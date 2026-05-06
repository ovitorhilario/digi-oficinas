import { EyeIcon, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '~/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '~/components/ui/input-group'
import { useFieldContext } from './index'

export type SecurityTextFieldProps = {
  label?: string
  description?: string
  onForgotPassword?: () => void
} & Omit<
  React.ComponentProps<'input'>,
  'value' | 'onChange' | 'name' | 'type'
>

export default function SecurityTextField({
  label,
  description,
  onForgotPassword,
  ...props
}: SecurityTextFieldProps) {
  const field = useFieldContext<string>()
  const isInvalid =
    field.state.meta.isTouched && !field.state.meta.isValid
  const [isSecure, setIsSecure] = useState(true)

  return (
    <Field data-invalid={isInvalid}>
      {label || onForgotPassword ? (
        <div className="flex items-center gap-2">
          {label ? (
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          ) : null}
          {onForgotPassword ? (
            <Button
              className="ml-auto"
              variant="link"
              size="sm"
              onClick={onForgotPassword}
            >
              Forgot password?
            </Button>
          ) : null}
        </div>
      ) : null}
      <InputGroup>
        <InputGroupInput
          id={field.name}
          type={isSecure ? 'password' : 'text'}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          {...props}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            title={isSecure ? 'Show password' : 'Hide password'}
            onClick={() => setIsSecure(!isSecure)}
          >
            {isSecure ? <EyeIcon /> : <EyeOff />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {description ? (
        <FieldDescription>{description}</FieldDescription>
      ) : null}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
