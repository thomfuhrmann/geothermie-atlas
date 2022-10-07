import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: "",
};

export const counterSlice = createSlice({
  name: "screenshot",
  initialState,
  reducers: {
    updateScreenshot: (state, action) => {
      state.value = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { updateScreenshot } = counterSlice.actions;

export default counterSlice.reducer;
