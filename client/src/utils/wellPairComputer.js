import Graphic from "@arcgis/core/Graphic";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import Point from "@arcgis/core/geometry/Point";
import Polygon from "@arcgis/core/geometry/Polygon";

import {
  view,
  pointGraphicsLayer,
  boundaryGraphicsLayer,
  //   cadastre,
  SRS,
} from "./view";

// grid points have to be at least 2.5 meters away from parcel boundary
const distanceToBoundary = 2.5;

const drawPoint = (point, color = [255, 255, 255, 0.25]) => {
  pointGraphicsLayer.add(
    new Graphic({
      geometry: point,
      symbol: {
        type: "simple-marker",
        color,
      },
    })
  );
};

const drawPolygon = (polygon) => {
  boundaryGraphicsLayer.add(
    new Graphic({
      geometry: polygon,
      symbol: {
        type: "simple-fill",
        color: [0, 0, 0, 0],
        outline: { color: "red", width: "1px" },
      },
    })
  );
};

export const distance = (point1, point2) => {
  return Math.sqrt(
    Math.pow(point2[0] - point1[0], 2) + Math.pow(point2[1] - point1[1], 2)
  );
};

export const calculateWells = (polygon, setPoints) => {
  pointGraphicsLayer.removeAll();

  let offsetPolygon = geometryEngine.offset(
    polygon,
    distanceToBoundary,
    "meters"
  );

  if (offsetPolygon) {
    // draw only outer polygon and ignore inner rings
    drawPolygon(
      new Polygon({
        rings: offsetPolygon.rings[0],
        spatialReference: view.spatialReference,
      })
    );

    const points = offsetPolygon.rings[0];

    // search for longest side
    let longestLength = 0;
    let firstIndex = 0;
    let secondIndex = 0;
    let currentLength;
    for (let i = 0; i < points.length - 1; i++) {
      for (let j = 0; j < points.length - 1; j++) {
        currentLength = distance(points[i], points[j]);
        if (currentLength > longestLength) {
          if (
            (i === 0 && j < points.length - 1) ||
            (i === 1 && j < points.length) ||
            (i > 1 && i < points.length - 2 && Math.abs(i - j) > 1) ||
            (i === points.length - 1 && j > 0 && Math.abs(i - j) > 1)
          ) {
            longestLength = currentLength;
            firstIndex = i;
            secondIndex = j;
          }
        }
      }
    }

    setPoints([points[firstIndex], points[secondIndex]]);

    drawPoint(
      new Point({
        x: points[firstIndex][0],
        y: points[firstIndex][1],
        spatialReference: SRS,
      })
    );

    drawPoint(
      new Point({
        x: points[secondIndex][0],
        y: points[secondIndex][1],
        spatialReference: SRS,
      })
    );
  }

  // filter points that are not on buildings
  // filterPointsByPixelAndDraw(filteredGridPoints, setPoints);
};

// select points that are not on buildings
// const filterPointsByPixelAndDraw = (points, setPoints) => {
//   cadastre.fetchImage(view.extent, view.width, view.height).then((image) => {
//     const canvas = document.createElement("canvas");
//     canvas.width = view.width;
//     canvas.height = view.height;

//     const context = canvas.getContext("2d");
//     context.drawImage(image, 0, 0);

//     const selectedGridPoints = [];
//     for (const point of points) {
//       const screenPoint = view.toScreen(point);

//       const { data } = context.getImageData(
//         Math.round(screenPoint.x),
//         Math.round(screenPoint.y),
//         1,
//         1
//       );

//       // buildings are identified by their RGB value (218, 62, 56) in the cadastral layer
//       if (!(data[0] === 218 && data[1] === 62 && data[2] === 56)) {
//         selectedGridPoints.push(point);
//       }
//     }
//     // draw points
//     selectedGridPoints.map((point) => drawPoint(point));

//     // set grid points for the UI
//     setPoints(selectedGridPoints.map((point) => [point.x, point.y]));
//   });
// };
