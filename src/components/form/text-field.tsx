import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { useFieldContext } from './index'

export type TextFieldProps = {
  label?: string
  description?: string
} & Omit<React.ComponentProps<'input'>, 'value' | 'onChange' | 'name'>

export default function TextField({
  label,
  description,
  ...props
}: TextFieldProps) {
  const field = useFieldContext<string>()
  const isInvalid =
    field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      {label ? (
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      ) : null}
      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        {...props}
      />
      {description ? (
        <FieldDescription>{description}</FieldDescription>
      ) : null}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
