import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../../lib/api.js';
import {
  FounderDashboardData,
  Startup,
  Interest,
} from '../../lib/types.js';
import {
  formatINRCompact,
  formatDate,
} from '../../lib/formatters.js';
import {
  StartupStatusBadge,
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
  PlusCircle,
  Building,
  Clock,
  CheckCircle,
  Inbox,
  TrendingUp,
  Edit,
  Send,
  Eye,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';

export function FounderDashboardPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [activeInterest, setActiveInterest] = useState<Interest | null>(null);
  const [responseAction, setResponseAction] = useState<'ACCEPTED' | 'DECLINED' | null>(null);

  // Fetch Founder Dashboard Aggregates
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['founder-dashboard'],
    queryFn: () => api.get<FounderDashboardData>('/dashboard/founder'),
  });

  // Fetch Founder's startups
  const { data: myStartups, isLoading: isStartupsLoading } = useQuery({
    queryKey: ['my-startups'],
    queryFn: () => api.get<Startup[]>('/me/startups'),
  });

  // Fetch received interests
  const { data: receivedInterests } = useQuery({
    queryKey: ['founder-received-interests'],
    queryFn: () => api.get<Interest[]>('/me/received-interests'),
  });

  // Status toggle mutation for startups
  const startupStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'PUBLISHED' | 'ARCHIVED' }) => {
      return api.patch(`/startups/${id}/status`, { status });
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['my-startups'] });
      queryClient.invalidateQueries({ queryKey: ['founder-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['startups-discovery'] });
      success(`Startup status updated to ${status}!`);
    },
    onError: (err: any) => {
      toastError(err.message || 'Failed to update status.');
    },
  });

  // Respond to interest mutation
  const respondMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'ACCEPTED' | 'DECLINED' }) => {
      return api.patch(`/interests/${id}/status`, { status });
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['founder-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['founder-received-interests'] });
      setActiveInterest(null);
      setResponseAction(null);
      success(`Interest request ${status.toLowerCase()} successfully!`);
    },
    onError: (err: any) => {
      toastError(err.message || 'Failed to update interest status.');
    },
  });

  const handleOpenResponse = (interest: Interest, action: 'ACCEPTED' | 'DECLINED') => {
    setActiveInterest(interest);
    setResponseAction(action);
  };

  const handleConfirmResponse = () => {
    if (activeInterest && responseAction) {
      respondMutation.mutate({ id: activeInterest._id, status: responseAction });
    }
  };

  if (isDashboardLoading) {
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
    publishedStartups: 0,
    draftStartups: 0,
    pendingInterests: 0,
    acceptedInterests: 0,
    totalInterestsReceived: 0,
  };

  const chartData = dashboardData?.activityLast7Days || [];
  const pendingRequests = (receivedInterests || []).filter((i) => i.status === 'PENDING');

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Founder Dashboard
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Monitor your venture profiles, funding targets, and inbound investor expressions of interest
          </p>
        </div>

        <Link to="/dashboard/startups/new">
          <Button variant="primary" size="md" className="gap-2 shadow-sm">
            <PlusCircle className="w-4 h-4" />
            Create Startup
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Published Ventures"
          value={stats.publishedStartups}
          subtext={`${stats.draftStartups} draft`}
          icon={Building}
          color="primary"
        />
        <StatCard
          label="Pending Interests"
          value={stats.pendingInterests}
          subtext="Requires your response"
          icon={Clock}
          color="amber"
        />
        <StatCard
          label="Accepted Connections"
          value={stats.acceptedInterests}
          subtext="Active discussions"
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          label="Total Received"
          value={stats.totalInterestsReceived}
          subtext="All time interest pipeline"
          icon={Inbox}
          color="slate"
        />
      </div>

      {/* Chart: 7-Day Inbound Activity */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-ink">Inbound Interest Activity (Last 7 Days)</h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Daily counts of new investor interest submissions on your ventures
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-600">
            Real Aggregation
          </span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="founderGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6D5EF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6D5EF6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
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
                formatter={(val) => [`${val} requests`, 'Inbound Interest']}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#6D5EF6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#founderGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Incoming Requests Pipeline */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <Inbox className="w-5 h-5 text-primary" />
              Incoming Investor Requests
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Review messages from investors and accept or decline conversation requests
            </p>
          </div>
          <Link
            to="/dashboard/interests"
            className="text-xs font-semibold text-primary hover:text-primary-hover"
          >
            View Full Pipeline →
          </Link>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            No pending investor requests right now. All requests have been reviewed!
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.slice(0, 3).map((req) => {
              const startupName =
                typeof req.startupId === 'object' ? req.startupId.name : 'Your Startup';
              const investorName =
                typeof req.investorId === 'object' ? req.investorId.name : 'Investor';

              return (
                <div
                  key={req._id}
                  className="p-4 rounded-xl border border-border bg-white hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-ink">{investorName}</span>
                      <span className="text-xs text-slate-400">• expressed interest in</span>
                      <span className="text-xs font-semibold text-primary">{startupName}</span>
                      <span className="text-[11px] text-slate-400">({formatDate(req.createdAt)})</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 italic">
                      "{req.message}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleOpenResponse(req, 'ACCEPTED')}
                      className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenResponse(req, 'DECLINED')}
                      className="gap-1 text-rose-600 border-rose-200 hover:bg-rose-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      Decline
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* My Startups Management Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-ink">My Startup Ventures</h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Manage your company profiles, draft stages, and publication status
            </p>
          </div>
          <Link to="/dashboard/startups/new">
            <Button size="sm" variant="outline">
              + Add Startup
            </Button>
          </Link>
        </div>

        {isStartupsLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : !myStartups || myStartups.length === 0 ? (
          <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <p className="text-sm text-slate-500 mb-3">You haven't created any startups yet.</p>
            <Link to="/dashboard/startups/new">
              <Button size="sm" variant="primary">
                Create First Startup
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Startup</th>
                  <th className="py-3 px-4">Sector</th>
                  <th className="py-3 px-4">Funding Target</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myStartups.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-ink">{s.name}</div>
                      <div className="text-slate-400 truncate max-w-xs">{s.tagline}</div>
                    </td>
                    <td className="py-3 px-4">
                      <IndustryBadge industry={s.industry} />
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-ink">
                      {formatINRCompact(s.targetAmount)}
                    </td>
                    <td className="py-3 px-4">
                      <StartupStatusBadge status={s.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {s.status === 'DRAFT' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() =>
                              startupStatusMutation.mutate({ id: s._id, status: 'PUBLISHED' })
                            }
                            isLoading={startupStatusMutation.isPending}
                            className="text-xs h-7 px-2.5"
                          >
                            Publish
                          </Button>
                        )}

                        {s.status === 'PUBLISHED' && (
                          <>
                            <Link to={`/startups/${s._id}`}>
                              <Button size="sm" variant="ghost" className="text-xs h-7 px-2">
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                startupStatusMutation.mutate({ id: s._id, status: 'ARCHIVED' })
                              }
                              className="text-xs h-7 px-2.5 text-slate-500"
                            >
                              Archive
                            </Button>
                          </>
                        )}

                        <Link to={`/dashboard/startups/${s._id}/edit`}>
                          <Button size="sm" variant="ghost" className="text-xs h-7 px-2">
                            <Edit className="w-3.5 h-3.5 text-slate-500" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Response Confirmation Modal */}
      <Modal
        isOpen={Boolean(activeInterest)}
        onClose={() => {
          setActiveInterest(null);
          setResponseAction(null);
        }}
        title={`${responseAction === 'ACCEPTED' ? 'Accept' : 'Decline'} Expression of Interest`}
        description="This state transition is race-safe and recorded atomically in the database."
      >
        {activeInterest && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <p>
                <strong>Investor:</strong>{' '}
                {typeof activeInterest.investorId === 'object'
                  ? activeInterest.investorId.name
                  : 'Investor'}
              </p>
              <p>
                <strong>Message:</strong> "{activeInterest.message}"
              </p>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to mark this request as{' '}
              <strong className={responseAction === 'ACCEPTED' ? 'text-emerald-600' : 'text-rose-600'}>
                {responseAction}
              </strong>
              ? Once processed, the investor will see your updated decision.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setActiveInterest(null);
                  setResponseAction(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant={responseAction === 'ACCEPTED' ? 'primary' : 'danger'}
                size="md"
                onClick={handleConfirmResponse}
                isLoading={respondMutation.isPending}
              >
                Confirm {responseAction}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
