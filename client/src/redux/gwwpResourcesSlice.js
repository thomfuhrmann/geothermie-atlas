import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: [],
};

export const counterSlice = createSlice({
  name: "gwwpResources",
  initialState,
  reducers: {
    updateGWWPResources: (state, action) => {
      state.value = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { updateGWWPResources } = counterSlice.actions;

export default counterSlice.reducer;
