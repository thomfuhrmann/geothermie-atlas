import Graphic from "@arcgis/core/Graphic";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import Point from "@arcgis/core/geometry/Point";
import Circle from "@arcgis/core/geometry/Circle";
import Polyline from "@arcgis/core/geometry/Polyline";
import Polygon from "@arcgis/core/geometry/Polygon";

import {
  view,
  graphicsLayer,
  cadastre as cadastralLayer,
  identifyLayers,
  takeScreenshot,
} from "./view";

// grid points have to be at least 2 meters away from parcel boundary
const distanceToBoundary = 2;

const drawPoint = (point) => {
  graphicsLayer.add(
    new Graphic({
      geometry: point,
      symbol: {
        type: "simple-marker",
        color: [90, 90, 90, 0],
      },
    })
  );
};

const determinant = (m) =>
  m.length === 1
    ? m[0][0]
    : m.length === 2
    ? m[0][0] * m[1][1] - m[0][1] * m[1][0]
    : m[0].reduce(
        (sum, element, i) =>
          sum +
          (-1) ** (i + 2) *
            element *
            determinant(m.slice(1).map((c) => c.filter((_, j) => i !== j))),
        0
      );

const intersect = (x1, y1, x2, y2, x3, y3, x4, y4) => {
  // Check if no line is of length 0
  if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
    return false;
  }
  const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  // Lines are parallel
  if (denominator === 0) {
    return false;
  }
  // Return an object with the x and y coordinates of the intersection
  let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
  let x = x1 + ua * (x2 - x1);
  let y = y1 + ua * (y2 - y1);
  return [x, y];
};

const orderPoints = (points) => {
  if (
    determinant([
      [points[0][0], points[0][1], 1],
      [points[1][0], points[1][1], 1],
      [points[2][0], points[2][1], 1],
    ]) > 0
  ) {
    points = [points[2], points[1], points[0]];
  }
  return points;
};

const intersectLineCircle = (line, circle) => {
  const intersectionLine = geometryEngine.intersect(line, circle);
  const path = intersectionLine.paths && intersectionLine.paths[0];
  const point =
    circle.center.x === path[0][0] && circle.center.y === path[0][1]
      ? new Point({
          x: path[1][0],
          y: path[1][1],
          spatialReference: view.spatialReference,
        })
      : new Point({
          x: path[0][0],
          y: path[0][1],
          spatialReference: view.spatialReference,
        });
  return point;
};

const calculatePointsOnLine = (line, start, offset) => {
  const length = geometryEngine.planarLength(line, "meters");
  let radius = offset;
  const points = [];
  while (radius < length - distanceToBoundary) {
    const circle = new Circle({
      center: start,
      radius: radius,
      radiusUnit: "meters",
    });
    const intersectionPoint = intersectLineCircle(line, circle);
    points.push(intersectionPoint);
    radius += offset;
  }
  return points;
};

const offsetLine = (line, offset, length, gridUnit) => {
  let currentOffset = offset;
  const lines = [];
  let currentStep = gridUnit;
  while (currentStep < length - distanceToBoundary) {
    const offsetPolyline = geometryEngine.offset(line, currentOffset, "meters");
    lines.push(offsetPolyline);
    currentOffset += offset;
    currentStep += gridUnit;
  }
  return lines;
};

