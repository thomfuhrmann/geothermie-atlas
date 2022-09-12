import ArcGISMap from "@arcgis/core/Map";
import Extent from "@arcgis/core/geometry/Extent";
import MapView from "@arcgis/core/views/MapView";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import WMSLayer from "@arcgis/core/layers/WMSLayer";
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
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";

import { calculateGrid } from "./gridcomputer";

import "./ui.css";
import Polygon from "@arcgis/core/geometry/Polygon";

export const graphicsLayer = new GraphicsLayer({
  title: "Planung Erdwärmesonden",
});

// instantiate layers
const ampelkarte_url =
  "https://srv-ags02i.gba.geolba.ac.at:6443/arcgis/rest/services/Test/Ampelkarte/MapServer";
const ampelkarte = new MapImageLayer({
  url: ampelkarte_url,
  title: "Ampelkarte",
  visible: true,
});

const gwwp_url =
  "https://srv-ags02i.gba.geolba.ac.at:6443/arcgis/rest/services/Test/OG_thermischeGrundwassernutzung_GWP_Wien_TEST/MapServer";
export const gwwp = new MapImageLayer({
  title: "Grundwasserwärmepumpen",
  url: gwwp_url,
});

const ews_url =
  "https://srv-ags02i.gba.geolba.ac.at:6443/arcgis/rest/services/Test/OG_Erdwaermesonden_EWS_Wien_TEST/MapServer";
const ews = new MapImageLayer({
  title: "Erdwärmesonden",
  url: ews_url,
});

const betriebsstunden_url =
  "https://srv-ags02i.gba.geolba.ac.at:6443/arcgis/rest/services/Test/OG_BetriebsStd_Wien_TEST/MapServer";
const betriebsstunden = new MapImageLayer({
  title: "Betriebsstunden",
  url: betriebsstunden_url,
});

export const cadastre = new WMSLayer({
  title: "Kataster",
  url: "https://data.bev.gv.at/geoserver/BEVdataKAT/wms",
});

cadastre.when(() => {
  cadastre.findSublayerByName("DKM_NFL").legendEnabled = false;
  cadastre.findSublayerByName("DKM_GST").legendEnabled = false;
});

export const arcgisMap = new ArcGISMap({
  basemap: "gray-vector",
  layers: [betriebsstunden, gwwp, ews, ampelkarte, cadastre, graphicsLayer],
});

export const view = new MapView({
  map: arcgisMap,
  extent: new Extent({
    xmin: 4775000,
    ymin: 2795000,
    xmax: 4816000,
    ymax: 2824000,
    spatialReference: new SpatialReference({ wkid: 3035 }),
  }),
});

view.ui.components = [];

// listen to scale changes
let scaleHandler;
reactiveUtils.watch(
  () => view?.scale,
  (scale) => {
    scaleHandler(scale);
  }
);

const layerList = new LayerList({ view });

let legend = new Legend({
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
  layer: graphicsLayer,
  view: view,
  // graphic will be selected as soon as it is created
  availableCreateTools: ["point", "polyline"],
  visibleElements: {
    selectionTools: {
      "lasso-selection": false,
      "rectangle-selection": true,
    },
    settingsMenu: false,
  },
  snappingOptions: {
    enabled: true,
    selfEnabled: true,
  },
});

let errorHandler;
let gridSpacing = 10;
sketch.on(["create"], (event) => {
  if (event.tool === "polyline" && event.state === "start") {
    graphicsLayer.removeAll();
    errorHandler(false);
  }

  if (event.tool === "polyline" && event.state === "complete") {
    const path = event.graphic.geometry.paths[0];
    if (path.length < 3) {
      errorHandler(true);
      return;
    }
    calculateGrid(event, gridSpacing);

    const polygon = new Polygon({
      rings: path,
      spatialReference: view.spatialReference,
    });

    setTimeout(() => takeScreenshot(polygon.centroid, false), 200);
  }

  if (event.tool === "point" && event.state === "complete") {
    // do something here
  }
});

sketch.on(["delete"], () => {});

// create drop down menu for selection of grid spacing
const dropDown = document.createElement("select");
dropDown.id = "grid-spacing";
dropDown.className = "spacing-dropdown";
dropDown.onchange = (event) => {
  gridSpacing = parseInt(event.target.value);
};

const option1 = document.createElement("option");
option1.value = 5;
option1.innerText = "5 Meter";

const option2 = document.createElement("option");
option2.value = 10;
option2.innerText = "10 Meter";

dropDown.appendChild(option2);
dropDown.appendChild(option1);

const label = document.createElement("label");
label.innerText = "Abstand der Sonden ";
label.for = "grid-spacing";

const dropDownDiv = document.createElement("div");
dropDownDiv.className = "spacing-dropdown-container";
dropDownDiv.appendChild(label);
dropDownDiv.appendChild(dropDown);

