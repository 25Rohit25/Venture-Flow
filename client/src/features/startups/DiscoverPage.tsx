import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api.js';
import { Startup, IndustryType, StageType, Bookmark } from '../../lib/types.js';
import { INDUSTRY_LABELS, STAGE_LABELS } from '../../lib/formatters.js';
import { StartupCard } from '../../components/shared/StartupCard.js';
import { StartupCardSkeleton } from '../../components/ui/Skeleton.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import { Button } from '../../components/ui/Button.js';
import { useAuth } from '../../app/AuthContext.js';
import { useToast } from '../../components/ui/Toast.js';
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

export function DiscoverPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  // Read query params from URL
  const qParam = searchParams.get('q') || '';
  const industryParam = (searchParams.get('industry') as IndustryType | 'ALL') || 'ALL';
  const stageParam = (searchParams.get('stage') as StageType | 'ALL') || 'ALL';
  const sortParam = searchParams.get('sort') || 'newest';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const minTargetParam = searchParams.get('minTarget') || '';
  const maxTargetParam = searchParams.get('maxTarget') || '';

  // Local state for debounced search input
  const [searchInput, setSearchInput] = useState(qParam);

  // Sync search input to URL after 300ms debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== qParam) {
        updateParams({ q: searchInput || undefined, page: '1' });
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const updateParams = (newParams: Record<string, string | undefined>) => {
    const current = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === undefined || val === '' || val === 'ALL') {
        current.delete(key);
      } else {
        current.set(key, val);
      }
    });
    setSearchParams(current, { replace: true });
  };

  // Build API query string
  const queryString = new URLSearchParams();
  if (qParam) queryString.set('q', qParam);
  if (industryParam && industryParam !== 'ALL') queryString.set('industry', industryParam);
  if (stageParam && stageParam !== 'ALL') queryString.set('stage', stageParam);
  if (minTargetParam) queryString.set('minTarget', minTargetParam);
  if (maxTargetParam) queryString.set('maxTarget', maxTargetParam);
  queryString.set('sort', sortParam);
  queryString.set('page', String(pageParam));
  queryString.set('limit', '9');

  // Fetch published startups
  const { data, isLoading, isError } = useQuery({
    queryKey: ['startups-discovery', queryString.toString()],
    queryFn: () =>
      api.get<Startup[]>(`/startups?${queryString.toString()}`).then((res: any) => {
        // Handle standard wrapper
        return {
          startups: Array.isArray(res) ? res : res.data || [],
          meta: res.meta || { page: 1, limit: 9, total: 0, totalPages: 1 },
        };
      }),
  });

  // Fetch investor bookmarks if authenticated
  const isInvestor = user?.role === 'INVESTOR';
  const { data: bookmarksData } = useQuery({
    queryKey: ['my-bookmarks'],
    queryFn: () => api.get<Bookmark[]>('/me/bookmarks'),
    enabled: isInvestor,
  });

  const bookmarkedStartupIds = new Set(
    (bookmarksData || []).map((b: any) => (typeof b.startupId === 'object' ? b.startupId._id : b.startupId))
  );

  // Bookmark toggle mutation
  const bookmarkMutation = useMutation({
    mutationFn: async ({ startupId, isSaved }: { startupId: string; isSaved: boolean }) => {
      if (isSaved) {
        await api.delete(`/startups/${startupId}/bookmark`);
      } else {
        await api.post(`/startups/${startupId}/bookmark`);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['my-bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['investor-dashboard'] });
      success(variables.isSaved ? 'Removed from saved startups.' : 'Saved startup to bookmarks!');
    },
    onError: () => {
      toastError('Failed to update bookmark.');
    },
  });

  const handleToggleBookmark = (startupId: string) => {
    const isSaved = bookmarkedStartupIds.has(startupId);
    bookmarkMutation.mutate({ startupId, isSaved });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const hasActiveFilters =
    Boolean(qParam) ||
    industryParam !== 'ALL' ||
    stageParam !== 'ALL' ||
    Boolean(minTargetParam) ||
    Boolean(maxTargetParam);

  const startups = data?.startups || [];
  const meta = data?.meta || { page: 1, totalPages: 1, total: 0 };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-ink tracking-tight">Discover Startups</h1>
        <p className="text-sm text-ink-muted mt-1">
          Explore early-stage ventures actively seeking investor interest and partnerships
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-border p-4 shadow-subtle mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by company name, technology keywords..."
              className="w-full pl-10 pr-9 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Stage Dropdown */}
          <div className="w-full md:w-48">
            <select
              value={stageParam}
              onChange={(e) => updateParams({ stage: e.target.value, page: '1' })}
              className="w-full py-2 px-3 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-ink"
            >
              <option value="ALL">All Stages</option>
              {Object.entries(STAGE_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort selector */}
          <div className="w-full md:w-48">
            <select
              value={sortParam}
              onChange={(e) => updateParams({ sort: e.target.value, page: '1' })}
              className="w-full py-2 px-3 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-ink"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="target-asc">Target: Low to High</option>
              <option value="target-desc">Target: High to Low</option>
            </select>
          </div>
        </div>

        {/* Industry Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 text-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Sector:
          </span>
          <button
            onClick={() => updateParams({ industry: 'ALL', page: '1' })}
            className={`px-3 py-1.5 rounded-full font-medium transition shrink-0 ${
              industryParam === 'ALL'
                ? 'bg-ink text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Sectors
          </button>
          {Object.entries(INDUSTRY_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => updateParams({ industry: key, page: '1' })}
              className={`px-3 py-1.5 rounded-full font-medium transition shrink-0 ${
                industryParam === key
                  ? 'bg-primary text-white font-semibold shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 px-2 py-1 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Showing {startups.length} of {meta.total} published {meta.total === 1 ? 'startup' : 'startups'}
        </p>
      </div>

      {/* Grid of Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <StartupCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          title="Failed to load startups"
          description="A network or server error occurred. Please try again."
          actionText="Retry"
          onAction={() => queryClient.invalidateQueries({ queryKey: ['startups-discovery'] })}
        />
      ) : startups.length === 0 ? (
        <EmptyState
          title="No matching startups found"
          description="Try broadening your search keywords or clearing sector and stage filters to explore more ventures."
          actionText="Clear All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {startups.map((startup: Startup) => (
            <StartupCard
              key={startup._id}
              startup={startup}
              isBookmarked={bookmarkedStartupIds.has(startup._id)}
              onToggleBookmark={handleToggleBookmark}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {meta.totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={pageParam <= 1}
            onClick={() => updateParams({ page: String(pageParam - 1) })}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <span className="text-xs font-medium text-slate-500">
            Page {meta.page} of {meta.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={pageParam >= meta.totalPages}
            onClick={() => updateParams({ page: String(pageParam + 1) })}
            className="gap-1"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
