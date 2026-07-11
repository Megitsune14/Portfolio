import { useState } from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useFetch } from '@/hooks/useFetch'
import { deleteAsset, getAssets, uploadAsset, type AssetFolder } from '../api/nexusApi'
import { resolvePublicAssetUrl } from '@/lib/assets'

type AssetPickerProps = {
  label: string
  folder: AssetFolder
  value: string
  onChange: (path: string) => void
}

export function AssetPicker({ label, folder, value, onChange }: AssetPickerProps) {
  const { data, loading, refetch } = useFetch(() => getAssets(folder), { deps: [folder] })
  const [uploading, setUploading] = useState(false)
  const [deletingPath, setDeletingPath] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const assets = data?.assets ?? []
  const folderLabel = `/assets/${folder}`

  async function handleUpload(file: File | null) {
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const { asset } = await uploadAsset(file, folder)
      onChange(asset.path)
      refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(assetPath: string, filename: string) {
    if (!confirm(`Supprimer ${filename} ?`)) return
    setDeletingPath(assetPath)
    setError(null)
    try {
      await deleteAsset(folder, assetPath)
      if (value === assetPath) {
        onChange('')
      }
      refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeletingPath(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        <div className="flex items-center gap-2">
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')}>
              Retirer
            </Button>
          )}
          <label className="inline-flex cursor-pointer">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
              className="sr-only"
              disabled={uploading}
              onChange={(e) => {
                void handleUpload(e.target.files?.[0] ?? null)
                e.target.value = ''
              }}
            />
            <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
              <span>
                <Upload className="size-4" />
                {uploading ? 'Upload…' : 'Uploader'}
              </span>
            </Button>
          </label>
        </div>
      </div>

      {value && (
        <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/40 p-3">
          <img src={resolvePublicAssetUrl(value)} alt="" className="size-12 rounded-md object-contain" />
          <code className="text-xs text-muted-foreground">{value}</code>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement des assets…</p>
      ) : assets.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune image dans {folderLabel}. Uploadez-en une.</p>
      ) : (
        <div className="grid max-h-48 grid-cols-4 gap-2 overflow-y-auto rounded-lg border border-border/60 p-2 sm:grid-cols-5">
          {assets.map((asset) => (
            <div key={asset.path} className="relative">
              <button
                type="button"
                title={asset.filename}
                onClick={() => onChange(asset.path)}
                className={cn(
                  'w-full overflow-hidden rounded-md border transition-colors hover:border-primary/50',
                  value === asset.path ? 'border-primary ring-2 ring-primary/30' : 'border-border/60',
                )}
              >
                <img
                  src={resolvePublicAssetUrl(asset.path)}
                  alt={asset.filename}
                  className="aspect-square w-full object-contain p-1"
                />
              </button>
              <button
                type="button"
                aria-label={`Supprimer ${asset.filename}`}
                disabled={deletingPath === asset.path}
                onClick={(e) => {
                  e.stopPropagation()
                  void handleDelete(asset.path, asset.filename)
                }}
                className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground shadow-sm transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
