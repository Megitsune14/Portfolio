import { useState } from 'react'
import { Check, Pencil, Plus, Trash2 } from 'lucide-react'
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
import {
  deleteGoal,
  deleteSubGoal,
  getGoals,
  postGoal,
  postSubGoal,
  putGoal,
  putSubGoal,
} from '../../api/nexusApi'
import { useNexusPageTitle } from '../../layout/useNexusPageTitle'
import type { NexusGoal } from '../../types/nexus'
import { cn } from '@/lib/utils'

export function GoalsObjectivesPage() {
  useNexusPageTitle('Objectifs')
  const { data, loading, refetch } = useFetch(getGoals)
  const [goalDialog, setGoalDialog] = useState(false)
  const [subDialog, setSubDialog] = useState<string | null>(null)
  const [editingGoal, setEditingGoal] = useState<NexusGoal | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetWeight, setTargetWeight] = useState('')
  const [saving, setSaving] = useState(false)

  function openGoalCreate() {
    setEditingGoal(null)
    setTitle('')
    setDescription('')
    setTargetWeight('')
    setGoalDialog(true)
  }

  function openGoalEdit(goal: NexusGoal) {
    setEditingGoal(goal)
    setTitle(goal.title)
    setDescription(goal.description ?? '')
    setTargetWeight(goal.targetWeightKg != null ? String(goal.targetWeightKg) : '')
    setGoalDialog(true)
  }

  async function saveGoal() {
    setSaving(true)
    try {
      const payload = {
        title,
        description: description || undefined,
        targetWeightKg: targetWeight ? Number(targetWeight) : undefined,
      }
      if (editingGoal) {
        await putGoal(editingGoal._id, { ...payload, status: editingGoal.status })
      } else {
        await postGoal(payload)
      }
      setGoalDialog(false)
      refetch()
    } finally {
      setSaving(false)
    }
  }

  async function saveSubGoal(goalId: string) {
    setSaving(true)
    try {
      await postSubGoal(goalId, { title, description: description || undefined })
      setSubDialog(null)
      refetch()
    } finally {
      setSaving(false)
    }
  }

  async function toggleGoalStatus(goal: NexusGoal) {
    await putGoal(goal._id, {
      title: goal.title,
      description: goal.description,
      targetWeightKg: goal.targetWeightKg,
      status: goal.status === 'active' ? 'completed' : 'active',
    })
    refetch()
  }

  async function toggleSubGoalStatus(goal: NexusGoal, subId: string, current: 'active' | 'completed') {
    await putSubGoal(goal._id, subId, { status: current === 'active' ? 'completed' : 'active' })
    refetch()
  }

  const goals = data?.goals ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading tracking-tight">Objectifs</h2>
          <p className="mt-1 text-sm text-muted-foreground">Objectifs et sous-objectifs</p>
        </div>
        <Button onClick={openGoalCreate} className="glow-primary">
          <Plus className="size-4" />
          Nouvel objectif
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-40 w-full rounded-xl" />
      ) : goals.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Aucun objectif pour l’instant.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <Card key={goal._id} className="glass">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle
                    className={cn(
                      'font-heading',
                      goal.status === 'completed' && 'text-muted-foreground line-through',
                    )}
                  >
                    {goal.title}
                  </CardTitle>
                  {goal.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{goal.description}</p>
                  )}
                  {goal.targetWeightKg != null && (
                    <p className="mt-1 text-xs text-accent">Cible : {goal.targetWeightKg} kg</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => toggleGoalStatus(goal)}>
                    <Check className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => openGoalEdit(goal)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={async () => {
                      if (confirm('Supprimer cet objectif ?')) {
                        await deleteGoal(goal._id)
                        refetch()
                      }
                    }}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {goal.subGoals.map((sub) => (
                  <div
                    key={sub._id}
                    className="flex items-center justify-between rounded-lg border border-primary/20 px-3 py-2"
                  >
                    <span
                      className={cn(
                        'text-sm',
                        sub.status === 'completed' && 'text-muted-foreground line-through',
                      )}
                    >
                      {sub.title}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => toggleSubGoalStatus(goal, sub._id, sub.status)}
                      >
                        <Check className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={async () => {
                          if (confirm('Supprimer ce sous-objectif ?')) {
                            await deleteSubGoal(goal._id, sub._id)
                            refetch()
                          }
                        }}
                      >
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTitle('')
                    setDescription('')
                    setSubDialog(goal._id)
                  }}
                >
                  <Plus className="size-3.5" />
                  Sous-objectif
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={goalDialog} onOpenChange={setGoalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGoal ? 'Modifier l’objectif' : 'Nouvel objectif'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Poids cible (kg)</Label>
              <Input type="number" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} />
            </div>
            <Button onClick={saveGoal} disabled={saving} className="w-full">
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={subDialog != null} onOpenChange={(o) => !o && setSubDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau sous-objectif</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <Button
              onClick={() => subDialog && saveSubGoal(subDialog)}
              disabled={saving}
              className="w-full"
            >
              Ajouter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
