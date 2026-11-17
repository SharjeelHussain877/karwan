import { createContext, useContext } from "react"

export type CropOptions = {
  /** width / height of the crop box. 1 is a square. */
  aspect: number
  title: string
  description: string
  /** The cropped image is scaled down to at most this many pixels wide. */
  maxSize: number
}

/** Opens the crop drawer. Resolves with the cropped file, or null if the user cancelled. */
export type CropImage = (file: File, options: CropOptions) => Promise<File | null>

export const ImageCropperContext = createContext<CropImage | null>(null)

/**
 * Crop any image from anywhere in the app:
 *
 *   const cropImage = useImageCropper()
 *   const cropped = await cropImage(file, { aspect: 1, title: "Crop photo", description: "", maxSize: 512 })
 */
export function useImageCropper(): CropImage {
  const crop = useContext(ImageCropperContext)
  if (crop === null) throw new Error("useImageCropper must be used inside <ImageCropperProvider>")
  return crop
}
