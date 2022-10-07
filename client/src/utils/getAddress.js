import * as locator from "@arcgis/core/rest/locator";

// reverse-geocode address for a given point
export function getAddress(mapPoint, setAddress) {
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
