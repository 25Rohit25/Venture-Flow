import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.js';
import {
  LayoutDashboard,
  Compass,
  Bookmark,
  Send,
  PlusCircle,
  Building,
} from 'lucide-react';

export function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const isFounder = user.role === 'FOUNDER';

  const founderLinks = [
    { to: '/dashboard/founder', label: 'Overview', icon: LayoutDashboard },
    { to: '/dashboard/startups/new', label: 'New Startup', icon: PlusCircle },
    { to: '/dashboard/interests', label: 'Received Requests', icon: Send },
    { to: '/discover', label: 'Explore Directory', icon: Compass },
  ];

  const investorLinks = [
    { to: '/dashboard/investor', label: 'Overview', icon: LayoutDashboard },
    { to: '/discover', label: 'Discover Startups', icon: Compass },
    { to: '/dashboard/bookmarks', label: 'Saved Startups', icon: Bookmark },
    { to: '/dashboard/interests', label: 'My Interests', icon: Send },
  ];

  const links = isFounder ? founderLinks : investorLinks;

  return (
    <aside className="w-64 bg-white border-r border-border shrink-0 hidden md:block min-h-[calc(100vh-4rem)] p-4">
      <div className="mb-6 px-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Building className="w-4 h-4" />
          <span>{isFounder ? 'Founder Workspace' : 'Investor Portal'}</span>
        </div>
      </div>

      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/dashboard/founder' || link.to === '/dashboard/investor'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-light text-primary font-semibold'
                    : 'text-ink-muted hover:text-ink hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
