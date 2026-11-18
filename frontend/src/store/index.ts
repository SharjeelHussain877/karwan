import { configureStore, createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit"
import { useDispatch, useSelector } from "react-redux"

import { setSessionExpiredHandler } from "@/lib/axios"
import { setSessionActive } from "@/lib/session"
import { baseApi } from "./api"
import authReducer, { sessionExpired, signedOut } from "./auth-slice"

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

store.subscribe(() => setSessionActive(store.getState().auth.sessionActive))

setSessionExpiredHandler(() => store.dispatch(sessionExpired()))
