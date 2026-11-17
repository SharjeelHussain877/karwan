import { Link, useNavigate } from "react-router"

import { AuthForm } from "@/components/auth/auth-form"
import { AuthLayout } from "@/components/auth/auth-layout"
import { authForms } from "@/lib/auth-forms"
import { getErrorCode, getErrorMessage } from "@/lib/errors"
import { useLoginMutation } from "@/store/api"

export function LoginPage() {
  const navigate = useNavigate()
  const [login] = useLoginMutation()

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to manage and publish your campaigns."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="font-medium text-foreground underline underline-offset-4">
            Sign up
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <AuthForm
          config={authForms.login}
          onCancel={null}
          onSubmit={async (values) => {
            const result = await login(values)
            if (result.error) {
              if (getErrorCode(result.error) === "EMAIL_NOT_VERIFIED") {
                navigate(`/verify-email?email=${encodeURIComponent(values.email)}`)
                return ""
              }
              return getErrorMessage(result.error)
            }
            navigate("/", { replace: true })
            return ""
          }}
        />
        <Link
          to="/forgot-password"
          className="text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Forgot your password?
        </Link>
      </div>
    </AuthLayout>
  )
}
