import React from "react";
import { einschraenkungen, hinweise } from "../Beschreibungen";

import { TableHeader, TableRow, TableData } from "./CommonStyledElements";

let einschraenkungen_erlaeuterungen = [];

const getEinschraenkung = (attributes) => {
  switch (attributes["Parameter"]) {
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
          {attributes["KATEGORIE"]}
          <sup>{Object.keys(einschraenkungen_erlaeuterungen).length}</sup>
        </TableData>
      );
    case "Wasserschutz- und Schongebiete":
      return <TableData>{attributes["KATEGORIE"]}</TableData>;
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

const getHinweis = (attributes) => {
  switch (attributes["Parameter"]) {
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
          {hinweise.Grundwasserchemismus[attributes["KATEGORIE"]]}
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
    if (attributes["Anzeige"] === "Ampelkarte") {
      switch (result.layerId) {
        case 0:
          einschraenkungenGWWP.push(
            <TableRow key={attributes["FID"]}>
              {getEinschraenkung(attributes)}
              <TableData textAlign={"center"}>
                {getAmpelText(attributes["GWWP"])}
              </TableData>
            </TableRow>
          );
          break;
        case 1:
          einschraenkungenEWS.push(
            <TableRow key={attributes["FID"]}>
              {getEinschraenkung(attributes)}
              <TableData textAlign={"center"}>
                {getAmpelText(attributes["EWS"])}
              </TableData>
            </TableRow>
          );
          break;
        default:
          break;
      }
    } else {
      switch (result.layerId) {
        case 0:
          hinweiseGWWP.push(
            <TableRow key={attributes["FID"]}>
              {getHinweis(attributes)}
            </TableRow>
          );
          break;
        case 1:
          hinweiseEWS.push(
            <TableRow key={attributes["FID"]}>
              {getHinweis(attributes)}
            </TableRow>
          );
          break;
        default:
          break;
      }
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
        <table id="hinweise-ews-table">
          <thead>
            <tr>
              <TableHeader>Hinweise Erdwärmesonden</TableHeader>
            </tr>
          </thead>
          <tbody>{hinweiseEWS}</tbody>
        </table>
      )}
      {hinweiseGWWP.length > 0 && (
        <table id="hinweise-gwwp-table">
          <thead>
            <tr>
              <TableHeader>Hinweise thermische Grundwassernutzung</TableHeader>
            </tr>
          </thead>
          <tbody>{hinweiseGWWP}</tbody>
        </table>
      )}
      {einschraenkungenEWS.length > 0 && (
        <table id="einschraenkungen-ews-table">
          <thead>
            <tr>
              <TableHeader colSpan={2}>
                Einschränkungen Erdwärmesonden
              </TableHeader>
            </tr>
          </thead>
          <tbody>{einschraenkungenEWS}</tbody>
        </table>
      )}
      {einschraenkungenGWWP.length > 0 && (
        <table id="einschraenkungen-gwwp-table">
          <thead>
            <tr>
              <TableHeader colSpan={2}>
                Einschränkungen thermische Grundwassernutzung
              </TableHeader>
            </tr>
          </thead>
          <tbody>{einschraenkungenGWWP}</tbody>
        </table>
      )}
      {Object.keys(einschraenkungen_erlaeuterungen).length > 0 && (
        <table id="erlaeuterungen-table">
          <thead>
            <tr>
              <TableHeader>Erläuterungen zu den Einschränkungen</TableHeader>
            </tr>
          </thead>
          <tbody>
            {Object.keys(einschraenkungen_erlaeuterungen).map((key, index) => {
              return (
                <TableRow key={key}>
                  <TableData>
                    {index + 1}: {einschraenkungen_erlaeuterungen[key]}
                  </TableData>
                </TableRow>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
};
