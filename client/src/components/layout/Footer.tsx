import React from 'react';
import { Zap, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <span className="font-bold text-base text-ink">VentureFlow</span>
            </div>
            <p className="text-sm text-ink-muted max-w-sm leading-relaxed mb-4">
              A high-integrity two-sided discovery and investor interest matching platform for early-stage ventures.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl max-w-md">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Demonstration platform only. Expressions of interest are non-binding; no escrow, securities trading, or financial advice is provided.
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-ink-muted">
              <li><a href="/discover" className="hover:text-ink transition">Browse Startups</a></li>
              <li><a href="/login" className="hover:text-ink transition">Founder Portal</a></li>
              <li><a href="/login" className="hover:text-ink transition">Investor Network</a></li>
              <li><a href="/#how-it-works" className="hover:text-ink transition">How It Works</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Architecture</h4>
            <div className="flex flex-wrap gap-1.5">
              {['MERN Stack', 'TypeScript', 'Node.js LTS', 'Express', 'MongoDB Atlas', 'Zod', 'Vitest', 'Tailwind CSS'].map((tech) => (
                <span key={tech} className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 VentureFlow. Built for StartupMeu Software Engineer Intern Assessment.</p>
          <p>Designed with Apple & Linear visual principles.</p>
        </div>
      </div>
    </footer>
  );
}
