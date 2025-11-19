import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { CheckCircle, Loader2 } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    role: "",
    phone: "",
    interest: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastEmail, setLastEmail] = useState<string>("");
  const successRef = useRef<HTMLDivElement>(null);

  const buildMailtoUrl = () => {
    const subject = `Lendgismo handoff request — ${formData.company || "No company"} (${formData.firstName} ${formData.lastName})`;
    const lines = [
      `Name: ${formData.firstName} ${formData.lastName}`,
      `Email: ${formData.email}`,
      `Company: ${formData.company}`,
      `Role: ${formData.role}`,
      `Phone: ${formData.phone || "(not provided)"}`,
      `Timeline: ${formData.interest || "(not provided)"}`,
      "",
      "Message:",
      formData.message || "(none)"
    ];
    const body = lines.join("\r\n");
    const to = "sales@lendgismo.com,brysen@lendgismo.com";
    return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const form = e.currentTarget;

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        company: formData.company,
        role: formData.role,
        phone: formData.phone,
        interest: formData.interest,
        message: formData.message,
      };
      const emailRes = await fetch('/api/contact/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!emailRes.ok) {
        const t = await emailRes.text().catch(() => '');
        throw new Error(`Email send failed (${emailRes.status}): ${t}`);
      }

      setLastEmail(formData.email);
      setSubmitted(true);
      setFormData({ firstName: "", lastName: "", email: "", company: "", role: "", phone: "", interest: "", message: "" });
    } catch (err) {
      console.error("Form submit failed", err);
      setSubmitError("We couldn't send your request. Please try again or email sales@lendgismo.com.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (submitted) {
      successRef.current?.focus();
    }
  }, [submitted]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen">
      <Seo 
        title="Contact — Lendgismo"
        description="Get in touch with Lendgismo. Request a code handoff, ask questions, or discuss your lending platform needs."
        url="https://lendgismo.com/contact"
      />
      <Navigation />

      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6" data-testid="text-contact-heading">
              Request a <span className="text-gradient">code handoff</span>
            </h1>
            <p className="text-lg text-zinc-300 max-w-2xl mx-auto" data-testid="text-contact-description">
              Fill out the form below and our team will reach out within 24 hours to discuss your needs and schedule a demo.
            </p>
          </div>
          
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 md:p-12 backdrop-blur">
            <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm text-zinc-400">Prefer to skip the form?</p>
              <a href={buildMailtoUrl()} className="btn-ghost">Email us directly</a>
            </div>
            {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-white mb-2">
                    First Name *
                  </label>
                  <input 
                    type="text" 
                    id="firstName" 
                    name="firstName" 
                    required 
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition outline-none"
                    placeholder="John"
                    data-testid="input-firstName"
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-white mb-2">
                    Last Name *
                  </label>
                  <input 
                    type="text" 
                    id="lastName" 
                    name="lastName" 
                    required 
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition outline-none"
                    placeholder="Doe"
                    data-testid="input-lastName"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                    Work Email *
                  </label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    required 
                    value={formData.email}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition outline-none"
                    placeholder="john@company.com"
                    data-testid="input-email"
                  />
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-semibold text-white mb-2">
                    Company *
                  </label>
                  <input 
                    type="text" 
                    id="company" 
                    name="company" 
                    required 
                    value={formData.company}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition outline-none"
                    placeholder="Acme Inc."
                    data-testid="input-company"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="role" className="block text-sm font-semibold text-white mb-2">
                    Role/Title *
                  </label>
                  <input 
                    type="text" 
                    id="role" 
                    name="role" 
                    required 
                    value={formData.role}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition outline-none"
                    placeholder="CTO, Engineering Manager, etc."
                    data-testid="input-role"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-white mb-2">
                    Phone Number
                  </label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition outline-none"
                    placeholder="(555) 123-4567"
                    data-testid="input-phone"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="interest" className="block text-sm font-semibold text-white mb-2">
                  Timeline *
                </label>
                <Select
                  value={formData.interest}
                  onValueChange={(v) => setFormData((p) => ({ ...p, interest: v }))}
                >
                  <SelectTrigger id="interest" className="w-full rounded-xl border border-white/10 bg-white/5 text-white">
                    <SelectValue placeholder="Select your timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate (within 2 weeks)</SelectItem>
                    <SelectItem value="1-month">Within 1 month</SelectItem>
                    <SelectItem value="1-3-months">1-3 months</SelectItem>
                    <SelectItem value="3-6-months">3-6 months</SelectItem>
                    <SelectItem value="exploring">Just exploring</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" name="interest" value={formData.interest} />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-white mb-2">
                  Tell us about your needs
                </label>
                <textarea 
                  id="message" 
                  name="message" 
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  disabled={submitting}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition resize-none outline-none"
                  placeholder="What are you looking to build? Any specific requirements or questions?"
                  data-testid="textarea-message"
                />
              </div>
              
              {submitError && (
                <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 text-red-200 px-4 py-3 text-sm">
                  {submitError}
                </div>
              )}
              
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-zinc-400" data-testid="text-form-response-time">
                  Response time: within 24 hours
                </p>
                <button 
                  type="submit" 
                  className="btn-primary disabled:opacity-60" 
                  data-testid="button-submit-form"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending…
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      Send Request
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 2L9 11M18 2L12 18L9 11M18 2L2 8L9 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  )}
                </button>
              </div>
              
              <div className="pt-2 text-right">
                <a href={buildMailtoUrl()} className="text-sm text-zinc-400 hover:text-brand-300">
                  If this doesn't send, click here to email us
                </a>
              </div>
            </form>
            ) : (
              <div ref={successRef} tabIndex={-1} className="flex flex-col items-center text-center gap-3 py-8 outline-none" aria-live="polite" role="status">
                <div className="h-12 w-12 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <CheckCircle className="h-7 w-7 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white">Thanks — your request was sent</h3>
                <p className="text-zinc-300 max-w-xl">
                  We'll reply within 24 hours{lastEmail ? ` at ${lastEmail}` : ''}. If it's urgent, email{' '}
                  <a href="mailto:sales@lendgismo.com" className="text-brand-400 hover:text-brand-300">
                    sales@lendgismo.com
                  </a>{' '}
                  or{' '}
                  <a href="mailto:brysen@lendgismo.com" className="text-brand-400 hover:text-brand-300">
                    brysen@lendgismo.com
                  </a>.
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <a href="/overview" className="btn-primary">View Technical Overview</a>
                  <a href="/docs" className="btn-ghost">Read the Docs</a>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-zinc-400" data-testid="text-email-contact">
              Prefer email? Reach us directly at{' '}
              <a href="mailto:sales@lendgismo.com" className="text-brand-400 hover:text-brand-300 transition" data-testid="link-email">
                sales@lendgismo.com
              </a>{' '}
              or{' '}
              <a href="mailto:brysen@lendgismo.com" className="text-brand-400 hover:text-brand-300 transition" data-testid="link-email-2">
                brysen@lendgismo.com
              </a>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
