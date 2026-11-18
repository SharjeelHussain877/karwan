import { useState } from "react"
import Cropper, { type Area, type Point } from "react-easy-crop"
import { Loader2Icon, ZoomInIcon, ZoomOutIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Slider } from "@/components/ui/slider"
import { getCroppedFile } from "@/lib/crop-image"
import type { CropOptions } from "./context"

type Props = {
  file: File
  src: string
  options: CropOptions
  onApply: (cropped: File) => void
  onCancel: () => void
}

export function CropEditor({ file, src, options, onApply, onCancel }: Props) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [area, setArea] = useState<Area | null>(null)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState("")

  const apply = async () => {
    if (area === null) return
    setApplying(true)
    setError("")
    try {
      onApply(await getCroppedFile(src, area, file, options.maxSize))
    } catch {
      setError("Could not crop this image. Try a different one.")
      setApplying(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col">
      <DrawerHeader className="shrink-0">
        <DrawerTitle>{options.title}</DrawerTitle>
        <DrawerDescription>{options.description}</DrawerDescription>
      </DrawerHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
        <div
          data-base-ui-swipe-ignore
          className="relative mx-auto aspect-square w-[min(100%,45svh)] shrink-0 overflow-hidden rounded-xl bg-black"
        >
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={options.aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, pixels) => setArea(pixels)}
          />
        </div>

        <div className="flex shrink-0 items-center gap-3" data-base-ui-swipe-ignore>
          <ZoomOutIcon className="size-4 text-muted-foreground" />
          <Slider
            aria-label="Zoom"
            min={1}
            max={3}
            step={0.01}
            value={[zoom]}
            onValueChange={(value) => setZoom(typeof value === "number" ? value : value[0])}
          />
          <ZoomInIcon className="size-4 text-muted-foreground" />
        </div>

        {error !== "" && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <DrawerFooter>
        <Button size="lg" onClick={apply} disabled={area === null || applying}>
          {applying && <Loader2Icon className="animate-spin" />}
          Apply
        </Button>
        <Button size="lg" variant="outline" onClick={onCancel} disabled={applying}>
          Cancel
        </Button>
      </DrawerFooter>
    </div>
  )
}
