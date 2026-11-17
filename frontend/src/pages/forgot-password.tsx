import { useState } from "react"
import { Link } from "react-router"
import { MailCheckIcon } from "lucide-react"

import { AuthForm } from "@/components/auth/auth-form"
import { AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { authForms } from "@/lib/auth-forms"
import { getErrorMessage } from "@/lib/errors"
import { useForgotPasswordMutation } from "@/store/api"

export function ForgotPasswordPage() {
  const [forgotPassword] = useForgotPasswordMutation()
  const [sentTo, setSentTo] = useState("")

  const back = (
    <Link to="/login" className="font-medium text-foreground underline underline-offset-4">
      Back to sign in
    </Link>
  )

  if (sentTo !== "") {
    return (
      <AuthLayout
        title="Check your email"
        description={`If an account exists for ${sentTo}, we've sent a link to reset your password.`}
        footer={back}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <MailCheckIcon className="size-10 text-muted-foreground" />
          <Button variant="outline" onClick={() => setSentTo("")}>
            Use a different email
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      description="Enter your email and we'll send you a link to reset it."
      footer={back}
    >
      <AuthForm
        config={authForms.forgotPassword}
        onCancel={null}
        onSubmit={async ({ email }) => {
          const result = await forgotPassword({ email })
          if (result.error) return getErrorMessage(result.error)
          setSentTo(email)
          return ""
        }}
      />
    </AuthLayout>
  )
}
