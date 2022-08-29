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
        de: "Wärmeleitfähigkeit",
        en: "Thermal conductivity",
      },
      url: "https://srv-ags02i.gba.geolba.ac.at:6443/arcgis/rest/services/Test/WLF_test/ImageServer",
      id: "layer-2",
      type: "imagery",
      des: {
        de: `Mittlere konduktive Wärmeleitfähigkeit des Untergrunds für eine Tiefe von 0 bis 100 m`,
        en: `Mean subsurface thermal conductivity from 0 to 100 m depth`,
      },
    },
    {
      title: {
        de: "Untergrundtemperatur",
        en: "Sub surface temperature",
      },
      url: "https://srv-ags02i.gba.geolba.ac.at:6443/arcgis/rest/services/Test/Untergrundtemperatur/ImageServer",
      id: "layer-3",
      type: "imagery",
      des: {
        de: `Mittlere Temperatur des Untergrunds für 0 bis 100 m Tiefe`,
        en: `Mean subsurface temperature from 0 to 100m depth`,
      },
    },
    {
      title: {
        de: "Bodentemperatur",
        en: "Surface temperature",
      },
      url: "https://srv-ags02i.gba.geolba.ac.at:6443/arcgis/rest/services/Test/wien_LST_dec_tif/ImageServer",
      id: "layer-4",
      type: "imagery",
      des: {
        de: `Mittlere jährliche Bodentemperatur an der Geländeoberfläche basierend auf Satellitendaten (MODIS)`,
        en: `Mean annual surface temperature based on satellite data (MODIS)`,
      },
    },
    {
      title: {
        de: "Betriebsstunden",
        en: "Operational time",
      },
      url: "https://srv-ags02i.gba.geolba.ac.at:6443/arcgis/rest/services/Test/OG_BETRIEBSSTD_Wien/MapServer",
      id: "layer-5",
      type: "map-image",
      des: {
        de: `Betriebsstunden - Heizen und Kühlen (Stunden/Jahr) `,
        en: `Operational - Heating and cooling (hours/year)`,
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
