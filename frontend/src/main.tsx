import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { ImageCropperProvider } from "@/components/image-cropper/provider"
import { Toaster } from "@/components/ui/sonner"
import { store } from "@/store"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <ImageCropperProvider>
          <App />
        </ImageCropperProvider>
        <Toaster position="top-center" />
      </ThemeProvider>
    </Provider>
  </StrictMode>
)
