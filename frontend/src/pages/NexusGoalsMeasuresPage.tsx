import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { NexusDeleteDialog } from '@/components/nexus/NexusDeleteDialog';
import { NexusPageHeader } from '@/components/nexus/NexusPageHeader';
import { NexusEmptyState, NexusLoadingState } from '@/components/nexus/NexusStates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { errorClass, labelClass } from '@/lib/goals/ui';
import { weightCreateFormSchema, weightEditFormSchema } from '@/lib/goals/schemas';
import type { WeightEntry } from '@/types/goals';
import { goalsApiRequest } from '@/utils/nexus-goals-api';

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

  if (weightsQuery.isLoading) {
    return (
      <>
        <NexusPageHeader title="Pesées" description="Historique et saisie de tes pesées." />
        <NexusLoadingState />
      </>
    );
  }

  const renderEditForm = () => (
    <form onSubmit={onUpdate} className="grid gap-3" noValidate>
      <div>
        <Label>Poids (kg)</Label>
        <Input {...editForm.register('weightKg')} />
      </div>
      <div>
        <Label>Note</Label>
        <Input {...editForm.register('note')} />
      </div>
      <div>
        <Label>Date</Label>
        <Input type="datetime-local" {...editForm.register('measuredAt')} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={updateMut.isPending}>
          Enregistrer
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setEditingId(null)}>
          Annuler
        </Button>
      </div>
    </form>
  );

  return (
    <>
      <NexusPageHeader title="Pesées" description="Historique et saisie de tes pesées." />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Nouvelle pesée</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreate} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" noValidate>
            <div>
              <Label className={labelClass}>Poids (kg)</Label>
              <Input {...createForm.register('weightKg')} placeholder="70.5" />
              {createForm.formState.errors.weightKg ? (
                <p className={errorClass}>{String(createForm.formState.errors.weightKg.message)}</p>
              ) : null}
            </div>
            <div>
              <Label className={labelClass}>Note</Label>
              <Input {...createForm.register('note')} placeholder="Optionnel" />
            </div>
            <div>
              <Label className={labelClass}>Date</Label>
              <Input type="datetime-local" {...createForm.register('measuredAt')} />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={createMut.isPending}>
                {createMut.isPending ? '…' : 'Ajouter'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Poids</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <NexusEmptyState message="Aucune pesée enregistrée." />
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) =>
                  editingId === entry._id ? (
                    <TableRow key={entry._id}>
                      <TableCell colSpan={4}>{renderEditForm()}</TableCell>
                    </TableRow>
                  ) : (
                    <TableRow key={entry._id}>
                      <TableCell className="font-mono font-semibold">{entry.weightKg} kg</TableCell>
                      <TableCell className="text-muted-foreground">{entry.note ?? '—'}</TableCell>
                      <TableCell>{formatDate(entry.measuredAt)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" onClick={() => startEdit(entry)}>
                            Modifier
                          </Button>
                          <NexusDeleteDialog
                            title="Supprimer cette pesée ?"
                            description="Cette action est irréversible."
                            onConfirm={() => deleteMut.mutate(entry._id)}
                          >
                            <Button variant="destructive" size="sm" disabled={deleteMut.isPending}>
                              Supprimer
                            </Button>
                          </NexusDeleteDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ),
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="space-y-4 md:hidden">
        {entries.length === 0 ? (
          <NexusEmptyState message="Aucune pesée enregistrée." />
        ) : (
          entries.map((entry) => (
            <Card key={entry._id}>
              <CardContent className="space-y-3 p-4">
                {editingId === entry._id ? (
                  renderEditForm()
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-lg font-bold">{entry.weightKg} kg</span>
                      <span className="text-sm text-muted-foreground">{formatDate(entry.measuredAt)}</span>
                    </div>
                    {entry.note ? <p className="text-sm text-muted-foreground">{entry.note}</p> : null}
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(entry)}>
                        Modifier
                      </Button>
                      <NexusDeleteDialog
                        title="Supprimer cette pesée ?"
                        description="Cette action est irréversible."
                        onConfirm={() => deleteMut.mutate(entry._id)}
                      >
                        <Button variant="destructive" size="sm" disabled={deleteMut.isPending}>
                          Supprimer
                        </Button>
                      </NexusDeleteDialog>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
