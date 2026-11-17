import { MegaphoneIcon } from "lucide-react"

export function CampaignsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight">Campaigns</h1>
      <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
        <MegaphoneIcon className="size-8 text-muted-foreground" />
        <p className="font-medium">No campaigns yet</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Once you connect Google and Meta, you can create and publish campaigns from here.
        </p>
      </div>
    </div>
  )
}
