import type { SerializedError } from "@reduxjs/toolkit"

import type { ApiError } from "@/types/auth"

export type RequestError = ApiError | SerializedError

const FALLBACK = "Something went wrong. Please try again."

export const getErrorMessage = (error: RequestError): string => error.message ?? FALLBACK

export const getErrorCode = (error: RequestError): string => error.code ?? ""
