import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MousePointer, Clock, Users, TrendingUp, ArrowUpDown, ChevronDown, ChevronUp, RefreshCw,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import GlowCard from '@/components/features/GlowCard';
import { cn } from '@/lib/utils';

export interface PageView {
  id: string;
  session_id: string;
  page: string;
  referrer: string | null;
  duration_seconds: number | null;
  created_at: string;
}

interface PageStats {
  page: string;
  views: number;
  uniqueSessions: number;
  avgDuration: number;
  totalDuration: number;
  pctOfTotal: number;
}

interface Props {
  pageViews: PageView[];
  refreshing: boolean;
  onRefresh: () => Promise<void>;
}

type SortField = 'views' | 'uniqueSessions' | 'avgDuration' | 'pctOfTotal';
type SortDir   = 'asc' | 'desc';

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

function pageName(path: string): string {
  if (path === '/')         return 'Home';
  if (path === '/services') return 'Services';
  if (path === '/about')    return 'About';
  if (path === '/contact')  return 'Contact';
  if (path === '/process')  return 'Process';
  return path.charAt(0).toUpperCase() + path.slice(1).replace(/\//g, ' › ');
}

function formatDuration(secs: number): string {
  if (secs < 1)   return '—';
  if (secs < 60)  return `${secs}s`;
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
}

export default function PagesTab({ pageViews, refreshing, onRefresh }: Props) {
  const [sortField, setSortField] = useState<SortField>('views');
  const [sortDir,   setSortDir]   = useState<SortDir>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="size-3 text-muted-foreground/30" />;
    return sortDir === 'asc' ? <ChevronUp className="size-3 text-primary" /> : <ChevronDown className="size-3 text-primary" />;
  };

  const pageStats = useMemo<PageStats[]>(() => {
    const map: Record<string, { views: number; sessions: Set<string>; durations: number[] }> = {};

    pageViews.forEach(pv => {
      if (!map[pv.page]) map[pv.page] = { views: 0, sessions: new Set(), durations: [] };
      map[pv.page].views++;
      map[pv.page].sessions.add(pv.session_id);
      if (pv.duration_seconds && pv.duration_seconds > 0) {
        map[pv.page].durations.push(pv.duration_seconds);
      }
    });

    const total = pageViews.length || 1;

    return Object.entries(map).map(([page, data]) => {
      const avgDuration = data.durations.length
        ? Math.round(data.durations.reduce((a, b) => a + b, 0) / data.durations.length)
        : 0;
      return {
        page,
        views:          data.views,
        uniqueSessions: data.sessions.size,
        avgDuration,
        totalDuration: data.durations.reduce((a, b) => a + b, 0),
        pctOfTotal: Math.round((data.views / total) * 1000) / 10,
      };
    });
  }, [pageViews]);

  const sortedStats = useMemo(() =>
    [...pageStats].sort((a, b) => {
      const cmp = a[sortField] - b[sortField];
      return sortDir === 'asc' ? cmp : -cmp;
    }),
  [pageStats, sortField, sortDir]);

  // Chart data: top 8 pages by views
  const chartData = useMemo(() =>
    [...pageStats]
      .sort((a, b) => b.views - a.views)
      .slice(0, 8)
      .map(p => ({ name: pageName(p.page), views: p.views, duration: p.avgDuration })),
  [pageStats]);

  // Daily page views last 30 days
  const dailyViews = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (29 - i));
      const iso   = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const count = pageViews.filter(pv => pv.created_at.startsWith(iso)).length;
      return { label, views: count };
    });
  }, [pageViews]);

  const totalViews   = pageViews.length;
  const uniquePages  = pageStats.length;
  const avgDur       = useMemo(() => {
    const all = pageViews.filter(p => p.duration_seconds && p.duration_seconds > 0).map(p => p.duration_seconds!);
    return all.length ? Math.round(all.reduce((a, b) => a + b, 0) / all.length) : 0;
  }, [pageViews]);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Page Performance</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Views, sessions, and time-on-page per URL</p>
        </div>
        <button onClick={onRefresh} disabled={refreshing}
          className="flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all disabled:opacity-50">
          <RefreshCw className={cn('size-3.5', refreshing && 'animate-spin')} /> Refresh
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Page Views', value: totalViews.toLocaleString(), icon: MousePointer, color: 'text-primary' },
          { label: 'Unique Pages',     value: uniquePages.toString(),      icon: Users,        color: 'text-blue-400' },
          { label: 'Avg Time On Page', value: formatDuration(avgDur),      icon: Clock,        color: 'text-amber-400' },
        ].map(k => (
          <GlowCard key={k.label}>
            <div className="p-4 flex items-center gap-3">
              <k.icon className={cn('size-5 shrink-0', k.color)} />
              <div>
                <p className={cn('font-display text-xl font-bold', k.color)}>{k.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-display">{k.label}</p>
              </div>
            </div>
          </GlowCard>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlowCard>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <MousePointer className="size-4 text-primary" />
              <h3 className="font-display text-sm font-bold text-foreground">Views by Page</h3>
            </div>
            {chartData.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-xs text-muted-foreground/40">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(140,20%,55%)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'hsl(140,20%,70%)' }} axisLine={false} tickLine={false} width={72} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="views" name="Views" fill="hsl(152,76%,46%)" radius={[0, 4, 4, 0]} maxBarSize={18} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlowCard>

        <GlowCard>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="size-4 text-primary" />
              <h3 className="font-display text-sm font-bold text-foreground">Daily Views</h3>
              <span className="ml-auto text-[10px] text-muted-foreground/50 font-display uppercase tracking-wider">Last 30 Days</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailyViews} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(150,12%,14%)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'hsl(140,20%,55%)' }} axisLine={false} tickLine={false}
                  interval={Math.max(0, Math.floor(dailyViews.length / 8) - 1)} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(140,20%,55%)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip {...tooltipStyle} cursor={{ fill: 'hsla(152,76%,46%,0.05)' }} />
                <Bar dataKey="views" name="Views" fill="hsl(152,76%,46%)" radius={[4, 4, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlowCard>
      </div>

      {/* Table */}
      <GlowCard>
        <div className="p-5 border-b border-border/50">
          <div className="flex items-center gap-2">
            <MousePointer className="size-4 text-primary" />
            <h3 className="font-display text-sm font-bold text-foreground">All Pages</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left px-5 py-3 text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">
                    Page
                  </th>
                  {[
                    { field: 'views'          as SortField, label: 'Views' },
                    { field: 'uniqueSessions' as SortField, label: 'Unique Sessions' },
                    { field: 'avgDuration'    as SortField, label: 'Avg. Duration' },
                    { field: 'pctOfTotal'     as SortField, label: '% of Traffic' },
                  ].map(col => (
                    <th key={col.field} onClick={() => handleSort(col.field)}
                      className="text-right px-4 py-3 text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none">
                      <div className="flex items-center justify-end gap-1.5">
                        {col.label} <SortIcon field={col.field} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedStats.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-muted-foreground">
                      <MousePointer className="size-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No page view data yet</p>
                    </td>
                  </tr>
                ) : (
                  sortedStats.map((ps, i) => (
                    <motion.tr key={ps.page}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3">
                        <div>
                          <p className="font-medium text-foreground">{pageName(ps.page)}</p>
                          <p className="text-[11px] text-muted-foreground/50 mt-0.5 font-mono">{ps.page}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-display font-semibold text-foreground">{ps.views.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-foreground/70">
                        {ps.uniqueSessions.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-foreground/70">
                        {formatDuration(ps.avgDuration)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-border/30 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary/60"
                              style={{ width: `${Math.min(ps.pctOfTotal, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">
                            {ps.pctOfTotal.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </GlowCard>
    </div>
  );
}
