import { configureStore } from "@reduxjs/toolkit";
import computationResultReducer from "./computationResultSlice";
import gwwwpResourcesReducer from "./gwwpResourcesSlice";
import ampelkarteReducer from "./ampelkarteSlice";
import cadastreReducer from "./cadastreSlice";
import gwwpComputationsReducer from "./gwwpComputationsSlice";

export const store = configureStore({
  reducer: {
    computationResult: computationResultReducer,
    gwwpResources: gwwwpResourcesReducer,
    ampelkarte: ampelkarteReducer,
    cadastre: cadastreReducer,
    gwwpComputations: gwwpComputationsReducer,
  },
});
