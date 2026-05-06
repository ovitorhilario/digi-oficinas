import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '~/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { useFieldContext } from './index'

export type SelectFieldProps = {
  label: string
  description?: string
  placeholder?: string
  items: { label: string; value: string; disabled?: boolean }[]
  alignItemWithTrigger?: boolean
}

export default function SelectField({
  label,
  description,
  placeholder,
  items,
  alignItemWithTrigger = true,
}: SelectFieldProps) {
  const field = useFieldContext<string>()
  const isInvalid =
    field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      <FieldContent>
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
        {description && (
          <FieldDescription>{description}</FieldDescription>
        )}
        {isInvalid && <FieldError errors={field.state.meta.errors} />}
      </FieldContent>

      <Select
        name={field.name}
        value={field.state.value}
        onValueChange={(value) => field.handleChange(value as string)}
        items={items}
        disabled={items.length === 0}
      >
        <SelectTrigger
          id={field.name}
          aria-invalid={isInvalid}
          className="min-w-30"
        >
          <SelectValue
            placeholder={`${placeholder} - ${items.length === 0 ? 'Nenhuma opção disponível' : items.length}`}
          />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={alignItemWithTrigger}>
          <SelectGroup>
            {items.map(({ label, value, disabled }) => (
              <SelectItem
                key={value}
                value={value}
                disabled={disabled}
              >
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  )
}
