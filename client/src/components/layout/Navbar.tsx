import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.js';
import { Button } from '../ui/Button.js';
import { RoleBadge } from '../ui/Badge.js';
import {
  Compass,
  LayoutDashboard,
  Bookmark,
  Send,
  PlusCircle,
  LogOut,
  Menu,
  X,
  Zap,
} from 'lucide-react';

export function Navbar() {
  const { user, logout, switchDemoUser } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-ink tracking-tight flex items-center gap-1.5">
                VentureFlow
                <span className="text-[10px] uppercase tracking-wider bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.5 rounded border border-slate-200">
                  Demo
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-ink-muted">
            <Link
              to="/discover"
              className="hover:text-ink transition flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-primary" />
              Discover Startups
            </Link>

            {user?.role === 'FOUNDER' && (
              <>
                <Link
                  to="/dashboard/founder"
                  className="hover:text-ink transition flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to="/dashboard/interests"
                  className="hover:text-ink transition flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  Pipeline Requests
                </Link>
              </>
            )}

            {user?.role === 'INVESTOR' && (
              <>
                <Link
                  to="/dashboard/investor"
                  className="hover:text-ink transition flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to="/dashboard/bookmarks"
                  className="hover:text-ink transition flex items-center gap-1.5"
                >
                  <Bookmark className="w-4 h-4" />
                  Saved Bookmarks
                </Link>
                <Link
                  to="/dashboard/interests"
                  className="hover:text-ink transition flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  Expressed Interest
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Right Section: Auth & Demo Controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* Fast Demo Account Switcher for Evaluators */}
          <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 text-xs">
            <span className="text-[11px] font-semibold text-slate-500 px-2">Demo:</span>
            <button
              onClick={() => switchDemoUser('FOUNDER')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                user?.role === 'FOUNDER'
                  ? 'bg-white shadow-sm text-primary font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Founder
            </button>
            <button
              onClick={() => switchDemoUser('INVESTOR')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                user?.role === 'INVESTOR'
                  ? 'bg-white shadow-sm text-emerald-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Investor
            </button>
          </div>

          {user ? (
            <div className="flex items-center gap-3 pl-2">
              {user.role === 'FOUNDER' && (
                <Link to="/dashboard/startups/new">
                  <Button variant="primary" size="sm" className="gap-1.5">
                    <PlusCircle className="w-4 h-4" />
                    New Startup
                  </Button>
                </Link>
              )}

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-border shadow-subtle">
                <div className="text-left">
                  <p className="text-xs font-semibold text-ink leading-tight">{user.name}</p>
                  <RoleBadge role={user.role} />
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-slate-500 hover:text-rose-600 p-2"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/discover"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium py-2 text-ink"
          >
            Discover Startups
          </Link>
          {user ? (
            <>
              {user.role === 'FOUNDER' ? (
                <>
                  <Link
                    to="/dashboard/founder"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium py-2 text-ink"
                  >
                    Founder Dashboard
                  </Link>
                  <Link
                    to="/dashboard/startups/new"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium py-2 text-primary"
                  >
                    + Create Startup
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/dashboard/investor"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium py-2 text-ink"
                  >
                    Investor Dashboard
                  </Link>
                  <Link
                    to="/dashboard/bookmarks"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium py-2 text-ink"
                  >
                    Saved Bookmarks
                  </Link>
                </>
              )}
              <Link
                to="/dashboard/interests"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium py-2 text-ink"
              >
                Interests Management
              </Link>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{user.name}</p>
                  <RoleBadge role={user.role} />
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Log out
                </Button>
              </div>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Log In
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
