import ArcGISMap from "@arcgis/core/Map";
import Extent from "@arcgis/core/geometry/Extent";
import MapView from "@arcgis/core/views/MapView";
import Basemap from "@arcgis/core/Basemap";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import WMSLayer from "@arcgis/core/layers/WMSLayer";
import WMTSLayer from "@arcgis/core/layers/WMTSLayer";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import LayerList from "@arcgis/core/widgets/LayerList";
import Legend from "@arcgis/core/widgets/Legend";
import Search from "@arcgis/core/widgets/Search";
import ScaleBar from "@arcgis/core/widgets/ScaleBar";
import Sketch from "@arcgis/core/widgets/Sketch";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import * as intl from "@arcgis/core/intl";
import esriRequest from "@arcgis/core/request";
import * as identify from "@arcgis/core/rest/identify";
import IdentifyParameters from "@arcgis/core/rest/support/IdentifyParameters";
import * as locator from "@arcgis/core/rest/locator";
import Polygon from "@arcgis/core/geometry/Polygon";
import Graphic from "@arcgis/core/Graphic";

import { updateWithResult } from "../redux/computationResultSlice";
import { collapsible } from "./ParameterMenu";

const SRS = 31256;

export const pointGraphicsLayer = new GraphicsLayer({
  title: "Planung Erdwärmesonden",
  listMode: "hide",
});

export const boundaryGraphicsLayer = new GraphicsLayer({
  title: "Planung Erdwärmesonden",
  listMode: "hide",
});

const polygonGraphicsLayer = new GraphicsLayer({
  title: "Grundstück",
  listMode: "hide",
});

// instantiate layers
const ampelkarte_url =
  "https://srv-ags02i.gba.geolba.ac.at:6443/arcgis/rest/services/Test/OG_Ampelkarte_Wien/MapServer";
const ampelkarte = new MapImageLayer({
  url: ampelkarte_url,
  title: "Ampelkarte",
  visible: false,
  listMode: "hide",
});

const gwwp_url =
  "https://srv-ags02i.gba.geolba.ac.at:6443/arcgis/rest/services/Test/OG_thermischeGrundwassernutzung_GWP_Wien_TEST/MapServer";
export const gwwp = new MapImageLayer({
  title: "Grundwasserwärmepumpen",
  url: gwwp_url,
  visible: false,
});

const ews_url =
  "https://srv-ags02i.gba.geolba.ac.at:6443/arcgis/rest/services/Test/OG_Erdwaermesonden_EWS_Wien_TEST/MapServer";
const ews = new MapImageLayer({
  title: "Erdwärmesonden",
  url: ews_url,
  visible: false,
});

const betriebsstunden_url =
  "https://srv-ags02i.gba.geolba.ac.at:6443/arcgis/rest/services/Test/OG_BetriebsStd_Wien_TEST/MapServer";
const betriebsstunden = new MapImageLayer({
  title: "Betriebsstunden",
  url: betriebsstunden_url,
  visible: false,
});

// cadastre used as basemap to filter points by category
export const cadastre = new WMSLayer({
  title: "Kataster",
  url: "https://data.bev.gv.at/geoserver/BEVdataKAT/wms",
  spatialReference: SRS,
});

