import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import { Loader2Icon, MailIcon, TriangleAlertIcon } from "lucide-react"
import { toast } from "sonner"

import { AuthForm } from "@/components/auth/auth-form"
import { AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { authForms } from "@/lib/auth-forms"
import { getErrorMessage } from "@/lib/errors"
import { readUrlTokens } from "@/lib/url-tokens"
import { useResendVerificationMutation, useVerifyEmailMutation } from "@/store/api"

const RESEND_COOLDOWN = 60

export function VerifyEmailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [verifyEmail] = useVerifyEmailMutation()
  const [resend] = useResendVerificationMutation()

  const [tokens] = useState(readUrlTokens)
  const hasToken = tokens.tokenHash !== "" || (tokens.accessToken !== "" && tokens.refreshToken !== "")
  const [error, setError] = useState(tokens.error)
  const started = useRef(false)

  const email = searchParams.get("email") ?? ""
  const [cooldown, setCooldown] = useState(0)

  // 1) Came from the email link: verify, then land on the home page.
  useEffect(() => {
    if (!hasToken || started.current) return
    started.current = true

    verifyEmail({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenHash: tokens.tokenHash,
    }).then((result) => {
      if (result.error) {
        setError(getErrorMessage(result.error))
        return
      }
      toast("Email verified. Welcome to AdSync!")
      navigate("/", { replace: true })
    })
  }, [hasToken, tokens, verifyEmail, navigate])

  useEffect(() => {
    if (cooldown <= 0) return
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [cooldown])

  if (hasToken && error === "") {
    return (
      <AuthLayout title="Verifying your email" description="Just a moment…" footer={null}>
        <div className="flex justify-center py-4">
          <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
        </div>
      </AuthLayout>
    )
  }

  const description =
    error !== ""
      ? error
      : email !== ""
        ? `We sent a verification link to ${email}. Open it to finish creating your account.`
        : "Open the verification link we emailed you to finish creating your account."

  // 2) Waiting for the user to open the email (or the link failed): offer a resend.
  return (
    <AuthLayout
      title={error !== "" ? "Verification failed" : "Verify your email"}
      description={description}
      footer={
        <Link to="/login" className="font-medium text-foreground underline underline-offset-4">
          Back to sign in
        </Link>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex justify-center">
          {error !== "" ? (
            <TriangleAlertIcon className="size-10 text-destructive" />
          ) : (
            <MailIcon className="size-10 text-muted-foreground" />
          )}
        </div>

        {cooldown > 0 ? (
          <Button variant="outline" size="lg" disabled>
            Email sent. Resend available in {cooldown}s
          </Button>
        ) : (
          <AuthForm
            config={{ ...authForms.resendVerification, defaultValues: { email } }}
            onCancel={null}
            onSubmit={async (values) => {
              const result = await resend({ email: values.email })
              if (result.error) return getErrorMessage(result.error)

              toast("Verification email sent")
              setError("")
              setCooldown(RESEND_COOLDOWN)
              return ""
            }}
          />
        )}
      </div>
    </AuthLayout>
  )
}
