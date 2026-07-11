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
import { Skeleton } from '@/components/ui/skeleton'
import { useFetch } from '@/hooks/useFetch'
import { emptyLocalized } from '@/lib/localized'
import { resolvePublicAssetUrl } from '@/lib/assets'
import type { LocalizedStringOptional } from '@/lib/localized'
import { deleteSocialLink, getSocialLinks, postSocialLink, putSocialLink } from '../../api/nexusApi'
import { AssetPicker } from '../../components/AssetPicker'
import { LocalizedInput } from '../../components/LocalizedFields'
import { useNexusPageTitle } from '../../layout/useNexusPageTitle'
import type { NexusSocialLink } from '../../types/nexus'

const emptyOptionalLocalized = (): LocalizedStringOptional => ({ en: '', fr: '' })

const emptyForm = {
  name: emptyLocalized(),
  username: emptyOptionalLocalized(),
  url: '',
  icon: '',
  order: '',
}

function OptionalLocalizedUsername({
  label,
  value,
  onChange,
}: {
  label: string
  value: LocalizedStringOptional
  onChange: (value: LocalizedStringOptional) => void
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground uppercase">English</span>
          <Input
            value={value.en ?? ''}
            onChange={(e) => onChange({ ...value, en: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground uppercase">Français</span>
          <Input
            value={value.fr ?? ''}
            onChange={(e) => onChange({ ...value, fr: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}

function normalizeUsername(value: LocalizedStringOptional): LocalizedStringOptional | undefined {
  const en = value.en?.trim()
  const fr = value.fr?.trim()
  if (!en && !fr) return undefined
  return { en: en || undefined, fr: fr || undefined }
}

export function ConfigSocialPage() {
  useNexusPageTitle('Social')
  const { data, loading, refetch } = useFetch(getSocialLinks)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<NexusSocialLink | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setError(null)
    setOpen(true)
  }

  function openEdit(link: NexusSocialLink) {
    setEditing(link)
    setForm({
      name: link.name,
      username: link.username ?? emptyOptionalLocalized(),
      url: link.url ?? '',
      icon: link.icon ?? '',
      order: String(link.order),
    })
    setError(null)
    setOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const payload = {
        name: form.name,
        username: normalizeUsername(form.username),
        url: form.url || undefined,
        icon: editing ? form.icon : form.icon || undefined,
        order: form.order ? Number(form.order) : undefined,
      }
      if (editing) {
        await putSocialLink(editing.id, payload)
      } else {
        await postSocialLink(payload)
      }
      setOpen(false)
      refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enregistrement impossible')
    } finally {
      setSaving(false)
    }
  }

  const links = data?.links ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading tracking-tight">Social</h2>
          <p className="mt-1 text-sm text-muted-foreground">Liens réseaux sur le portfolio (EN / FR)</p>
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
            </div>
          ) : links.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">Aucun lien.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-muted-foreground">
                  <th className="px-4 py-3">Ordre</th>
                  <th className="px-4 py-3">Nom</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Icône</th>
                  <th className="px-4 py-3">URL</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <tr key={link.id} className="border-b border-border/40">
                    <td className="px-4 py-3">{link.order}</td>
                    <td className="px-4 py-3 font-medium">{link.name.en}</td>
                    <td className="px-4 py-3 text-muted-foreground">{link.username?.en ?? '-'}</td>
                    <td className="px-4 py-3">
                      {link.icon ? (
                        <img src={resolvePublicAssetUrl(link.icon)} alt="" className="size-8 rounded object-cover" />
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                      {link.url ?? '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(link)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={async () => {
                            if (confirm('Supprimer ce lien ?')) {
                              await deleteSocialLink(link.id)
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifier le lien' : 'Nouveau lien'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <LocalizedInput
              label="Nom"
              value={form.name}
              onChange={(name) => setForm({ ...form, name })}
            />
            <OptionalLocalizedUsername
              label="Username (optionnel)"
              value={form.username}
              onChange={(username) => setForm({ ...form, username })}
            />
            <div className="space-y-2">
              <Label>URL (laisser vide si aucun lien)</Label>
              <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            </div>
            <AssetPicker
              label="Icône"
              folder="social"
              value={form.icon}
              onChange={(icon) => setForm({ ...form, icon })}
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
