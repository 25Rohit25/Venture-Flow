import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { Interest, InterestStatus } from '../../lib/types.js';
import { formatDate } from '../../lib/formatters.js';
import { InterestStatusBadge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Card } from '../../components/ui/Card.js';
import { Modal } from '../../components/ui/Modal.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import { useAuth } from '../../app/AuthContext.js';
import { useToast } from '../../components/ui/Toast.js';
import {
  Send,
  Check,
  X,
  RotateCcw,
  Clock,
  CheckCircle,
  Inbox,
  Filter,
} from 'lucide-react';

export function InterestsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const isFounder = user?.role === 'FOUNDER';
  const [statusFilter, setStatusFilter] = useState<InterestStatus | 'ALL'>('ALL');

  // Modal states for response and withdrawal
  const [selectedInterest, setSelectedInterest] = useState<Interest | null>(null);
  const [founderAction, setFounderAction] = useState<'ACCEPTED' | 'DECLINED' | null>(null);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // Fetch data depending on role
  const { data: interests, isLoading } = useQuery({
    queryKey: [isFounder ? 'founder-received-interests' : 'my-interests'],
    queryFn: () =>
      isFounder
        ? api.get<Interest[]>('/me/received-interests')
        : api.get<Interest[]>('/me/interests'),
  });

  // Respond mutation (founder)
  const respondMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'ACCEPTED' | 'DECLINED' }) => {
      return api.patch(`/interests/${id}/status`, { status });
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['founder-received-interests'] });
      queryClient.invalidateQueries({ queryKey: ['founder-dashboard'] });
      setSelectedInterest(null);
      setFounderAction(null);
      success(`Interest request ${status.toLowerCase()}!`);
    },
    onError: (err: any) => {
      toastError(err.message || 'Failed to update interest request.');
    },
  });

  // Withdraw mutation (investor)
  const withdrawMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.post(`/interests/${id}/withdraw`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-interests'] });
      queryClient.invalidateQueries({ queryKey: ['investor-dashboard'] });
      setSelectedInterest(null);
      setIsWithdrawModalOpen(false);
      success('Interest request successfully withdrawn.');
    },
    onError: (err: any) => {
      toastError(err.message || 'Failed to withdraw interest.');
    },
  });

  const allItems = interests || [];
  const filteredItems =
    statusFilter === 'ALL'
      ? allItems
      : allItems.filter((i) => i.status === statusFilter);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight flex items-center gap-2">
            <Send className="w-6 h-6 text-primary" />
            {isFounder ? 'Received Interest Pipeline' : 'My Expressed Interests'}
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            {isFounder
              ? 'Review inbound investor queries and accept or decline discussions atomically'
              : 'Monitor the status of your introductory investment requests to founders'}
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-border shadow-subtle text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
          {(['ALL', 'PENDING', 'ACCEPTED', 'DECLINED', 'WITHDRAWN'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                statusFilter === st
                  ? 'bg-primary text-white font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-ink'
              }`}
            >
              {st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main List */}
      <Card className="p-6">
        {isLoading ? (
          <div className="py-12 text-center text-slate-400">Loading requests...</div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="No Interest Requests Found"
            description={
              isFounder
                ? 'When investors express interest in your published startups, their requests will appear here.'
                : 'Browse the Discover directory to evaluate opportunities and reach out to founders.'
            }
            actionText={isFounder ? undefined : 'Explore Discover Feed'}
            onAction={isFounder ? undefined : () => window.location.assign('/discover')}
          />
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => {
              const startup = typeof item.startupId === 'object' ? item.startupId : null;
              const startupName = startup?.name || 'Venture';
              const investorName =
                typeof item.investorId === 'object' ? item.investorId.name : 'Investor';

              return (
                <div
                  key={item._id}
                  className="p-5 rounded-xl border border-border bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-ink text-sm">
                        {isFounder ? investorName : startupName}
                      </span>
                      <span className="text-xs text-slate-400">
                        {isFounder ? '→ requested for' : '• startup'}
                      </span>
                      {isFounder && startup && (
                        <Link
                          to={`/startups/${startup._id}`}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          {startupName}
                        </Link>
                      )}
                      <InterestStatusBadge status={item.status} />
                      <span className="text-[11px] text-slate-400 ml-auto md:ml-0">
                        Submitted on {formatDate(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 bg-background p-3 rounded-lg border border-border leading-relaxed">
                      "{item.message}"
                    </p>

                    {item.respondedAt && (
                      <p className="text-[11px] text-slate-400">
                        Responded by founder on {formatDate(item.respondedAt)}
                      </p>
                    )}
                  </div>

                  {/* Actions depending on role */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    {isFounder && item.status === 'PENDING' && (
                      <>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            setSelectedInterest(item);
                            setFounderAction('ACCEPTED');
                          }}
                          className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedInterest(item);
                            setFounderAction('DECLINED');
                          }}
                          className="gap-1 text-rose-600 border-rose-200 hover:bg-rose-50"
                        >
                          <X className="w-3.5 h-3.5" />
                          Decline
                        </Button>
                      </>
                    )}

                    {!isFounder && item.status === 'PENDING' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedInterest(item);
                          setIsWithdrawModalOpen(true);
                        }}
                        className="gap-1 text-slate-500 hover:text-rose-600"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Withdraw
                      </Button>
                    )}

                    {startup && (
                      <Link to={`/startups/${startup._id}`}>
                        <Button size="sm" variant="ghost">
                          View Pitch
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Founder Response Modal */}
      <Modal
        isOpen={Boolean(selectedInterest && founderAction)}
        onClose={() => {
          setSelectedInterest(null);
          setFounderAction(null);
        }}
        title={`${founderAction === 'ACCEPTED' ? 'Accept' : 'Decline'} Expression of Interest`}
        description="This will update the pipeline status and inform the investor."
      >
        {selectedInterest && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Are you sure you want to transition this request to{' '}
              <strong className={founderAction === 'ACCEPTED' ? 'text-emerald-600' : 'text-rose-600'}>
                {founderAction}
              </strong>
              ?
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setSelectedInterest(null);
                  setFounderAction(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant={founderAction === 'ACCEPTED' ? 'primary' : 'danger'}
                size="md"
                onClick={() => {
                  if (founderAction) {
                    respondMutation.mutate({
                      id: selectedInterest._id,
                      status: founderAction,
                    });
                  }
                }}
                isLoading={respondMutation.isPending}
              >
                Confirm {founderAction}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Investor Withdraw Modal */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => {
          setIsWithdrawModalOpen(false);
          setSelectedInterest(null);
        }}
        title="Withdraw Expression of Interest"
        description="Are you sure you want to withdraw this request? Per MVP rules, withdrawn requests cannot be resubmitted."
      >
        {selectedInterest && (
          <div className="space-y-4">
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setIsWithdrawModalOpen(false);
                  setSelectedInterest(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={() => withdrawMutation.mutate(selectedInterest._id)}
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
