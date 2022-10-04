import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: [],
};

export const counterSlice = createSlice({
  name: "ampelkarte",
  initialState,
  reducers: {
    updateAmpelkarte: (state, action) => {
      state.value = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { updateAmpelkarte } = counterSlice.actions;

export default counterSlice.reducer;
