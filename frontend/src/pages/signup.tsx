import { Link, useNavigate } from "react-router"

import { AuthForm } from "@/components/auth/auth-form"
import { AuthLayout } from "@/components/auth/auth-layout"
import { authForms } from "@/lib/auth-forms"
import { getErrorMessage } from "@/lib/errors"
import { useSignUpMutation } from "@/store/api"

export function SignUpPage() {
  const navigate = useNavigate()
  const [signUp] = useSignUpMutation()

  return (
    <AuthLayout
      title="Create your account"
      description="Connect Google and Meta, then publish ads smoothly and securely."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-foreground underline underline-offset-4">
            Sign in
          </Link>
        </>
      }
    >
      <AuthForm
        config={authForms.signUp}
        onCancel={null}
        onSubmit={async ({ name, email, password }) => {
          const result = await signUp({ name, email, password })
          if (result.error) return getErrorMessage(result.error)

          if (!result.data.data.verificationRequired) {
            navigate("/", { replace: true })
            return ""
          }
          navigate(`/verify-email?email=${encodeURIComponent(email)}`)
          return ""
        }}
      />
    </AuthLayout>
  )
}
