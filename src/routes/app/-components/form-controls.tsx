import { Save } from 'lucide-react'
import { Button } from '~/components/ui/button'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from '~/components/ui/field'
import { Switch } from '~/components/ui/switch'

export function SubmitStateButton({
  canSubmit,
  isSubmitting,
  label = 'Salvar',
  busyLabel = 'Salvando...',
  icon,
  disabled,
}: {
  canSubmit: boolean
  isSubmitting: boolean
  label?: string
  busyLabel?: string
  icon?: React.ReactNode
  disabled?: boolean
}) {
  return (
    <Field>
      <Button
        type="submit"
        disabled={!canSubmit || isSubmitting || disabled}
      >
        {icon ?? <Save />}
        {isSubmitting ? busyLabel : label}
      </Button>
    </Field>
  )
}

export function BooleanField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <Field orientation="horizontal">
      <Switch checked={checked} onCheckedChange={onChange} />
      <FieldContent>
        <FieldLabel>{label}</FieldLabel>
        {description ? (
          <FieldDescription>{description}</FieldDescription>
        ) : null}
      </FieldContent>
    </Field>
  )
}
