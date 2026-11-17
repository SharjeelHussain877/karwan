import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppSelector } from "@/store"

const steps = [
  { title: "Connect Google Ads", body: "Sign in with Google to link your ad account securely." },
  { title: "Connect Meta Ads", body: "Sign in with Meta to link your ad account securely." },
  { title: "Create a campaign", body: "Pick a goal, audience and budget with guided steps." },
]

export function HomePage() {
  const user = useAppSelector((state) => state.auth.user)

  if (user === null) return null

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight">
        Welcome{user.name !== "" ? `, ${user.name.split(" ")[0]}` : ""}
      </h1>
      <p className="mt-2 text-muted-foreground">
        Your email is verified. Here is how to get your first campaign live.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <Card key={step.title}>
            <CardHeader>
              <CardDescription>Step {index + 1}</CardDescription>
              <CardTitle>{step.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{step.body}</CardContent>
          </Card>
        ))}
      </div>

      <Button className="mt-8" size="lg" disabled>
        <PlusIcon />
        New campaign (coming soon)
      </Button>
    </div>
  )
}
