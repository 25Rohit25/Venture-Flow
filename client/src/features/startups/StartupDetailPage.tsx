import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../../lib/api.js';
import { Startup, Interest } from '../../lib/types.js';
import { formatINR, formatDate } from '../../lib/formatters.js';
import { IndustryBadge, StageBadge, InterestStatusBadge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Card } from '../../components/ui/Card.js';
import { Modal } from '../../components/ui/Modal.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import { useAuth } from '../../app/AuthContext.js';
import { useToast } from '../../components/ui/Toast.js';
import {
  ArrowLeft,
  Building,
  MapPin,
  Calendar,
  Send,
  Bookmark,
  CheckCircle,
  AlertCircle,
  Info,
  UserCheck,
} from 'lucide-react';

export function StartupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  const [interestMessage, setInterestMessage] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  const isInvestor = user?.role === 'INVESTOR';
  const isFounder = user?.role === 'FOUNDER';

  // Fetch Startup details
  const { data: startup, isLoading, isError } = useQuery({
    queryKey: ['startup-detail', id],
    queryFn: () => api.get<Startup>(`/startups/${id}`),
    enabled: Boolean(id),
  });

  // Check if current investor has bookmarked
  const { data: bookmarkStatus } = useQuery({
    queryKey: ['bookmark-check', id],
    queryFn: () => api.get<{ isBookmarked: boolean }>(`/startups/${id}/bookmark/status`),
    enabled: Boolean(id) && isInvestor,
  });

  // Check if current investor already expressed interest
  const { data: investorInterests } = useQuery({
    queryKey: ['my-interests'],
    queryFn: () => api.get<Interest[]>('/me/interests'),
    enabled: isInvestor,
  });

  const existingInterest = (investorInterests || []).find((item) => {
    const sId = typeof item.startupId === 'object' ? item.startupId._id : item.startupId;
    return sId === id;
  });

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: async (isCurrentlySaved: boolean) => {
      if (isCurrentlySaved) {
        await api.delete(`/startups/${id}/bookmark`);
      } else {
        await api.post(`/startups/${id}/bookmark`);
      }
    },
    onSuccess: (_, isCurrentlySaved) => {
      queryClient.invalidateQueries({ queryKey: ['bookmark-check', id] });
      queryClient.invalidateQueries({ queryKey: ['my-bookmarks'] });
      success(isCurrentlySaved ? 'Removed from saved bookmarks.' : 'Startup bookmarked successfully!');
    },
    onError: () => {
      toastError('Failed to update bookmark status.');
    },
  });

  // Express interest mutation
  const interestMutation = useMutation({
    mutationFn: async (message: string) => {
      return api.post(`/startups/${id}/interests`, { message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-interests'] });
      queryClient.invalidateQueries({ queryKey: ['investor-dashboard'] });
      setIsInterestModalOpen(false);
      setInterestMessage('');
      success('Interest expressed successfully! The founder will review your request.');
    },
    onError: (err: any) => {
      if (err instanceof ApiError && err.code === 'INTEREST_ALREADY_EXISTS') {
        setModalError('You have already submitted an expression of interest for this venture.');
      } else {
        setModalError(err.message || 'Failed to submit interest. Please try again.');
      }
    },
  });

  const handleSendInterest = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    if (interestMessage.trim().length < 20) {
      setModalError('Your message must be at least 20 characters.');
      return;
    }
    interestMutation.mutate(interestMessage.trim());
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !startup) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <EmptyState
          title="Startup Not Found"
          description="The startup profile you are looking for may be unpublished or does not exist."
          actionText="Back to Discover"
          onAction={() => navigate('/discover')}
        />
      </div>
    );
  }

  const founderName =
    typeof startup.founderId === 'object' && startup.founderId?.name
      ? startup.founderId.name
      : 'Founder';

  const isOwner = user && typeof startup.founderId === 'object' && startup.founderId?._id === user.id;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation Breadcrumb */}
      <Link
        to="/discover"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-ink mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Discover Startups
      </Link>

      {/* Main Pitch Card */}
      <div className="bg-white rounded-2xl border border-border shadow-subtle p-6 sm:p-8 mb-8">
        {/* Top Badges & Meta */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <IndustryBadge industry={startup.industry} />
            <StageBadge stage={startup.stage} />
            {startup.status !== 'PUBLISHED' && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {startup.status}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            {startup.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Published {formatDate(startup.publishedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Title & Tagline */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
          {startup.name}
        </h1>
        <p className="text-lg text-ink-muted mt-2 leading-relaxed font-medium">
          {startup.tagline}
        </p>

        {/* Key Metrics Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8 p-4 bg-background rounded-xl border border-border">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Funding Target
            </span>
            <span className="text-2xl font-black text-ink">{formatINR(startup.targetAmount)}</span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Founder Profile
            </span>
            <span className="text-sm font-bold text-ink flex items-center gap-1.5 mt-1">
              <UserCheck className="w-4 h-4 text-primary" />
              {founderName}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Headquarters
            </span>
            <span className="text-sm font-medium text-slate-700 flex items-center gap-1 mt-1">
              <MapPin className="w-4 h-4 text-slate-400" />
              {startup.location || 'Pan India / Remote'}
            </span>
          </div>
        </div>

        {/* Investor Actions Bar */}
        {isInvestor && (
          <div className="pt-2 pb-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
            {/* Existing Interest Status Banner */}
            {existingInterest ? (
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex-1">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-semibold text-ink">You expressed interest: </span>
                  <InterestStatusBadge status={existingInterest.status} />
                  <span className="text-slate-500 ml-2">
                    on {formatDate(existingInterest.createdAt)}
                  </span>
                </div>
              </div>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setModalError(null);
                  setIsInterestModalOpen(true);
                }}
                className="gap-2 shadow-sm"
              >
                <Send className="w-4 h-4" />
                Express Investor Interest
              </Button>
            )}

            <Button
              variant="outline"
              size="md"
              onClick={() => bookmarkMutation.mutate(!!bookmarkStatus?.isBookmarked)}
              isLoading={bookmarkMutation.isPending}
              className={`gap-2 ${
                bookmarkStatus?.isBookmarked
                  ? 'border-rose-300 text-rose-600 bg-rose-50/50'
                  : ''
              }`}
            >
              <Bookmark className={`w-4 h-4 ${bookmarkStatus?.isBookmarked ? 'fill-current' : ''}`} />
              {bookmarkStatus?.isBookmarked ? 'Saved to Bookmarks' : 'Bookmark Startup'}
            </Button>
          </div>
        )}

        {/* If Founder Owner Viewing */}
        {isOwner && (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl mb-6 flex items-center justify-between">
            <span className="text-xs font-medium text-purple-900">
              You are the founder of this startup profile.
            </span>
            <Link to={`/dashboard/startups/${startup._id}/edit`}>
              <Button size="sm" variant="outline">
                Edit Startup
              </Button>
            </Link>
          </div>
        )}

        {/* If Guest Viewing */}
        {!user && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl my-6 flex items-center justify-between text-xs">
            <span className="text-slate-600">
              Sign in as an <strong>Investor</strong> to express interest or save this venture.
            </span>
            <Link to="/login">
              <Button size="sm" variant="primary">
                Sign In
              </Button>
            </Link>
          </div>
        )}

        {/* Narrative Description Section */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-ink mb-3">Pitch & Overview</h2>
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-4">
            {startup.description}
          </div>
        </div>
      </div>

      {/* Express Interest Modal */}
      <Modal
        isOpen={isInterestModalOpen}
        onClose={() => setIsInterestModalOpen(false)}
        title={`Express Interest in ${startup.name}`}
        description="Introduce your investment focus. The founder will receive your message and can accept or decline conversation requests."
      >
        <form onSubmit={handleSendInterest} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-ink uppercase tracking-wider">
                Introduction Note
              </label>
              <span
                className={`text-[11px] font-mono ${
                  interestMessage.length < 20 || interestMessage.length > 500
                    ? 'text-amber-600 font-semibold'
                    : 'text-slate-400'
                }`}
              >
                {interestMessage.length} / 500 chars (min 20)
              </span>
            </div>
            <textarea
              required
              rows={4}
              value={interestMessage}
              onChange={(e) => setInterestMessage(e.target.value)}
              placeholder="e.g. We lead seed-stage investments in digital health. We would love to evaluate your traction and speak with the founding team."
              className="w-full p-3 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>
              Per platform integrity rules, each investor can express interest once per startup. This request will enter the founder's atomic review pipeline.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsInterestModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={interestMessage.trim().length < 20 || interestMessage.trim().length > 500}
              isLoading={interestMutation.isPending}
            >
              Submit Interest
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
