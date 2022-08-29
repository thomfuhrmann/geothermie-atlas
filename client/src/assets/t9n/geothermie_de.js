import { config } from "../../config";

let layerMap = {};
config.layers.map(
  (layer) => (layerMap[layer.id] = { title: layer.title.de, des: layer.des.de })
);

export const geothermie_de = {
  header: {
    title: "Geothermie-Atlas 1.0",
  },
  locale_button: {
    title: "en",
  },
  info_div: {
    scale_alert: "Bitte zoomen Sie hinein, um die Katasterkarte zu sehen.",
    instruction_click: `Klicken Sie auf einen Ort in der Karte oder geben Sie die gewünschte Adresse ein, um Informationen zu diesem Ort abzufragen.`,
    instruction_polyline_first: "Verwenden Sie das Werkzeug ",
    instruction_polyline_middle: "Polylinie zeichnen",
    instruction_polyline_last: ` um einen Bohrloch-Raster festzulegen. 
    Ziehen sie eine Polylinie um das gewünschte Grundstück. Die ersten beiden Abschnitte der Polylinie bestimmen die Anordnung der Rasterpunkte.
    Die Rasterpunkte haben einen Abstand von 10 Metern zueinander, und einen Abstand von 2 Metern zur Grundstücksgrenze.`,
    title: "Standortbasierter Bericht",
    error:
      "Bitte geben Sie mindestens 3 Punkte ein, um einen Bohrloch-Raster zu definieren.",
    no_data: "keine Daten",
    contact: "Kontakt",
    gba: "Geologische Bundesanstalt",
    dep: "Fachbereich Hydrogeologie und Geothermie",
    city: "Wien",
    disclaimer_title: "Haftungsausschluss",
    disclaimer: `Die thematischen Inhalte auf unserem Webportal dienen dazu, einen Überblick über Potentiale und Konflikte im Zusammenhang mit oberflächennaher Geothermie zu geben. 
      Sie ersetzen keine detaillierten Planungen. Es ergibt sich aus unseren Karten auch keinerlei Genehmigungsanspruch einer geplanten Nutzung gegenüber den zuständigen Behörden. 
      Der Anbieter dieses Webportals und der damit verbundenen Dienstleistungen übernimmt keine Haftung für Schäden die durch den ungeeigneten Gebrauch des Webportals entstehen.`,
    geo_parameters: "Geowissenschaftliche Parameter",
  },
  grid_query_table: {
    title: "Sondenfeld",
  },
  point_query_table: {
    title: "Punktabfrage",
  },
  layers: layerMap,
};
