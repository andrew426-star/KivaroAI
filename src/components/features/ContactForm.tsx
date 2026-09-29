import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Send, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { FunctionsHttpError } from '@supabase/supabase-js';

const INQUIRY_TYPES = [
  'Pilot Application',
  'Launch Waitlist',
  'Discovery Call',
  'General Inquiry',
];

export default function ContactForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    inquiryType: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('submit-inquiry', {
        body: {
          name: formData.name,
          email: formData.email,
          company: formData.company,
          role: formData.role,
          inquiryType: formData.inquiryType,
          message: formData.message,
        },
      });

      if (error) {
        let errorMessage = error.message;
        if (error instanceof FunctionsHttpError) {
          try {
            const textContent = await error.context?.text();
            errorMessage = textContent || error.message || 'Unknown error';
          } catch {
            errorMessage = error.message || 'Failed to process submission';
          }
        }
        console.error('Submission error:', errorMessage);
        toast({
          title: 'Submission Error',
          description: 'There was an issue submitting your inquiry. Please try again or email us directly.',
        });
        setSending(false);
        return;
      }

      console.log('Form submitted successfully:', data);
      setSending(false);
      setSent(true);
      toast({
        title: 'Inquiry Received',
        description: 'We will review your request and respond within one business day.',
      });

      setTimeout(() => {
        setSent(false);
        setFormData({ name: '', email: '', company: '', role: '', inquiryType: '', message: '' });
      }, 3000);
    } catch (err) {
      console.error('Unexpected error:', err);
      setSending(false);
      toast({
        title: 'Submission Error',
        description: 'There was an issue submitting your inquiry. Please try again or email us directly.',
      });
    }
  };

  const inputClass = cn(
    'w-full rounded-lg bg-kv-surface border border-border/60 px-4 py-3',
    'text-sm text-foreground placeholder:text-muted-foreground/50',
    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50',
    'transition-all duration-300',
    'hover:border-border'
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-4">
        <div className="relative">
          <label htmlFor="name" className={cn(
            "block text-xs font-medium mb-1.5 uppercase tracking-wider font-display transition-colors duration-300",
            focusedField === 'name' ? 'text-primary' : 'text-muted-foreground'
          )}>
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField(null)}
            placeholder="Andrew Thomas"
            className={inputClass}
          />
        </div>
        <div className="relative">
          <label htmlFor="email" className={cn(
            "block text-xs font-medium mb-1.5 uppercase tracking-wider font-display transition-colors duration-300",
            focusedField === 'email' ? 'text-primary' : 'text-muted-foreground'
          )}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            placeholder="andrew@hedgefund.com"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-4">
        <div>
          <label htmlFor="company" className={cn(
            "block text-xs font-medium mb-1.5 uppercase tracking-wider font-display transition-colors duration-300",
            focusedField === 'company' ? 'text-primary' : 'text-muted-foreground'
          )}>
            Fund / Organization
          </label>
          <input
            id="company"
            name="company"
            type="text"
            value={formData.company}
            onChange={handleChange}
            onFocus={() => setFocusedField('company')}
            onBlur={() => setFocusedField(null)}
            placeholder="Apex Capital Partners"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="role" className={cn(
            "block text-xs font-medium mb-1.5 uppercase tracking-wider font-display transition-colors duration-300",
            focusedField === 'role' ? 'text-primary' : 'text-muted-foreground'
          )}>
            Role
          </label>
          <input
            id="role"
            name="role"
            type="text"
            value={formData.role}
            onChange={handleChange}
            onFocus={() => setFocusedField('role')}
            onBlur={() => setFocusedField(null)}
            placeholder="Head of Operations"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="inquiryType" className={cn(
          "block text-xs font-medium mb-1.5 uppercase tracking-wider font-display transition-colors duration-300",
          focusedField === 'inquiryType' ? 'text-primary' : 'text-muted-foreground'
        )}>
          Inquiry Type
        </label>
        <select
          id="inquiryType"
          name="inquiryType"
          value={formData.inquiryType}
          onChange={handleChange}
          onFocus={() => setFocusedField('inquiryType')}
          onBlur={() => setFocusedField(null)}
          required
          className={cn(inputClass, 'appearance-none cursor-pointer')}
        >
          <option value="" disabled>
            Select inquiry type
          </option>
          {INQUIRY_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className={cn(
          "block text-xs font-medium mb-1.5 uppercase tracking-wider font-display transition-colors duration-300",
          focusedField === 'message' ? 'text-primary' : 'text-muted-foreground'
        )}>
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          value={formData.message}
          onChange={handleChange}
          onFocus={() => setFocusedField('message')}
          onBlur={() => setFocusedField(null)}
          rows={5}
          placeholder="Describe your firm's automation needs or the workflow challenges you're looking to address..."
          className={cn(inputClass, 'resize-none')}
        />
      </div>

      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 bg-primary/10 border border-primary/25 text-primary font-semibold text-sm"
          >
            <CheckCircle2 className="size-4" />
            Inquiry Submitted Successfully
          </motion.div>
        ) : (
          <motion.button
            key="submit"
            type="submit"
            disabled={sending}
            whileHover={{ scale: sending ? 1 : 1.01 }}
            whileTap={{ scale: sending ? 1 : 0.98 }}
            className={cn(
              'w-full flex items-center justify-center gap-2 rounded-full px-6 py-3.5',
              'bg-primary text-primary-foreground font-semibold text-sm',
              'transition-all duration-300',
              'hover:shadow-[0_0_30px_hsla(152,76%,46%,0.3)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'btn-magnetic overflow-hidden relative'
            )}
          >
            <span className="relative z-10 flex items-center gap-2">
              {sending ? (
                <>
                  <div className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Submit Inquiry
                  <Send className="size-4" />
                </>
              )}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <p className="text-center text-xs text-muted-foreground">
        We respond to qualified inquiries within one business day.
      </p>
    </form>
  );
}
