import React from 'react';
import { Link } from 'react-router-dom';
import { Startup } from '../../lib/types.js';
import { formatINRCompact } from '../../lib/formatters.js';
import { IndustryBadge, StageBadge } from '../ui/Badge.js';
import { MapPin, ArrowRight, Bookmark } from 'lucide-react';
import { useAuth } from '../../app/AuthContext.js';

interface StartupCardProps {
  startup: Startup;
  isBookmarked?: boolean;
  onToggleBookmark?: (startupId: string) => void;
}

export function StartupCard({
  startup,
  isBookmarked = false,
  onToggleBookmark,
}: StartupCardProps) {
  const { user } = useAuth();
  const isInvestor = user?.role === 'INVESTOR';

  return (
    <div className="bg-white rounded-xl border border-border shadow-subtle p-5 hover:shadow-elevated hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top Badges & Bookmark */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <IndustryBadge industry={startup.industry} />
            <StageBadge stage={startup.stage} />
          </div>

          {isInvestor && onToggleBookmark && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleBookmark(startup._id);
              }}
              className={`p-1.5 rounded-lg border transition ${
                isBookmarked
                  ? 'bg-rose-50 border-rose-200 text-rose-500'
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700'
              }`}
              title={isBookmarked ? 'Remove bookmark' : 'Save bookmark'}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Save bookmark'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* Startup Name & Tagline */}
        <Link to={`/startups/${startup._id}`} className="block group-hover:text-primary transition-colors">
          <h3 className="text-base font-bold text-ink leading-snug line-clamp-1">
            {startup.name}
          </h3>
          <p className="text-sm text-ink-muted mt-1.5 line-clamp-2 leading-relaxed">
            {startup.tagline}
          </p>
        </Link>
      </div>

      {/* Target Amount & Footer link */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
        <div>
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Funding Target
          </span>
          <span className="text-sm font-bold text-ink">
            {formatINRCompact(startup.targetAmount)}
          </span>
        </div>

        {startup.location && (
          <div className="hidden sm:flex items-center gap-1 text-slate-500 max-w-[130px] truncate" title={startup.location}>
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{startup.location}</span>
          </div>
        )}

        <Link
          to={`/startups/${startup._id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover transition"
        >
          View Pitch
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
