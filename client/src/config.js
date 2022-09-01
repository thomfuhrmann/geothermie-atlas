export const config = {
  layers: [
    {
      title: {
        de: "Ampelkarte",
        en: "Traffic light map",
      },
      url: "https://services.arcgis.com/Q50VQz37ImhG4P49/arcgis/rest/services/AMPEL_Wien_final_EWS/FeatureServer",
      id: "layer-1",
      type: "feature",
      des: {
        de: "Die Ampelkarte zeigt rechtliche Einschränkungen in Bezug auf die Planung von Erdwärmesonden.",
        en: "Traffic light map for the planning of borehole heat exchangers.",
      },
    },
    {
      title: {
        de: "Kataster",
        en: "Cadastral map",
      },
      url: "https://data.bev.gv.at/geoserver/BEVdataKAT/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities",
      id: "layer-6",
      type: "wms",
      des: { de: "Grundstücke", en: "Cadastral parcels" },
    },
  ],
};
