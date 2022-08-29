import { config } from "../../config";

let layerMap = {};
config.layers.map(
  (layer) => (layerMap[layer.id] = { title: layer.title.en, des: layer.des.en })
);

// layerTitleMap = {
//   ...config.layers.map((layer) => layer.title.en),
// };

export const geothermie_en = {
  header: {
    title: "Geothermal-energy-atlas 1.0",
  },
  locale_button: {
    title: "de",
  },
  info_div: {
    scale_alert: "Please zoom in to see the cadastral map.",
    instruction_click: `Please click on the map or enter an address to query for information related to a specific place.`,
    instruction_polyline_first: "Please use the tool ",
    instruction_polyline_middle: "Draw a polyline",
    instruction_polyline_last: ` to span a borehole-grid. Draw a polyline around the desired parcel. The first two sections of this polyline define the alignment of raster points.`,
    title: "Location query",
    error: "Please enter at least 3 points to span a borehole-grid.",
    no_data: "No data",
    contact: "Contact",
    gba: "Geological Survey of Austria",
    dep: "Department of hydrogeology and geothermal energy",
    city: "Vienna",
    disclaimer_title: "Disclaimer",
    disclaimer: `The thematic contents shown on our web portal intend to give an overview of potentials and conflicts of use associated to shallow geothermal energy. 
      They do not replace detailed planning studies and must not be used for any detailed planning purpose and do not replace any approvals by competent legal authorities. 
      The provider of the services does not take any liability for damages caused by an inappropriate use of the contents presented.`,
    geo_parameters: "Geoscientific parameters",
  },
  polygon_query_table: {
    title: "Polygon query",
  },
  point_query_table: {
    title: "Point query",
  },
  layers: layerMap,
};
