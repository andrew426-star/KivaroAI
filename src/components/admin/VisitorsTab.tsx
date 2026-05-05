import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Monitor, Smartphone, Tablet, Globe, TrendingUp,
  ChevronDown, ChevronUp, ArrowUpDown, Clock, RefreshCw,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from 'recharts';
import GlowCard from '@/components/features/GlowCard';
import { cn } from '@/lib/utils';

export interface VisitorSession {
  id: string;
  session_id: string;
  first_page: string;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  device_type: string;
  browser: string;
  created_at: string;
  last_active_at: string;
}

interface Props {
  sessions: VisitorSession[];
  refreshing: boolean;
  onRefresh: () => Promise<void>;
}

const CHART_COLORS = [
  'hsl(152,76%,46%)', 'hsl(190,70%,50%)', 'hsl(82,80%,55%)',
  'hsl(45,90%,55%)',  'hsl(280,70%,60%)',
];

const tooltipStyle = {
  contentStyle: {
    background: 'hsl(150,12%,8%)',
    border: '1px solid hsl(150,12%,16%)',
    borderRadius: '8px',
    fontSize: '12px',
    color: 'hsl(140,20%,85%)',
  },
  labelStyle: { color: 'hsl(140,20%,65%)', fontWeight: 600 },
};

const DeviceIcon = ({ type }: { type: string }) => {
  if (type === 'Mobile')  return <Smartphone className="size-3.5 text-primary" />;
  if (type === 'Tablet')  return <Tablet className="size-3.5 text-blue-400" />;
  return <Monitor className="size-3.5 text-emerald-400" />;
};

type SortField = 'created_at' | 'device_type' | 'browser' | 'first_page' | 'referrer' | 'duration';
type SortDir = 'asc' | 'desc';

