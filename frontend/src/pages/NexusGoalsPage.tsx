import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { z } from 'zod';
import { GoalDescriptionPromptButton } from '../components/goals/GoalDescriptionPromptButton';
import { GoalProgressBar } from '../components/goals/GoalProgressBar';
import { GoalsPageLayout } from '../components/goals/GoalsPageLayout';
import { StatusSelect } from '../components/goals/StatusSelect';
import { computeGoalProgress, type GoalProgressContext } from '../lib/goals/goalProgress';
import { goalEditFormSchema, newGoalWithTargetSchema, subGoalFormSchema } from '../lib/goals/schemas';
import {
  btnDanger,
  btnGhost,
  btnPrimary,
  errorClass,
  inputClass,
  labelClass,
  textareaClass,
} from '../lib/goals/ui';
import type { DashboardResponse, Goal, SubGoal } from '../types/goals';
import { goalsApiRequest } from '../utils/nexus-goals-api';

type NewGoalIn = z.input<typeof newGoalWithTargetSchema>;
type EditGoalIn = z.input<typeof goalEditFormSchema>;
type EditGoalOut = z.output<typeof goalEditFormSchema>;
type SubGoalIn = z.infer<typeof subGoalFormSchema>;

function parseTargetKg(s: string | undefined): number | undefined {
  const t = s?.trim();
  if (!t) return undefined;
  const n = Number(t.replace(',', '.'));
  if (!Number.isFinite(n)) return undefined;
  return n;
}

function subKey(goalId: string, subId: string) {
  return `${goalId}::${subId}`;
}

