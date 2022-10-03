import React from "react";

import { einschraenkungen, hinweise } from "../assets/Beschreibungen";
import {
  TableRow,
  TableData,
  Placeholder,
  Table,
} from "./CommonStyledElements";
import CollapsibleSection from "./CollapsibleSection";

const prefixes = {
  0: "main_og_ampelkarte_ews_wien.",
  1: "main_og_ampelkarte_gwp_wien.",
};

let einschraenkungen_erlaeuterungen = [];

const getEinschraenkung = (attributes, prefix) => {
  switch (attributes[prefix + "Parameter"]) {
    case "Naturschutz":
      einschraenkungen_erlaeuterungen["Naturschutz"] = (
        <>
          {" "}
          {einschraenkungen["Naturschutz"]}{" "}
          {
            <a href={einschraenkungen["Naturschutz_links"][0]}>
              {einschraenkungen["Naturschutz_links"][0]}
            </a>
          }{" "}
          und{" "}
          {
            <a href={einschraenkungen["Naturschutz_links"][1]}>
              {einschraenkungen["Naturschutz_links"][1]}
            </a>
          }
        </>
      );
      return (
        <TableData>
          {attributes[prefix + "KATEGORIE"]}
          <sup>{Object.keys(einschraenkungen_erlaeuterungen).length}</sup>
        </TableData>
      );
    case "Wasserschutz- und Schongebiete":
      return <TableData>{attributes[prefix + "KATEGORIE"]}</TableData>;
    case "Artesisch gespannte Brunnen":
      einschraenkungen_erlaeuterungen["Artesisch gespannte Brunnen"] =
        einschraenkungen["Artesisch gespannte Brunnen"];
      return (
        <TableData>
          Artesisch gespannte Brunnen
          <sup>{Object.keys(einschraenkungen_erlaeuterungen).length}</sup>
        </TableData>
      );
    case "Verkarstungsfähige Gesteine":
      einschraenkungen_erlaeuterungen["Verkarstungsfähige Gesteine"] =
        einschraenkungen["Verkarstungsfähige Gesteine"];
      return (
        <TableData>
          Verkarstungsfähige Gesteine
          <sup>{Object.keys(einschraenkungen_erlaeuterungen).length}</sup>
        </TableData>
      );
    case "Altlasten":
      einschraenkungen_erlaeuterungen["Altlasten"] = (
        <>
          {einschraenkungen["Altlasten"]}
          <a href={einschraenkungen["Altlasten_links"]}>
            {einschraenkungen["Altlasten_links"]}
          </a>
        </>
      );
      return (
        <TableData>
          Altlasten
          <sup>{Object.keys(einschraenkungen_erlaeuterungen).length}</sup>
        </TableData>
      );
    case "Unterirdische Bauwerke":
      einschraenkungen_erlaeuterungen["Unterirdische Bauwerke"] =
        einschraenkungen["Unterirdische Bauwerke"];
      return (
        <TableData>
          Unterirdische Bauwerke
          <sup>{Object.keys(einschraenkungen_erlaeuterungen).length}</sup>
        </TableData>
      );
    case "Keine Einschränkung bekannt":
      return <TableData>Keine Einschränkung bekannt</TableData>;
    default:
      break;
  }
};

const getHinweis = (attributes, prefix) => {
  switch (attributes[prefix + "Parameter"]) {
    case "Naturdenkmal":
      return <TableData>{hinweise["Naturdenkmal"]}</TableData>;
    case "Gespannte Grundwasserzone":
      return <TableData>{hinweise["Gespannte Grundwasserzone"]}</TableData>;
    case "Vorkommen brennbarer Gase":
      return <TableData>{hinweise["Vorkommen brennbarer Gase"]}</TableData>;
    case "Mehrere Grundwasserstockwerke":
      return <TableData>{hinweise["Mehrere Grundwasserstockwerke"]}</TableData>;
    case "Grundwasserchemismus":
      return (
        <TableData>
          {hinweise.Grundwasserchemismus[attributes[prefix + "KATEGORIE"]]}
        </TableData>
      );
    default:
      break;
  }
};

export const getAmpelText = (color) => {
  switch (color) {
    case "Grün":
      return "Nutzung generell möglich";
    case "Gelb":
      return "Genauere Beurteilung notwendig";
    case "Magenta":
      return "Nutzung generell nicht möglich";
    default:
      return;
  }
};

const getPostfix = (layerId) => {
  switch (layerId) {
    case 0:
      return "EWS";
    case 1:
      return "GWWP";
    default:
      return;
  }
};

const getTitle = (layerId) => {
  switch (layerId) {
    case 0:
      return "Erdwärmesonden";
    case 1:
      return "thermische Grundwassernutzung";
    default:
      return;
  }
};

export const AmpelkarteTable = ({ results, setTables, layerId }) => {
  let einschraenkungen = [];
  let hinweise = [];
  einschraenkungen_erlaeuterungen = {};

  results.forEach((result) => {
    const attributes = result.feature.attributes;
    if (result.layerId === layerId) {
      if (attributes[prefixes[layerId] + "Anzeige"] === "Ampelkarte") {
        einschraenkungen.push(
          <TableRow key={attributes[prefixes[layerId] + "OBJECTID"]}>
            {getEinschraenkung(attributes, prefixes[layerId])}
            <TableData textAlign={"center"}>
              {getAmpelText(
                attributes[prefixes[layerId] + getPostfix(layerId)]
              )}
            </TableData>
          </TableRow>
        );
      } else {
        hinweise.push(
          <TableRow key={attributes[prefixes[layerId] + "OBJECTID"]}>
            {getHinweis(attributes, prefixes[layerId])}
          </TableRow>
        );
      }
    }
  });

  setTables(layerId, einschraenkungen.length > 0, hinweise.length > 0);

  return (
    <>
      {hinweise.length > 0 && (
        <CollapsibleSection title={"Hinweise " + getTitle(layerId)}>
          <Table id={"hinweise-" + layerId + "-table"}>
            <thead>
              <tr>
                <td></td>
              </tr>
            </thead>
            <tbody>{hinweise}</tbody>
          </Table>
          <Placeholder></Placeholder>
        </CollapsibleSection>
      )}
      {einschraenkungen.length > 0 && (
        <CollapsibleSection title={"Einschränkungen " + getTitle(layerId)}>
          <Table id={"einschraenkungen-" + layerId + "-table"}>
            <thead>
              <tr>
                <td colSpan={2}></td>
              </tr>
            </thead>
            <tbody>{einschraenkungen}</tbody>
            <tbody>
              {Object.keys(einschraenkungen_erlaeuterungen).length > 0 &&
                Object.keys(einschraenkungen_erlaeuterungen).map(
                  (key, index) => {
                    return (
                      <TableRow key={key}>
                        <TableData colSpan={2}>
                          {index + 1}: {einschraenkungen_erlaeuterungen[key]}
                        </TableData>
                      </TableRow>
                    );
                  }
                )}
            </tbody>
          </Table>
          <Placeholder></Placeholder>
        </CollapsibleSection>
      )}
    </>
  );
};
