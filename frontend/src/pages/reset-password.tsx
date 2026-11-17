import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { toast } from "sonner"

import { AuthForm } from "@/components/auth/auth-form"
import { AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { authForms } from "@/lib/auth-forms"
import { getErrorMessage } from "@/lib/errors"
import { readUrlTokens } from "@/lib/url-tokens"
import { useResetPasswordMutation } from "@/store/api"

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [resetPassword] = useResetPasswordMutation()
  // Read once: the tokens are removed from the address bar right away.
  const [tokens] = useState(readUrlTokens)

  if (tokens.error !== "" || (tokens.accessToken === "" && tokens.tokenHash === "")) {
    return (
      <AuthLayout
        title="Reset link invalid"
        description={tokens.error !== "" ? tokens.error : "This password reset link is invalid or has expired."}
        footer={null}
      >
        <Button className="w-full" nativeButton={false} render={<Link to="/forgot-password" />}>
          Request a new link
        </Button>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Set a new password" description="Choose a strong password for your account." footer={null}>
      <AuthForm
        config={authForms.resetPassword}
        onCancel={null}
        onSubmit={async ({ password }) => {
          const result = await resetPassword({
            accessToken: tokens.accessToken,
            tokenHash: tokens.tokenHash,
            password,
          })
          if (result.error) return getErrorMessage(result.error)

          toast("Password updated. Please sign in.")
          navigate("/login", { replace: true })
          return ""
        }}
      />
    </AuthLayout>
  )
}
