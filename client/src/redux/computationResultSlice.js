import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    value: {},
}

export const counterSlice = createSlice({
    name: 'computationResult',
    initialState,
    reducers: {
        updateWithResult: (state, action) => {
            state.value = action.payload
        },
    },
})

// Action creators are generated for each case reducer function
export const { updateWithResult } = counterSlice.actions

export default counterSlice.reducer