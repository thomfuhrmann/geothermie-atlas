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
import Legend from "@arcgis/core/widgets/Legend";
import LayerList from "@arcgis/core/widgets/LayerList";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import Point from "@arcgis/core/geometry/Point";
import Zoom from "@arcgis/core/widgets/Zoom";

import { updateEWSComputationResult } from "../redux/ewsComputationsSlice";
import { updateGWWPComputationResult } from "../redux/gwwpComputationsSlice";
import { identifyAllLayers } from "./identify";
import { queryCadastre } from "./queryCadastre";
import { takeScreenshot } from "./screenshot";
import { getAddress } from "./getAddress";

import "./ui.css";
import { updateCadastralData } from "../redux/cadastreSlice";

// spatial reference WKID
export const SRS = 31256;

// layer URLs
export const ampelkarte_url =
  "https://srv-ags02i.gba.geolba.ac.at:6443/arcgis/rest/services/Test/OG_Ampelkarte_Wien/MapServer";
export const ews_url =
  "https://srv-ags02i.gba.geolba.ac.at:6443/arcgis/rest/services/Test/OG_Erdwaermesonden_EWS_Wien_TEST/MapServer";
export const gwwp_url =
  "https://srv-ags02i.gba.geolba.ac.at:6443/arcgis/rest/services/Test/OG_thermischeGrundwassernutzung_GWP_Wien_TEST/MapServer";
export const betriebsstunden_url =
  "https://srv-ags02i.gba.geolba.ac.at:6443/arcgis/rest/services/Test/OG_BetriebsStd_Wien_TEST/MapServer";

// exports
export let view;
export let pointGraphicsLayer;
export let boundaryGraphicsLayer;
export let cadastre;

// initialize the map view container
let setPoints,
  setPolygon,
  polygonGraphicsLayer,
  dispatch,
  setAddress,
  gridSpacing = 10,
  setClosenessWarning,
  setOutsideWarning,
  setScaleWarning;
