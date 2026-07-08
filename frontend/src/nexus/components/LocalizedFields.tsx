import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { LocalizedString } from '@/lib/localized'

type LocalizedInputProps = {
  label: string
  value: LocalizedString
  onChange: (value: LocalizedString) => void
  placeholder?: { en?: string; fr?: string }
}

export function LocalizedInput({ label, value, onChange, placeholder }: LocalizedInputProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground uppercase">English</span>
          <Input
            value={value.en}
            onChange={(e) => onChange({ ...value, en: e.target.value })}
            placeholder={placeholder?.en}
          />
        </div>
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground uppercase">Français</span>
          <Input
            value={value.fr}
            onChange={(e) => onChange({ ...value, fr: e.target.value })}
            placeholder={placeholder?.fr}
          />
        </div>
      </div>
    </div>
  )
}

type LocalizedTextareaProps = {
  label: string
  value: LocalizedString
  onChange: (value: LocalizedString) => void
  placeholder?: { en?: string; fr?: string }
  rows?: number
}

export function LocalizedTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: LocalizedTextareaProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground uppercase">English</span>
          <Textarea
            value={value.en}
            onChange={(e) => onChange({ ...value, en: e.target.value })}
            placeholder={placeholder?.en}
            rows={rows}
          />
        </div>
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground uppercase">Français</span>
          <Textarea
            value={value.fr}
            onChange={(e) => onChange({ ...value, fr: e.target.value })}
            placeholder={placeholder?.fr}
            rows={rows}
          />
        </div>
      </div>
    </div>
  )
}
