import type { Area } from "react-easy-crop"

const OUTPUT_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("Could not read the image"))
    image.src = src
  })
}

function toBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob !== null ? resolve(blob) : reject(new Error("Could not export the image"))),
      type,
      0.92
    )
  })
}

/**
 * Cuts `area` (pixels of the original image) out of `src` and returns it as a File.
 * The result is scaled down so its width is at most `maxSize`.
 */
export async function getCroppedFile(
  src: string,
  area: Area,
  original: File,
  maxSize: number
): Promise<File> {
  const image = await loadImage(src)

  const width = Math.min(Math.round(area.width), maxSize)
  const height = Math.round(width * (area.height / area.width))

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext("2d")
  if (context === null) throw new Error("Canvas is not supported")

  context.imageSmoothingQuality = "high"
  context.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, width, height)

  // Keep PNG and WebP as they are; anything else becomes JPEG.
  const type = original.type in OUTPUT_TYPES ? original.type : "image/jpeg"
  const blob = await toBlob(canvas, type)

  const baseName = original.name.replace(/\.[^.]+$/, "")
  return new File([blob], `${baseName}.${OUTPUT_TYPES[type]}`, { type })
}
