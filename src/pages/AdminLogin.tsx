import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Lock, Mail, KeyRound, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import kivaroLogo from '@/assets/kivaro-logo.png';
import MarketBars from '@/components/features/MarketBars';
import type { User } from '@supabase/supabase-js';
import type { AuthUser } from '@/stores/authStore';

function mapSupabaseUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email!,
    username: user.user_metadata?.username || user.user_metadata?.full_name || user.email!.split('@')[0],
    avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
  };
}

type Step = 'email' | 'otp' | 'set-password' | 'login';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputClass = cn(
    'w-full rounded-lg bg-kv-surface border border-border/60 px-4 py-3 pl-11',
    'text-sm text-foreground placeholder:text-muted-foreground/50',
    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50',
    'transition-all duration-300'
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      login(mapSupabaseUser(data.user));
      navigate('/admin');
    } catch (err: any) {
      toast({ title: 'Login Failed', description: err.message });
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      toast({ title: 'OTP Sent', description: 'Check your email for the verification code.' });
      setStep('otp');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
      if (error) throw error;
      setStep('set-password');
    } catch (err: any) {
      toast({ title: 'Verification Failed', description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const username = email.split('@')[0];
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
        data: { username },
      });
      if (error) throw error;
      login(mapSupabaseUser(data.user));
      navigate('/admin');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <MarketBars barCount={100} />
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, hsla(152, 76%, 46%, 0.04), transparent 60%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md mx-4"
      >
        <div className="rounded-2xl bg-kv-surface/60 backdrop-blur-sm border border-border/50 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          {/* Header */}
          <div className="px-8 pt-8 pb-4 text-center">
            <motion.img
              src={kivaroLogo}
              alt="Kivaro AI"
              className="size-12 mx-auto mb-4 object-contain drop-shadow-[0_0_8px_hsla(152,76%,46%,0.3)]"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            />
            <h1 className="font-display text-xl font-bold text-foreground">Admin Access</h1>
            <p className="mt-1 text-sm text-muted-foreground">Authenticate to access the dashboard</p>
          </div>

          {/* Tab selector */}
          <div className="px-8 pb-4">
            <div className="flex rounded-lg bg-background/50 border border-border/40 p-1">
              <button
                onClick={() => { setStep('login'); setOtp(''); setNewPassword(''); }}
                className={cn(
                  'flex-1 py-2 text-xs font-medium rounded-md transition-all duration-300',
                  step === 'login'
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Sign In
              </button>
              <button
                onClick={() => { setStep('email'); setOtp(''); setNewPassword(''); }}
                className={cn(
                  'flex-1 py-2 text-xs font-medium rounded-md transition-all duration-300',
                  step !== 'login'
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Register
              </button>
            </div>
          </div>

          {/* Forms */}
          <div className="px-8 pb-8">
            <AnimatePresence mode="wait">
              {step === 'login' && (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleLogin}
                  className="space-y-4"
                >
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 size-4 text-muted-foreground/50" />
                    <input
                      type="email"
                      required
                      placeholder="admin@kivaroai.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 size-4 text-muted-foreground/50" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={cn(inputClass, 'pr-11')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-muted-foreground/50 hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.01 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:shadow-[0_0_24px_hsla(152,76%,46%,0.3)] disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}

              {step === 'email' && (
                <motion.form
                  key="email"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleSendOtp}
                  className="space-y-4"
                >
                  <p className="text-xs text-muted-foreground">Enter your email to receive a one-time verification code.</p>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 size-4 text-muted-foreground/50" />
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.01 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:shadow-[0_0_24px_hsla(152,76%,46%,0.3)] disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <>
                        Send Verification Code
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}

              {step === 'otp' && (
                <motion.form
                  key="otp"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleVerifyOtp}
                  className="space-y-4"
                >
                  <p className="text-xs text-muted-foreground">
                    A 4-digit code was sent to <span className="text-primary font-medium">{email}</span>
                  </p>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-3.5 size-4 text-muted-foreground/50" />
                    <input
                      type="text"
                      required
                      maxLength={4}
                      placeholder="0000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className={cn(inputClass, 'text-center tracking-[0.5em] font-mono text-lg')}
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={loading || otp.length < 4}
                    whileHover={{ scale: loading ? 1 : 1.01 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:shadow-[0_0_24px_hsla(152,76%,46%,0.3)] disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <>
                        Verify Code
                        <ShieldCheck className="size-4" />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}

              {step === 'set-password' && (
                <motion.form
                  key="set-password"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleSetPassword}
                  className="space-y-4"
                >
                  <p className="text-xs text-muted-foreground">Create a password for your admin account.</p>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 size-4 text-muted-foreground/50" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Create password (min 6 chars)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={cn(inputClass, 'pr-11')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-muted-foreground/50 hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.01 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:shadow-[0_0_24px_hsla(152,76%,46%,0.3)] disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <>
                        Complete Setup
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Security notice */}
        <p className="text-center text-xs text-muted-foreground/50 mt-4">
          Protected admin area. Unauthorized access is prohibited.
        </p>
      </motion.div>
    </div>
  );
}
