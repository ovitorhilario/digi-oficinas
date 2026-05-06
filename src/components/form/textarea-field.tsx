import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '~/components/ui/field'
import { Textarea } from '~/components/ui/textarea'
import { useFieldContext } from './index'

export type TextareaFieldProps = {
  label?: string
  placeholder?: string
  description?: string
}

export default function TextareaField({
  label,
  placeholder,
  description,
}: TextareaFieldProps) {
  const field = useFieldContext<string>()
  const isInvalid =
    field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      {label ? (
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      ) : null}
      <Textarea
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder={placeholder}
        className="min-h-[120px]"
      />
      {description ? (
        <FieldDescription>{description}</FieldDescription>
      ) : null}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
