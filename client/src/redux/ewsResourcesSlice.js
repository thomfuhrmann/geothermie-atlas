import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: [],
};

export const counterSlice = createSlice({
  name: "ewsResources",
  initialState,
  reducers: {
    updateEWSResources: (state, action) => {
      state.value = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { updateEWSResources } = counterSlice.actions;

export default counterSlice.reducer;
