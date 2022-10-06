import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: {},
};

export const counterSlice = createSlice({
  name: "ewsComputations",
  initialState,
  reducers: {
    updateEWSComputationResult: (state, action) => {
      state.value = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { updateEWSComputationResult } = counterSlice.actions;

export default counterSlice.reducer;
