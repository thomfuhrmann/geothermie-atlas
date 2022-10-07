import ArcGISMap from "@arcgis/core/Map";
import Extent from "@arcgis/core/geometry/Extent";
import MapView from "@arcgis/core/views/MapView";
import Basemap from "@arcgis/core/Basemap";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import WMSLayer from "@arcgis/core/layers/WMSLayer";
import WMTSLayer from "@arcgis/core/layers/WMTSLayer";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import Search from "@arcgis/core/widgets/Search";
import ScaleBar from "@arcgis/core/widgets/ScaleBar";
import Sketch from "@arcgis/core/widgets/Sketch";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";

import { updateEWSComputationResult } from "../redux/ewsComputationsSlice";
import { updateGWWPComputationResult } from "../redux/gwwpComputationsSlice";
import { initializeCollapsibleEWS } from "./ParameterMenuEWS";
import { initializeCollapsibleGWWP } from "./ParameterMenuGWWP";
import { identifyAllLayers } from "./identify";
import { queryCadastre } from "./queryCadastre";
import { takeScreenshot } from "./screenshot";
import { getAddress } from "./getAddress";

// spatial reference WKID
const SRS = 31256;

// layer urls
const ampelkarte_url =
  "https://srv-ags02i.gba.geolba.ac.at:6443/arcgis/rest/services/Test/OG_Ampelkarte_Wien/MapServer";
const ews_url =
  "https://srv-ags02i.gba.geolba.ac.at:6443/arcgis/rest/services/Test/OG_Erdwaermesonden_EWS_Wien_TEST/MapServer";
const gwwp_url =
  "https://srv-ags02i.gba.geolba.ac.at:6443/arcgis/rest/services/Test/OG_thermischeGrundwassernutzung_GWP_Wien_TEST/MapServer";
const betriebsstunden_url =
  "https://srv-ags02i.gba.geolba.ac.at:6443/arcgis/rest/services/Test/OG_BetriebsStd_Wien_TEST/MapServer";

// exports
export let view;
export let pointGraphicsLayer;
export let boundaryGraphicsLayer;
export let cadastre;