export const calculateGrid = async (event, gridSpacing = 10) => {
  let points = orderPoints(event.graphic.geometry.paths[0]);
  let offsetPolyline = geometryEngine.offset(
    new Polyline({ paths: points, spatialReference: view.spatialReference }),
    distanceToBoundary,
    "meters"
  );

  if (offsetPolyline) {
    // oder in clockwise direction
    points = orderPoints(offsetPolyline.paths[0]);

    const point1 = new Point({
      x: points[0][0],
      y: points[0][1],
      spatialReference: view.spatialReference,
    });
    const point2 = new Point({
      x: points[1][0],
      y: points[1][1],
      spatialReference: view.spatialReference,
    });
    const point3 = new Point({
      x: points[2][0],
      y: points[2][1],
      spatialReference: view.spatialReference,
    });
    const line1 = new Polyline({
      paths: [points[0], points[1]],
      spatialReference: view.spatialReference,
    });
    const line2 = new Polyline({
      paths: [points[1], points[2]],
      spatialReference: view.spatialReference,
    });
    const circle = new Circle({
      center: point2,
      radius: gridSpacing,
      radiusUnit: "meters",
    });

    // create boundary polygon from polyline
    const path = event.graphic.geometry.paths[0];
    const firstPoint = path.length > 0 && path[0];
    path.push(firstPoint);
    const boundaryPolygon = new Polygon({
      rings: path,
      spatialReference: view.spatialReference,
    });

    const intersectionPoint1 = intersectLineCircle(line1, circle);
    const intersectionPoint2 = intersectLineCircle(line2, circle);

    const offset1 = geometryEngine.distance(line1, intersectionPoint2);
    const offset2 = geometryEngine.distance(line2, intersectionPoint1);

    const length1 = geometryEngine.distance(point1, point2);
    const length2 = geometryEngine.distance(point2, point3);

    const lines1 = offsetLine(line1, offset1, length2, gridSpacing);
    const lines2 = offsetLine(line2, offset2, length1, gridSpacing);

    const gridPoints = [];
    gridPoints.push(point2);
    gridPoints.push(...calculatePointsOnLine(line1, point2, gridSpacing));
    gridPoints.push(...calculatePointsOnLine(line2, point2, gridSpacing));

    for (let line1 of lines1) {
      for (let line2 of lines2) {
        const intersection = intersect(
          line1.paths[0][0][0],
          line1.paths[0][0][1],
          line1.paths[0][1][0],
          line1.paths[0][1][1],
          line2.paths[0][0][0],
          line2.paths[0][0][1],
          line2.paths[0][1][0],
          line2.paths[0][1][1]
        );

        const intersectionPoint =
          intersection &&
          new Point({
            x: intersection[0],
            y: intersection[1],
            spatialReference: view.spatialReference,
          });

        gridPoints.push(intersectionPoint);
      }
    }

    // filter points that are inside the boundary polygon
    const filteredGridPoints = gridPoints.filter((point) => {
      let include = false;
      if (
        geometryEngine.distance(point, event.graphic.geometry, "meters") >
          1.8 &&
        geometryEngine.within(point, boundaryPolygon)
      ) {
        include = true;
      }
      return include;
    });

    // filter points that are not on buildings
    filterPointsByPixelAndDraw(
      cadastralLayer,
      filteredGridPoints,
      boundaryPolygon.centroid
    );
  }
};

// select points that are not on buildings
const filterPointsByPixelAndDraw = (
  cadastralLayer,
  filteredGridPoints,
  centroid
) => {
  cadastralLayer
    .fetchImage(view.extent, view.width, view.height)
    .then((image) => {
      const canvas = document.createElement("canvas");
      canvas.width = view.width;
      canvas.height = view.height;

      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0);

      const selectedGridPoints = [];
      let m = 1;
      for (const point of filteredGridPoints) {
        const screenPoint = view.toScreen(point);

        const { data } = context.getImageData(
          Math.round(screenPoint.x),
          Math.round(screenPoint.y),
          1,
          1
        );

        // buildings are identified by their RGB value (218, 62, 56) in the cadastral layer
        if (!(data[0] === 218 && data[1] === 62 && data[2] === 56)) {
          point.m = m;
          selectedGridPoints.push(point);
          m++;
        }
      }

      // query layer values and execute scipt
      identifyLayers(centroid, selectedGridPoints.length);

      // draw points
      selectedGridPoints.map((point) => drawPoint(point));

      // take screenshot at centroid of polygon
      takeScreenshot(centroid);
    });
};