export function initialize(container, theme, isMobile) {
  const scaleLimit = 1000;

  view = new MapView({
    extent: new Extent({
      xmin: -19000,
      ymin: 325000,
      xmax: 29000,
      ymax: 360000,
      spatialReference: new SpatialReference({ wkid: SRS }),
    }),
  });

  reactiveUtils.watch(
    () => view.scale,
    () => {
      if (view.scale < scaleLimit) {
        setScaleWarning(false);
      } else {
        setScaleWarning(true);
      }
    }
  );

  pointGraphicsLayer = new GraphicsLayer({
    title: "Planungslayer - Punkte",
    listMode: "hide",
  });

  boundaryGraphicsLayer = new GraphicsLayer({
    title: "EWS - innere Grenze",
    listMode: "hide",
  });

  polygonGraphicsLayer = new GraphicsLayer({
    title: "Grundstücksgrenze",
    listMode: "hide",
  });

  let highlightGraphicsLayer = new GraphicsLayer({
    title: "Grundstücksgrenze",
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
    title: "Potentialkarten für Erdwärmesonden",
    url: ews_url,
    visible: true,
    listMode: theme === "EWS" ? "show" : "hide",
  });

  const gwwp = new MapImageLayer({
    title: "Potentialkarten für Grundwasserwärmepumpen",
    url: gwwp_url,
    visible: true,
    listMode: theme === "GWWP" ? "show" : "hide",
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

  gwwp.when(() => {
    const bundeslandGrenzen = gwwp.findSublayerById(10);
    if (bundeslandGrenzen) {
      bundeslandGrenzen.visible = false;
      bundeslandGrenzen.legendEnabled = false;
    }
    gwwp.findSublayerById(0).visible = false;
  });

  ews.when(() => {
    const bundeslandGrenzen = ews.findSublayerById(7);
    if (bundeslandGrenzen) {
      bundeslandGrenzen.visible = false;
      bundeslandGrenzen.legendEnabled = false;
    }
    ews.findSublayerById(0).visible = false;
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
          highlightGraphicsLayer,
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
          highlightGraphicsLayer,
        ],
      });
      break;
    default:
      break;
  }

  const legend = new Legend({ view });

  const layerList = new LayerList({ view });

  const search = new Search({
    view,
    popupEnabled: false,
  });

  const scaleBar = new ScaleBar({
    view: view,
    unit: "metric",
  });

  const zoom = new Zoom({
    view,
    layout: "horizontal",
  });

  const sketch = new Sketch({
    layer: pointGraphicsLayer,
    view: view,
    availableCreateTools: [theme === "EWS" ? "point" : undefined],
    visibleElements: {
      selectionTools: {
        "lasso-selection": false,
        "rectangle-selection": theme === "EWS" ? true : false,
      },
      settingsMenu: false,
      undoRedoMenu: false,
    },
    creationMode: "single",
  });

  sketch.on("create", (event) => {
    if (event.tool === "point" && event.state === "complete") {
      // point symbol
      const symbol = {
        type: "simple-marker",
        color: [255, 255, 255, 0.25],
      };

      // delete default point symbol
      pointGraphicsLayer.remove(event.graphic);

      let point = event.graphic.geometry;
      let points;
      switch (theme) {
        case "EWS":
          // add point to current list of points
          setPoints((currentPoints) => {
            points = [...currentPoints, [point.x, point.y]];
            return points;
          });

          // check if point is too close to any other point
          pointGraphicsLayer.graphics.forEach((graphic) => {
            if (geometryEngine.distance(graphic.geometry, point) < 5) {
              setClosenessWarning(true);
            }
          });

          // check if point is outside the parcel
          if (
            !geometryEngine.intersects(
              point,
              boundaryGraphicsLayer.graphics.at(0).geometry
            )
          ) {
            setOutsideWarning(true);
          }

          // draw point graphic
          pointGraphicsLayer.add(
            new Graphic({
              geometry: point,
              symbol,
            })
          );
          break;
        case "GWWP":
          // check if point is outside the parcel
          if (
            !geometryEngine.intersects(
              point,
              polygonGraphicsLayer.graphics.at(0).geometry
            )
          ) {
            setOutsideWarning(true);
          }

          // add point to current list of points
          // keep only the last two points
          setPoints((currentPoints) => {
            points = [...currentPoints.slice(-1), [point.x, point.y]];

            // only draw last two points
            pointGraphicsLayer.removeAll();

            points.forEach((point) =>
              pointGraphicsLayer.add(
                new Graphic({
                  geometry: new Point({
                    x: point[0],
                    y: point[1],
                    spatialReference: SRS,
                  }),
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

  sketch.on("update", (event) => {
    if (event.state === "complete") {
      // list of updated points
      let allPoints = pointGraphicsLayer.graphics.map(
        (graphic) => graphic.geometry
      );

      // update state of calculations menu
      setPoints(allPoints.map((point) => [point.x, point.y]).toArray());

      if (theme === "EWS") {
        // check if all points are inside the boundary
        let allPointsInside = true;
        allPoints.forEach((point) => {
          if (
            !geometryEngine.intersects(
              point,
              boundaryGraphicsLayer.graphics.at(0).geometry
            )
          ) {
            allPointsInside = false;
            return;
          }
        });
        setOutsideWarning(!allPointsInside);

        // check if points are too close
        let tooClose = false;
        allPoints.forEach((firstPoint) => {
          allPoints.forEach((secondPoint) => {
            if (secondPoint !== firstPoint) {
              if (
                geometryEngine.distance(firstPoint, secondPoint, "meters") <=
                4.9
              ) {
                tooClose = true;
                return;
              }
            }
          });
        });
        setClosenessWarning(tooClose);
      } else {
        // check if all points are inside the boundary
        let allPointsInside = true;
        allPoints.forEach((point) => {
          if (
            !geometryEngine.intersects(
              point,
              polygonGraphicsLayer.graphics.at(0).geometry
            )
          ) {
            allPointsInside = false;
            return;
          }
        });
        setOutsideWarning(!allPointsInside);
      }
    }
  });

  // register event handlers for mouse clicks
  view.on("click", ({ mapPoint }) => {
    // at application start if no polygon is drawn yet
    if (polygonGraphicsLayer.graphics.length === 0) {
      startNewQuery(mapPoint);
    } else {
      view
        .hitTest(view.toScreen(mapPoint), {
          include: pointGraphicsLayer,
        })
        .then(({ results }) => {
          if (results.length > 0) {
            // if point was selected then start update
            const pointGraphic = results.at(0).graphic;
            sketch.update(pointGraphic);
          } else {
            if (
              !geometryEngine.intersects(
                mapPoint,
                polygonGraphicsLayer.graphics.at(0).geometry
              )
            ) {
              // if click was outside parcel and no point was selected then start new query
              startNewQuery(mapPoint);
            }
          }
        });
    }
  });

  // listen to move event
  view.on("pointer-move", (event) => {
    let mapPoint = view.toMap({ x: event.x, y: event.y });
    view
      .hitTest(view.toScreen(mapPoint), {
        include: pointGraphicsLayer,
      })
      .then(({ results }) => {
        // if users hovers over a point
        if (results.length > 0 && event.buttons === 0) {
          let graphic = results.at(0).graphic;
          sketch.update(graphic);
          let pointGraphic = new Graphic({
            geometry: graphic.geometry,
            symbol: {
              type: "simple-marker",
              size: "30px",
              color: null,
              outline: { color: "#00ffff" },
            },
          });
          highlightGraphicsLayer.add(pointGraphic);
          document.body.style.cursor = "pointer";
        } else {
          highlightGraphicsLayer.removeAll();
          document.body.style.cursor = "default";
        }
      });
  });

  const startNewQuery = (mapPoint) => {
    // clear all
    dispatch(updateCadastralData({}));
    polygonGraphicsLayer.removeAll();
    boundaryGraphicsLayer.removeAll();
    pointGraphicsLayer.removeAll();
    setClosenessWarning(false);
    setOutsideWarning(false);
    setPolygon(null);
    setPoints([]);

    // hide sketch menu if user starts new query
    // let sketchMenuContainer = calculationsMenu.querySelector(
    //   "#sketch-menu-container"
    // );

    // if (sketchMenuContainer) {
    //   sketchMenuContainer.style.display = "none";
    // }

    // initialize store in case there was a previous computation
    switch (theme) {
      case "EWS":
        dispatch(updateEWSComputationResult({}));
        break;
      case "GWWP":
        dispatch(updateGWWPComputationResult({}));
        break;
      default:
        break;
    }

    // start new queries
    identifyAllLayers(view, mapPoint, dispatch);
    getAddress(mapPoint, setAddress);

    if (view.scale > scaleLimit) {
      // take screenshot with marker at higher scales when parcels are not selectable
      setTimeout(() => takeScreenshot(view, mapPoint, dispatch, true), 0);
    } else {
      // take screenshot
      setTimeout(() => takeScreenshot(view, mapPoint, dispatch), 0);

      // query cadastral data
      queryCadastre(
        view,
        polygonGraphicsLayer,
        mapPoint,
        dispatch,
        setPolygon,
        setPoints,
        theme,
        gridSpacing
      );
    }

    // add sketch menu to calculations menu if below scale limit
    // if (theme === "EWS" && view.scale < scaleLimit) {
    //   if (!sketchMenuContainer) {
    //     // add menu elements
    //     const collapsibleContent = calculationsMenu.querySelector(
    //       "#collapsible-content"
    //     );
    //     sketchMenuContainer = document.createElement("div");
    //     sketchMenuContainer.id = "sketch-menu-container";
    //     sketchMenuContainer.style.fontFamily = `-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif`;
    //     sketchMenuContainer.style.textRendering = "optimizelegibility";
    //     sketchMenuContainer.style.lineHeight = "normal";
    //     sketchMenuContainer.style.boxSizing = "content-box";
    //     sketchMenuContainer.style.display = "inline";
    //     collapsibleContent.appendChild(sketchMenuContainer);

    //     let label = document.createElement("label");
    //     label.innerHTML = "Sondenpunkte auswählen oder zeichnen";
    //     sketchMenuContainer.appendChild(label);
    //   } else {
    //     // set to block mode if container already exists
    //     sketchMenuContainer.style.display = "block";
    //   }

    //   sketch.container = sketchMenuContainer;
    // }
  };

  // add map to view
  view.map = arcgisMap;

  // add UI components
  view.ui.components = [];
  if (!isMobile) {
    view.ui.add([zoom, search, layerList, legend], "top-left");
    view.ui.add(scaleBar, "bottom-left");
  }

  // set container of mapview
  view.container = container;

  // return map view and sketch widget
  return { view, sketch };
}

// initialize callback functions
export function initializeInfoPanelHandlers(
  setAddressCallback,
  dispatchCallback,
  setClosenessWarningCallback,
  setOutsideWarningCallback,
  setScaleWarningCallback
) {
  setAddress = setAddressCallback;
  dispatch = dispatchCallback;
  setClosenessWarning = setClosenessWarningCallback;
  setOutsideWarning = setOutsideWarningCallback;
  setScaleWarning = setScaleWarningCallback;
}

// initialize calculatoins menu callback functions
export function initializeCalculationsMenuHandlers(
  setPointsCallback,
  setPolygonCallback
) {
  setPoints = setPointsCallback;
  setPolygon = setPolygonCallback;
}
