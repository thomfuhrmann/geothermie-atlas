import { configureStore } from "@reduxjs/toolkit";
import computationResultReducer from "./ewsComputationsSlice";
import gwwwpResourcesReducer from "./gwwpResourcesSlice";
import ampelkarteReducer from "./ampelkarteSlice";
import cadastreReducer from "./cadastreSlice";
import gwwpComputationsReducer from "./gwwpComputationsSlice";
import ewsResourcesReducer from "./ewsResourcesSlice";

export const store = configureStore({
  reducer: {
    ewsResources: ewsResourcesReducer,
    gwwpResources: gwwwpResourcesReducer,
    ampelkarte: ampelkarteReducer,
    cadastre: cadastreReducer,
    ewsComputations: computationResultReducer,
    gwwpComputations: gwwpComputationsReducer,
  },
});
