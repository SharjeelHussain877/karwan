import { useCallback, useRef, useState, type ReactNode } from "react"

import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { CropEditor } from "./crop-editor"
import { ImageCropperContext, type CropImage, type CropOptions } from "./context"

type Request = { file: File; src: string; options: CropOptions }

export function ImageCropperProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<Request | null>(null)
  const [open, setOpen] = useState(false)
  const settle = useRef<(file: File | null) => void>(() => {})

  const crop: CropImage = useCallback(
    (file, options) =>
      new Promise((resolve) => {
        settle.current = resolve
        setRequest({ file, src: URL.createObjectURL(file), options })
        setOpen(true)
      }),
    []
  )

  const finish = (result: File | null) => {
    settle.current(result)
    settle.current = () => {}
    setOpen(false)
  }

  return (
    <ImageCropperContext.Provider value={crop}>
      {children}

      <Drawer
        open={open}
        onOpenChange={(next) => {
          if (!next) finish(null)
        }}
        onOpenChangeComplete={(isOpen) => {
          if (!isOpen && request !== null) {
            URL.revokeObjectURL(request.src)
            setRequest(null)
          }
        }}
      >
        <DrawerContent>
          {request !== null && (
            <CropEditor
              key={request.src}
              file={request.file}
              src={request.src}
              options={request.options}
              onApply={finish}
              onCancel={() => finish(null)}
            />
          )}
        </DrawerContent>
      </Drawer>
    </ImageCropperContext.Provider>
  )
}
