import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { GoalsPageLayout } from '../components/goals/GoalsPageLayout';
import { btnDanger, btnGhost, btnPrimary, errorClass, inputClass, labelClass, textareaClass } from '../lib/goals/ui';
import { weightCreateFormSchema, weightEditFormSchema } from '../lib/goals/schemas';
import type { WeightEntry } from '../types/goals';
import { goalsApiRequest } from '../utils/nexus-goals-api';

type CreateFormIn = z.input<typeof weightCreateFormSchema>;
type CreateFormOut = z.output<typeof weightCreateFormSchema>;
type EditFormIn = z.input<typeof weightEditFormSchema>;
type EditFormOut = z.output<typeof weightEditFormSchema>;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function NexusGoalsMeasuresPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);

  const weightsQuery = useQuery({
    queryKey: ['nexus-goals-weights'],
    queryFn: () => goalsApiRequest<{ entries: WeightEntry[] }>('/weights'),
  });

  const createForm = useForm<CreateFormIn, unknown, CreateFormOut>({
    resolver: zodResolver(weightCreateFormSchema),
    defaultValues: { weightKg: '', note: '', measuredAt: '' },
  });

  const editForm = useForm<EditFormIn, unknown, EditFormOut>({
    resolver: zodResolver(weightEditFormSchema),
    defaultValues: { weightKg: '', note: '', measuredAt: '' },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['nexus-goals-weights'] });
    queryClient.invalidateQueries({ queryKey: ['nexus-goals-dashboard'] });
  };

  const createMut = useMutation({
    mutationFn: (body: { weightKg: number; note?: string; measuredAt?: string }) =>
      goalsApiRequest('/weights', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      createForm.reset();
      invalidate();
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      goalsApiRequest(`/weights/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    onSuccess: () => {
      setEditingId(null);
      invalidate();
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => goalsApiRequest(`/weights/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  const entries = [...(weightsQuery.data?.entries ?? [])].sort(
    (a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime(),
  );

  const startEdit = (entry: WeightEntry) => {
    setEditingId(entry._id);
    editForm.reset({
      weightKg: String(entry.weightKg),
      note: entry.note ?? '',
      measuredAt: toDatetimeLocal(entry.measuredAt),
    });
  };

  const onCreate = createForm.handleSubmit((data) => {
    createMut.mutate({
      weightKg: data.weightKg,
      note: data.note?.trim() ? data.note : undefined,
      measuredAt: data.measuredAt ? new Date(data.measuredAt).toISOString() : undefined,
    });
  });

  const onUpdate = editForm.handleSubmit((data) => {
    if (!editingId) return;
    updateMut.mutate({
      id: editingId,
      body: {
        weightKg: data.weightKg,
        note: data.note?.trim() ? data.note : undefined,
        measuredAt: data.measuredAt ? new Date(data.measuredAt).toISOString() : undefined,
      },
    });
  });

  const gridClass =
    'grid grid-cols-1 gap-3 border-b border-theme/60 py-3 sm:grid-cols-[minmax(0,0.5fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center sm:gap-4';

  if (weightsQuery.isLoading) {
    return (
      <GoalsPageLayout>
        <div className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-(--primary)" />
        </div>
      </GoalsPageLayout>
    );
  }

  return (
    <GoalsPageLayout>
      <div className="surface-panel flex-1 overflow-x-auto p-4 sm:p-6">
          <h2 className="mb-4 font-jp text-xl font-bold text-foreground">Pesées</h2>

          <div className={`${gridClass} border-b border-theme pb-3 text-[11px] font-bold uppercase tracking-wider text-muted`}>
            <span>Poids (kg)</span>
            <span>Note</span>
            <span>Date</span>
            <span>Actions</span>
          </div>

          <form onSubmit={onCreate} className={`${gridClass} bg-(--secondary)/20`} noValidate>
            <div>
              <label className={`${labelClass} sm:sr-only`}>Poids</label>
              <input {...createForm.register('weightKg')} className={inputClass} placeholder="70.5" />
              {createForm.formState.errors.weightKg ? (
                <p className={errorClass}>{String(createForm.formState.errors.weightKg.message)}</p>
              ) : null}
            </div>
            <div>
              <label className={`${labelClass} sm:sr-only`}>Note</label>
              <textarea {...createForm.register('note')} className={`${textareaClass} min-h-12`} placeholder="Optionnel" />
            </div>
            <div>
              <label className={`${labelClass} sm:sr-only`}>Date</label>
              <input type="datetime-local" {...createForm.register('measuredAt')} className={inputClass} />
            </div>
            <div>
              <button type="submit" className={`${btnPrimary} w-full sm:w-auto`} disabled={createMut.isPending}>
                {createMut.isPending ? '…' : 'Ajouter'}
              </button>
            </div>
          </form>

          {entries.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">Aucune pesée enregistrée.</p>
          ) : (
            entries.map((entry) =>
              editingId === entry._id ? (
                <form key={entry._id} onSubmit={onUpdate} className={gridClass} noValidate>
                  <div>
                    <input {...editForm.register('weightKg')} className={inputClass} />
                  </div>
                  <div>
                    <textarea {...editForm.register('note')} className={`${textareaClass} min-h-12`} />
                  </div>
                  <div>
                    <input type="datetime-local" {...editForm.register('measuredAt')} className={inputClass} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="submit" className={btnPrimary} disabled={updateMut.isPending}>
                      Enregistrer
                    </button>
                    <button type="button" className={btnGhost} onClick={() => setEditingId(null)}>
                      Annuler
                    </button>
                  </div>
                </form>
              ) : (
                <div key={entry._id} className={gridClass}>
                  <span className="font-mono font-semibold text-foreground">{entry.weightKg} kg</span>
                  <span className="text-sm text-muted">{entry.note ?? '—'}</span>
                  <span className="text-sm text-foreground">{formatDate(entry.measuredAt)}</span>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className={btnGhost} onClick={() => startEdit(entry)}>
                      Modifier
                    </button>
                    <button
                      type="button"
                      className={btnDanger}
                      onClick={() => {
                        if (confirm('Supprimer cette pesée ?')) deleteMut.mutate(entry._id);
                      }}
                      disabled={deleteMut.isPending}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ),
            )
          )}
        </div>
    </GoalsPageLayout>
  );
}
