import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { useFetch } from '@/hooks/useFetch'
import { deleteWeight, getWeights, postWeight, putWeight } from '../../api/nexusApi'
import { useNexusPageTitle } from '../../layout/useNexusPageTitle'
import type { NexusWeightEntry } from '../../types/nexus'

export function GoalsWeightsPage() {
  useNexusPageTitle('Pesées')
  const { data, loading, refetch } = useFetch(getWeights)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<NexusWeightEntry | null>(null)
  const [weightKg, setWeightKg] = useState('')
  const [note, setNote] = useState('')
  const [measuredAt, setMeasuredAt] = useState('')
  const [saving, setSaving] = useState(false)

  function openCreate() {
    setEditing(null)
    setWeightKg('')
    setNote('')
    setMeasuredAt(new Date().toISOString().slice(0, 16))
    setDialogOpen(true)
  }

  function openEdit(entry: NexusWeightEntry) {
    setEditing(entry)
    setWeightKg(String(entry.weightKg))
    setNote(entry.note ?? '')
    setMeasuredAt(entry.measuredAt.slice(0, 16))
    setDialogOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const payload = {
        weightKg: Number(weightKg),
        note: note || undefined,
        measuredAt: measuredAt ? new Date(measuredAt).toISOString() : undefined,
      }
      if (editing) {
        await putWeight(editing._id, payload)
      } else {
        await postWeight(payload)
      }
      setDialogOpen(false)
      refetch()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette pesée ?')) return
    await deleteWeight(id)
    refetch()
  }

  const entries = data?.entries ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading tracking-tight">Pesées</h2>
          <p className="mt-1 text-sm text-muted-foreground">Suivi du poids au fil du temps</p>
        </div>
        <Button onClick={openCreate} className="glow-primary">
          <Plus className="size-4" />
          Ajouter
        </Button>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="font-heading">Historique</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune pesée.</p>
          ) : (
            <ul className="space-y-2">
              {entries.map((entry) => (
                <li
                  key={entry._id}
                  className="flex items-center justify-between rounded-lg border border-primary/25 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold font-heading">{entry.weightKg} kg</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.measuredAt).toLocaleString('fr-FR')}
                      {entry.note ? ` · ${entry.note}` : ''}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(entry)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(entry._id)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifier la pesée' : 'Nouvelle pesée'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Poids (kg)</Label>
              <Input type="number" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="datetime-local" value={measuredAt} onChange={(e) => setMeasuredAt(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Note</Label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
