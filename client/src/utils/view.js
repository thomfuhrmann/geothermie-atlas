import ArcGISMap from "@arcgis/core/Map";
import Extent from "@arcgis/core/geometry/Extent";
import MapView from "@arcgis/core/views/MapView";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import ImageryLayer from "@arcgis/core/layers/ImageryLayer";
import WMSLayer from "@arcgis/core/layers/WMSLayer";
import VectorTileLayer from "@arcgis/core/layers/VectorTileLayer";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import LayerList from "@arcgis/core/widgets/LayerList";
import Search from "@arcgis/core/widgets/Search";
import ScaleBar from "@arcgis/core/widgets/ScaleBar";
import RasterStretchRenderer from "@arcgis/core/renderers/RasterStretchRenderer";
import AlgorithmicColorRamp from "@arcgis/core/rest/support/AlgorithmicColorRamp";
import Color from "@arcgis/core/Color";
import Bookmarks from "@arcgis/core/widgets/Bookmarks";
import Bookmark from "@arcgis/core/webmap/Bookmark";
import Collection from "@arcgis/core/core/Collection";
import Sketch from "@arcgis/core/widgets/Sketch";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import * as intl from "@arcgis/core/intl";
import esriRequest from "@arcgis/core/request";

import { config } from "../config";
import { queryFeatures } from "./query";
import { calculateGrid } from "./gridcomputer";

const colorRamp = new AlgorithmicColorRamp({
  algorithm: "hsv",
  fromColor: new Color("blue"),
  toColor: new Color("red"),
});

const renderer = new RasterStretchRenderer({
  colorRamp: colorRamp,
  stretchType: "percent-clip",
  minPercent: 0.5,
  maxPercent: 0.5,
  useGamma: true,
  gamma: [1.0],
});

export const layers = config.layers.map((configItem) => {
  let layer;
  switch (configItem.type) {
    case "feature":
      layer = new FeatureLayer({
        title: configItem.title.de,
        url: configItem.url,
        id: configItem.id,
        legendEnabled: true,
      });
      break;
    case "imagery":
      layer = new ImageryLayer({
        title: configItem.title.de,
        url: configItem.url,
        id: configItem.id,
        renderer: renderer,
        legendEnabled: false,
      });
      break;
    case "wms":
      layer = new WMSLayer({
        title: configItem.title.de,
        url: configItem.url,
        id: configItem.id,
        legendEnabled: true,
        popupEnabled: true,
      });
      break;
    case "map-image":
      layer = new MapImageLayer({
        title: configItem.title.de,
        url: configItem.url,
        id: configItem.id,
      });
      break;
    case "vector-tile":
      layer = new VectorTileLayer({
        title: configItem.title.de,
        url: configItem.url,
        id: configItem.id,
      });
      break;
    default:
      break;
  }
  return layer;
});

export const graphicsLayer = new GraphicsLayer({
  title: "Geothermische Planung",
});
layers.push(graphicsLayer);

const map = new ArcGISMap({
  basemap: "gray-vector",
  layers,
});

export const view = new MapView({
  map,
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
  pointQueryHandler(
    await queryFeatures(event.results[0].results[0].feature.geometry)
  );
});

const bookmarksCollection = new Collection();
const wien = new Bookmark({
  name: "Wien",
  extent: new Extent({
    xmin: 1747740,
    ymin: 6095743,
    xmax: 1903824,
    ymax: 6189837,
    spatialReference: new SpatialReference({ wkid: 102100 }),
  }),
});
const salzburg = new Bookmark({
  name: "Salzburg",
  extent: new Extent({
    xmin: 1337874,
    ymin: 5955285,
    xmax: 1554570,
    ymax: 6107922,
    spatialReference: new SpatialReference({ wkid: 102100 }),
  }),
});
const steiermark = new Bookmark({
  name: "Steiermark",
  extent: new Extent({
    xmin: 1680193,
    ymin: 5931247,
    xmax: 1818878,
    ymax: 6028935,
    spatialReference: new SpatialReference({ wkid: 102100 }),
  }),
});
bookmarksCollection.addMany([wien, steiermark, salzburg]);

const bookmarks = new Bookmarks({
  view,
  bookmarks: bookmarksCollection,
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
      "lasso-selection": true,
      "rectangle-selection": false,
    },
    settingsMenu: false,
  },
  snappingOptions: {
    enabled: true,
    selfEnabled: true,
  },
});

view.ui.add([bookmarks, layerList, search, sketch], "top-left");

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

    calculateGrid(event);
  }
});

sketch.viewModel.on(["delete"], () => {});

// listen to scale changes
let scaleHandler;
view.on("mouse-wheel", (event) => {
  scaleHandler(view.scale);
});

// register an event handler for mouse clicks
let pointQueryHandler;
let screenshotHandler;
let pythonScriptHandler;
let setCalculating;
view.on("click", async ({ mapPoint }) => {
  const queryResult = await queryFeatures(mapPoint);
  pointQueryHandler(queryResult);
  takeScreenshot(mapPoint);

  if (view.scale <= 20000) {
    setCalculating(true);
    const cadastralData = await queryCadastralWMS(mapPoint);
    if (
      queryResult["layer-2"] &&
      queryResult["layer-3"] &&
      queryResult["layer-4"]
    ) {
      let params = {
        EZ: cadastralData.EZ,
        BT: queryResult["layer-4"],
        GT: queryResult["layer-3"],
        WLF: queryResult["layer-2"],
        FF: cadastralData.flaeche,
      };
      pythonScriptHandler(params);
    }
  }
});

const queryCadastralWMS = async (mapPoint) => {
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
  pointQueryCallback,
  errorCallback,
  scaleCallback,
  screenShotCallback,
  pythonScriptCallback,
  setIsCalculatingCallback
) {
  pointQueryHandler = pointQueryCallback;
  errorHandler = errorCallback;
  scaleHandler = scaleCallback;
  screenshotHandler = screenShotCallback;
  pythonScriptHandler = pythonScriptCallback;
  setCalculating = setIsCalculatingCallback;
}

export const updateLocale = (titles, locale) => {
  layers.map((layer, index) => (layer.title = titles[index]));
  intl.setLocale(locale);
  if (locale === "en") {
    for (const source of search.allSources)
      source.placeholder = "Find address or place";
    wien.name = "Vienna";
    steiermark.name = "Styria";
    graphicsLayer.title = "Geothermal planning";
  } else {
    for (const source of search.allSources)
      source.placeholder = "Adresse oder Ort suchen";
    wien.name = "Wien";
    steiermark.name = "Steiermark";
    graphicsLayer.title = "Geothermische Planung";
  }
};
