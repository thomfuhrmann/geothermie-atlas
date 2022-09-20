import { configureStore } from "@reduxjs/toolkit"
import computationResultReducer from "./computationResultSlice"

export const store = configureStore({
    reducer: {
        computationResult: computationResultReducer,
    },
})