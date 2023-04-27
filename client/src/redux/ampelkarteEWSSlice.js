import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: [],
};

export const counterSlice = createSlice({
  name: 'ampelkarteEWS',
  initialState,
  reducers: {
    updateAmpelkarteEWS: (state, action) => {
      state.value = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { updateAmpelkarteEWS } = counterSlice.actions;

export default counterSlice.reducer;
