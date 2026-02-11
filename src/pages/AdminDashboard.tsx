import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  LogOut, Download, RefreshCw, Filter, Search, ArrowUpDown,
  ChevronDown, ChevronUp, Calendar, Mail, Building2, User,
  MessageSquare, Clock, CheckCircle2, XCircle, FileText,
  BarChart3, PieChart as PieChartIcon, TrendingUp,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area, CartesianGrid,
} from 'recharts';
import kivaroLogo from '@/assets/kivaro-logo.png';
import MarketBars from '@/components/features/MarketBars';
import GlowCard from '@/components/features/GlowCard';

interface FormSubmission {
  id: string;
  name: string;
  email: string;
  company: string | null;
  role: string | null;
  inquiry_type: string;
  message: string;
  source: string;
  submitted_at: string;
  exported: boolean;
  created_at: string;
}

type SortField = 'submitted_at' | 'name' | 'email' | 'inquiry_type' | 'exported';
type SortDir = 'asc' | 'desc';

const INQUIRY_TYPES = ['All', 'Discovery Call', 'Pilot Engagement', 'Workflow Audit', 'General Inquiry'];

const CHART_COLORS = [
  'hsl(152, 76%, 46%)',
  'hsl(160, 80%, 42%)',
  'hsl(82, 80%, 55%)',
  'hsl(190, 70%, 50%)',
  'hsl(45, 90%, 55%)',
];