view.ui.add([layerList, legend, search, sketch, dropDownDiv], "top-left");

let handleAddress;
function getAddress(mapPoint) {
  const serviceUrl =
    "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";
  const params = {
    location: mapPoint,
  };
  locator.locationToAddress(serviceUrl, params).then(
    function (response) {
      // Show the address found
      handleAddress(response.address.split(","));
    },
    function () {
      handleAddress([]);
    }
  );
}

// register event handlers for mouse clicks
let handleIdentifyAmpelkarte,
  screenshotHandler,
  pythonScriptHandler,
  setCalculating,
  handleIdentifyGWWP,
  handleIdentifyEWS,
  handleIdentifyBetriebsstunden;
view.on("click", ({ mapPoint }) => {
  takeScreenshot(mapPoint);
  getAddress(mapPoint);
  identifyLayers(mapPoint);
});

let BT, GT, WLF, BS_KL_Norm, BS_HZ_Norm;
export const identifyLayers = (mapPoint, drawnProbeheads = 0) => {
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
      handleIdentifyBetriebsstunden(res.results);
      BS_KL_Norm = res.results.find((result) => result.layerId === 0)?.feature
        .attributes["Pixel Value"];
      BS_HZ_Norm = res.results.find((result) => result.layerId === 1)?.feature
        .attributes["Pixel Value"];
      if (view.scale <= 20000 && BT && GT && WLF && BS_KL_Norm && BS_HZ_Norm) {
        queryCadastralDataAndRunScript(mapPoint, drawnProbeheads);
      }
    });
  });

  identify.identify(gwwp_url, params).then((res) => {
    handleIdentifyGWWP(res.results);
  });

  identify.identify(ampelkarte_url, params).then((res) => {
    handleIdentifyAmpelkarte(res.results);
  });
};

const queryCadastralDataAndRunScript = (mapPoint, drawnProbeheads) => {
  const { x, y } = view.toScreen(mapPoint);
  let url =
    "https://data.bev.gv.at/geoserver/BEVdataKAT/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=DKM_GST&QUERY_LAYERS=DKM_GST&CRS=EPSG:3857&INFO_FORMAT=application/json";
  const { xmin, ymin, xmax, ymax } = view.extent;
  const width = view.width;
  const height = view.height;
  url +=
    "&BBOX=" +
    xmin +
    "," +
    ymin +
    "," +
    xmax +
    "," +
    ymax +
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
      const KG = feature.properties.KG;
      const GNR = feature.properties.GNR;
      url = "https://kataster.bev.gv.at/api/gst/" + KG + "/" + GNR;

      esriRequest(url, { responseType: "json" }).then((cadastralResponse) => {
        let EZ;
        let FF = 0;
        if (cadastralResponse.data) {
          EZ = cadastralResponse.data.properties.ez;
          const garten = cadastralResponse.data.properties.nutzungen.find(
            (element) => element.nutzung === "Gärten"
          );
          if (garten) FF = garten.fl;

          setCalculating(true);
          pythonScriptHandler({
            KG,
            GNR,
            EZ,
            FF,
            BT,
            GT,
            WLF,
            BS_HZ_Norm,
            BS_KL_Norm,
            drawnProbeheads,
          });
        }
      });
    }
  });
};

// take screenshot for info panel
export const takeScreenshot = (mapPoint, withMarker = true) => {
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
  view.container = container;
}

// initialize handlers
export function initializeHandlers(
  identifyAmpelkarteCallback,
  errorCallback,
  scaleCallback,
  screenShotCallback,
  pythonScriptCallback,
  setIsCalculatingCallback,
  identifyGWWPCallback,
  identifyEWSCallback,
  identifyBetriebsstundenCallback,
  addressCallback
) {
  handleIdentifyAmpelkarte = identifyAmpelkarteCallback;
  errorHandler = errorCallback;
  scaleHandler = scaleCallback;
  screenshotHandler = screenShotCallback;
  pythonScriptHandler = pythonScriptCallback;
  setCalculating = setIsCalculatingCallback;
  handleIdentifyGWWP = identifyGWWPCallback;
  handleIdentifyEWS = identifyEWSCallback;
  handleIdentifyBetriebsstunden = identifyBetriebsstundenCallback;
  handleAddress = addressCallback;
}

export const updateLocale = (locale) => {
  intl.setLocale(locale);
  if (locale === "en") {
    for (const source of search.allSources)
      source.placeholder = "Find address or place";
    graphicsLayer.title = "Geothermal planning";
  } else {
    for (const source of search.allSources)
      source.placeholder = "Adresse oder Ort suchen";
    graphicsLayer.title = "Geothermische Planung";
  }
};
