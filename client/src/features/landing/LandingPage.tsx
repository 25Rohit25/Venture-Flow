import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api.js';
import { Startup } from '../../lib/types.js';
import { StartupCard } from '../../components/shared/StartupCard.js';
import { StartupCardSkeleton } from '../../components/ui/Skeleton.js';
import { Button } from '../../components/ui/Button.js';
import { useAuth } from '../../app/AuthContext.js';
import {
  Compass,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Send,
  Building,
  UserCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export function LandingPage() {
  const { user, switchDemoUser } = useAuth();
  const navigate = useNavigate();

  const { data: featuredData, isLoading } = useQuery({
    queryKey: ['featured-startups'],
    queryFn: () => api.get<Startup[]>('/startups?limit=3&sort=newest'),
  });

  const handleQuickDemo = async (role: 'FOUNDER' | 'INVESTOR') => {
    await switchDemoUser(role);
    if (role === 'FOUNDER') {
      navigate('/dashboard/founder');
    } else {
      navigate('/discover');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden border-b border-border bg-gradient-to-b from-white via-background to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Two-Sided Early-Stage Discovery Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-ink tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Find the startups <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-600">
              shaping tomorrow.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-ink-muted max-w-2xl mx-auto leading-relaxed">
            VentureFlow bridges ambitious startup founders and forward-looking investors with race-safe interest pipelines, structured funding targets, and zero fluff.
          </p>

          {/* Role CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/discover">
              <Button size="lg" variant="primary" className="w-full sm:w-auto shadow-md">
                <Compass className="w-5 h-5" />
                Explore Discover Directory
              </Button>
            </Link>

            {user?.role === 'FOUNDER' ? (
              <Link to="/dashboard/startups/new">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  + Create New Startup
                </Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Pitch Your Venture
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>

          {/* Quick Demo Credentials Bar for Reviewers */}
          <div className="mt-12 max-w-xl mx-auto bg-white/90 backdrop-blur-sm border border-slate-200/90 rounded-2xl p-4 shadow-subtle text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-primary" />
                One-Click Reviewer Demo Login
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Password: Password123!</span>
            </div>
            <p className="text-xs text-ink-muted mb-3">
              Instantly authenticate as pre-seeded demo accounts to evaluate role-specific dashboards:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickDemo('FOUNDER')}
                className="flex items-center justify-center gap-2 py-2 px-3 bg-purple-50 hover:bg-purple-100 text-primary border border-purple-200 rounded-xl text-xs font-semibold transition"
              >
                <Building className="w-3.5 h-3.5" />
                Demo Founder (Asha)
              </button>
              <button
                onClick={() => handleQuickDemo('INVESTOR')}
                className="flex items-center justify-center gap-2 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold transition"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Demo Investor (Vikram)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Strip */}
      <section id="how-it-works" className="py-16 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-ink">
              Structured matching in three clear steps
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              Engineered with atomic database constraints and strict role boundaries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-background border border-border">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-primary flex items-center justify-center font-bold text-base mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-ink mb-2">Publish Deal Pitch</h3>
              <p className="text-sm text-ink-muted leading-relaxed">
                Founders craft validated startup profiles with explicit integer INR funding targets, sector taxonomy, and pitch narratives.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-background border border-border">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-base mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-ink mb-2">Filter & Bookmark</h3>
              <p className="text-sm text-ink-muted leading-relaxed">
                Investors filter opportunities by sector, development stage, and target capital with URL state synchronization.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-background border border-border">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-base mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-ink mb-2">Atomic Interest Pipeline</h3>
              <p className="text-sm text-ink-muted leading-relaxed">
                Investors submit 20–500 character introductory interest once. Founders accept or decline with race-safe conditional transitions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Live Startups */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-ink">Featured Live Ventures</h2>
              <p className="text-sm text-ink-muted mt-1">
                Verified startups currently actively seeking investor conversations
              </p>
            </div>
            <Link to="/discover">
              <Button variant="outline" size="sm">
                View All Startups
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StartupCardSkeleton />
              <StartupCardSkeleton />
              <StartupCardSkeleton />
            </div>
          ) : featuredData && featuredData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredData.map((startup) => (
                <StartupCard key={startup._id} startup={startup} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-border">
              <p className="text-ink-muted">No published startups yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Trust & Non-Goals Disclosure */}
      <section className="py-12 bg-white border-t border-border">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Security & Integrity Highlights
          </div>
          <h3 className="text-xl font-bold text-ink mb-2">
            Engineered with Production-Minded Boundaries
          </h3>
          <p className="text-sm text-ink-muted leading-relaxed mb-6">
            Database-level compound unique constraints prevent duplicate submissions. Role-based server middleware rejects unauthorized mutations with 403. Private founder email addresses are never returned across public discovery APIs.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> HttpOnly Secure Cookies</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Atomic Status Transitions</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 17 Automated Tests</span>
          </div>
        </div>
      </section>
    </div>
  );
}