export default function VisitorsTab({ sessions, refreshing, onRefresh }: Props) {
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir,   setSortDir]   = useState<SortDir>('desc');
  const [page,      setPage]      = useState(0);
  const PAGE_SIZE = 25;

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="size-3 text-muted-foreground/30" />;
    return sortDir === 'asc' ? <ChevronUp className="size-3 text-primary" /> : <ChevronDown className="size-3 text-primary" />;
  };

  // Daily sessions last 30 days
  const dailySessions = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (29 - i));
      const iso   = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const count = sessions.filter(s => s.created_at.startsWith(iso)).length;
      return { label, sessions: count };
    });
  }, [sessions]);

  // Device breakdown
  const deviceData = useMemo(() => {
    const map: Record<string, number> = {};
    sessions.forEach(s => { map[s.device_type] = (map[s.device_type] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [sessions]);

  // Browser breakdown
  const browserData = useMemo(() => {
    const map: Record<string, number> = {};
    sessions.forEach(s => { map[s.browser] = (map[s.browser] || 0) + 1; });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [sessions]);

  // Top referrers
  const topReferrers = useMemo(() => {
    const map: Record<string, number> = {};
    sessions.forEach(s => {
      const ref = s.referrer || 'Direct / None';
      map[ref] = (map[ref] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [sessions]);

  // UTM sources
  const utmSources = useMemo(() => {
    const map: Record<string, number> = {};
    sessions.forEach(s => {
      if (s.utm_source) map[s.utm_source] = (map[s.utm_source] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [sessions]);

  // Sorted session list
  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'created_at') {
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortField === 'duration') {
        const dA = new Date(a.last_active_at).getTime() - new Date(a.created_at).getTime();
        const dB = new Date(b.last_active_at).getTime() - new Date(b.created_at).getTime();
        cmp = dA - dB;
      } else {
        cmp = ((a as Record<string, string>)[sortField] || '').localeCompare((b as Record<string, string>)[sortField] || '');
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [sessions, sortField, sortDir]);

  const paginatedSessions = sortedSessions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(sortedSessions.length / PAGE_SIZE);

  const formatDuration = (start: string, end: string) => {
    const secs = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 1000);
    if (secs < 5)   return '< 5s';
    if (secs < 60)  return `${secs}s`;
    return `${Math.floor(secs / 60)}m ${secs % 60}s`;
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Visitor Analytics</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {sessions.length.toLocaleString()} total sessions tracked
          </p>
        </div>
        <button onClick={onRefresh} disabled={refreshing}
          className="flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all disabled:opacity-50">
          <RefreshCw className={cn('size-3.5', refreshing && 'animate-spin')} /> Refresh
        </button>
      </div>

      {/* Daily Sessions Chart */}
      <GlowCard>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="size-4 text-primary" />
            <h3 className="font-display text-sm font-bold text-foreground">Daily Sessions</h3>
            <span className="ml-auto text-[10px] text-muted-foreground/50 font-display uppercase tracking-wider">Last 30 Days</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dailySessions} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="vsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="hsl(152,76%,46%)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="hsl(152,76%,46%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(150,12%,14%)" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(140,20%,55%)' }} axisLine={false} tickLine={false}
                interval={Math.max(0, Math.floor(dailySessions.length / 8) - 1)} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(140,20%,55%)' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="sessions" name="Sessions" stroke="hsl(152,76%,46%)" strokeWidth={2} fill="url(#vsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlowCard>

      {/* Device + Browser breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlowCard>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="size-4 text-primary" />
              <h3 className="font-display text-sm font-bold text-foreground">Device Types</h3>
            </div>
            {deviceData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-xs text-muted-foreground/40">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={deviceData} cx="50%" cy="45%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
                    {deviceData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} formatter={(v: string) => <span style={{ color: 'hsl(140,20%,70%)' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlowCard>

        <GlowCard>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="size-4 text-primary" />
              <h3 className="font-display text-sm font-bold text-foreground">Browsers</h3>
            </div>
            {browserData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-xs text-muted-foreground/40">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={browserData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(140,20%,55%)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'hsl(140,20%,70%)' }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="value" name="Sessions" fill="hsl(152,76%,46%)" radius={[0, 4, 4, 0]} maxBarSize={16} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlowCard>
      </div>

      {/* Top Referrers + UTM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlowCard>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="size-4 text-primary" />
              <h3 className="font-display text-sm font-bold text-foreground">Traffic Sources</h3>
            </div>
            {topReferrers.length === 0 ? (
              <p className="text-xs text-muted-foreground/40 text-center py-6">No data</p>
            ) : (
              <div className="space-y-2.5">
                {topReferrers.map(({ name, count }, i) => {
                  const max = topReferrers[0].count;
                  const label = name.length > 50 ? name.slice(0, 50) + '…' : name;
                  return (
                    <div key={name}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-foreground/80 truncate max-w-[75%]">{label}</span>
                        <span className="text-muted-foreground tabular-nums">{count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-border/30 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(count / max) * 100}%` }}
                          transition={{ delay: i * 0.08 + 0.2, duration: 0.5 }}
                          className="h-full rounded-full bg-primary/50"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </GlowCard>

        <GlowCard>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="size-4 text-primary" />
              <h3 className="font-display text-sm font-bold text-foreground">UTM Campaigns</h3>
            </div>
            {utmSources.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-muted-foreground/40">No UTM-tagged traffic yet</p>
                <p className="text-[11px] text-muted-foreground/30 mt-1">Add ?utm_source= params to your links</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {utmSources.slice(0, 8).map(({ name, value }, i) => {
                  const max = utmSources[0].value;
                  return (
                    <div key={name}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-foreground/80">{name}</span>
                        <span className="text-muted-foreground tabular-nums">{value}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-border/30 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(value / max) * 100}%` }}
                          transition={{ delay: i * 0.08 + 0.2, duration: 0.5 }}
                          className="h-full rounded-full bg-blue-400/50"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </GlowCard>
      </div>

      {/* Sessions Table */}
      <GlowCard>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <h3 className="font-display text-sm font-bold text-foreground">Session Log</h3>
            </div>
            <span className="text-[10px] text-muted-foreground/50 font-display uppercase tracking-wider">
              {sessions.length.toLocaleString()} total
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-border/50">
                  {[
                    { field: 'created_at'  as SortField, label: 'Time',     icon: Clock },
                    { field: 'first_page'  as SortField, label: 'Entry',    icon: Globe },
                    { field: 'referrer'    as SortField, label: 'Referrer', icon: Globe },
                    { field: 'device_type' as SortField, label: 'Device',   icon: Monitor },
                    { field: 'browser'     as SortField, label: 'Browser',  icon: Globe },
                    { field: 'duration'    as SortField, label: 'Duration', icon: Clock },
                  ].map(col => (
                    <th key={col.field} onClick={() => handleSort(col.field)}
                      className="text-left px-4 py-3 text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none">
                      <div className="flex items-center gap-1.5">
                        {col.label}
                        <SortIcon field={col.field} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedSessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-muted-foreground">
                      <Users className="size-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No session data yet</p>
                      <p className="text-xs mt-1 opacity-60">Sessions appear as visitors land on your site</p>
                    </td>
                  </tr>
                ) : (
                  paginatedSessions.map((s, i) => (
                    <motion.tr key={s.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(s.created_at)}</td>
                      <td className="px-4 py-3 text-xs text-foreground/80 max-w-[120px] truncate">
                        {s.first_page === '/' ? 'Home' : s.first_page}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground/70 max-w-[140px] truncate">
                        {s.referrer ? (
                          <span title={s.referrer}>
                            {s.referrer.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                          </span>
                        ) : (
                          <span className="opacity-40">Direct</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs text-foreground/70">
                          <DeviceIcon type={s.device_type} />
                          {s.device_type}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground/70">{s.browser}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDuration(s.created_at, s.last_active_at)}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border/50">
            <span className="text-xs text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="rounded-lg border border-border/60 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all disabled:opacity-30">
                Previous
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                className="rounded-lg border border-border/60 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all disabled:opacity-30">
                Next
              </button>
            </div>
          </div>
        )}
      </GlowCard>
    </div>
  );
}
