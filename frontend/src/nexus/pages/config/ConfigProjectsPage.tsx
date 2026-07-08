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
import { emptyLocalized } from '@/lib/localized'
import type { LocalizedString } from '@/lib/localized'
import { deleteProject, getProjects, postProject, putProject } from '../../api/nexusApi'
import { AssetPicker } from '../../components/AssetPicker'
import { LocalizedInput, LocalizedTextarea } from '../../components/LocalizedFields'
import { useNexusPageTitle } from '../../layout/useNexusPageTitle'
import type { NexusProject } from '../../types/nexus'

const emptyForm = {
  title: emptyLocalized(),
  description: emptyLocalized(),
  techStack: emptyLocalized(),
  url: '',
  links: '',
  imageUrl: '',
  order: '',
}

function formatLinks(links: { label: LocalizedString; url: string }[]) {
  return links.map((link) => `${link.label.en}|${link.label.fr}|${link.url}`).join('\n')
}

function parseLinks(text: string) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split('|').map((part) => part.trim())
      if (parts.length >= 3) {
        const url = parts[parts.length - 1]!
        const fr = parts[parts.length - 2]!
        const en = parts.slice(0, -2).join('|')
        return { label: { en, fr }, url }
      }
      if (parts.length === 2) {
        const [label, url] = parts
        return { label: { en: label!, fr: label! }, url: url! }
      }
      return null
    })
    .filter((link): link is { label: LocalizedString; url: string } => Boolean(link?.label.en && link.url))
}

export function ConfigProjectsPage() {
  useNexusPageTitle('Projects')
  const { data, loading, refetch } = useFetch(getProjects)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<NexusProject | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setError(null)
    setOpen(true)
  }

  function openEdit(project: NexusProject) {
    setEditing(project)
    setForm({
      title: project.title,
      description: project.description,
      techStack: project.techStack,
      url: project.url ?? '',
      links: formatLinks(project.links ?? []),
      imageUrl: project.imageUrl ?? '',
      order: String(project.order),
    })
    setError(null)
    setOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const links = parseLinks(form.links)
      const payload = {
        title: form.title,
        description: form.description,
        techStack: form.techStack,
        url: form.url || links[0]?.url || undefined,
        links,
        imageUrl: editing ? form.imageUrl : form.imageUrl || undefined,
        order: form.order ? Number(form.order) : undefined,
      }
      if (editing) {
        await putProject(editing.id, payload)
      } else {
        await postProject(payload)
      }
      setOpen(false)
      refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enregistrement impossible')
    } finally {
      setSaving(false)
    }
  }

  const projects = data?.projects ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading tracking-tight">Projects</h2>
          <p className="mt-1 text-sm text-muted-foreground">Projets affichés sur le portfolio (EN / FR)</p>
        </div>
        <Button onClick={openCreate} className="glow-primary">
          <Plus className="size-4" />
          Ajouter
        </Button>
      </div>

      <Card className="glass overflow-hidden">
        <CardHeader>
          <CardTitle className="font-heading">Liste</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {loading ? (
            <div className="space-y-2 p-6">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : projects.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">Aucun projet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-muted-foreground">
                  <th className="px-4 py-3">Ordre</th>
                  <th className="px-4 py-3">Titre</th>
                  <th className="px-4 py-3">Description (EN)</th>
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Liens</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} className="border-b border-border/40">
                    <td className="px-4 py-3">{p.order}</td>
                    <td className="px-4 py-3 font-medium">
                      <div>{p.title.en}</div>
                      <div className="text-xs text-muted-foreground">{p.title.fr}</div>
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                      {p.description.en || '-'}
                    </td>
                    <td className="px-4 py-3">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt="" className="size-8 rounded object-cover" />
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {(p.links ?? []).map((link) => link.label.en).join(' · ') || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(p)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={async () => {
                            if (confirm('Supprimer ce projet ?')) {
                              await deleteProject(p.id)
                              refetch()
                            }
                          }}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifier le projet' : 'Nouveau projet'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <LocalizedInput
              label="Titre"
              value={form.title}
              onChange={(title) => setForm({ ...form, title })}
            />
            <LocalizedTextarea
              label="Description"
              value={form.description}
              onChange={(description) => setForm({ ...form, description })}
              placeholder={{
                en: 'What does this project do?',
                fr: 'À quoi sert ce projet ?',
              }}
            />
            <LocalizedTextarea
              label="Tech stack (une ligne par catégorie : Catégorie : tag1, tag2)"
              value={form.techStack}
              onChange={(techStack) => setForm({ ...form, techStack })}
              placeholder={{
                en: 'Backend : Node.js, Hono, TypeScript\nFrontend : React, TypeScript, Vite, Tailwind',
                fr: 'Backend : Node.js, Hono, TypeScript\nFrontend : React, TypeScript, Vite, Tailwind',
              }}
              rows={4}
            />
            <div className="space-y-2">
              <Label>Liens (un par ligne : Label EN|Label FR|URL)</Label>
              <Textarea
                value={form.links}
                onChange={(e) => setForm({ ...form, links: e.target.value })}
                placeholder={'Website|Site web|https://megitsune.xyz\nGitHub|GitHub|https://github.com/...'}
              />
            </div>
            <div className="space-y-2">
              <Label>URL principale (optionnel)</Label>
              <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            </div>
            <AssetPicker
              label="Image du projet"
              folder="projects"
              value={form.imageUrl}
              onChange={(imageUrl) => setForm({ ...form, imageUrl })}
            />
            <div className="space-y-2">
              <Label>Ordre</Label>
              <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={handleSave} disabled={saving} className="w-full">
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
