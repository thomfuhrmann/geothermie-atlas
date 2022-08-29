import * as promiseUtils from "@arcgis/core/core/promiseUtils";

import { layers } from "./view";

// query features by position
export function queryFeatures(geometry) {
  const query = {
    geometry: geometry,
    spatialRelationship: "intersects",
    returnGeometry: false,
    outFields: ["*"],
  };

  return promiseUtils
    .eachAlways(
      layers.map((layer) => {
        let promise;
        switch (layer.type) {
          case "feature":
            promise = layer.queryFeatures(query).then((featureSet) => {
              //add feature attributes to result
              const queryResult = [];
              featureSet.features.forEach((feature) => {
                queryResult.push(feature.attributes);
              });
              return { [layer.id]: queryResult };
            });
            break;
          case "imagery":
            promise = layer.identify({ geometry: geometry }).then((result) => {
              return { [layer.id]: result.value };
            });
            break;
          case "map-image":
            break;
          default:
            break;
        }
        return promise;
      })
    )
    .then((results) => {
      const allResults = {};
      results.forEach((result) => {
        if (result.error || result.value === undefined) return;
        const key = Object.keys(result.value)[0];
        allResults[key] = result.value[key];
      });
      return allResults;
    });
}
