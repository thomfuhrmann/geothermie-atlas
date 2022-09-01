import ArcGISMap from "@arcgis/core/Map";
import Extent from "@arcgis/core/geometry/Extent";
import MapView from "@arcgis/core/views/MapView";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import WMSLayer from "@arcgis/core/layers/WMSLayer";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import LayerList from "@arcgis/core/widgets/LayerList";
import Search from "@arcgis/core/widgets/Search";
import ScaleBar from "@arcgis/core/widgets/ScaleBar";
import Sketch from "@arcgis/core/widgets/Sketch";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import * as intl from "@arcgis/core/intl";
import esriRequest from "@arcgis/core/request";
import * as identify from "@arcgis/core/rest/identify";
import IdentifyParameters from "@arcgis/core/rest/support/IdentifyParameters";

import { calculateGrid } from "./gridcomputer";

import ui from "./ui.module.css";

export const graphicsLayer = new GraphicsLayer({
  title: "Planung Erdwärmesonden",
});

const ampelkarte_url =
  "https://srv-ags02i.gba.geolba.ac.at:6443/arcgis/rest/services/Test/Ampelkarte/MapServer";
const ampelkarte = new MapImageLayer({
  url: ampelkarte_url,
  title: "Ampelkarte",
  visible: true,
});

const gwwp_url =
  "https://srv-ags02i.gba.geolba.ac.at:6443/arcgis/rest/services/Test/GWWP/MapServer";
export const gwwp = new MapImageLayer({
  title: "Grundwasserwärmepumpen",
  url: gwwp_url,
});

const ews_url =
  "https://srv-ags02i.gba.geolba.ac.at:6443/arcgis/rest/services/Test/EWS/MapServer";
const ews = new MapImageLayer({
  title: "Erdwärmesonden",
  url: ews_url,
});

const betriebsstunden_url =
  "https://srv-ags02i.gba.geolba.ac.at:6443/arcgis/rest/services/Test/OG_BETRIEBSSTD_Wien/MapServer";
const betriebsstunden = new MapImageLayer({
  title: "Betriebsstunden",
  url: betriebsstunden_url,
});

const cadastre_url = "https://data.bev.gv.at/geoserver/BEVdataKAT/wms";
export const cadastre = new WMSLayer({
  title: "Kataster",
  url: cadastre_url,
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

const layerList = new LayerList({ view });

const search = new Search({
  view,
  popupEnabled: false,
});

search.on("search-complete", async function (event) {
  // results are stored in event Object[]
  const params = new IdentifyParameters();
  params.geometry = event.results[0].results[0].feature.geometry;
  params.tolerance = 0;
  params.layerOption = "all";
  params.width = view.width;
  params.height = view.height;
  params.mapExtent = view.extent;

  identify.identify(ampelkarte_url, params).then((res) => {
    handleIdentifyAmpelkarte(res.results);
  });
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
  availableCreateTools: ["polyline"],
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

// create drop down menu for selection of grid spacing
let gridSpacing = 10;
const dropDown = document.createElement("select");
dropDown.id = "grid-spacing";
dropDown.className = `${ui.spacing_dropdown}`;
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
dropDownDiv.className = `${ui.spacing_dropdown_box}`;
dropDownDiv.appendChild(label);
dropDownDiv.appendChild(dropDown);

view.ui.add([layerList, search, sketch, dropDownDiv], "top-left");

let errorHandler;
sketch.viewModel.on(["create"], async function (event) {
  if (event.state === "start") {
    graphicsLayer.removeAll();
  }

  if (event.state === "complete") {
    if (event.graphic.geometry.paths[0].length < 3) {
      errorHandler(true);
      return;
    } else {
      errorHandler(false);
    }

    calculateGrid(event, gridSpacing);
  }
});

sketch.viewModel.on(["delete"], () => {});

// listen to scale changes
let scaleHandler;
view.on("mouse-wheel", (event) => {
  scaleHandler(view.scale);
});

// register event handlers for mouse clicks
let handleIdentifyAmpelkarte,
  screenshotHandler,
  pythonScriptHandler,
  setCalculating,
  handleIdentifyGWWP,
  handleIdentifyEWS;
view.on("click", async ({ mapPoint }) => {
  takeScreenshot(mapPoint);

  const params = new IdentifyParameters();
  params.geometry = mapPoint;
  params.tolerance = 0;
  params.layerOption = "all";
  params.width = view.width;
  params.height = view.height;
  params.mapExtent = view.extent;

  identify.identify(ampelkarte_url, params).then((res) => {
    handleIdentifyAmpelkarte(res.results);
  });

  let BT, GT, WLF;
  identify.identify(ews_url, params).then((res) => {
    BT = res.results.find((result) => result.layerId === 0)?.feature.attributes[
      "Stretch.Pixel Value"
    ];
    GT = res.results.find((result) => result.layerId === 1)?.feature.attributes[
      "Stretch.Pixel Value"
    ];
    WLF = res.results.find((result) => result.layerId === 2)?.feature
      .attributes["Stretch.Pixel Value"];
    handleIdentifyEWS(res.results);
  });

  identify.identify(gwwp_url, params).then((res) => {
    handleIdentifyGWWP(res.results);
  });

  if (view.scale <= 20000) {
    setCalculating(true);
    const cadastralData = await queryCadastralData(mapPoint);
    if (BT && GT && WLF && cadastralData) {
      let params = {
        EZ: cadastralData.EZ,
        BT,
        GT,
        WLF,
        FF: cadastralData.flaeche,
      };
      pythonScriptHandler(params);
    }
  }
});

const queryCadastralData = async (mapPoint) => {
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

  return await esriRequest(url, { responseType: "json" }).then(
    async (response) => {
      if (
        response.data &&
        response.data.features &&
        response.data.features.length > 0
      ) {
        const feature = response.data.features[0];
        const KG = feature.properties.KG;
        const GNR = feature.properties.GNR;
        url = "https://kataster.bev.gv.at/api/gst/" + KG + "/" + GNR;
        return await esriRequest(url, { responseType: "json" }).then(
          (cadastralResponse) => {
            let flaeche = 0;
            let EZ;
            if (cadastralResponse.data) {
              EZ = cadastralResponse.data.properties.ez;
              const nutzungen = cadastralResponse.data.properties.nutzungen;
              const garten = nutzungen.find(
                (element) => element.nutzung === "Gärten"
              );
              if (garten) flaeche = garten.fl;
            }
            return { EZ, flaeche };
          }
        );
      }
    }
  );
};

// take screenshot for info panel
export const takeScreenshot = async (mapPoint) => {
  const screenPoint = view.toScreen(mapPoint);
  const width = 1000;
  const height = 500;
  const screenshot = await view.takeScreenshot({
    area: {
      x: screenPoint.x - width / 2,
      y: screenPoint.y - height / 2,
      width: width,
      height: height,
    },
  });

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
    context.beginPath();
    context.arc(width / 2, height / 2, 10, 0, 2 * Math.PI);
    context.stroke();

    screenshotHandler(canvas.toDataURL());
  };
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
  identifyEWSCallback
) {
  handleIdentifyAmpelkarte = identifyAmpelkarteCallback;
  errorHandler = errorCallback;
  scaleHandler = scaleCallback;
  screenshotHandler = screenShotCallback;
  pythonScriptHandler = pythonScriptCallback;
  setCalculating = setIsCalculatingCallback;
  handleIdentifyGWWP = identifyGWWPCallback;
  handleIdentifyEWS = identifyEWSCallback;
}

export const updateLocale = (titles, locale) => {
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
