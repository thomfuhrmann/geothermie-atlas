import { configureStore } from "@reduxjs/toolkit";

import computationResultReducer from "./ewsComputationsSlice";
import gwwwpResourcesReducer from "./gwwpResourcesSlice";
import ampelkarteReducer from "./ampelkarteSlice";
import cadastreReducer from "./cadastreSlice";
import gwwpComputationsReducer from "./gwwpComputationsSlice";
import ewsResourcesReducer from "./ewsResourcesSlice";
import screenshotReducer from "./screenshotSlice";
import betriebsstundenReducer from "./betriebsstundenSlice";

export const store = configureStore({
  reducer: {
    ewsResources: ewsResourcesReducer,
    gwwpResources: gwwwpResourcesReducer,
    ampelkarte: ampelkarteReducer,
    cadastre: cadastreReducer,
    ewsComputations: computationResultReducer,
    gwwpComputations: gwwpComputationsReducer,
    screenshot: screenshotReducer,
    betriebsstunden: betriebsstundenReducer,
  },
});
