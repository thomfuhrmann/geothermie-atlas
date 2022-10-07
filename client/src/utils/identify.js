import * as identify from "@arcgis/core/rest/identify";
import IdentifyParameters from "@arcgis/core/rest/support/IdentifyParameters";

import { updateAmpelkarte } from "../redux/ampelkarteSlice";
import { updateGWWPResources } from "../redux/gwwpResourcesSlice";
import { updateEWSResources } from "../redux/ewsResourcesSlice";
import { updateBetriebsstunden } from "../redux/betriebsstundenSlice";

// layer urls
const ampelkarte_url =
  "https://srv-ags02i.gba.geolba.ac.at:6443/arcgis/rest/services/Test/OG_Ampelkarte_Wien/MapServer";
const gwwp_url =
  "https://srv-ags02i.gba.geolba.ac.at:6443/arcgis/rest/services/Test/OG_thermischeGrundwassernutzung_GWP_Wien_TEST/MapServer";
const ews_url =
  "https://srv-ags02i.gba.geolba.ac.at:6443/arcgis/rest/services/Test/OG_Erdwaermesonden_EWS_Wien_TEST/MapServer";
const betriebsstunden_url =
  "https://srv-ags02i.gba.geolba.ac.at:6443/arcgis/rest/services/Test/OG_BetriebsStd_Wien_TEST/MapServer";

// query layers
export const identifyAllLayers = (view, mapPoint, dispatch) => {
  const params = new IdentifyParameters();
  params.geometry = mapPoint;
  params.tolerance = 0;
  params.layerOption = "all";
  params.width = view.width;
  params.height = view.height;
  params.mapExtent = view.extent;

  identify.identify(ews_url, params).then((res) => {
    const results = res.results.map((result) => {
      return {
        layerId: result.layerId,
        layerName: result.layerName,
        feature: { attributes: result.feature.attributes },
      };
    });
    dispatch(updateEWSResources(results));
  });

  identify.identify(betriebsstunden_url, params).then((res) => {
    const results = res.results.map((result) => {
      return {
        layerId: result.layerId,
        layerName: result.layerName,
        feature: { attributes: result.feature.attributes },
      };
    });
    dispatch(updateBetriebsstunden(results));
  });

  identify.identify(gwwp_url, params).then((res) => {
    const results = res.results.map((result) => {
      return {
        layerId: result.layerId,
        layerName: result.layerName,
        feature: { attributes: result.feature.attributes },
      };
    });
    dispatch(updateGWWPResources(results));
  });

  identify.identify(ampelkarte_url, params).then((res) => {
    const results = res.results.map((result) => {
      return {
        layerId: result.layerId,
        layerName: result.layerName,
        feature: { attributes: result.feature.attributes },
      };
    });
    dispatch(updateAmpelkarte(results));
  });
};
