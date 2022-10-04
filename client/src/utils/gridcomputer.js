import Graphic from "@arcgis/core/Graphic";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import Point from "@arcgis/core/geometry/Point";
import Polygon from "@arcgis/core/geometry/Polygon";

import {
  view,
  pointGraphicsLayer,
  boundaryGraphicsLayer,
  cadastre,
} from "./viewEWS";

// grid points have to be at least 2 meters away from parcel boundary
const distanceToBoundary = 2;

const drawPoint = (point, color = [90, 90, 90, 0]) => {
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

const dotProduct = (u, v) => {
  return u[0] * v[0] + u[1] * v[1];
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

const spread = (u, v) => {
  return (
    Math.pow(determinant([u, v]), 2) / (dotProduct(u, u) * dotProduct(v, v))
  );
};

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

const computeParallelLine = (line, offset) => {
  const v = [line[1][0] - line[0][0], line[1][1] - line[0][1]];
  const n = [-v[1], v[0]];
  const il = 1 / Math.sqrt(Math.pow(n[0], 2) + Math.pow(n[1], 2));
  const nn = [il * n[0], il * n[1]];
  const p = [line[0][0] - offset * nn[0], line[0][1] - offset * nn[1]];
  const q = [p[0] + v[0], p[1] + v[1]];
  return [p, q];
};

const computeParallelLines = (line, offset, maxOffset) => {
  const lines = [];
  let currentOffset = offset;
  while (Math.abs(currentOffset) < maxOffset) {
    const offsetPolyline = computeParallelLine(line, currentOffset);
    lines.push(offsetPolyline);
    currentOffset += offset;
  }
  return lines;
};

export const distance = (point1, point2) => {
  return Math.sqrt(
    Math.pow(point2[0] - point1[0], 2) + Math.pow(point2[1] - point1[1], 2)
  );
};

const computeGridLines = (point1, point2, points, gridSpacing) => {
  let v = [point2[0] - point1[0], point2[1] - point1[1]];
  let n = [-v[0], -v[1]];
  let c = -n[0] * point1[0] - n[1] * point1[1];
  let longestDistanceRight = 0;
  let longestDistanceLeft = 0;

  for (let point of points) {
    let projectedPoint = [
      (point[0] * n[1] * n[1] - n[0] * n[1] * point[1] - n[0] * c) /
        (n[0] * n[0] + n[1] * n[1]),
      (n[0] * n[0] * point[1] - n[0] * n[1] * point[0] - n[1] * c) /
        (n[0] * n[0] + n[1] * n[1]),
    ];

    const length = distance(point1, projectedPoint);

    const m = [
      [point1[0], point1[1], 1],
      [point2[0], point2[1], 1],
      [projectedPoint[0], projectedPoint[1], 1],
    ];

    if (determinant(m) < 0 && length > longestDistanceRight) {
      longestDistanceRight = length;
    } else if (determinant(m) > 0 && length > longestDistanceLeft) {
      longestDistanceLeft = length;
    }
  }

  const line = [point1, point2];

  const linesRight = computeParallelLines(
    [point1, point2],
    gridSpacing,
    longestDistanceRight
  );
  const linesLeft = computeParallelLines(
    [point1, point2],
    -gridSpacing,
    longestDistanceLeft
  );
  const lines = linesRight.concat(linesLeft, [line]);

  return lines;
};

export const calculateGrid = (polygon, gridSpacing = 10, setGridPoints) => {
  pointGraphicsLayer.removeAll();

  let offsetPolygon = geometryEngine.offset(
    polygon,
    distanceToBoundary,
    "meters"
  );

  // draw only outer polygon and ignore inner rings
  drawPolygon(
    new Polygon({
      rings: offsetPolygon.rings[0],
      spatialReference: view.spatialReference,
    })
  );

  if (offsetPolygon) {
    const points = offsetPolygon.rings[0];

    // search for most perpendicular corner
    let widestSpread = 0;
    let index = 0;
    for (let i = 0; i < points.length - 1; i++) {
      let currentSpread, u, v;
      if (i === 0) {
        u = [
          points[points.length - 1][0] - points[0][0],
          points[points.length - 1][1] - points[0][1],
        ];
        v = [points[1][0] - points[0][0], points[1][1] - points[0][1]];
        currentSpread = spread(u, v);
      } else if (i === points.length - 1) {
        u = [
          points[points.length - 2][0] - points[points.length - 1][0],
          points[points.length - 2][1] - points[points.length - 1][1],
        ];
        v = [
          points[points.length - 1][0] - points[0][0],
          points[points.length - 1][1] - points[0][1],
        ];
        currentSpread = spread(u, v);
      } else {
        u = [points[i - 1][0] - points[i][0], points[i - 1][1] - points[i][1]];
        v = [points[i + 1][0] - points[i][0], points[i + 1][1] - points[i][1]];
        currentSpread = spread(u, v);
      }

      if (currentSpread > widestSpread) {
        widestSpread = currentSpread;
        index = i;
      }
    }

    const v = [
      points[index + 1][0] - points[index][0],
      points[index + 1][1] - points[index][1],
    ];
    const n = [-v[1], v[0]];
    const lines = computeGridLines(
      points[index],
      points[index + 1],
      points,
      gridSpacing
    );
    const orthogonalLines = computeGridLines(
      points[index],
      [points[index][0] + n[0], points[index][1] + n[1]],
      points,
      gridSpacing
    );

    const gridPoints = [];
    for (let line1 of lines) {
      for (let line2 of orthogonalLines) {
        const intersection = intersect(
          line1[0][0],
          line1[0][1],
          line1[1][0],
          line1[1][1],
          line2[0][0],
          line2[0][1],
          line2[1][0],
          line2[1][1]
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
      if (geometryEngine.intersects(point, offsetPolygon)) {
        include = true;
      }
      return include;
    });

    // filter points that are not on buildings
    filterPointsByPixelAndDraw(filteredGridPoints, setGridPoints);
  }
};

// select points that are not on buildings
const filterPointsByPixelAndDraw = (points, setGridPoints) => {
  cadastre.fetchImage(view.extent, view.width, view.height).then((image) => {
    const canvas = document.createElement("canvas");
    canvas.width = view.width;
    canvas.height = view.height;

    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0);

    const selectedGridPoints = [];
    for (const point of points) {
      const screenPoint = view.toScreen(point);

      const { data } = context.getImageData(
        Math.round(screenPoint.x),
        Math.round(screenPoint.y),
        1,
        1
      );

      // buildings are identified by their RGB value (218, 62, 56) in the cadastral layer
      if (!(data[0] === 218 && data[1] === 62 && data[2] === 56)) {
        selectedGridPoints.push(point);
      }
    }
    // draw points
    selectedGridPoints.map((point) => drawPoint(point));

    // set grid points for the UI
    setGridPoints(selectedGridPoints);
  });
};