// initialize the map view container
let setPoints, setPolygon, polygonGraphicsLayer, dispatch, setAddress;
export function initialize(container, theme) {
  view = new MapView({
    extent: new Extent({
      xmin: -14663,
      ymin: 326096,
      xmax: 23660,
      ymax: 352619,
      spatialReference: new SpatialReference({ wkid: SRS }),
    }),
  });

  pointGraphicsLayer = new GraphicsLayer({
    title: "Planung Erdwärmesonden",
    listMode: "hide",
  });

  boundaryGraphicsLayer = new GraphicsLayer({
    title: "Planung Erdwärmesonden",
    listMode: "hide",
  });

  polygonGraphicsLayer = new GraphicsLayer({
    title: "Grundstück",
    listMode: "hide",
  });

  // instantiate layers
  const ampelkarte = new MapImageLayer({
    url: ampelkarte_url,
    title: "Ampelkarte",
    visible: false,
    listMode: "hide",
  });

  const ews = new MapImageLayer({
    title: "Erdwärmesonden",
    url: ews_url,
    visible: false,
    listMode: "hide",
  });

  const gwwp = new MapImageLayer({
    title: "Grundwasserwärmepumpen",
    url: gwwp_url,
    visible: false,
    listMode: "hide",
  });

  const betriebsstunden = new MapImageLayer({
    title: "Betriebsstunden",
    url: betriebsstunden_url,
    visible: false,
    listMode: "hide",
  });

  // cadastre used as basemap to filter points by category
  cadastre = new WMSLayer({
    title: "Kataster",
    url: "https://data.bev.gv.at/geoserver/BEVdataKAT/wms",
    spatialReference: SRS,
  });

  // cadastre overlay to query parcel boundaries
  const cadastreOverlay = new WMSLayer({
    title: "Kataster",
    url: "https://data.bev.gv.at/geoserver/BEVdataKAT/wms",
    listMode: "hide",
    spatialReference: SRS,
  });

  cadastreOverlay.when(() => {
    cadastreOverlay.findSublayerByName("DKM_NFL").legendEnabled = false;
    cadastreOverlay.findSublayerByName("DKM_NFL").visible = false;
    cadastreOverlay.findSublayerByName("DKM_GST").legendEnabled = false;
    cadastreOverlay.findSublayerByName("KAT_DKM_GST-NFL").legendEnabled = false;
    cadastreOverlay.findSublayerByName("KAT_DKM_GST-NFL").visible = false;
  });

  // basemap in Viennese coordinate system due to tranformation inaccuracies from MGI to in WGS84
  // default transformation in ArcGIS API from MGI to WGS84 is 1306
  // transformation 1618 is recommended
  const basemap_at = new WMTSLayer({
    url: "https://maps.wien.gv.at/basemap/1.0.0/WMTSCapabilities_31256.xml",
    activeLayer: {
      id: "geolandbasemap",
    },
    listMode: "hide",
    serviceMode: "KVP",
  });

  let basemap, arcgisMap;
  switch (theme) {
    case "EWS":
      basemap = new Basemap({
        baseLayers: [cadastre],
        title: "basemap",
        id: "basemap",
        spatialReference: SRS,
      });

      arcgisMap = new ArcGISMap({
        basemap: basemap,
        layers: [
          basemap_at,
          ews,
          ampelkarte,
          betriebsstunden,
          cadastreOverlay,
          pointGraphicsLayer,
          boundaryGraphicsLayer,
          polygonGraphicsLayer,
        ],
      });
      break;
    case "GWWP":
      basemap = new Basemap({
        baseLayers: [basemap_at],
        title: "basemap",
        id: "basemap",
        spatialReference: SRS,
      });

      arcgisMap = new ArcGISMap({
        basemap: basemap,
        layers: [
          gwwp,
          ews,
          ampelkarte,
          cadastreOverlay,
          pointGraphicsLayer,
          polygonGraphicsLayer,
        ],
      });
      break;
    default:
      break;
  }

  const search = new Search({
    view,
    popupEnabled: false,
  });

  const scaleBar = new ScaleBar({
    view: view,
    unit: "metric",
  });

  const sketch = new Sketch({
    layer: pointGraphicsLayer,
    view: view,
    // graphic will be selected as soon as it is created
    availableCreateTools: ["point"],
    visibleElements: {
      selectionTools: {
        "lasso-selection": false,
        "rectangle-selection": theme === "EWS" ? true : false,
      },
      settingsMenu: false,
      undoRedoMenu: false,
    },
    snappingOptions: {
      enabled: true,
      selfEnabled: true,
    },
  });

  sketch.on("create", (event) => {
    if (event.tool === "point" && event.state === "complete") {
      // point symbol
      const symbol = {
        type: "simple-marker",
        color: [90, 90, 90, 0],
      };

      // delete default point symbol
      pointGraphicsLayer.remove(event.graphic);

      let point = event.graphic.geometry;
      switch (theme) {
        case "EWS":
          // add point to current list of points
          setPoints((current) => [...current, point]);

          // draw point graphic
          pointGraphicsLayer.add(
            new Graphic({
              geometry: point,
              symbol,
            })
          );
          break;
        case "GWWP":
          // add point to current list of points
          // keep only the last two points
          let points;
          setPoints((current) => {
            points = [...current.slice(-1), point];

            // only draw last two points
            pointGraphicsLayer.removeAll();

            points.map((point) =>
              pointGraphicsLayer.add(
                new Graphic({
                  geometry: point,
                  symbol,
                })
              )
            );
            return points;
          });
          break;
        default:
          break;
      }
    }
  });

  sketch.on("delete", (event) => {
    let points = event.graphics.map((graphic) => graphic.geometry);
    setPoints((current) => current.filter((point) => !points.includes(point)));
  });

  // register event handlers for mouse clicks
  view.on("click", ({ mapPoint }) => {
    polygonGraphicsLayer.removeAll();
    boundaryGraphicsLayer.removeAll();
    pointGraphicsLayer.removeAll();

    // initialize store in case there was a previous computation
    switch (theme) {
      case "EWS":
        dispatch(updateEWSComputationResult({}));
        break;
      case "GWWP":
        dispatch(updateGWWPComputationResult([]));
        break;
      default:
        break;
    }

    // initialize points
    setPoints([]);

    // query
    queryCadastre(view, polygonGraphicsLayer, mapPoint, dispatch, setPolygon);
    identifyAllLayers(view, mapPoint, dispatch);
    getAddress(mapPoint, setAddress);

    if (view.scale > 45000) {
      // take screenshot with marker at higher scales when parcels are not selectable
      setTimeout(() => takeScreenshot(view, mapPoint, dispatch, true), 500);
    } else {
      // take screenshot with selected parcel boundary
      setTimeout(() => takeScreenshot(view, mapPoint, dispatch), 500);
    }
  });

  // add map to view
  view.map = arcgisMap;

  // add UI components
  view.ui.components = [];
  switch (theme) {
    case "EWS":
      view.ui.add([search, sketch, initializeCollapsibleEWS()], "top-left");
      break;
    case "GWWP":
      view.ui.add([search, sketch, initializeCollapsibleGWWP()], "top-left");
      break;
    default:
      break;
  }

  view.ui.add(scaleBar, "bottom-left");
  view.container = container;
  return view;
}

// initialize handlers
export function initializeInfoPanelHandlers(
  setAddressCallback,
  dispatchCallback
) {
  setAddress = setAddressCallback;
  dispatch = dispatchCallback;
}

export function initializeCalculationsMenuHandlers(
  setPointsCallback,
  setPolygonCallback
) {
  setPoints = setPointsCallback;
  setPolygon = setPolygonCallback;
}
