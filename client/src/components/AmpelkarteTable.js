import React from "react";

import { einschraenkungen, hinweise } from "../assets/Beschreibungen";
import { TableRow, TableData, Placeholder } from "./CommonStyledElements";
import CollapsibleSection from "./CollapsibleSection";

const prefixEWS = "main_og_ampelkarte_ews_wien.";
const prefixGWWP = "main_og_ampelkarte_gwp_wien.";
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

export const AmpelkarteTable = ({ results, setTablesAdded }) => {
  let einschraenkungenEWS = [];
  let einschraenkungenGWWP = [];
  let hinweiseEWS = [];
  let hinweiseGWWP = [];
  einschraenkungen_erlaeuterungen = {};

  results.forEach((result) => {
    const attributes = result.feature.attributes;
    switch (result.layerId) {
      case 0:
        if (attributes[prefixEWS + "Anzeige"] === "Ampelkarte") {
          einschraenkungenEWS.push(
            <TableRow key={attributes[prefixEWS + "fid"]}>
              {getEinschraenkung(attributes, prefixEWS)}
              <TableData textAlign={"center"}>
                {getAmpelText(attributes[prefixEWS + "EWS"])}
              </TableData>
            </TableRow>
          );
        } else {
          hinweiseEWS.push(
            <TableRow key={attributes[prefixEWS + "fid"]}>
              {getHinweis(attributes, prefixEWS)}
            </TableRow>
          );
        }
        break;
      case 1:
        if (attributes[prefixGWWP + "Anzeige"] === "Ampelkarte") {
          einschraenkungenGWWP.push(
            <TableRow key={attributes[prefixGWWP + "fid"]}>
              {getEinschraenkung(attributes, prefixGWWP)}
              <TableData textAlign={"center"}>
                {getAmpelText(attributes[prefixGWWP + "GWWP"])}
              </TableData>
            </TableRow>
          );
        } else {
          hinweiseGWWP.push(
            <TableRow key={attributes[prefixGWWP + "fid"]}>
              {getHinweis(attributes, prefixGWWP)}
            </TableRow>
          );
        }
        break;
      default:
        break;
    }
  });

  setTablesAdded(
    einschraenkungenEWS.length > 0,
    einschraenkungenGWWP.length > 0,
    einschraenkungen_erlaeuterungen.length > 0,
    hinweiseEWS.length > 0,
    hinweiseGWWP.length > 0
  );

  return (
    <>
      {hinweiseEWS.length > 0 && (
        <CollapsibleSection title="Hinweise Erdwärmesonden">
          <table id="hinweise-ews-table">
            <thead>
              <tr>
                <td></td>
              </tr>
            </thead>
            <tbody>{hinweiseEWS}</tbody>
          </table>
          <Placeholder></Placeholder>
        </CollapsibleSection>
      )}
      {einschraenkungenEWS.length > 0 && (
        <CollapsibleSection title="Einschränkungen Erdwärmesonden">
          <table id="einschraenkungen-ews-table">
            <thead>
              <tr>
                <td colSpan={2}></td>
              </tr>
            </thead>
            <tbody>{einschraenkungenEWS}</tbody>
          </table>
          <Placeholder></Placeholder>
        </CollapsibleSection>
      )}
      {hinweiseGWWP.length > 0 && (
        <CollapsibleSection title="Hinweise thermische Grundwassernutzung">
          <table id="hinweise-gwwp-table">
            <thead>
              <tr>
                <td></td>
              </tr>
            </thead>
            <tbody>{hinweiseGWWP}</tbody>
          </table>
          <Placeholder></Placeholder>
        </CollapsibleSection>
      )}
      {einschraenkungenGWWP.length > 0 && (
        <CollapsibleSection title="Einschränkungen thermische Grundwassernutzung">
          <table id="einschraenkungen-gwwp-table">
            <thead>
              <tr>
                <td colSpan={2}></td>
              </tr>
            </thead>
            <tbody>{einschraenkungenGWWP}</tbody>
          </table>
          <Placeholder></Placeholder>
        </CollapsibleSection>
      )}
      {Object.keys(einschraenkungen_erlaeuterungen).length > 0 && (
        <CollapsibleSection title="Erläuterungen zu den Einschränkungen">
          <table id="erlaeuterungen-table">
            <thead>
              <tr>
                <td></td>
              </tr>
            </thead>
            <tbody>
              {Object.keys(einschraenkungen_erlaeuterungen).map(
                (key, index) => {
                  return (
                    <TableRow key={key}>
                      <TableData>
                        {index + 1}: {einschraenkungen_erlaeuterungen[key]}
                      </TableData>
                    </TableRow>
                  );
                }
              )}
            </tbody>
          </table>
          <Placeholder></Placeholder>
        </CollapsibleSection>
      )}
    </>
  );
};
