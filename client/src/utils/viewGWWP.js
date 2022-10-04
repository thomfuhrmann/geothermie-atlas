import ArcGISMap from "@arcgis/core/Map";
import Extent from "@arcgis/core/geometry/Extent";
import MapView from "@arcgis/core/views/MapView";
import Basemap from "@arcgis/core/Basemap";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import WMSLayer from "@arcgis/core/layers/WMSLayer";
import WMTSLayer from "@arcgis/core/layers/WMTSLayer";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
// import LayerList from "@arcgis/core/widgets/LayerList";
// import Legend from "@arcgis/core/widgets/Legend";
import Search from "@arcgis/core/widgets/Search";
import ScaleBar from "@arcgis/core/widgets/ScaleBar";
import Sketch from "@arcgis/core/widgets/Sketch";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import esriRequest from "@arcgis/core/request";
import * as identify from "@arcgis/core/rest/identify";
import IdentifyParameters from "@arcgis/core/rest/support/IdentifyParameters";
import * as locator from "@arcgis/core/rest/locator";
import Polygon from "@arcgis/core/geometry/Polygon";
import Graphic from "@arcgis/core/Graphic";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";

import { updateAmpelkarte } from "../redux/ampelkarteSlice";
import { updateGWWPResources } from "../redux/gwwpResourcesSlice";
import { updateCadastralData } from "../redux/cadastreSlice";
import { updateGWWPComputationResult } from "../redux/gwwpComputationsSlice";
import { initializeCollapsible } from "./ParameterMenuGWWP";

// spatial reference WKID
const SRS = 31256;

// layer urls
const ampelkarte_url =
  "https://srv-ags02i.gba.geolba.ac.at:6443/arcgis/rest/services/Test/OG_Ampelkarte_Wien/MapServer";
const gwwp_url =
  "https://srv-ags02i.gba.geolba.ac.at:6443/arcgis/rest/services/Test/OG_thermischeGrundwassernutzung_GWP_Wien_TEST/MapServer";

// exports
export let view;
export let pointGraphicsLayer;
export let cadastre;

// reverse-geocode address for a given point
let setAddress;
function getAddress(mapPoint) {
  const serviceUrl =
    "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";
  const params = {
    location: mapPoint,
  };
  locator.locationToAddress(serviceUrl, params).then(
    function (response) {
      setAddress(response.address.split(","));
    },
    function () {
      setAddress([]);
    }
  );
}

// query layers
let dispatch;
export const identifyLayers = (mapPoint) => {
  const params = new IdentifyParameters();
  params.geometry = mapPoint;
  params.tolerance = 0;
  params.layerOption = "all";
  params.width = view.width;
  params.height = view.height;
  params.mapExtent = view.extent;

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

let polygonGraphicsLayer, KG, GNR, FF, setPolygon;
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

      FF = geometryEngine.planarArea(polygon, "square-meters");

      setPolygon(polygon);
      dispatch(updateCadastralData({ KG, GNR, FF }));
    }
  });
};

// take screenshot for info panel
let setScreenshot;
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

          setScreenshot(canvas.toDataURL());
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
        setScreenshot(screenshot.dataUrl);
      });
  }
};

// initialize the map view container
let setPoints;
export function initialize(container) {
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
    title: "Planung thermische Grundwassernutzung",
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

  const gwwp = new MapImageLayer({
    title: "Grundwasserwärmepumpen",
    url: gwwp_url,
    visible: false,
    listMode: "hide",
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

  // basemap.at basemap in Viennese coordinate system to make cadastre aligned with basemap
  const basemap_at = new WMTSLayer({
    url: "https://maps.wien.gv.at/basemap/1.0.0/WMTSCapabilities_31256.xml",
    activeLayer: {
      id: "geolandbasemap",
    },
    listMode: "hide",
    serviceMode: "KVP",
  });

  let basemap = new Basemap({
    baseLayers: [basemap_at],
    title: "basemap",
    id: "basemap",
    spatialReference: SRS,
  });

  const arcgisMap = new ArcGISMap({
    basemap: basemap,
    layers: [
      gwwp,
      ampelkarte,
      cadastreOverlay,
      pointGraphicsLayer,
      polygonGraphicsLayer,
    ],
  });

  // const layerList = new LayerList({ view });

  // const legend = new Legend({
  //   view: view,
  //   hideLayersNotInCurrentView: true,
  // });

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
        "rectangle-selection": false,
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
      // delete default point symbol
      pointGraphicsLayer.remove(event.graphic);

      // add point to current list of points
      const point = event.graphic.geometry;
      let points;
      setPoints((current) => {
        points = [...current.slice(-1), point];

        // draw current points
        pointGraphicsLayer.removeAll();

        const symbol = {
          type: "simple-marker",
          color: [90, 90, 90, 0],
        };

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
    }
  });

  // register event handlers for mouse clicks
  view.on("click", ({ mapPoint }) => {
    polygonGraphicsLayer.removeAll();
    pointGraphicsLayer.removeAll();

    dispatch(updateCadastralData({}));
    dispatch(updateGWWPResources([]));
    dispatch(updateAmpelkarte([]));
    dispatch(updateGWWPComputationResult([]));
    setPoints([]);

    queryCadastre(mapPoint);
    identifyLayers(mapPoint);
    getAddress(mapPoint);

    if (view.scale > 45000) {
      setTimeout(() => takeScreenshot(mapPoint, true), 500);
    } else {
      setTimeout(() => takeScreenshot(mapPoint), 500);
    }
  });

  view.map = arcgisMap;
  view.ui.components = [];
  view.ui.add([search, sketch, initializeCollapsible()], "top-left");
  view.ui.add(scaleBar, "bottom-left");
  view.container = container;
  return view;
}

export const initializeInfoPanelHandlers = (
  setScreenshotCallback,
  setAddressCallback,
  dispatchCallback
) => {
  setScreenshot = setScreenshotCallback;
  setAddress = setAddressCallback;
  dispatch = dispatchCallback;
};

export const initializeCalculationsMenuHandlers = (
  setPointsCallback,
  setPolygonCallback
) => {
  setPoints = setPointsCallback;
  setPolygon = setPolygonCallback;
};
