import { useRef, useState } from "react"
import { useNavigate } from "react-router"
import { LogOutIcon, PencilIcon, UploadIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { AuthForm } from "@/components/auth/auth-form"
import { UserAvatar } from "@/components/app/user-avatar"
import { useImageCropper } from "@/components/image-cropper/context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { authForms } from "@/lib/auth-forms"
import { getErrorMessage } from "@/lib/errors"
import { useLogoutMutation, useUpdateProfileMutation } from "@/store/api"
import { useAppDispatch, useAppSelector } from "@/store"
import { signedOut } from "@/store/auth-slice"

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_ORIGINAL_BYTES = 15 * 1024 * 1024
const AVATAR_SIZE = 512

function formatDate(value: string): string {
  if (value === "") return "Not set"
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { dateStyle: "long" })
}

export function SettingsPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const [logout, { isLoading: loggingOut }] = useLogoutMutation()
  const [updateProfile] = useUpdateProfileMutation()
  const cropImage = useImageCropper()
  const fileInput = useRef<HTMLInputElement>(null)
  const [photoError, setPhotoError] = useState("")
  const [editing, setEditing] = useState(false)
  const [newPhoto, setNewPhoto] = useState<{ file: File; previewUrl: string } | null>(null)

  if (user === null) return null

  const discardNewPhoto = () => {
    if (newPhoto !== null) URL.revokeObjectURL(newPhoto.previewUrl)
    setNewPhoto(null)
    setPhotoError("")
  }

  const stopEditing = () => {
    discardNewPhoto()
    setEditing(false)
  }

  const signOut = async () => {
    await logout()
    dispatch(signedOut())
    navigate("/login", { replace: true })
  }

  const onPhotoSelected = async (file: File) => {
    setPhotoError("")

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setPhotoError("Choose a JPG, PNG or WebP image.")
      return
    }
    if (file.size > MAX_ORIGINAL_BYTES) {
      setPhotoError("The image must be 15 MB or smaller.")
      return
    }

    const cropped = await cropImage(file, {
      aspect: 1,
      title: "Crop your photo",
      description: "Drag to move and use the slider to zoom.",
      maxSize: AVATAR_SIZE,
    })
    if (cropped === null) return

    if (newPhoto !== null) URL.revokeObjectURL(newPhoto.previewUrl)
    setNewPhoto({ file: cropped, previewUrl: URL.createObjectURL(cropped) })
  }

  const accessLabels = [
    ...(user.roles.includes("dev") ? ["Dev"] : []),
    ...(user.is_super_admin ? ["Super admin"] : []),
  ]
  const roleRow = accessLabels.length === 0 ? [] : [{ label: "Role", value: accessLabels.join(", ") }]

  const details = [
    { label: "Name", value: user.name !== "" ? user.name : "Not set" },
    { label: "Email", value: user.email },
    { label: "Date of birth", value: formatDate(user.date_of_birth) },
    ...roleRow,
    { label: "Email verified", value: user.email_verified ? "Yes" : "No" },
  ]

  const shownUser = newPhoto !== null ? { ...user, avatar_url: newPhoto.previewUrl } : user

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            {editing ? "Update your details, then save." : "Your photo and account details."}
          </CardDescription>
          <CardAction>
            <Button
              variant="ghost"
              size="icon"
              aria-label={editing ? "Cancel editing" : "Edit profile"}
              onClick={() => (editing ? stopEditing() : setEditing(true))}
            >
              {editing ? <XIcon /> : <PencilIcon />}
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <UserAvatar user={shownUser} className="size-20 text-xl" />

            {editing && (
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInput}
                  type="file"
                  accept={ACCEPTED_TYPES.join(",")}
                  className="hidden"
                  onChange={(event) => {
                    const files = event.target.files
                    const file = files !== null ? files.item(0) : null
                    if (file !== null) void onPhotoSelected(file)
                    event.target.value = ""
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const input = fileInput.current
                    if (input !== null) input.click()
                  }}
                >
                  <UploadIcon />
                  {newPhoto !== null ? "Choose another photo" : "Change photo"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  {newPhoto !== null
                    ? "Saved when you press Save changes."
                    : "JPG, PNG or WebP. You can crop it next."}
                </p>
                {photoError !== "" && <p className="text-xs text-destructive">{photoError}</p>}
              </div>
            )}
          </div>

          {editing ? (
            <div className="flex flex-col gap-4">
              <AuthForm
                config={{
                  ...authForms.profile,
                  defaultValues: {
                    name: user.name,
                    date_of_birth: user.date_of_birth,
                  },
                }}
                onCancel={stopEditing}
                onSubmit={async (values) => {
                  const result = await updateProfile({
                    id: user.id,
                    ...values,
                    avatar: newPhoto !== null ? newPhoto.file : null,
                  })
                  if (result.error) return getErrorMessage(result.error)

                  toast("Profile updated")
                  stopEditing()
                  return ""
                }}
              />
              <p className="text-xs text-muted-foreground">
                Your email ({user.email}) can&apos;t be changed here.
              </p>
            </div>
          ) : (
            <dl className="divide-y text-sm">
              {details.map((detail) => (
                <div key={detail.label} className="flex justify-between gap-4 py-3">
                  <dt className="text-muted-foreground">{detail.label}</dt>
                  <dd className="font-medium">{detail.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Session</CardTitle>
          <CardDescription>Sign out of AdSync on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="outline">
                  <LogOutIcon />
                  Sign out
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sign out of AdSync?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will need to sign in again to manage your campaigns.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex justify-end gap-2">
                <AlertDialogCancel disabled={loggingOut}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={signOut} disabled={loggingOut}>
                  Sign out
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
