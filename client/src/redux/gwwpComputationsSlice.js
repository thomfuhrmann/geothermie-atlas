import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: {},
};

export const counterSlice = createSlice({
  name: "gwwpComputations",
  initialState,
  reducers: {
    updateGWWPComputationResult: (state, action) => {
      state.value = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { updateGWWPComputationResult } = counterSlice.actions;

export default counterSlice.reducer;
