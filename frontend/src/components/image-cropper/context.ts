import { createContext, useContext } from "react"

export type CropOptions = {
  aspect: number
  title: string
  description: string
  maxSize: number
}

export type CropImage = (file: File, options: CropOptions) => Promise<File | null>

export const ImageCropperContext = createContext<CropImage | null>(null)

export function useImageCropper(): CropImage {
  const crop = useContext(ImageCropperContext)
  if (crop === null) throw new Error("useImageCropper must be used inside <ImageCropperProvider>")
  return crop
}
