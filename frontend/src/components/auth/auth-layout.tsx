import type { ReactNode } from "react"
import { Link } from "react-router"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type Props = {
  title: string
  description: ReactNode
  children: ReactNode
  footer: ReactNode
}

export function AuthLayout({ title, description, children, footer }: Props) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/40 p-6">
      <Link to="/" className="text-xl font-semibold tracking-tight">
        AdSync
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{title}</CardTitle>
          {description !== null && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>

      {footer !== null && <div className="text-center text-sm text-muted-foreground">{footer}</div>}
    </div>
  )
}