export default function NexusGoalsPage() {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editingSubKey, setEditingSubKey] = useState<string | null>(null);
  const [subFormGoalId, setSubFormGoalId] = useState<string | null>(null);

  const goalsQuery = useQuery({
    queryKey: ['nexus-goals'],
    queryFn: () => goalsApiRequest<{ goals: Goal[] }>('/'),
  });

  const dashboardQuery = useQuery({
    queryKey: ['nexus-goals-dashboard'],
    queryFn: () => goalsApiRequest<DashboardResponse>('/dashboard'),
  });

  const profile = dashboardQuery.data?.profile ?? null;
  const dashboardSummary = dashboardQuery.data?.summary;

  const createForm = useForm<NewGoalIn>({
    resolver: zodResolver(newGoalWithTargetSchema),
    defaultValues: { title: '', description: '', targetWeightKg: '' },
  });

  const editGoalForm = useForm<EditGoalIn, unknown, EditGoalOut>({
    resolver: zodResolver(goalEditFormSchema),
    defaultValues: { title: '', description: '', status: 'active', targetWeightKg: '' },
  });

  const subCreateForm = useForm<SubGoalIn>({
    resolver: zodResolver(subGoalFormSchema),
    defaultValues: { title: '', description: '' },
  });

  const subEditForm = useForm<SubGoalIn>({
    resolver: zodResolver(subGoalFormSchema),
    defaultValues: { title: '', description: '' },
  });

  const [createTitle, createTargetKg] = useWatch({
    control: createForm.control,
    name: ['title', 'targetWeightKg'],
  });

  const [editTitle, editTargetKg, editStatus] = useWatch({
    control: editGoalForm.control,
    name: ['title', 'targetWeightKg', 'status'],
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['nexus-goals'] });
    queryClient.invalidateQueries({ queryKey: ['nexus-goals-dashboard'] });
  };

  const createGoalMut = useMutation({
    mutationFn: (body: { title: string; description?: string; targetWeightKg?: number }) =>
      goalsApiRequest('/', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      createForm.reset();
      invalidate();
    },
  });

  const updateGoalMut = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      goalsApiRequest(`/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    onSuccess: () => {
      setEditingGoalId(null);
      invalidate();
    },
  });

  const deleteGoalMut = useMutation({
    mutationFn: (id: string) => goalsApiRequest(`/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  const createSubMut = useMutation({
    mutationFn: ({ goalId, body }: { goalId: string; body: { title: string; description?: string } }) =>
      goalsApiRequest(`/${goalId}/subgoals`, { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      subCreateForm.reset();
      setSubFormGoalId(null);
      invalidate();
    },
  });

  const updateSubMut = useMutation({
    mutationFn: ({
      goalId,
      subId,
      body,
    }: {
      goalId: string;
      subId: string;
      body: { title?: string; description?: string; status?: 'active' | 'completed' };
    }) => goalsApiRequest(`/${goalId}/subgoals/${subId}`, { method: 'PUT', body: JSON.stringify(body) }),
    onSuccess: () => {
      setEditingSubKey(null);
      invalidate();
    },
  });

  const deleteSubMut = useMutation({
    mutationFn: ({ goalId, subId }: { goalId: string; subId: string }) =>
      goalsApiRequest(`/${goalId}/subgoals/${subId}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  const goals = (goalsQuery.data?.goals ?? []).map((g) => ({
    ...g,
    subGoals: g.subGoals ?? [],
  }));

  const startEditGoal = (g: Goal) => {
    setEditingGoalId(g._id);
    editGoalForm.reset({
      title: g.title,
      description: g.description ?? '',
      status: g.status,
      targetWeightKg: g.targetWeightKg != null ? String(g.targetWeightKg) : '',
    });
  };

  const cancelEditGoal = () => setEditingGoalId(null);

  const startEditSub = (_goal: Goal, sub: SubGoal) => {
    setEditingSubKey(subKey(_goal._id, sub._id));
    subEditForm.reset({ title: sub.title, description: sub.description ?? '' });
  };

  const cancelEditSub = () => setEditingSubKey(null);

  const onCreateGoal = createForm.handleSubmit((data) => {
    createGoalMut.mutate({
      title: data.title,
      description: data.description?.trim() ? data.description : undefined,
      targetWeightKg: parseTargetKg(data.targetWeightKg),
    });
  });

  const onUpdateGoal = editGoalForm.handleSubmit((data) => {
    if (!editingGoalId) return;
    updateGoalMut.mutate({
      id: editingGoalId,
      body: {
        title: data.title,
        description: data.description?.trim() ? data.description : undefined,
        status: data.status,
        targetWeightKg: parseTargetKg(data.targetWeightKg),
      },
    });
  });

  const onCreateSub = subCreateForm.handleSubmit((data) => {
    if (!subFormGoalId) return;
    createSubMut.mutate({
      goalId: subFormGoalId,
      body: {
        title: data.title,
        description: data.description?.trim() ? data.description : undefined,
      },
    });
  });

  const onUpdateSub = subEditForm.handleSubmit((data) => {
    if (!editingSubKey) return;
    const [goalId, subId] = editingSubKey.split('::');
    updateSubMut.mutate({
      goalId,
      subId,
      body: {
        title: data.title,
        description: data.description?.trim() ? data.description : undefined,
      },
    });
  });

  const toggleGoal = (g: Goal) => {
    updateGoalMut.mutate({
      id: g._id,
      body: {
        title: g.title,
        description: g.description,
        targetWeightKg: g.targetWeightKg,
        status: g.status === 'active' ? 'completed' : 'active',
      },
    });
  };

  const toggleSub = (goalId: string, sub: SubGoal) => {
    updateSubMut.mutate({
      goalId,
      subId: sub._id,
      body: { status: sub.status === 'active' ? 'completed' : 'active' },
    });
  };

  const progressCtx: GoalProgressContext = {
    currentWeightKg: dashboardSummary?.currentWeight ?? null,
    profileWeightKg: profile?.weightKg ?? null,
  };

  const goalGrid =
    'grid grid-cols-1 gap-3 border-b border-theme/60 py-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)_minmax(0,0.5fr)_minmax(0,0.48fr)_minmax(0,6.75rem)_auto] lg:items-start lg:gap-4';

  const subGrid =
    'grid grid-cols-1 gap-2 border-b border-theme/40 py-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.5fr)_auto] sm:items-center sm:gap-3';

  if (goalsQuery.isLoading) {
    return (
      <GoalsPageLayout>
        <div className="surface-panel flex flex-1 items-center justify-center p-12">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-(--primary)" />
        </div>
      </GoalsPageLayout>
    );
  }

  if (goalsQuery.isError) {
    return (
      <GoalsPageLayout>
        <div className="surface-panel flex-1 p-6">
          <p className="font-semibold text-foreground">Impossible de charger les objectifs.</p>
        </div>
      </GoalsPageLayout>
    );
  }

  return (
    <GoalsPageLayout>
      <div className="surface-panel mb-10 flex-1 overflow-x-auto p-4 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">Objectifs principaux</h2>
          <div className="w-full">
            <div
              className={`${goalGrid} border-b border-theme pb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted`}
            >
              <span>Titre</span>
              <span>Description</span>
              <span>Poids cible</span>
              <span>Statut</span>
              <span className="hidden lg:block">Progression</span>
              <span className="hidden lg:block">Actions</span>
            </div>

            <form onSubmit={onCreateGoal} className={`${goalGrid} bg-(--secondary)/20`} noValidate>
              <div>
                <label className={`${labelClass} lg:sr-only`}>Titre (création)</label>
                <input {...createForm.register('title')} className={inputClass} placeholder="Nouvel objectif" />
                {createForm.formState.errors.title ? (
                  <p className={errorClass}>{createForm.formState.errors.title.message}</p>
                ) : null}
              </div>
              <div>
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <label className={`${labelClass} lg:sr-only`}>Description</label>
                  <GoalDescriptionPromptButton
                    profile={profile}
                    summary={dashboardSummary}
                    goalTitle={createTitle ?? ''}
                    goalTargetKgStr={createTargetKg ?? ''}
                  />
                </div>
                <textarea {...createForm.register('description')} className={textareaClass} placeholder="Optionnel" />
              </div>
              <div>
                <label className={`${labelClass} lg:sr-only`}>Poids cible (kg)</label>
                <input {...createForm.register('targetWeightKg')} className={inputClass} placeholder="—" />
                {createForm.formState.errors.targetWeightKg ? (
                  <p className={errorClass}>{createForm.formState.errors.targetWeightKg.message}</p>
                ) : null}
              </div>
              <div className="text-xs text-muted lg:flex lg:items-center">—</div>
              <div className="hidden lg:block" />
              <div className="flex lg:justify-end">
                <button type="submit" className={`${btnPrimary} w-full lg:w-auto lg:min-w-26`} disabled={createGoalMut.isPending}>
                  {createGoalMut.isPending ? '…' : 'Créer'}
                </button>
              </div>
            </form>

            {goals.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">Aucun objectif — remplis la ligne « Créer » ci-dessus.</p>
            ) : (
              goals.map((g) => {
                const isEdit = editingGoalId === g._id;
                const isOpen = expanded[g._id];
                const subs = g.subGoals;
                const progressResult = isEdit
                  ? computeGoalProgress(
                      {
                        ...g,
                        status: (editStatus ?? g.status) as Goal['status'],
                        targetWeightKg: parseTargetKg(editTargetKg) ?? g.targetWeightKg,
                        subGoals: subs,
                      },
                      progressCtx,
                    )
                  : computeGoalProgress(g, progressCtx);

                return (
                  <div key={g._id} className="border-b border-theme/40 last:border-0">
                    {isEdit ? (
                      <form onSubmit={onUpdateGoal} className={goalGrid} noValidate>
                        <div>
                          <label className={labelClass}>Titre</label>
                          <input {...editGoalForm.register('title')} className={inputClass} />
                          {editGoalForm.formState.errors.title ? (
                            <p className={errorClass}>{editGoalForm.formState.errors.title.message}</p>
                          ) : null}
                        </div>
                        <div>
                          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                            <label className={labelClass}>Description</label>
                            <GoalDescriptionPromptButton
                              profile={profile}
                              summary={dashboardSummary}
                              goalTitle={editTitle ?? ''}
                              goalTargetKgStr={editTargetKg ?? ''}
                              subGoalTitles={subs.map((x) => x.title)}
                            />
                          </div>
                          <textarea {...editGoalForm.register('description')} className={textareaClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Poids cible</label>
                          <input {...editGoalForm.register('targetWeightKg')} className={inputClass} />
                          {editGoalForm.formState.errors.targetWeightKg ? (
                            <p className={errorClass}>{editGoalForm.formState.errors.targetWeightKg.message}</p>
                          ) : null}
                        </div>
                        <div>
                          <label className={labelClass}>Statut</label>
                          <Controller
                            name="status"
                            control={editGoalForm.control}
                            render={({ field }) => (
                              <StatusSelect
                                id={`status-${g._id}`}
                                value={field.value}
                                onChange={field.onChange}
                                options={[
                                  { value: 'active', label: 'Actif' },
                                  { value: 'completed', label: 'Terminé' },
                                ]}
                              />
                            )}
                          />
                        </div>
                        <div className="lg:pt-6">
                          <GoalProgressBar percent={progressResult?.percent ?? null} detail={progressResult?.detail} />
                        </div>
                        <div className="flex flex-wrap gap-2 lg:flex-col">
                          <button type="submit" className={`${btnPrimary} flex-1`} disabled={updateGoalMut.isPending}>
                            {updateGoalMut.isPending ? '…' : 'Enregistrer'}
                          </button>
                          <button type="button" className={btnGhost} onClick={cancelEditGoal}>
                            Annuler
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className={goalGrid}>
                        <div className="font-semibold text-foreground">{g.title}</div>
                        <div className="text-sm text-muted">{g.description ?? '—'}</div>
                        <div className="tabular-nums text-foreground">
                          {g.targetWeightKg != null ? `${g.targetWeightKg} kg` : '—'}
                        </div>
                        <div>
                          <span
                            className={
                              g.status === 'active'
                                ? 'inline-block rounded-full border border-theme bg-(--secondary) px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground'
                                : 'inline-block rounded-full border border-theme px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted'
                            }
                          >
                            {g.status === 'active' ? 'Actif' : 'Terminé'}
                          </span>
                        </div>
                        <div className="lg:pt-1">
                          <GoalProgressBar percent={progressResult?.percent ?? null} detail={progressResult?.detail} />
                        </div>
                        <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
                          <button type="button" className={btnGhost} onClick={() => startEditGoal(g)}>
                            Modifier
                          </button>
                          <button type="button" className={btnGhost} onClick={() => toggleGoal(g)} disabled={updateGoalMut.isPending}>
                            {g.status === 'active' ? 'Terminer' : 'Réactiver'}
                          </button>
                          <button
                            type="button"
                            className={btnDanger}
                            onClick={() => {
                              if (confirm('Supprimer cet objectif et tous ses sous-objectifs ?')) deleteGoalMut.mutate(g._id);
                            }}
                            disabled={deleteGoalMut.isPending}
                          >
                            Supprimer
                          </button>
                          <button
                            type="button"
                            className={btnGhost}
                            onClick={() => setExpanded((p) => ({ ...p, [g._id]: !p[g._id] }))}
                          >
                            {isOpen ? '▼ Sous-objectifs' : '▶ Sous-objectifs'} ({subs.length})
                          </button>
                        </div>
                      </div>
                    )}

                    {isOpen && !isEdit ? (
                      <div className="mb-3 ml-0 border-l-2 border-theme pl-3 pt-2 lg:ml-4 lg:pl-4">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted">Sous-objectifs</p>
                        <div className="rounded-xl border border-theme bg-(--secondary)/15 p-3">
                          <div
                            className={`${subGrid} border-b border-theme/60 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted`}
                          >
                            <span>Titre</span>
                            <span>Description</span>
                            <span>Statut</span>
                            <span className="hidden sm:block">Actions</span>
                          </div>

                          {subFormGoalId === g._id ? (
                            <form
                              onSubmit={onCreateSub}
                              className="mb-2 grid grid-cols-1 gap-2 border-b border-theme/40 py-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"
                              noValidate
                            >
                              <div>
                                <label className={labelClass}>Titre (création)</label>
                                <input {...subCreateForm.register('title')} className={inputClass} placeholder="Étape" />
                                {subCreateForm.formState.errors.title ? (
                                  <p className={errorClass}>{subCreateForm.formState.errors.title.message}</p>
                                ) : null}
                              </div>
                              <div>
                                <label className={labelClass}>Description</label>
                                <textarea {...subCreateForm.register('description')} className={`${inputClass} min-h-12 resize-y`} />
                              </div>
                              <div className="flex flex-wrap gap-2 sm:flex-col sm:pb-0.5">
                                <button type="submit" className={`${btnPrimary} text-xs`} disabled={createSubMut.isPending}>
                                  Créer
                                </button>
                                <button type="button" className={`${btnGhost} text-xs`} onClick={() => setSubFormGoalId(null)}>
                                  Annuler
                                </button>
                              </div>
                            </form>
                          ) : (
                            <button type="button" className={`${btnGhost} mb-2 mt-1 w-full text-xs sm:w-auto`} onClick={() => setSubFormGoalId(g._id)}>
                              + Ajouter un sous-objectif
                            </button>
                          )}

                          {subs.length === 0 && subFormGoalId !== g._id ? (
                            <p className="py-3 text-center text-xs text-muted">Aucun sous-objectif.</p>
                          ) : (
                            subs.map((s) => {
                              const ek = subKey(g._id, s._id);
                              const isSubEdit = editingSubKey === ek;
                              if (isSubEdit) {
                                return (
                                  <form
                                    key={s._id}
                                    onSubmit={onUpdateSub}
                                    className="mb-1 grid grid-cols-1 gap-2 border-b border-theme/30 py-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"
                                    noValidate
                                  >
                                    <div>
                                      <label className={labelClass}>Titre</label>
                                      <input {...subEditForm.register('title')} className={inputClass} />
                                      {subEditForm.formState.errors.title ? (
                                        <p className={errorClass}>{subEditForm.formState.errors.title.message}</p>
                                      ) : null}
                                    </div>
                                    <div>
                                      <label className={labelClass}>Description</label>
                                      <textarea {...subEditForm.register('description')} className={`${inputClass} min-h-12 resize-y`} />
                                    </div>
                                    <div className="flex flex-wrap gap-2 sm:flex-col sm:pb-0.5">
                                      <button type="submit" className={`${btnPrimary} text-xs`} disabled={updateSubMut.isPending}>
                                        Enregistrer
                                      </button>
                                      <button type="button" className={`${btnGhost} text-xs`} onClick={cancelEditSub}>
                                        Annuler
                                      </button>
                                    </div>
                                  </form>
                                );
                              }
                              return (
                                <div key={s._id} className={subGrid}>
                                  <span className="text-sm font-medium text-foreground">{s.title}</span>
                                  <span className="text-xs text-muted">{s.description ?? '—'}</span>
                                  <span className="text-[10px] font-bold uppercase text-muted">
                                    {s.status === 'active' ? 'À faire' : 'Fait'}
                                  </span>
                                  <div className="flex flex-wrap gap-2">
                                    <button type="button" className={`${btnGhost} text-[11px]`} onClick={() => startEditSub(g, s)}>
                                      Modifier
                                    </button>
                                    <button
                                      type="button"
                                      className={`${btnGhost} text-[11px]`}
                                      onClick={() => toggleSub(g._id, s)}
                                      disabled={updateSubMut.isPending}
                                    >
                                      {s.status === 'active' ? 'Cocher' : 'Rouvrir'}
                                    </button>
                                    <button
                                      type="button"
                                      className={`${btnDanger} text-[11px]`}
                                      onClick={() => {
                                        if (confirm('Supprimer ce sous-objectif ?')) deleteSubMut.mutate({ goalId: g._id, subId: s._id });
                                      }}
                                      disabled={deleteSubMut.isPending}
                                    >
                                      Suppr.
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>
    </GoalsPageLayout>
  );
}
