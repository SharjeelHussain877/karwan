import type { BaseQueryFn } from "@reduxjs/toolkit/query"
import axios, { type Method } from "axios"

import { api } from "@/lib/axios"
import type { ApiError, ErrorBody } from "@/types/auth"

type Args = {
  url: string
  method: Method
  body: object | null
}

export const axiosBaseQuery =
  (): BaseQueryFn<Args, object, ApiError> =>
  async ({ url, method, body }) => {
    try {
      const result =
        body === null
          ? await api.request<object>({ url, method })
          : body instanceof Blob
            ? await api.request<object>({
                url,
                method,
                data: body,
                headers: { "Content-Type": body.type },
              })
            : body instanceof FormData
              ? await api.request<object>({
                  url,
                  method,
                  data: body,
                  headers: { "Content-Type": "multipart/form-data" },
                })
              : await api.request<object>({ url, method, data: body })
      return { data: result.data }
    } catch (e) {
      if (axios.isAxiosError<ErrorBody>(e) && e.response !== undefined) {
        const { status, data } = e.response
        return { error: { status, code: data.code, message: data.message } }
      }
      return {
        error: { status: 0, code: "NETWORK_ERROR", message: "Cannot reach the server. Please try again." },
      }
    }
  }
