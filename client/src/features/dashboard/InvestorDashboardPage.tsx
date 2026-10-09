import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../../lib/api.js';
import {
  InvestorDashboardData,
  Interest,
} from '../../lib/types.js';
import {
  formatDate,
  formatINRCompact,
} from '../../lib/formatters.js';
import {
  InterestStatusBadge,
  IndustryBadge,
} from '../../components/ui/Badge.js';
import { StatCard } from '../../components/shared/StatCard.js';
import { Button } from '../../components/ui/Button.js';
import { Card } from '../../components/ui/Card.js';
import { Modal } from '../../components/ui/Modal.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { useToast } from '../../components/ui/Toast.js';
import {
  Compass,
  Bookmark,
  Send,
  CheckCircle,
  Clock,
  XCircle,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';

export function InvestorDashboardPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [withdrawInterestItem, setWithdrawInterestItem] = useState<Interest | null>(null);

  // Fetch Investor Dashboard aggregates
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['investor-dashboard'],
    queryFn: () => api.get<InvestorDashboardData>('/dashboard/investor'),
  });

  // Withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: async (interestId: string) => {
      return api.post(`/interests/${interestId}/withdraw`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investor-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['my-interests'] });
      setWithdrawInterestItem(null);
      success('Interest request successfully withdrawn.');
    },
    onError: (err: any) => {
      toastError(err.message || 'Failed to withdraw interest request.');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    totalSubmitted: 0,
    pending: 0,
    accepted: 0,
    declined: 0,
    withdrawn: 0,
    savedBookmarks: 0,
  };

  const chartData = dashboardData?.activityLast7Days || [];
  const recentInterests = dashboardData?.recentInterests || [];
  const savedStartups = dashboardData?.savedStartups || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Investor Dashboard
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Track your deal evaluation flow, active introductory discussions, and bookmarked ventures
          </p>
        </div>

        <Link to="/discover">
          <Button variant="primary" size="md" className="gap-2 shadow-sm">
            <Compass className="w-4 h-4" />
            Discover Startups
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Pending Review"
          value={stats.pending}
          subtext="Awaiting founder response"
          icon={Clock}
          color="amber"
        />
        <StatCard
          label="Accepted Connections"
          value={stats.accepted}
          subtext="Founders agreed to talk"
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          label="Saved Bookmarks"
          value={stats.savedBookmarks}
          subtext="Watchlist ventures"
          icon={Bookmark}
          color="primary"
        />
        <StatCard
          label="Total Submissions"
          value={stats.totalSubmitted}
          subtext={`${stats.declined} declined, ${stats.withdrawn} withdrawn`}
          icon={Send}
          color="slate"
        />
      </div>

      {/* Chart: Submitted Activity */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-ink">My Evaluation Activity (Last 7 Days)</h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Daily volume of new expressions of interest submitted across sectors
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-600">
            Real Grouped Data
          </span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={12}
                tickFormatter={(val) => {
                  const parts = val.split('-');
                  return `${parts[1]}/${parts[2]}`;
                }}
              />
              <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                }}
                labelFormatter={(label) => `Date: ${label}`}
                formatter={(val) => [`${val} requests`, 'Expressions of Interest']}
              />
              <Bar dataKey="count" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Two Column Section: Recent Expressions & Saved Startups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Expressions of Interest */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-ink">Recent Outbound Interests</h2>
                <p className="text-xs text-ink-muted mt-0.5">
                  Latest status from founders on your introductory requests
                </p>
              </div>
              <Link
                to="/dashboard/interests"
                className="text-xs font-semibold text-primary hover:text-primary-hover"
              >
                View All →
              </Link>
            </div>

            {recentInterests.length === 0 ? (
              <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <p className="text-sm text-slate-500 mb-3">You haven't submitted any interest requests yet.</p>
                <Link to="/discover">
                  <Button size="sm" variant="primary">
                    Browse Startups
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentInterests.slice(0, 4).map((item) => {
                  const s = typeof item.startupId === 'object' ? item.startupId : null;
                  const name = s ? s.name : 'Startup';

                  return (
                    <div
                      key={item._id}
                      className="p-3.5 rounded-xl border border-border bg-white hover:border-slate-300 transition flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-ink truncate">{name}</span>
                          <InterestStatusBadge status={item.status} />
                        </div>
                        <p className="text-slate-500 truncate italic">"{item.message}"</p>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {item.status === 'PENDING' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setWithdrawInterestItem(item)}
                            className="text-xs h-7 px-2 text-slate-500 hover:text-rose-600"
                          >
                            Withdraw
                          </Button>
                        )}
                        {s && (
                          <Link to={`/startups/${s._id}`}>
                            <Button size="sm" variant="ghost" className="text-xs h-7 px-2">
                              View
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Recently Saved Bookmarks */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-ink">Saved Startups Watchlist</h2>
                <p className="text-xs text-ink-muted mt-0.5">
                  Bookmarked opportunities you are monitoring
                </p>
              </div>
              <Link
                to="/dashboard/bookmarks"
                className="text-xs font-semibold text-primary hover:text-primary-hover"
              >
                View All ({stats.savedBookmarks}) →
              </Link>
            </div>

            {savedStartups.length === 0 ? (
              <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <p className="text-sm text-slate-500 mb-3">No saved startups yet.</p>
                <Link to="/discover">
                  <Button size="sm" variant="outline">
                    Explore Directory
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {savedStartups.slice(0, 4).map((b) => {
                  const s = b.startupId;
                  if (!s) return null;

                  return (
                    <div
                      key={b._id}
                      className="p-3.5 rounded-xl border border-border bg-white hover:border-slate-300 transition flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-bold text-ink truncate">{s.name}</span>
                          <IndustryBadge industry={s.industry} />
                        </div>
                        <p className="text-slate-500 truncate">{s.tagline}</p>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="text-[11px] text-slate-400 block">Target</span>
                        <span className="font-bold font-mono text-ink">
                          {formatINRCompact(s.targetAmount)}
                        </span>
                      </div>

                      <Link to={`/startups/${s._id}`} className="shrink-0">
                        <Button size="sm" variant="outline" className="text-xs h-7 px-2">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Withdraw Modal */}
      <Modal
        isOpen={Boolean(withdrawInterestItem)}
        onClose={() => setWithdrawInterestItem(null)}
        title="Withdraw Expression of Interest"
        description="Are you sure you want to withdraw this pending request? Per MVP rules, withdrawn requests cannot be resubmitted."
      >
        {withdrawInterestItem && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              The founder will see that this request has been withdrawn, and the status transition is recorded atomically.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="md"
                onClick={() => setWithdrawInterestItem(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={() => withdrawMutation.mutate(withdrawInterestItem._id)}
                isLoading={withdrawMutation.isPending}
              >
                Confirm Withdrawal
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
