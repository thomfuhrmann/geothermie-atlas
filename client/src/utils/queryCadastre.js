import esriRequest from "@arcgis/core/request";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import Polygon from "@arcgis/core/geometry/Polygon";
import Graphic from "@arcgis/core/Graphic";

import { updateCadastralData } from "../redux/cadastreSlice";
import { calculateGrid } from "./gridcomputer";
import { calculateWells } from "./wellPairComputer";

export const queryCadastre = (
  view,
  polygonGraphicsLayer,
  mapPoint,
  dispatch,
  setPolygon,
  setPoints,
  theme,
  gridSpacing = 10
) => {
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
      let KG = feature.properties.KG;
      let GNR = feature.properties.GNR;

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
          width: "2px",
        },
      };

      const polygonGraphic = new Graphic({
        geometry: polygon,
        symbol: polygonSymbol,
      });

      polygonGraphicsLayer.add(polygonGraphic);

      let FF = geometryEngine.planarArea(polygon, "square-meters");

      if (theme === "EWS") {
        calculateGrid(polygon, gridSpacing, setPoints);
      } else if (theme === "GWWP") {
        calculateWells(polygon, setPoints);
      }

      setPolygon(polygon);
      dispatch(updateCadastralData({ KG, GNR, FF }));
    }
  });
};
