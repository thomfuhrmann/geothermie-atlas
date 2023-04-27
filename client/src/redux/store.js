import { configureStore } from '@reduxjs/toolkit';

import computationResultReducer from './ewsComputationsSlice';
import gwwwpResourcesReducer from './gwwpResourcesSlice';
import ampelkarteEWSReducer from './ampelkarteEWSSlice';
import ampelkarteGWWPReducer from './ampelkarteGWWPSlice';
import cadastreReducer from './cadastreSlice';
import gwwpComputationsReducer from './gwwpComputationsSlice';
import ewsResourcesReducer from './ewsResourcesSlice';
import screenshotReducer from './screenshotSlice';

export const store = configureStore({
  reducer: {
    ewsResources: ewsResourcesReducer,
    gwwpResources: gwwwpResourcesReducer,
    ampelkarteEWS: ampelkarteEWSReducer,
    ampelkarteGWWP: ampelkarteGWWPReducer,
    cadastre: cadastreReducer,
    ewsComputations: computationResultReducer,
    gwwpComputations: gwwpComputationsReducer,
    screenshot: screenshotReducer,
  },
});
