import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: [],
};

export const counterSlice = createSlice({
  name: "betriebsstunden",
  initialState,
  reducers: {
    updateBetriebsstunden: (state, action) => {
      state.value = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { updateBetriebsstunden } = counterSlice.actions;

export default counterSlice.reducer;
