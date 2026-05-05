import { useState } from 'react';
import {
  User, Mail, Phone, MapPin, Calendar, Shield, Download,
  CheckCircle2, AlertCircle, Copy, ExternalLink, Server,
  Lock, Eye, EyeOff,
} from 'lucide-react';
import GlowCard from '@/components/features/GlowCard';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { SITE_CONFIG } from '@/constants/config';

interface Props {
  adminEmail: string;
  allSubmissions: object[];
  allSessions: object[];
  allPageViews: object[];
}

export default function SettingsTab({ adminEmail, allSubmissions, allSessions, allPageViews }: Props) {
  const { toast } = useToast();
  const [newPassword,    setNewPassword]    = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword,   setShowPassword]   = useState(false);
  const [changingPw,     setChangingPw]     = useState(false);
  const [pwSuccess,      setPwSuccess]      = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied', description: `${label} copied to clipboard` });
  };

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast({ title: 'Error', description: 'Password must be at least 8 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match.' });
      return;
    }
    setChangingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: 'Error', description: error.message });
    } else {
      setPwSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      toast({ title: 'Password updated', description: 'Your admin password has been changed.' });
      setTimeout(() => setPwSuccess(false), 3000);
    }
    setChangingPw(false);
  };

  const exportAllData = () => {
    const data = {
      exported_at:  new Date().toISOString(),
      submissions:  allSubmissions,
      sessions:     allSessions,
      page_views:   allPageViews,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `kivaro-ai-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const SITE_INFO = [
    { icon: User,     label: 'Founder',  value: SITE_CONFIG.founder },
    { icon: Mail,     label: 'Email',    value: SITE_CONFIG.email,  copy: true },
    { icon: Phone,    label: 'Phone',    value: SITE_CONFIG.phone,  copy: true },
    { icon: MapPin,   label: 'Location', value: SITE_CONFIG.location },
    { icon: Calendar, label: 'Founded',  value: String(SITE_CONFIG.founded) },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-3xl">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Site configuration and admin account management</p>
      </div>

      {/* Site Info */}
      <GlowCard>
        <div className="p-5 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Server className="size-4 text-primary" />
            <h3 className="font-display text-sm font-bold text-foreground">Site Configuration</h3>
          </div>
        </div>
        <div className="p-5 space-y-3">
          <div className="rounded-lg bg-primary/5 border border-primary/15 px-4 py-3 flex items-center gap-3">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-foreground">{SITE_CONFIG.name}</span>
            <span className="text-xs text-muted-foreground/60 ml-1">— {SITE_CONFIG.tagline}</span>
          </div>
          <div className="divide-y divide-border/40">
            {SITE_INFO.map(item => (
              <div key={item.label} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <item.icon className="size-4 text-muted-foreground/50" />
                  <span className="text-xs font-display uppercase tracking-wider text-muted-foreground">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground/80">{item.value}</span>
                  {item.copy && (
                    <button onClick={() => copyToClipboard(item.value, item.label)}
                      className="text-muted-foreground/40 hover:text-primary transition-colors">
                      <Copy className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlowCard>

      {/* Removing OnSpace.ai Banner */}
      <GlowCard>
        <div className="p-5 border-b border-border/50">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-amber-400" />
            <h3 className="font-display text-sm font-bold text-foreground">Remove OnSpace.ai Branding Banner</h3>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            The "Ideas → Web | OnSpace.AI" banner at the top of your site is injected by OnSpace.ai's
            hosting platform at the CDN level — it's not in your source code. The only way to permanently
            remove it is to host this React app yourself on a platform you control and point your domain DNS there.
          </p>

          <div className="space-y-3">
            <p className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">
              Recommended hosting options (all have free tiers)
            </p>

            {[
              {
                name:   'Vercel',
                desc:   'Best for React apps. Zero-config, instant deploys from GitHub.',
                steps:  ['Push this repo to GitHub', 'Connect repo at vercel.com/new', 'Vercel auto-detects Vite — click Deploy', 'Add kivaroai.com in Project → Domains'],
                color:  'text-white',
              },
              {
                name:   'Netlify',
                desc:   'Also excellent. Build command: vite build, publish dir: dist.',
                steps:  ['Push to GitHub', 'app.netlify.com → Add new site → Import from Git', 'Build command: npm run build, Publish dir: dist', 'Add custom domain under Site settings → Domain management'],
                color:  'text-teal-400',
              },
            ].map(host => (
              <div key={host.name} className="rounded-lg border border-border/50 bg-background/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={cn('font-display font-bold text-sm', host.color)}>{host.name}</span>
                  <span className="text-[10px] text-emerald-400 font-display uppercase tracking-wider bg-emerald-400/10 border border-emerald-400/20 rounded px-1.5 py-0.5">Free</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{host.desc}</p>
                <ol className="space-y-1">
                  {host.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-foreground/70">
                      <span className="font-display font-bold text-primary/70 shrink-0">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            ))}

            <div className="rounded-lg border border-border/40 bg-primary/3 p-4">
              <p className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                After deploying, update DNS at your registrar
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                In your domain registrar (where you registered kivaroai.com), update the A record or
                CNAME to point to your new host. Both Vercel and Netlify provide the exact DNS values
                in their domain settings. Propagation takes 5–30 minutes.
              </p>
            </div>
          </div>
        </div>
      </GlowCard>

      {/* Admin Account */}
      <GlowCard>
        <div className="p-5 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Shield className="size-4 text-primary" />
            <h3 className="font-display text-sm font-bold text-foreground">Admin Account</h3>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/40">
            <Lock className="size-4 text-muted-foreground/50" />
            <div>
              <p className="text-xs text-muted-foreground font-display uppercase tracking-wider">Logged in as</p>
              <p className="text-sm text-foreground mt-0.5">{adminEmail}</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">Change Password</p>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="New password (min 8 characters)"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full rounded-lg bg-background border border-border/60 px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
              <button onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-2.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg bg-background border border-border/60 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
            <button
              onClick={handlePasswordChange}
              disabled={changingPw || !newPassword || !confirmPassword}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-50',
                pwSuccess
                  ? 'bg-emerald-400/10 border border-emerald-400/20 text-emerald-400'
                  : 'bg-primary/10 border border-primary/20 text-primary hover:bg-primary/15'
              )}
            >
              {pwSuccess ? (
                <><CheckCircle2 className="size-4" /> Password updated</>
              ) : changingPw ? (
                <><div className="size-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> Updating...</>
              ) : (
                <><Lock className="size-4" /> Update Password</>
              )}
            </button>
          </div>
        </div>
      </GlowCard>

      {/* Data Export */}
      <GlowCard>
        <div className="p-5 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Download className="size-4 text-primary" />
            <h3 className="font-display text-sm font-bold text-foreground">Data Export</h3>
          </div>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-sm text-muted-foreground">
            Export all your site data — form submissions, visitor sessions, and page views — as a single JSON file.
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: 'Submissions', count: allSubmissions.length },
              { label: 'Sessions',    count: allSessions.length },
              { label: 'Page Views',  count: allPageViews.length },
            ].map(d => (
              <div key={d.label} className="rounded-lg border border-border/40 bg-background/40 py-3">
                <p className="font-display text-lg font-bold text-foreground">{d.count.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground font-display uppercase tracking-wider mt-0.5">{d.label}</p>
              </div>
            ))}
          </div>
          <button onClick={exportAllData}
            className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/15 transition-all">
            <Download className="size-4" /> Export All Data as JSON
          </button>
        </div>
      </GlowCard>

      {/* Environment */}
      <GlowCard>
        <div className="p-5 border-b border-border/50">
          <div className="flex items-center gap-2">
            <ExternalLink className="size-4 text-primary" />
            <h3 className="font-display text-sm font-bold text-foreground">Supabase — Apply Analytics Migration</h3>
          </div>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            To enable visitor and page analytics, run the migration SQL in your Supabase project.
            Navigate to <strong className="text-foreground/80">Supabase → SQL Editor</strong> and paste the contents of:
          </p>
          <div className="rounded-lg bg-background/50 border border-border/40 px-4 py-2.5 flex items-center justify-between">
            <code className="text-xs text-primary font-mono">supabase/migrations/20250505000000_analytics.sql</code>
            <button onClick={() => copyToClipboard('supabase/migrations/20250505000000_analytics.sql', 'Path')}
              className="text-muted-foreground/40 hover:text-primary transition-colors ml-3">
              <Copy className="size-3.5" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            This creates the <code className="text-foreground/70">visitor_sessions</code> and <code className="text-foreground/70">page_views</code> tables
            with the correct Row Level Security policies. Once applied, analytics data will begin flowing immediately.
          </p>
        </div>
      </GlowCard>
    </div>
  );
}
