import {
  createFormHook,
  createFormHookContexts,
} from '@tanstack/react-form'
import SecurityTextField from './security-field'
import SelectField from './select-field'
import TextField from './text-field'
import TextareaField from './textarea-field'

// export useFieldContext for use in your custom components
export const { fieldContext, formContext, useFieldContext } =
  createFormHookContexts()

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  // We'll learn more about these options later
  fieldComponents: {
    TextField,
    TextareaField,
    SelectField,
    SecurityTextField,
  },
  formComponents: {},
})
