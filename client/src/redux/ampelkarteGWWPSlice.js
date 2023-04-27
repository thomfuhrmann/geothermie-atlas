import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: [],
};

export const counterSlice = createSlice({
  name: 'ampelkarteGWWP',
  initialState,
  reducers: {
    updateAmpelkarteGWWP: (state, action) => {
      state.value = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { updateAmpelkarteGWWP } = counterSlice.actions;

export default counterSlice.reducer;
