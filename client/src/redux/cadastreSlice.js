import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: {},
};

export const counterSlice = createSlice({
  name: "cadastre",
  initialState,
  reducers: {
    updateCadastralData: (state, action) => {
      state.value = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { updateCadastralData } = counterSlice.actions;

export default counterSlice.reducer;
