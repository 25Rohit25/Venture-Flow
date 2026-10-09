import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../../lib/api.js';
import { Startup, IndustryType, StageType } from '../../lib/types.js';
import { INDUSTRY_LABELS, STAGE_LABELS, formatINRCompact } from '../../lib/formatters.js';
import { Button } from '../../components/ui/Button.js';
import { Card } from '../../components/ui/Card.js';
import { IndustryBadge, StageBadge } from '../../components/ui/Badge.js';
import { useToast } from '../../components/ui/Toast.js';
import { ArrowLeft, Save, Send, AlertTriangle, Eye, Sparkles } from 'lucide-react';

export function StartupEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState<IndustryType>('SAAS');
  const [stage, setStage] = useState<StageType>('MVP');
  const [targetAmount, setTargetAmount] = useState<number>(2500000);
  const [location, setLocation] = useState('Bengaluru, Karnataka');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If editing, fetch startup details
  const { data: existingStartup, isLoading: isFetching } = useQuery({
    queryKey: ['my-startup-detail', id],
    queryFn: () => api.get<Startup>(`/me/startups/${id}`),
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingStartup) {
      setName(existingStartup.name);
      setTagline(existingStartup.tagline);
      setDescription(existingStartup.description);
      setIndustry(existingStartup.industry);
      setStage(existingStartup.stage);
      setTargetAmount(existingStartup.targetAmount);
      setLocation(existingStartup.location || '');
    }
  }, [existingStartup]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async ({ shouldPublish }: { shouldPublish: boolean }) => {
      const startup = await api.post<Startup>('/startups', {
        name: name.trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        industry,
        stage,
        targetAmount: Number(targetAmount),
        location: location.trim() || undefined,
      });

      if (shouldPublish) {
        await api.patch(`/startups/${startup._id}/status`, { status: 'PUBLISHED' });
      }
      return startup;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['my-startups'] });
      queryClient.invalidateQueries({ queryKey: ['founder-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['startups-discovery'] });
      success(variables.shouldPublish ? 'Startup published live!' : 'Startup saved as draft!');
      navigate('/dashboard/founder');
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Failed to save startup.');
      toastError('Failed to save startup.');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async () => {
      return api.patch<Startup>(`/startups/${id}`, {
        name: name.trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        industry,
        stage,
        targetAmount: Number(targetAmount),
        location: location.trim() || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-startups'] });
      queryClient.invalidateQueries({ queryKey: ['my-startup-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['startup-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['founder-dashboard'] });
      success('Startup details updated successfully!');
      navigate('/dashboard/founder');
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Failed to update startup.');
      toastError('Failed to update startup.');
    },
  });

  // Status mutation
  const statusMutation = useMutation({
    mutationFn: async (status: 'PUBLISHED' | 'ARCHIVED') => {
      return api.patch<Startup>(`/startups/${id}/status`, { status });
    },
    onSuccess: (_, status) => {
      queryClient.invalidateQueries({ queryKey: ['my-startups'] });
      queryClient.invalidateQueries({ queryKey: ['my-startup-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['founder-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['startups-discovery'] });
      success(`Startup status updated to ${status}!`);
      navigate('/dashboard/founder');
    },
    onError: (err: any) => {
      toastError(err.message || 'Failed to update status.');
    },
  });

  const validate = (): boolean => {
    setErrorMessage(null);
    if (name.trim().length < 2) {
      setErrorMessage('Startup name must be at least 2 characters.');
      return false;
    }
    if (tagline.trim().length < 5) {
      setErrorMessage('Tagline must be at least 5 characters.');
      return false;
    }
    if (description.trim().length < 100) {
      setErrorMessage('Description must be at least 100 characters to provide a meaningful pitch.');
      return false;
    }
    if (!targetAmount || targetAmount < 10000) {
      setErrorMessage('Target funding amount must be at least ₹10,000.');
      return false;
    }
    return true;
  };

  const handleSave = (publish: boolean) => {
    if (!validate()) return;
    if (isEditing) {
      updateMutation.mutate();
    } else {
      createMutation.mutate({ shouldPublish: publish });
    }
  };

  if (isEditing && isFetching) {
    return <div className="p-8 text-center text-slate-400">Loading startup details...</div>;
  }

  const isSaving = createMutation.isPending || updateMutation.isPending || statusMutation.isPending;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/dashboard/founder"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-ink mb-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            {isEditing ? `Edit ${name || 'Startup'}` : 'Create New Startup'}
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Fill in your venture profile and funding requirements to reach potential investors
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              {existingStartup?.status === 'DRAFT' && (
                <Button
                  variant="primary"
                  onClick={() => statusMutation.mutate('PUBLISHED')}
                  isLoading={isSaving}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                  Publish Live
                </Button>
              )}

              {existingStartup?.status === 'PUBLISHED' && (
                <Button
                  variant="outline"
                  onClick={() => statusMutation.mutate('ARCHIVED')}
                  isLoading={isSaving}
                  className="gap-2 text-slate-600 hover:text-slate-900"
                >
                  Archive Profile
                </Button>
              )}

              {existingStartup?.status === 'ARCHIVED' && (
                <Button
                  variant="outline"
                  onClick={() => statusMutation.mutate('PUBLISHED')}
                  isLoading={isSaving}
                  className="gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                >
                  Unarchive & Publish
                </Button>
              )}

              <Button
                variant="primary"
                onClick={() => handleSave(false)}
                isLoading={isSaving}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => handleSave(false)}
                isLoading={isSaving}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                Save as Draft
              </Button>
              <Button
                variant="primary"
                onClick={() => handleSave(true)}
                isLoading={isSaving}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                Publish Immediately
              </Button>
            </>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Editor Grid: Form & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <Card className="p-6 sm:p-8 lg:col-span-2 space-y-6">
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Startup Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Northstar Health"
              className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-ink uppercase tracking-wider">
                Tagline *
              </label>
              <span className="text-[11px] text-slate-400 font-mono">{tagline.length} / 160</span>
            </div>
            <input
              type="text"
              required
              maxLength={160}
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Better triage for modern clinics"
              className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Industry Sector *
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value as IndustryType)}
                className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-ink"
              >
                {Object.entries(INDUSTRY_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Stage of Development *
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as StageType)}
                className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-ink"
              >
                {Object.entries(STAGE_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Target Funding (INR ₹) *
              </label>
              <input
                type="number"
                required
                min={10000}
                step={50000}
                value={targetAmount}
                onChange={(e) => setTargetAmount(parseInt(e.target.value, 10) || 0)}
                placeholder="2500000"
                className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-mono"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Formatted: {formatINRCompact(targetAmount)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Location (Headquarters)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bengaluru, Karnataka"
                className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-ink uppercase tracking-wider">
                Pitch Description *
              </label>
              <span
                className={`text-[11px] font-mono ${
                  description.length < 100 ? 'text-amber-600 font-semibold' : 'text-slate-400'
                }`}
              >
                {description.length} / 4000 (min 100 characters)
              </span>
            </div>
            <textarea
              required
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a thorough overview of your problem statement, solution, target market, current traction metrics, and how the target capital will be deployed..."
              className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition leading-relaxed"
            />
          </div>
        </Card>

        {/* Live Preview Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Eye className="w-4 h-4 text-primary" />
            <span>Card Preview in Discover Feed</span>
          </div>

          {/* Render Mock Card */}
          <div className="bg-white rounded-xl border border-border shadow-subtle p-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <IndustryBadge industry={industry} />
                <StageBadge stage={stage} />
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                Preview
              </span>
            </div>

            <h3 className="text-base font-bold text-ink">{name || 'Your Startup Name'}</h3>
            <p className="text-sm text-ink-muted mt-1.5 line-clamp-2">
              {tagline || 'Your compelling one-line proposition goes here.'}
            </p>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                  Target
                </span>
                <span className="text-sm font-bold text-ink">
                  {formatINRCompact(targetAmount)}
                </span>
              </div>
              <span className="text-xs text-primary font-semibold">View Pitch →</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 space-y-2">
            <div className="font-semibold text-ink flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Publisher Tips
            </div>
            <p>
              • <strong>DRAFT</strong> startups are visible only to you. You can preview, edit, and publish whenever you are ready.
            </p>
            <p>
              • Once <strong>PUBLISHED</strong>, your startup appears in public discovery feeds and verified investors can submit interest.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
