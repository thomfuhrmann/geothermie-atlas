import * as identify from '@arcgis/core/rest/identify';
import IdentifyParameters from '@arcgis/core/rest/support/IdentifyParameters';

import { updateAmpelkarteEWS } from '../redux/ampelkarteEWSSlice';
import { updateAmpelkarteGWWP } from '../redux/ampelkarteGWWPSlice';
import { updateGWWPResources } from '../redux/gwwpResourcesSlice';
import { updateEWSResources } from '../redux/ewsResourcesSlice';
import { ampelkarte_ews_url, ampelkarte_gwwp_url, ews_url, gwwp_url } from './view';

// query layers
export const identifyAllLayers = (view, mapPoint, dispatch, theme) => {
  // define query parameters
  const params = new IdentifyParameters();
  params.geometry = mapPoint;
  params.tolerance = 0;
  params.layerOption = 'all';
  params.width = view.width;
  params.height = view.height;
  params.mapExtent = view.extent;

  if (theme === 'EWS') {
    identify
      .identify(ews_url, params)
      .then((res) => {
        const results = res.results.map((result) => {
          return {
            layerId: result.layerId,
            layerName: result.layerName,
            feature: { attributes: result.feature.attributes },
          };
        });
        dispatch(updateEWSResources(results));
      })
      .catch((err) => {
        dispatch(updateEWSResources([]));
      });

    identify
      .identify(ampelkarte_ews_url, params)
      .then((res) => {
        const results = res.results.map((result) => {
          return {
            layerId: result.layerId,
            layerName: result.layerName,
            feature: { attributes: result.feature.attributes },
          };
        });
        dispatch(updateAmpelkarteEWS(results));
      })
      .catch((err) => {
        dispatch(updateAmpelkarteEWS([]));
      });
  }

  if (theme === 'GWWP') {
    identify
      .identify(gwwp_url, params)
      .then((res) => {
        const results = res.results.map((result) => {
          return {
            layerId: result.layerId,
            layerName: result.layerName,
            feature: { attributes: result.feature.attributes },
          };
        });
        dispatch(updateGWWPResources(results));
      })
      .catch((err) => {
        dispatch(updateGWWPResources([]));
      });

    identify
      .identify(ampelkarte_gwwp_url, params)
      .then((res) => {
        const results = res.results.map((result) => {
          return {
            layerId: result.layerId,
            layerName: result.layerName,
            feature: { attributes: result.feature.attributes },
          };
        });
        dispatch(updateAmpelkarteGWWP(results));
      })
      .catch((err) => {
        dispatch(updateAmpelkarteGWWP([]));
      });
  }
};
