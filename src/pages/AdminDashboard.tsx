import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, Users, MousePointer, Settings,
  LogOut, Menu, X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import kivaroLogo from '@/assets/kivaro-logo.png';

import OverviewTab from '@/components/admin/OverviewTab';
import SubmissionsTab, { type FormSubmission } from '@/components/admin/SubmissionsTab';
import VisitorsTab, { type VisitorSession } from '@/components/admin/VisitorsTab';
import PagesTab, { type PageView } from '@/components/admin/PagesTab';
import SettingsTab from '@/components/admin/SettingsTab';

type Tab = 'overview' | 'submissions' | 'visitors' | 'pages' | 'settings';

const NAV_ITEMS = [
  { id: 'overview'    as Tab, label: 'Overview',    icon: LayoutDashboard },
  { id: 'submissions' as Tab, label: 'Submissions',  icon: FileText },
  { id: 'visitors'    as Tab, label: 'Visitors',     icon: Users },
  { id: 'pages'       as Tab, label: 'Pages',        icon: MousePointer },
  { id: 'settings'    as Tab, label: 'Settings',     icon: Settings },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const [activeTab,    setActiveTab]    = useState<Tab>('overview');
  const [sidebarOpen,  setSidebarOpen]  = useState(false);

  // Data state
  const [submissions,  setSubmissions]  = useState<FormSubmission[]>([]);
  const [sessions,     setSessions]     = useState<VisitorSession[]>([]);
  const [pageViews,    setPageViews]    = useState<PageView[]>([]);

  const [subLoading,   setSubLoading]   = useState(true);
  const [visLoading,   setVisLoading]   = useState(true);
  const [pvLoading,    setPvLoading]    = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);

  // Noindex admin
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'noindex, nofollow');
    return () => { meta?.remove(); };
  }, []);

  const fetchSubmissions = useCallback(async () => {
    setRefreshing(true);
    const { data, error } = await supabase
      .from('form_submissions')
      .select('*')
      .order('submitted_at', { ascending: false });
    if (error) {
      toast({ title: 'Error', description: 'Failed to load submissions.' });
    } else {
      setSubmissions((data as FormSubmission[]) || []);
    }
    setSubLoading(false);
    setRefreshing(false);
  }, [toast]);

  const fetchSessions = useCallback(async () => {
    // Fetch last 90 days of sessions
    const since = new Date();
    since.setDate(since.getDate() - 90);
    const { data, error } = await supabase
      .from('visitor_sessions')
      .select('*')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false })
      .limit(5000);
    if (!error) setSessions((data as VisitorSession[]) || []);
    setVisLoading(false);
  }, []);

  const fetchPageViews = useCallback(async () => {
    const since = new Date();
    since.setDate(since.getDate() - 90);
    const { data, error } = await supabase
      .from('page_views')
      .select('*')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false })
      .limit(20000);
    if (!error) setPageViews((data as PageView[]) || []);
    setPvLoading(false);
  }, []);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchSubmissions(), fetchSessions(), fetchPageViews()]);
    setRefreshing(false);
  }, [fetchSubmissions, fetchSessions, fetchPageViews]);

  useEffect(() => {
    fetchSubmissions();
    fetchSessions();
    fetchPageViews();
  }, [fetchSubmissions, fetchSessions, fetchPageViews]);

  // Close sidebar on tab change (mobile)
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const isLoading = subLoading || visLoading || pvLoading;

  const Sidebar = ({ mobile = false }) => (
    <div className={cn(
      'flex flex-col h-full',
      mobile ? 'bg-background' : 'bg-background/95 backdrop-blur-sm'
    )}>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={kivaroLogo} alt="Kivaro AI" className="size-7 object-contain" />
          <div>
            <p className="font-display font-bold text-sm text-foreground">Kivaro AI</p>
            <p className="text-[10px] text-muted-foreground font-display uppercase tracking-widest">Admin</p>
          </div>
        </div>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="size-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              activeTab === item.id
                ? 'bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_0_20px_hsla(152,76%,46%,0.05)]'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent'
            )}
          >
            <item.icon className={cn('size-4 shrink-0', activeTab === item.id ? 'text-primary' : 'text-muted-foreground/60')} />
            {item.label}
            {item.id === 'submissions' && submissions.filter(s => !s.exported).length > 0 && (
              <span className="ml-auto text-[10px] font-display font-bold bg-amber-400/15 text-amber-400 border border-amber-400/20 rounded-full px-1.5 py-0.5 leading-none">
                {submissions.filter(s => !s.exported).length}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 pb-4 pt-2 border-t border-border/50">
        <div className="px-3 py-2 mb-1">
          <p className="text-[10px] text-muted-foreground/50 font-display uppercase tracking-wider">Signed in as</p>
          <p className="text-xs text-muted-foreground/80 truncate mt-0.5">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-rose-500/10 hover:border-rose-500/20 border border-transparent transition-all duration-200"
        >
          <LogOut className="size-4 text-muted-foreground/60" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-border/50 fixed inset-y-0 left-0 z-50">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-72 z-50 border-r border-border/50 lg:hidden"
            >
              <Sidebar mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">

        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border/50 flex items-center gap-3 px-4 py-3">
          <button onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground hover:text-foreground transition-colors">
            <Menu className="size-5" />
          </button>
          <img src={kivaroLogo} alt="" className="size-6 object-contain" />
          <span className="font-display font-bold text-sm text-foreground">Admin Panel</span>
          <span className="ml-auto text-xs text-muted-foreground font-display">
            {NAV_ITEMS.find(n => n.id === activeTab)?.label}
          </span>
        </header>

        {/* Loading overlay (initial) */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="size-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground mt-3 font-display">Loading dashboard...</p>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {!isLoading && (
          <main className="flex-1 overflow-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'overview' && (
                  <OverviewTab
                    sessions={sessions}
                    pageViews={pageViews}
                    submissions={submissions}
                  />
                )}
                {activeTab === 'submissions' && (
                  <SubmissionsTab
                    submissions={submissions}
                    onRefresh={fetchSubmissions}
                    refreshing={refreshing}
                  />
                )}
                {activeTab === 'visitors' && (
                  <VisitorsTab
                    sessions={sessions}
                    refreshing={refreshing}
                    onRefresh={async () => { setRefreshing(true); await fetchSessions(); setRefreshing(false); }}
                  />
                )}
                {activeTab === 'pages' && (
                  <PagesTab
                    pageViews={pageViews}
                    refreshing={refreshing}
                    onRefresh={async () => { setRefreshing(true); await fetchPageViews(); setRefreshing(false); }}
                  />
                )}
                {activeTab === 'settings' && (
                  <SettingsTab
                    adminEmail={user?.email || ''}
                    allSubmissions={submissions}
                    allSessions={sessions}
                    allPageViews={pageViews}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        )}
      </div>
    </div>
  );
}
