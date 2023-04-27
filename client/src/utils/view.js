import ArcGISMap from '@arcgis/core/Map';
import Extent from '@arcgis/core/geometry/Extent';
import MapView from '@arcgis/core/views/MapView';
import Basemap from '@arcgis/core/Basemap';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import WMTSLayer from '@arcgis/core/layers/WMTSLayer';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import Search from '@arcgis/core/widgets/Search';
import ScaleBar from '@arcgis/core/widgets/ScaleBar';
import Sketch from '@arcgis/core/widgets/Sketch';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import LayerList from '@arcgis/core/widgets/LayerList';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import Point from '@arcgis/core/geometry/Point';
import Zoom from '@arcgis/core/widgets/Zoom';

import { updateEWSComputationResult } from '../redux/ewsComputationsSlice';
import { updateGWWPComputationResult } from '../redux/gwwpComputationsSlice';
import { identifyAllLayers } from './identify';
import { queryCadastre } from './queryCadastre';
import { takeScreenshot } from './screenshot';
import { getAddress } from './getAddress';

import './ui.css';
import { updateCadastralData } from '../redux/cadastreSlice';
import { Vienna, Austria } from '../assets/Vienna';
import Polygon from '@arcgis/core/geometry/Polygon';

// spatial reference WKID
export const SRS = 31256;

// layer URLs
export const ampelkarte_ews_url = 'https://gis.geosphere.at/maps/rest/services/geothermie/ampelkarte_ews/MapServer';
export const ampelkarte_gwwp_url = 'https://gis.geosphere.at/maps/rest/services/geothermie/ampelkarte_gwwp/MapServer';
export const ews_url = 'https://gis.geosphere.at/maps/rest/services/geothermie/potentialkarte_ews/MapServer';
export const gwwp_url = 'https://gis.geosphere.at/maps/rest/services/geothermie/potentialkarte_gwwp/MapServer';
export const cadastre_url = 'https://data.bev.gv.at/geoserver/BEVdataKAT/wms';
const basemap_at_url = 'https://mapsneu.wien.gv.at/basemap31256neu/1.0.0/WMTSCapabilities.xml';

