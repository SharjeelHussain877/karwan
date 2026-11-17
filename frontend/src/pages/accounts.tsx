import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const PLATFORMS = [
  { name: "Google Ads", body: "Read and publish campaigns on Google." },
  { name: "Meta Ads", body: "Read and publish campaigns on Facebook and Instagram." },
]

export function AccountsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight">Connected accounts</h1>
      <p className="mt-2 text-muted-foreground">Connect your ad accounts through secure OAuth.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {PLATFORMS.map((platform) => (
          <Card key={platform.name}>
            <CardHeader>
              <CardTitle>{platform.name}</CardTitle>
              <CardDescription>{platform.body}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" disabled>
                Connect (coming soon)
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
