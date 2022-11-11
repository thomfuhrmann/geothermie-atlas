import * as identify from "@arcgis/core/rest/identify";
import IdentifyParameters from "@arcgis/core/rest/support/IdentifyParameters";

import { updateAmpelkarte } from "../redux/ampelkarteSlice";
import { updateGWWPResources } from "../redux/gwwpResourcesSlice";
import { updateEWSResources } from "../redux/ewsResourcesSlice";
import { updateBetriebsstunden } from "../redux/betriebsstundenSlice";
import { ampelkarte_url, ews_url, gwwp_url, betriebsstunden_url } from "./view";

// query layers
export const identifyAllLayers = (view, mapPoint, dispatch) => {
  // define query parameters
  const params = new IdentifyParameters();
  params.geometry = mapPoint;
  params.tolerance = 0;
  params.layerOption = "all";
  params.width = view.width;
  params.height = view.height;
  params.mapExtent = view.extent;

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
    .identify(betriebsstunden_url, params)
    .then((res) => {
      const results = res.results.map((result) => {
        return {
          layerId: result.layerId,
          layerName: result.layerName,
          feature: { attributes: result.feature.attributes },
        };
      });
      dispatch(updateBetriebsstunden(results));
    })
    .catch((err) => {
      dispatch(updateBetriebsstunden([]));
    });

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
    .identify(ampelkarte_url, params)
    .then((res) => {
      const results = res.results.map((result) => {
        return {
          layerId: result.layerId,
          layerName: result.layerName,
          feature: { attributes: result.feature.attributes },
        };
      });
      dispatch(updateAmpelkarte(results));
    })
    .catch((err) => {
      dispatch(updateAmpelkarte([]));
    });
};