export let view;
export let pointGraphicsLayer;
export let boundaryGraphicsLayer;

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

  let viennaGraphic = new Graphic({
    geometry: new Polygon({ rings: [Austria, Vienna], spatialReference: SRS }),
    symbol: {
      type: 'simple-fill',
      color: [5, 46, 55, 0.5],
      style: 'solid',
      outline: {
        color: 'white',
        width: 0,
      },
    },
  });

  let viennaGraphicsLayer = new GraphicsLayer({ title: 'Wien', listMode: 'hide' });
  viennaGraphicsLayer.add(viennaGraphic);

  pointGraphicsLayer = new GraphicsLayer({
    title: 'Planungslayer - Punkte',
    listMode: 'hide',
  });

  boundaryGraphicsLayer = new GraphicsLayer({
    title: 'EWS - innere Grenze',
    listMode: 'hide',
  });

  polygonGraphicsLayer = new GraphicsLayer({
    title: 'Grundstücksgrenze',
    listMode: 'hide',
  });

  let highlightGraphicsLayer = new GraphicsLayer({
    title: 'Grundstücksgrenze',
    listMode: 'hide',
  });

  // create layers
  const ampelkarte_ews = new MapImageLayer({
    url: ampelkarte_ews_url,
    title: 'Ampelkarte',
    visible: false,
    listMode: 'show',
  });

  const ampelkarte_gwwp = new MapImageLayer({
    url: ampelkarte_gwwp_url,
    title: 'Ampelkarte',
    visible: false,
    listMode: 'show',
  });

  const ews = new MapImageLayer({
    title: 'Potentialkarten für Erdwärmesonden',
    url: ews_url,
    visible: false,
    listMode: 'hide',
  });

  const gwwp = new MapImageLayer({
    title: 'Potentialkarten für Grundwasserwärmepumpen',
    url: gwwp_url,
    visible: false,
    listMode: 'hide',
  });

  // basemap in Viennese coordinate system due to tranformation inaccuracies from MGI to WGS84
  // default transformation in ArcGIS API from MGI to WGS84 is 1306
  // transformation 1618 is recommended
  const basemap_at = new WMTSLayer({
    url: basemap_at_url,
    activeLayer: {
      id: 'geolandbasemap',
    },
    listMode: 'hide',
    serviceMode: 'KVP',
  });

  let basemap = new Basemap({
    baseLayers: [basemap_at],
    title: 'basemap',
    id: 'basemap',
    spatialReference: SRS,
  });

  let arcgisMap;
  switch (theme) {
    case 'EWS':
      arcgisMap = new ArcGISMap({
        basemap: basemap,
        layers: [
          ews,
          ampelkarte_ews,
          pointGraphicsLayer,
          boundaryGraphicsLayer,
          polygonGraphicsLayer,
          highlightGraphicsLayer,
          viennaGraphicsLayer,
        ],
      });
      break;
    case 'GWWP':
      arcgisMap = new ArcGISMap({
        basemap: basemap,
        layers: [
          gwwp,
          ampelkarte_gwwp,
          pointGraphicsLayer,
          polygonGraphicsLayer,
          highlightGraphicsLayer,
          viennaGraphicsLayer,
        ],
      });
      break;
    default:
      break;
  }

  const layerList = new LayerList({ view });

  const search = new Search({
    view,
    popupEnabled: true,
  });

  const scaleBar = new ScaleBar({
    view: view,
    unit: 'metric',
  });

  const zoom = new Zoom({
    view,
    layout: 'horizontal',
  });

  const sketch = new Sketch({
    layer: pointGraphicsLayer,
    view: view,
    availableCreateTools: [theme === 'EWS' ? 'point' : undefined],
    visibleElements: {
      selectionTools: {
        'lasso-selection': false,
        'rectangle-selection': theme === 'EWS' ? true : false,
      },
      settingsMenu: false,
      undoRedoMenu: false,
    },
    creationMode: 'single',
  });

  sketch.on('create', (event) => {
    if (event.tool === 'point' && event.state === 'complete') {
      // point symbol
      const symbol = {
        type: 'simple-marker',
        color: [255, 255, 255, 0.25],
      };

      // delete default point symbol
      pointGraphicsLayer.remove(event.graphic);

      let point = event.graphic.geometry;
      let points;
      switch (theme) {
        case 'EWS':
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
          if (!geometryEngine.intersects(point, boundaryGraphicsLayer.graphics.at(0).geometry)) {
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
        case 'GWWP':
          // check if point is outside the parcel
          if (!geometryEngine.intersects(point, polygonGraphicsLayer.graphics.at(0).geometry)) {
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

  sketch.on('update', (event) => {
    if (event.state === 'complete') {
      // list of updated points
      let allPoints = pointGraphicsLayer.graphics.map((graphic) => graphic.geometry);

      // update state of calculations menu
      setPoints(allPoints.map((point) => [point.x, point.y]).toArray());

      if (theme === 'EWS') {
        // check if all points are inside the boundary
        let allPointsInside = true;
        allPoints.forEach((point) => {
          if (!geometryEngine.intersects(point, boundaryGraphicsLayer.graphics.at(0).geometry)) {
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
              if (geometryEngine.distance(firstPoint, secondPoint, 'meters') <= 4.9) {
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
          if (!geometryEngine.intersects(point, polygonGraphicsLayer.graphics.at(0).geometry)) {
            allPointsInside = false;
            return;
          }
        });
        setOutsideWarning(!allPointsInside);
      }
    }
  });

  // register event handler for mouse clicks
  view.on('click', ({ mapPoint }) => {
    // at application start if no polygon is drawn yet
    if (polygonGraphicsLayer.graphics.length === 0) {
      startNewQuery(mapPoint);
    } else {
      // check if point is selected
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
            if (!geometryEngine.intersects(mapPoint, polygonGraphicsLayer.graphics.at(0).geometry)) {
              // if click was outside parcel and no point was selected then start new query
              startNewQuery(mapPoint);
            }
          }
        });
    }
  });

  // listen to move event
  view.on('pointer-move', (event) => {
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
              type: 'simple-marker',
              size: '30px',
              color: null,
              outline: { color: '#00ffff' },
            },
          });
          highlightGraphicsLayer.add(pointGraphic);
          document.body.style.cursor = 'pointer';
        } else {
          highlightGraphicsLayer.removeAll();
          document.body.style.cursor = 'default';
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

    // initialize store in case there was a previous computation
    switch (theme) {
      case 'EWS':
        dispatch(updateEWSComputationResult({}));
        break;
      case 'GWWP':
        dispatch(updateGWWPComputationResult({}));
        break;
      default:
        break;
    }

    // start new layer queries
    identifyAllLayers(view, mapPoint, dispatch, theme);
    getAddress(mapPoint, setAddress);

    if (view.scale > scaleLimit) {
      // take screenshot with marker at higher scales
      setTimeout(() => takeScreenshot(view, mapPoint, dispatch, true), 0);
    } else {
      // take screenshot without marker
      setTimeout(() => takeScreenshot(view, mapPoint, dispatch), 500);

      // query cadastral data
      queryCadastre(view, polygonGraphicsLayer, mapPoint, dispatch, setPolygon, setPoints, theme, gridSpacing);
    }
  };

  // add map to view
  view.map = arcgisMap;

  // add UI components
  view.ui.components = [];
  if (!isMobile) {
    view.ui.add([zoom, search, layerList], 'top-left');
    view.ui.add(scaleBar, 'bottom-left');
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
export function initializeCalculationsMenuHandlers(setPointsCallback, setPolygonCallback) {
  setPoints = setPointsCallback;
  setPolygon = setPolygonCallback;
}
