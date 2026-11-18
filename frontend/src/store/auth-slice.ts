import { createSlice } from "@reduxjs/toolkit"

import { isSessionActive } from "@/lib/session"
import type { User } from "@/types/auth"
import { baseApi } from "./api"

type AuthState = {
  user: User | null
  sessionActive: boolean
}

const initialState: AuthState = { user: null, sessionActive: isSessionActive() }

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    sessionExpired: (state) => {
      state.user = null
      state.sessionActive = false
    },
    signedOut: (state) => {
      state.user = null
      state.sessionActive = false
    },
  },
  extraReducers: (builder) => {
    const { endpoints } = baseApi
    builder
      .addMatcher(endpoints.login.matchFulfilled, (state, { payload }) => {
        state.user = payload.data.user
        state.sessionActive = true
      })
      .addMatcher(endpoints.verifyEmail.matchFulfilled, (state, { payload }) => {
        state.user = payload.data.user
        state.sessionActive = true
      })
      .addMatcher(endpoints.signUp.matchFulfilled, (state, { payload }) => {
        if (!payload.data.verificationRequired) {
          state.user = payload.data.user
          state.sessionActive = payload.data.user !== null
        }
      })
      .addMatcher(endpoints.me.matchFulfilled, (state, { payload }) => {
        state.user = payload.data.user
      })
      .addMatcher(endpoints.me.matchRejected, (state) => {
        state.user = null
        state.sessionActive = false
      })
      .addMatcher(endpoints.updateProfile.matchFulfilled, (state, { payload }) => {
        state.user = payload.data.user
      })
      .addMatcher(endpoints.logout.matchFulfilled, (state) => {
        state.user = null
        state.sessionActive = false
      })
  },
})

export const { sessionExpired, signedOut } = slice.actions
export default slice.reducer
