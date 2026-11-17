import { configureStore, createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit"
import { useDispatch, useSelector } from "react-redux"

import { setSessionExpiredHandler } from "@/lib/axios"
import { setSessionActive } from "@/lib/session"
import { baseApi } from "./api"
import authReducer, { sessionExpired, signedOut } from "./auth-slice"

/**
 * Whenever a session ends (sign out, or it expired) every cached API result is thrown
 * away. The next person to sign in on this browser starts from nothing: no leftover
 * users list, no old profile. Pages mount with their loading state and fetch again.
 */
const clearOnSessionEnd = createListenerMiddleware()
clearOnSessionEnd.startListening({
  matcher: isAnyOf(signedOut, sessionExpired, baseApi.endpoints.logout.matchFulfilled),
  effect: (_action, listenerApi) => {
    listenerApi.dispatch(baseApi.util.resetApiState())
  },
})

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefault) =>
    getDefault().prepend(clearOnSessionEnd.middleware).concat(baseApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()

// Keep the "logged in" flag in sync with the store.
store.subscribe(() => setSessionActive(store.getState().auth.sessionActive))

setSessionExpiredHandler(() => store.dispatch(sessionExpired()))