// cadastre overlay to query parcel boundaries
export const cadastreOverlay = new WMSLayer({
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

// "https://basemap.at/wmts/1.0.0/WMTSCapabilities.xml"
const basemap_at = new WMTSLayer({
  url: "https://maps.wien.gv.at/basemap/1.0.0/WMTSCapabilities_31256.xml",
  activeLayer: {
    id: "geolandbasemap",
  },
  listMode: "hide",
});

let basemap = new Basemap({
  baseLayers: [cadastre],
  title: "basemap",
  id: "basemap",
  spatialReference: SRS,
});

export const arcgisMap = new ArcGISMap({
  //basemap: "gray-vector",
  basemap: basemap,
  layers: [
    basemap_at,
    betriebsstunden,
    gwwp,
    ews,
    ampelkarte,
    cadastreOverlay,
    pointGraphicsLayer,
    boundaryGraphicsLayer,
    polygonGraphicsLayer,
  ],
});

export const view = new MapView({
  extent: new Extent({
    xmin: -14663,
    ymin: 326096,
    xmax: 23660,
    ymax: 352619,
    spatialReference: new SpatialReference({ wkid: SRS }),
  }),
});

view.ui.components = [];

const layerList = new LayerList({ view });

const legend = new Legend({
  view: view,
  hideLayersNotInCurrentView: true,
});

const search = new Search({
  view,
  popupEnabled: false,
});

const scaleBar = new ScaleBar({
  view: view,
  unit: "metric",
});

view.ui.add(scaleBar, "bottom-left");

const sketch = new Sketch({
  layer: pointGraphicsLayer,
  view: view,
  // graphic will be selected as soon as it is created
  availableCreateTools: ["point"],
  visibleElements: {
    selectionTools: {
      "lasso-selection": false,
      "rectangle-selection": true,
    },
    settingsMenu: false,
    undoRedoMenu: false,
  },
  snappingOptions: {
    enabled: true,
    selfEnabled: true,
  },
});

let gridPointsHandler;
sketch.on("create", (event) => {
  if (event.tool === "point" && event.state === "complete") {
    pointGraphicsLayer.remove(event.graphic);
    pointGraphicsLayer.add(
      new Graphic({
        geometry: event.graphic.geometry,
        symbol: {
          type: "simple-marker",
          color: [90, 90, 90, 0],
        },
      })
    );

    const point = event.graphic.geometry;
    gridPointsHandler((current) => [...current, point]);
  }
});

sketch.on("delete", (event) => {
  let points = event.graphics.map((graphic) => graphic.geometry);
  gridPointsHandler((current) =>
    current.filter((point) => !points.includes(point))
  );
});

view.ui.add([layerList, legend, search, sketch, collapsible], "top-left");

// register event handlers for mouse clicks
let handleIdentifyAmpelkarte,
  screenshotHandler,
  handleIdentifyGWWP,
  handleIdentifyEWS,
  dispatchHandler;
view.on("click", ({ mapPoint }) => {
  polygonGraphicsLayer.removeAll();
  pointGraphicsLayer.removeAll();
  boundaryGraphicsLayer.removeAll();

  dispatchHandler(updateWithResult({}));
  gridPointsHandler([]);

  queryCadastre(mapPoint);
  identifyLayers(mapPoint);
  getAddress(mapPoint);

  if (view.scale > 37000) {
    setTimeout(() => takeScreenshot(mapPoint, true), 500);
  } else {
    setTimeout(() => takeScreenshot(mapPoint), 500);
  }
});

// reverse-geocode address for a given point
let handleAddress;
function getAddress(mapPoint) {
  const serviceUrl =
    "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";
  const params = {
    location: mapPoint,
  };
  locator.locationToAddress(serviceUrl, params).then(
    function (response) {
      handleAddress(response.address.split(","));
    },
    function () {
      handleAddress([]);
    }
  );
}

// query layers
let BT, GT, WLF, BS_KL_Norm, BS_HZ_Norm;
let identifyResultsHandler;
export const identifyLayers = (mapPoint) => {
  const params = new IdentifyParameters();
  params.geometry = mapPoint;
  params.tolerance = 0;
  params.layerOption = "all";
  params.width = view.width;
  params.height = view.height;
  params.mapExtent = view.extent;

  identify.identify(ews_url, params).then((res) => {
    BT = res.results.find((result) => result.layerId === 4)?.feature.attributes[
      "Pixel Value"
    ];
    GT = res.results.find((result) => result.layerId === 5)?.feature.attributes[
      "Pixel Value"
    ];
    WLF = res.results.find((result) => result.layerId === 6)?.feature
      .attributes["Pixel Value"];

    handleIdentifyEWS(res.results);

    identify.identify(betriebsstunden_url, params).then((res) => {
      BS_KL_Norm = res.results.find((result) => result.layerId === 0)?.feature
        .attributes["Pixel Value"];
      BS_HZ_Norm = res.results.find((result) => result.layerId === 1)?.feature
        .attributes["Pixel Value"];

      identifyResultsHandler({
        BT,
        GT,
        WLF,
        BS_HZ_Norm,
        BS_KL_Norm,
      });
    });
  });

  identify.identify(gwwp_url, params).then((res) => {
    handleIdentifyGWWP(res.results);
  });

  identify.identify(ampelkarte_url, params).then((res) => {
    handleIdentifyAmpelkarte(res.results);
  });
};

let setPolygonHandler;
let cadastralDataHandler;
let handleCadastralData;
let KG,
  EZ,
  GNR,
  FF = 0;
const queryCadastre = (mapPoint) => {
  const { x, y } = view.toScreen(mapPoint);
  let url =
    "https://data.bev.gv.at/geoserver/BEVdataKAT/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=DKM_GST&QUERY_LAYERS=DKM_GST&CRS=EPSG:31256&INFO_FORMAT=application/json";
  const { xmin, ymin, xmax, ymax } = view.extent;
  const width = view.width;
  const height = view.height;
  url +=
    "&BBOX=" +
    ymin +
    "," +
    xmin +
    "," +
    ymax +
    "," +
    xmax +
    "&WIDTH=" +
    width +
    "&HEIGHT=" +
    height +
    "&I=" +
    Math.round(x) +
    "&J=" +
    Math.round(y);

  esriRequest(url, { responseType: "json" }).then((response) => {
    if (
      response.data &&
      response.data.features &&
      response.data.features.length > 0
    ) {
      const feature = response.data.features[0];
      KG = feature.properties.KG;
      GNR = feature.properties.GNR;

      let polygon = new Polygon({
        rings: feature.geometry.coordinates,
        spatialReference: view.spatialReference,
      });

      setPolygonHandler(polygon);

      const polygonSymbol = {
        type: "simple-fill",
        color: [51, 51, 204, 0],
        style: "solid",
        outline: {
          color: "blue",
          width: 1,
        },
      };

      const polygonGraphic = new Graphic({
        geometry: polygon,
        symbol: polygonSymbol,
      });

      polygonGraphicsLayer.add(polygonGraphic);

      handleCadastralData({ KG, GNR });
      cadastralDataHandler({ KG, GNR, EZ, FF });

      // url = "https://kataster.bev.gv.at/api/gst/" + KG + "/" + GNR;
      // esriRequest(url, { responseType: "json" }).then(({ data }) => {
      //   EZ = data.properties.ez;
      //   const garten = data.properties.nutzungen.find(
      //     (element) => element.nutzung === "Gärten"
      //   );
      //   if (garten) FF = garten.fl;

      //   cadastralDataHandler({ KG, GNR, EZ, FF });
      // });
    }
  });
};

// take screenshot for info panel
export const takeScreenshot = (mapPoint, withMarker = false) => {
  const screenPoint = view.toScreen(mapPoint);
  const width = 1000;
  const height = 500;

  if (withMarker) {
    view
      .takeScreenshot({
        area: {
          x: screenPoint.x - width / 2,
          y: screenPoint.y - height / 2,
          width: width,
          height: height,
        },
      })
      .then((screenshot) => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        const img = new Image();
        img.width = width;
        img.height = height;
        img.src = screenshot.dataUrl;

        img.onload = () => {
          context.drawImage(img, 0, 0);
          context.strokeStyle = "#4090D0";
          context.lineWidth = 10;
          context.beginPath();
          context.moveTo(width / 2, height / 2);
          context.lineTo(width / 2 + 10, height / 2 - 40);
          context.lineTo(width / 2 - 10, height / 2 - 40);
          context.closePath();
          context.stroke();

          screenshotHandler(canvas.toDataURL());
        };
      });
  } else {
    view
      .takeScreenshot({
        area: {
          x: screenPoint.x - width / 2,
          y: screenPoint.y - height / 2,
          width: width,
          height: height,
        },
      })
      .then((screenshot) => {
        screenshotHandler(screenshot.dataUrl);
      });
  }
};

// initialize the map view container
export function initialize(container) {
  view.map = arcgisMap;
  view.container = container;
  return view;
}

// initialize handlers
export function initializeInfoPanelHandlers(
  identifyAmpelkarteCallback,
  screenShotCallback,
  identifyGWWPCallback,
  identifyEWSCallback,
  addressCallback,
  cadastralDataCallback
) {
  handleIdentifyAmpelkarte = identifyAmpelkarteCallback;
  screenshotHandler = screenShotCallback;
  handleIdentifyGWWP = identifyGWWPCallback;
  handleIdentifyEWS = identifyEWSCallback;
  handleAddress = addressCallback;
  handleCadastralData = cadastralDataCallback;
}

export function initializeCalculationsMenuHandlers(
  setPolygonCallback,
  setIdentifyResultsCallback,
  setGridPointsCallback,
  dispatchCallback,
  setCadastralDataCallback
) {
  setPolygonHandler = setPolygonCallback;
  identifyResultsHandler = setIdentifyResultsCallback;
  gridPointsHandler = setGridPointsCallback;
  dispatchHandler = dispatchCallback;
  cadastralDataHandler = setCadastralDataCallback;
}

export const updateLocale = (locale) => {
  intl.setLocale(locale);
  if (locale === "en") {
    for (const source of search.allSources)
      source.placeholder = "Find address or place";
    pointGraphicsLayer.title = "Geothermal planning";
  } else {
    for (const source of search.allSources)
      source.placeholder = "Adresse oder Ort suchen";
    pointGraphicsLayer.title = "Geothermische Planung";
  }
};
