import { useState, type ReactNode } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, type FieldValues } from "react-hook-form"
import { EyeIcon, EyeOffIcon, Loader2Icon, TriangleAlertIcon } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { DatePicker } from "@/components/date-picker"
import { Input } from "@/components/ui/input"
import type { FieldConfig, FormConfig } from "@/lib/auth-forms"

type AuthFormProps<TInput extends FieldValues, TOutput> = {
  config: FormConfig<TInput, TOutput>
  /** Resolve with an error message to show above the button, or "" on success. */
  onSubmit: (values: TOutput) => Promise<string>
  /** Shows a Cancel button next to the submit button; null for none. */
  onCancel: (() => void) | null
}

function PasswordInput(props: React.ComponentProps<typeof Input>) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} className="pr-10" />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
      >
        {visible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
      </button>
    </div>
  )
}

function renderInput<TInput extends FieldValues>(field: FieldConfig<TInput>, props: React.ComponentProps<typeof Input>) {
  return field.type === "password" ? <PasswordInput {...props} /> : <Input {...props} type={field.type} />
}

/** Date fields use the shadcn calendar instead of the browser's date input. */
function renderDate(
  field: { placeholder: string },
  id: string,
  value: string,
  invalid: boolean,
  onChange: (value: string) => void,
  onBlur: () => void
) {
  return (
    <DatePicker
      id={id}
      value={value}
      placeholder={field.placeholder}
      invalid={invalid}
      onChange={onChange}
      onBlur={onBlur}
    />
  )
}

export function AuthForm<TInput extends FieldValues, TOutput>({
  config,
  onSubmit,
  onCancel,
}: AuthFormProps<TInput, TOutput>): ReactNode {
  const [serverError, setServerError] = useState("")

  const form = useForm<TInput, object, TOutput>({
    resolver: zodResolver(config.schema),
    values: config.defaultValues,
  })

  const submit = form.handleSubmit(async (values) => {
    setServerError("")
    const error = await onSubmit(values)
    setServerError(error)
  })

  const { isSubmitting } = form.formState

  return (
    <form onSubmit={submit} noValidate>
      <FieldGroup>
        {serverError !== "" && (
          <Alert variant="destructive">
            <TriangleAlertIcon />
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        {config.fields.map((field) => (
          <Controller
            key={field.name}
            name={field.name}
            control={form.control}
            render={({ field: rhf, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`auth-${field.name}`}>{field.label}</FieldLabel>
                {field.type === "date"
                  ? renderDate(field, `auth-${field.name}`, typeof rhf.value === "string" ? rhf.value : "", fieldState.invalid, rhf.onChange, rhf.onBlur)
                  : renderInput(field, {
                      ...rhf,
                      id: `auth-${field.name}`,
                      placeholder: field.placeholder,
                      autoComplete: field.autoComplete,
                      "aria-invalid": fieldState.invalid,
                    })}
                {field.description !== "" && !fieldState.invalid && (
                  <FieldDescription>{field.description}</FieldDescription>
                )}
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        ))}

        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
            {isSubmitting && <Loader2Icon className="animate-spin" />}
            {config.submitLabel}
          </Button>
          {onCancel !== null && (
            <Button type="button" size="lg" variant="outline" disabled={isSubmitting} onClick={onCancel} className="w-full">
              Cancel
            </Button>
          )}
        </div>
      </FieldGroup>
    </form>
  )
}
