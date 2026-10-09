import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api.js';
import { Bookmark, Startup } from '../../lib/types.js';
import { StartupCard } from '../../components/shared/StartupCard.js';
import { StartupCardSkeleton } from '../../components/ui/Skeleton.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import { Button } from '../../components/ui/Button.js';
import { useToast } from '../../components/ui/Toast.js';
import { Bookmark as BookmarkIcon, Compass } from 'lucide-react';

export function BookmarksPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const { data: bookmarks, isLoading } = useQuery({
    queryKey: ['my-bookmarks'],
    queryFn: () => api.get<Bookmark[]>('/me/bookmarks'),
  });

  const removeBookmarkMutation = useMutation({
    mutationFn: async (startupId: string) => {
      await api.delete(`/startups/${startupId}/bookmark`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['investor-dashboard'] });
      success('Startup removed from saved bookmarks.');
    },
    onError: () => {
      toastError('Failed to remove bookmark.');
    },
  });

  const items = bookmarks || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight flex items-center gap-2">
            <BookmarkIcon className="w-6 h-6 text-primary" />
            Saved Startups Watchlist
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Venture opportunities you have saved for continued due diligence and evaluation
          </p>
        </div>

        <Link to="/discover">
          <Button variant="outline" size="sm" className="gap-2">
            <Compass className="w-4 h-4" />
            Find More Startups
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <StartupCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No Saved Startups"
          description="When you discover interesting startup profiles, save them to your watchlist to monitor updates and reach out."
          actionText="Explore Discover Feed"
          onAction={() => window.location.assign('/discover')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((b) => {
            const startup = b.startupId as Startup;
            if (!startup) return null;

            return (
              <StartupCard
                key={b._id}
                startup={startup}
                isBookmarked={true}
                onToggleBookmark={(startupId) => removeBookmarkMutation.mutate(startupId)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