const chartTooltipStyle = {
  contentStyle: {
    background: 'hsl(150, 12%, 8%)',
    border: '1px solid hsl(150, 12%, 16%)',
    borderRadius: '8px',
    fontSize: '12px',
    color: 'hsl(140, 20%, 85%)',
    boxShadow: '0 4px 20px hsla(0,0%,0%,0.4)',
  },
  labelStyle: { color: 'hsl(140, 20%, 65%)', fontWeight: 600, fontFamily: 'Syne, sans-serif' },
  itemStyle: { color: 'hsl(140, 20%, 85%)' },
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  // Prevent Google Safe Browsing from indexing admin pages
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'noindex, nofollow');
    return () => {
      meta?.remove();
    };
  }, []);

  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [inquiryFilter, setInquiryFilter] = useState('All');
  const [exportFilter, setExportFilter] = useState<'all' | 'exported' | 'pending'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState<SortField>('submitted_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSubmissions = async () => {
    setRefreshing(true);
    const { data, error } = await supabase
      .from('form_submissions')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Fetch error:', error);
      toast({ title: 'Error', description: 'Failed to fetch submissions.' });
    } else {
      setSubmissions(data || []);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const filtered = useMemo(() => {
    let result = [...submissions];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          (s.company || '').toLowerCase().includes(q) ||
          s.message.toLowerCase().includes(q)
      );
    }

    // Inquiry type filter
    if (inquiryFilter !== 'All') {
      result = result.filter((s) => s.inquiry_type === inquiryFilter);
    }

    // Export status filter
    if (exportFilter === 'exported') {
      result = result.filter((s) => s.exported);
    } else if (exportFilter === 'pending') {
      result = result.filter((s) => !s.exported);
    }

    // Date range
    if (dateFrom) {
      result = result.filter((s) => new Date(s.submitted_at) >= new Date(dateFrom));
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((s) => new Date(s.submitted_at) <= to);
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'submitted_at') {
        cmp = new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
      } else if (sortField === 'exported') {
        cmp = Number(a.exported) - Number(b.exported);
      } else {
        cmp = (a[sortField] || '').localeCompare(b[sortField] || '');
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [submissions, searchQuery, inquiryFilter, exportFilter, dateFrom, dateTo, sortField, sortDir]);

  const exportCsv = () => {
    if (filtered.length === 0) return;
    const headers = ['Name', 'Email', 'Company', 'Role', 'Inquiry Type', 'Message', 'Submitted At', 'Exported'];
    const rows = filtered.map((s) => [
      s.name,
      s.email,
      s.company || '',
      s.role || '',
      s.inquiry_type,
      `"${s.message.replace(/"/g, '""')}"`,
      new Date(s.submitted_at).toISOString(),
      s.exported ? 'Yes' : 'No',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kivaro-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="size-3 text-muted-foreground/30" />;
    return sortDir === 'asc'
      ? <ChevronUp className="size-3 text-primary" />
      : <ChevronDown className="size-3 text-primary" />;
  };

  const stats = useMemo(() => ({
    total: submissions.length,
    exported: submissions.filter((s) => s.exported).length,
    pending: submissions.filter((s) => !s.exported).length,
    today: submissions.filter((s) => {
      const d = new Date(s.submitted_at);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    }).length,
  }), [submissions]);

  // Chart data: daily submission counts (last 30 days)
  const dailyData = useMemo(() => {
    const today = new Date();
    const days: { date: string; label: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const count = submissions.filter((s) => s.submitted_at.startsWith(iso)).length;
      days.push({ date: iso, label, count });
    }
    return days;
  }, [submissions]);

  // Chart data: inquiry type distribution
  const inquiryDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    submissions.forEach((s) => {
      map[s.inquiry_type] = (map[s.inquiry_type] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [submissions]);

  // Chart data: submission trend (weekly aggregation for area chart)
  const weeklyTrend = useMemo(() => {
    const today = new Date();
    const weeks: { week: string; submissions: number; exported: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() - i * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);
      const label = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const count = submissions.filter((s) => {
        const sd = new Date(s.submitted_at);
        return sd >= weekStart && sd <= weekEnd;
      }).length;
      const exp = submissions.filter((s) => {
        const sd = new Date(s.submitted_at);
        return sd >= weekStart && sd <= weekEnd && s.exported;
      }).length;
      weeks.push({ week: label, submissions: count, exported: exp });
    }
    return weeks;
  }, [submissions]);

  const [showCharts, setShowCharts] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={kivaroLogo} alt="Kivaro AI" className="size-8 object-contain" />
            <div>
              <h1 className="font-display text-base font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-lg border border-border/60 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-destructive/30 transition-all duration-300"
          >
            <LogOut className="size-4" />
            Sign Out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 lg:px-8 py-6 lg:py-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Submissions', value: stats.total, icon: FileText, color: 'text-primary' },
            { label: 'Exported to n8n', value: stats.exported, icon: CheckCircle2, color: 'text-emerald-400' },
            { label: 'Pending Export', value: stats.pending, icon: Clock, color: 'text-amber-400' },
            { label: 'Today', value: stats.today, icon: Calendar, color: 'text-blue-400' },
          ].map((stat) => (
            <GlowCard key={stat.label}>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={cn('size-4', stat.color)} />
                  <span className="text-xs text-muted-foreground font-display uppercase tracking-wider">{stat.label}</span>
                </div>
                <p className={cn('font-display text-2xl font-bold', stat.color)}>{stat.value}</p>
              </div>
            </GlowCard>
          ))}
        </div>

        {/* Analytics Charts */}
        <div className="mb-6">
          <button
            onClick={() => setShowCharts(!showCharts)}
            className="flex items-center gap-2 text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <BarChart3 className="size-3.5" />
            Analytics
            <ChevronDown className={cn('size-3.5 transition-transform duration-300', showCharts && 'rotate-180')} />
          </button>

          <AnimatePresence>
            {showCharts && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Submission Trend (Area Chart) */}
                  <GlowCard className="lg:col-span-2">
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="size-4 text-primary" />
                        <h3 className="font-display text-sm font-bold text-foreground">Submission Trend</h3>
                        <span className="text-[10px] text-muted-foreground/60 font-display uppercase tracking-wider ml-auto">Last 12 Weeks</span>
                      </div>
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={weeklyTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="gradSubmissions" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(152, 76%, 46%)" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(152, 76%, 46%)" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gradExported" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(82, 80%, 55%)" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="hsl(82, 80%, 55%)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 12%, 14%)" />
                          <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'hsl(140, 20%, 55%)' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: 'hsl(140, 20%, 55%)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip {...chartTooltipStyle} />
                          <Area type="monotone" dataKey="submissions" stroke="hsl(152, 76%, 46%)" strokeWidth={2} fill="url(#gradSubmissions)" name="Total" />
                          <Area type="monotone" dataKey="exported" stroke="hsl(82, 80%, 55%)" strokeWidth={1.5} fill="url(#gradExported)" name="Exported" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </GlowCard>

                  {/* Inquiry Type Distribution (Pie Chart) */}
                  <GlowCard>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <PieChartIcon className="size-4 text-primary" />
                        <h3 className="font-display text-sm font-bold text-foreground">Inquiry Types</h3>
                      </div>
                      {inquiryDistribution.length === 0 ? (
                        <div className="flex items-center justify-center h-[220px] text-muted-foreground/40 text-xs">
                          No data yet
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height={220}>
                          <PieChart>
                            <Pie
                              data={inquiryDistribution}
                              cx="50%"
                              cy="45%"
                              innerRadius={45}
                              outerRadius={70}
                              paddingAngle={3}
                              dataKey="value"
                              stroke="none"
                            >
                              {inquiryDistribution.map((_, index) => (
                                <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip {...chartTooltipStyle} />
                            <Legend
                              wrapperStyle={{ fontSize: '10px', fontFamily: 'Outfit, sans-serif' }}
                              formatter={(value: string) => <span style={{ color: 'hsl(140, 20%, 70%)' }}>{value}</span>}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </GlowCard>
                </div>

                {/* Daily Submissions Bar Chart */}
                <GlowCard className="mt-4">
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="size-4 text-primary" />
                      <h3 className="font-display text-sm font-bold text-foreground">Daily Submissions</h3>
                      <span className="text-[10px] text-muted-foreground/60 font-display uppercase tracking-wider ml-auto">Last 30 Days</span>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={dailyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 12%, 14%)" vertical={false} />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 9, fill: 'hsl(140, 20%, 55%)' }}
                          axisLine={false}
                          tickLine={false}
                          interval={Math.max(0, Math.floor(dailyData.length / 8) - 1)}
                        />
                        <YAxis tick={{ fontSize: 10, fill: 'hsl(140, 20%, 55%)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip {...chartTooltipStyle} cursor={{ fill: 'hsla(152, 76%, 46%, 0.05)' }} />
                        <Bar dataKey="count" name="Submissions" fill="hsl(152, 76%, 46%)" radius={[4, 4, 0, 0]} maxBarSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </GlowCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filters */}
        <GlowCard className="mb-6">
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-display uppercase tracking-wider text-muted-foreground mb-2">
              <Filter className="size-3.5" />
              Filters
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground/50" />
                <input
                  type="text"
                  placeholder="Search name, email, company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg bg-background border border-border/60 pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>
              {/* Inquiry Type */}
              <select
                value={inquiryFilter}
                onChange={(e) => setInquiryFilter(e.target.value)}
                className="rounded-lg bg-background border border-border/60 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all appearance-none cursor-pointer"
              >
                {INQUIRY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {/* Export Status */}
              <select
                value={exportFilter}
                onChange={(e) => setExportFilter(e.target.value as 'all' | 'exported' | 'pending')}
                className="rounded-lg bg-background border border-border/60 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="exported">Exported</option>
                <option value="pending">Pending</option>
              </select>
              {/* Date range */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="flex-1 rounded-lg bg-background border border-border/60 px-2 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
                <span className="text-muted-foreground text-xs">–</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="flex-1 rounded-lg bg-background border border-border/60 px-2 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>
            </div>
          </div>
        </GlowCard>

        {/* Actions */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="text-foreground font-medium">{filtered.length}</span> of {submissions.length} submissions
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchSubmissions}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-300 disabled:opacity-50"
            >
              <RefreshCw className={cn('size-3.5', refreshing && 'animate-spin')} />
              Refresh
            </button>
            <button
              onClick={exportCsv}
              disabled={filtered.length === 0}
              className="flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/15 transition-all duration-300 disabled:opacity-50"
            >
              <Download className="size-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <GlowCard>
          <div className="overflow-x-auto -mx-px">
            <div className="min-w-[640px]">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="size-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <MessageSquare className="size-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">No submissions found</p>
                <p className="text-xs mt-1">Adjust your filters or wait for new inquiries.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    {[
                      { field: 'name' as SortField, label: 'Name', icon: User },
                      { field: 'email' as SortField, label: 'Email', icon: Mail },
                      { field: 'inquiry_type' as SortField, label: 'Type', icon: MessageSquare },
                      { field: 'submitted_at' as SortField, label: 'Date', icon: Calendar },
                      { field: 'exported' as SortField, label: 'Status', icon: CheckCircle2 },
                    ].map((col) => (
                      <th
                        key={col.field}
                        onClick={() => handleSort(col.field)}
                        className="text-left px-4 py-3 text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          <col.icon className="size-3" />
                          {col.label}
                          <SortIcon field={col.field} />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((sub, i) => (
                    <motion.tr
                      key={sub.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02, duration: 0.2 }}
                      onClick={() => setSelectedRow(selectedRow === sub.id ? null : sub.id)}
                      className={cn(
                        'border-b border-border/30 cursor-pointer transition-colors duration-200',
                        selectedRow === sub.id
                          ? 'bg-primary/5'
                          : 'hover:bg-kv-surface/50'
                      )}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-foreground">{sub.name}</p>
                          {sub.company && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Building2 className="size-3" />
                              {sub.company}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-foreground/80">{sub.email}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-md bg-primary/8 border border-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                          {sub.inquiry_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(sub.submitted_at)}
                      </td>
                      <td className="px-4 py-3">
                        {sub.exported ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                            <CheckCircle2 className="size-3" />
                            Exported
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                            <XCircle className="size-3" />
                            Pending
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

            </div>
          {/* Expanded detail */}
          <AnimatePresence>
            {selectedRow && (
              <motion.div
                key={selectedRow}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden border-t border-border/50"
              >
                {(() => {
                  const sub = submissions.find((s) => s.id === selectedRow);
                  if (!sub) return null;
                  return (
                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <span className="text-xs font-display uppercase tracking-wider text-muted-foreground">Full Name</span>
                          <p className="text-sm text-foreground mt-0.5">{sub.name}</p>
                        </div>
                        <div>
                          <span className="text-xs font-display uppercase tracking-wider text-muted-foreground">Email</span>
                          <p className="text-sm text-foreground mt-0.5">{sub.email}</p>
                        </div>
                        <div>
                          <span className="text-xs font-display uppercase tracking-wider text-muted-foreground">Role</span>
                          <p className="text-sm text-foreground mt-0.5">{sub.role || 'Not specified'}</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-display uppercase tracking-wider text-muted-foreground">Message</span>
                        <p className="text-sm text-foreground/90 mt-1 leading-relaxed bg-background/50 rounded-lg p-4 border border-border/30">
                          {sub.message}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </GlowCard>

        {/* Bottom ambient */}
        <div className="mt-8 opacity-10 pointer-events-none">
          <MarketBars barCount={40} />
        </div>
      </main>
    </div>
  );
}
