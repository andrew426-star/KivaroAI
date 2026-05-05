import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users, FileText, TrendingUp, Clock, MousePointer, Activity,
  ArrowUpRight, Building2, Mail,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import GlowCard from '@/components/features/GlowCard';
import { cn } from '@/lib/utils';

interface VisitorSession {
  session_id: string;
  created_at: string;
  device_type: string;
  browser: string;
  first_page: string;
}

interface PageView {
  session_id: string;
  page: string;
  duration_seconds: number | null;
  created_at: string;
}

interface FormSubmission {
  id: string;
  name: string;
  email: string;
  company: string | null;
  inquiry_type: string;
  submitted_at: string;
  exported: boolean;
}

interface Props {
  sessions: VisitorSession[];
  pageViews: PageView[];
  submissions: FormSubmission[];
}

const tooltipStyle = {
  contentStyle: {
    background: 'hsl(150, 12%, 8%)',
    border: '1px solid hsl(150, 12%, 16%)',
    borderRadius: '8px',
    fontSize: '12px',
    color: 'hsl(140, 20%, 85%)',
  },
  labelStyle: { color: 'hsl(140, 20%, 65%)', fontWeight: 600 },
};

export default function OverviewTab({ sessions, pageViews, submissions }: Props) {
  const now = new Date();

  const stats = useMemo(() => {
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sessionsLast30 = sessions.filter(s => new Date(s.created_at) >= thirtyDaysAgo);
    const sessionsLast7  = sessions.filter(s => new Date(s.created_at) >= sevenDaysAgo);
    const today          = sessions.filter(s => new Date(s.created_at).toDateString() === now.toDateString());

    // Avg session duration from page_views
    const durationsBySid: Record<string, number> = {};
    pageViews.forEach(pv => {
      if (pv.duration_seconds) {
        durationsBySid[pv.session_id] = (durationsBySid[pv.session_id] || 0) + pv.duration_seconds;
      }
    });
    const allDurations = Object.values(durationsBySid);
    const avgDurationSecs = allDurations.length
      ? Math.round(allDurations.reduce((a, b) => a + b, 0) / allDurations.length)
      : 0;

    // Bounce rate: sessions with exactly 1 page view
    const viewsPerSession: Record<string, number> = {};
    pageViews.forEach(pv => {
      viewsPerSession[pv.session_id] = (viewsPerSession[pv.session_id] || 0) + 1;
    });
    const singlePageSessions = Object.values(viewsPerSession).filter(c => c === 1).length;
    const totalTracked = Object.keys(viewsPerSession).length;
    const bounceRate = totalTracked ? Math.round((singlePageSessions / totalTracked) * 100) : 0;

    // Conversion rate: submissions / sessions (last 30d)
    const subLast30 = submissions.filter(s => new Date(s.submitted_at) >= thirtyDaysAgo);
    const convRate = sessionsLast30.length
      ? ((subLast30.length / sessionsLast30.length) * 100).toFixed(1)
      : '0.0';

    return {
      totalSessions: sessions.length,
      sessionsLast7: sessionsLast7.length,
      todaySessions: today.length,
      totalSubmissions: submissions.length,
      avgDurationSecs,
      bounceRate,
      convRate,
    };
  }, [sessions, pageViews, submissions, now]);

  // Sparkline: visitors last 14 days
  const sparklineData = useMemo(() => {
    const days: { label: string; visitors: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const iso   = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const count = sessions.filter(s => s.created_at.startsWith(iso)).length;
      days.push({ label, visitors: count });
    }
    return days;
  }, [sessions, now]);

  // Top pages
  const topPages = useMemo(() => {
    const map: Record<string, number> = {};
    pageViews.forEach(pv => { map[pv.page] = (map[pv.page] || 0) + 1; });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([page, views]) => ({ page, views }));
  }, [pageViews]);

  const formatDuration = (secs: number) => {
    if (secs < 60) return `${secs}s`;
    return `${Math.floor(secs / 60)}m ${secs % 60}s`;
  };

  const KPI_CARDS = [
    {
      label: 'Total Visitors',
      value: stats.totalSessions.toLocaleString(),
      sub: `${stats.sessionsLast7} this week`,
      icon: Users,
      color: 'text-primary',
      bg: 'bg-primary/8',
    },
    {
      label: 'Today\'s Visitors',
      value: stats.todaySessions.toString(),
      sub: 'unique sessions',
      icon: Activity,
      color: 'text-blue-400',
      bg: 'bg-blue-400/8',
    },
    {
      label: 'Form Submissions',
      value: stats.totalSubmissions.toLocaleString(),
      sub: `${stats.convRate}% conversion (30d)`,
      icon: FileText,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/8',
    },
    {
      label: 'Avg. Visit Duration',
      value: formatDuration(stats.avgDurationSecs),
      sub: 'across all sessions',
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-400/8',
    },
    {
      label: 'Bounce Rate',
      value: `${stats.bounceRate}%`,
      sub: 'single-page sessions',
      icon: MousePointer,
      color: 'text-rose-400',
      bg: 'bg-rose-400/8',
    },
    {
      label: 'Conversion Rate',
      value: `${stats.convRate}%`,
      sub: 'submissions / sessions (30d)',
      icon: TrendingUp,
      color: 'text-violet-400',
      bg: 'bg-violet-400/8',
    },
  ];

  const recentSubmissions = submissions.slice(0, 6);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">Overview</h2>
        <p className="text-sm text-muted-foreground mt-0.5">All-time snapshot of your site performance</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
        {KPI_CARDS.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <GlowCard>
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className={cn('flex items-center justify-center size-9 rounded-lg', card.bg)}>
                    <card.icon className={cn('size-4', card.color)} />
                  </div>
                  <ArrowUpRight className="size-3.5 text-muted-foreground/30 mt-0.5" />
                </div>
                <p className={cn('font-display text-2xl font-bold mt-3', card.color)}>
                  {card.value}
                </p>
                <p className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground mt-0.5">
                  {card.label}
                </p>
                <p className="text-[11px] text-muted-foreground/60 mt-0.5">{card.sub}</p>
              </div>
            </GlowCard>
          </motion.div>
        ))}
      </div>

      {/* Sparkline + Top Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlowCard className="lg:col-span-2">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="size-4 text-primary" />
              <h3 className="font-display text-sm font-bold text-foreground">Visitors — Last 14 Days</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={sparklineData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ovGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="hsl(152,76%,46%)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(152,76%,46%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(150,12%,14%)" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(140,20%,55%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(140,20%,55%)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="visitors" name="Visitors" stroke="hsl(152,76%,46%)" strokeWidth={2} fill="url(#ovGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlowCard>

        <GlowCard>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <MousePointer className="size-4 text-primary" />
              <h3 className="font-display text-sm font-bold text-foreground">Top Pages</h3>
            </div>
            {topPages.length === 0 ? (
              <p className="text-xs text-muted-foreground/40 text-center py-8">No page view data yet</p>
            ) : (
              <div className="space-y-2.5">
                {topPages.map(({ page, views }, i) => {
                  const maxViews = topPages[0].views;
                  return (
                    <div key={page}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-foreground/80 font-medium truncate max-w-[70%]">
                          {page === '/' ? 'Home' : page.replace('/', '').charAt(0).toUpperCase() + page.slice(2)}
                        </span>
                        <span className="text-muted-foreground tabular-nums">{views.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-border/30 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(views / maxViews) * 100}%` }}
                          transition={{ delay: i * 0.1 + 0.3, duration: 0.6 }}
                          className="h-full rounded-full bg-primary/60"
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

      {/* Recent Submissions */}
      <GlowCard>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              <h3 className="font-display text-sm font-bold text-foreground">Recent Inquiries</h3>
            </div>
            <span className="text-[10px] font-display uppercase tracking-wider text-muted-foreground/50">
              Latest {recentSubmissions.length}
            </span>
          </div>
          {recentSubmissions.length === 0 ? (
            <p className="text-xs text-muted-foreground/40 text-center py-6">No submissions yet</p>
          ) : (
            <div className="divide-y divide-border/30">
              {recentSubmissions.map((sub) => (
                <div key={sub.id} className="flex items-center gap-4 py-3">
                  <div className="size-8 rounded-full bg-primary/8 border border-primary/15 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary font-display">
                      {sub.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{sub.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground/60">
                        <Mail className="size-2.5" />
                        {sub.email}
                      </span>
                      {sub.company && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground/50">
                          <Building2 className="size-2.5" />
                          {sub.company}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center rounded-md bg-primary/8 border border-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                      {sub.inquiry_type}
                    </span>
                    <p className="text-[10px] text-muted-foreground/50 mt-1">
                      {new Date(sub.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </GlowCard>
    </div>
  );
}
