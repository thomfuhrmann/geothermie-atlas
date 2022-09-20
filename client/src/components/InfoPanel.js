import React, { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";
import styled from "styled-components";
import "jspdf-autotable";

import { useSelector } from "react-redux";

import { initializeInfoPanel } from "../utils/view";
import { AmpelkarteTable } from "./AmpelkarteTable";
import { ews_erklaerungen, gwwp_erklaerungen } from "../Beschreibungen";

import {
  Table,
  TableRow,
  TableData,
  TableHeader,
} from "./CommonStyledElements";

const StyledInfoPanel = styled.div`
  position: absolute;
  top: 15px;
  right: 30px;
  width: 20%;
  height: auto;
  max-height: 90%;
  overflow-y: auto;
  overflow-x: auto;
  padding: 10px 30px 30px;
  color: #444444;
  background-color: white;
`;

const PDFButtonDiv = styled.div`
  float: right;
  justify-content: center;
`;

const PDFButton = styled.button`
  color: white;
  background-color: #9c4b4b;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #9c0d0d;
    transition: 0.7s;
  }
`;

const Screenshot = styled.img`
  width: 100%;
  height: 100%;
`;

const Error = styled.p`
  color: red;
`;

const Underline = styled.u`
  text-decoration-line: underline;
  text-decoration-style: dotted;
`;

export default function InfoPanel(props) {
  const infoDivRef = useRef(null);
  const sketchToolColor = useRef(null);

  const [scale, setScale] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [identifyAmpelkarte, setIdentifyAmpelkarte] = useState(null);
  const [identifyGWWP, setIdentifyGWWP] = useState(null);
  const [identifyEWS, setIdentifyEWS] = useState(null);
  const [address, setAddress] = useState(null);

  const computationResult = useSelector(store => store.computationResult.value);

  const { t } = useTranslation();

  let [
    einschraenkungenEWS,
    einschraenkungenGWWP,
    erlaeuterungen,
    hinweiseEWS,
    hinweiseGWWP,
  ] = [false, false, false, false, false];

  // initialize query handlers
  useEffect(() => {
    initializeInfoPanel(
      setIdentifyAmpelkarte,
      setScale,
      setScreenshot,
      setIdentifyGWWP,
      setIdentifyEWS,
      setAddress,
    );
  }, []);

  // print pdf report
  const clickHandler = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    let today = new Date().toLocaleDateString();
    doc.setFontSize(8);
    doc.text("erstellt am " + today, 190, 10, { align: "right" });
    doc.setFontSize(14);
    doc.text("Standortbasierter Bericht", 105, 20, {
      align: "center",
    });

    doc.addImage(screenshot, "PNG", 20, 30, 170, 85);

    if (address) {
      doc.autoTable({
        html: "#address-table",
        rowPageBreak: "avoid",
        startY: 120,
        styles: { halign: "center" },
        willDrawCell: function (data) {
          if (data.section === "body") {
            doc.setFillColor(255, 255, 255);
          }
        },
      });
    }

    let finalY = doc.lastAutoTable.finalY;
    if (identifyEWS) {
      doc.autoTable({
        html: "#ews-table",
        rowPageBreak: "avoid",
        startY: finalY + 10,
      });
    }

    finalY = doc.lastAutoTable.finalY;
    if (identifyGWWP) {
      doc.autoTable({
        html: "#gwwp-table",
        rowPageBreak: "avoid",
        startY: finalY + 10,
      });
    }

    finalY = doc.lastAutoTable.finalY;
    if (hinweiseEWS) {
      doc.autoTable({
        html: "#hinweise-ews-table",
        rowPageBreak: "avoid",
        startY: finalY + 10,
      });
    }

    finalY = doc.lastAutoTable.finalY;
    if (hinweiseGWWP) {
      doc.autoTable({
        html: "#hinweise-gwwp-table",
        rowPageBreak: "avoid",
        startY: finalY + 10,
      });
    }

    finalY = doc.lastAutoTable.finalY;
    if (einschraenkungenEWS) {
      doc.autoTable({
        html: "#einschraenkungen-ews-table",
        rowPageBreak: "avoid",
        startY: finalY + 10,
      });
    }

    finalY = doc.lastAutoTable.finalY;
    if (einschraenkungenGWWP) {
      doc.autoTable({
        html: "#einschraenkungen-gwwp-table",
        rowPageBreak: "avoid",
        startY: finalY + 10,
      });
    }

    finalY = doc.lastAutoTable.finalY;
    if (erlaeuterungen) {
      doc.autoTable({
        html: "#erlaeuterungen-table",
        rowPageBreak: "avoid",
        startY: finalY + 10,
      });
    }

    finalY = doc.lastAutoTable.finalY;
    if (Object.keys(computationResult).length !== 0) {
      doc.autoTable({
        html: "#gesamtpotential-table",
        rowPageBreak: "avoid",
        startY: finalY + 10,
      });
    }

    finalY = doc.lastAutoTable.finalY;
    if (Object.keys(computationResult).length !== 0 && computationResult.sondenleistung !== 0) {
      doc.autoTable({
        html: "#gebaeude-dimensionierung-table",
        rowPageBreak: "avoid",
        startY: finalY + 10,
      });
    }

    finalY = doc.lastAutoTable.finalY;
    doc.autoTable({
      html: "#disclaimer",
      rowPageBreak: "avoid",
      startY: finalY + 10,
      willDrawCell: function (data) {
        if (data.section === "body") {
          doc.setFillColor(255, 255, 255);
        }
      },
    });

    finalY = doc.lastAutoTable.finalY;
    doc.autoTable({
      html: "#contact",
      rowPageBreak: "avoid",
      startY: finalY + 10,
      willDrawCell: function (data) {
        if (data.section === "body") {
          doc.setFillColor(255, 255, 255);
        }
      },
    });

    doc.save("Bericht.pdf");
  };

  // mouse over event to highlight sketch tool
  const handleMouseOver = () => {
    const sketchTool = document.querySelector("div.esri-sketch__panel");
    sketchToolColor.current = sketchTool.style.backgroundColor;
    sketchTool.style.backgroundColor = "red";
  };

  // mouse out event to de-highlight sketch tool
  const handleMouseOut = () => {
    document.querySelector("div.esri-sketch__panel").style.backgroundColor =
      sketchToolColor.current;
  };

  // format values
  const formatEWS = (layerId, layerName, value) => {
    if (value !== "NoData") {
      if ([4, 5, 6].includes(layerId)) {
        value = parseFloat(value).toFixed(1);
      } else {
        value = parseFloat(value).toFixed(0);
      }
    }

    if (value === "NoData") {
      return layerName + ": " + t("info_div.no_data");
    } else {
      return (
        ews_erklaerungen[layerId][0] + value + ews_erklaerungen[layerId][1]
      );
    }
  };

  // format values
  const formatGWWP = (layerId, layerName, value) => {
    if (value !== "NoData") {
      if ([5, 6, 7].includes(layerId)) {
        value = parseFloat(value).toFixed(1);
      } else if (layerId === 4) {
        value = parseFloat(value).toFixed(4);
      } else {
        value = parseFloat(value).toFixed(0);
      }
    }

    if (value === "NoData") {
      return layerName + ": " + t("info_div.no_data");
    } else {
      return (
        gwwp_erklaerungen[layerId][0] + value + gwwp_erklaerungen[layerId][1]
      );
    }
  };

  const setTablesAdded = (
    einschraenkungenEWSAdded,
    einschraenkungenGWWPAdded,
    erlaeuterungenAdded,
    hinweiseEWSAdded,
    hinweiseGWWPAdded
  ) => {
    einschraenkungenEWS = einschraenkungenEWSAdded;
    einschraenkungenGWWP = einschraenkungenGWWPAdded;
    erlaeuterungen = erlaeuterungenAdded;
    hinweiseEWS = hinweiseEWSAdded;
    hinweiseGWWP = hinweiseGWWPAdded;
  };

  return (
    <StyledInfoPanel ref={infoDivRef}>
      {!identifyAmpelkarte ? (
        <div>
          <p>{t("info_div.instruction_click")}</p>
          <p>
            {t("info_div.instruction_polyline_first")}{" "}
            <span onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
              <Underline>{t("info_div.instruction_polyline_middle")}</Underline>
            </span>
            {t("info_div.instruction_polyline_last")}
          </p>
        </div>
      ) : (
        <div>
          <h3>
            {t("info_div.title")}{" "}
            <PDFButtonDiv className="pdf-button-div">
              <PDFButton onClick={clickHandler}>PDF erstellen</PDFButton>
            </PDFButtonDiv>
          </h3>
          <Screenshot src={screenshot} id="screenshot"></Screenshot>
        </div>
      )}
      {(!scale || scale > 20000) && (
        <Error className="scale-alert">{t("info_div.scale_alert")}</Error>
      )}
      {address && address.length > 0 && (
        <table id="address-table">
          <tbody>
            <tr>
              <td style={{ textAlign: "center" }}>{address[0]}</td>
            </tr>
            <tr>
              <td>
                {address[1]} {address[3]}
              </td>
            </tr>
          </tbody>
        </table>
      )}
      {identifyEWS && (
        <table id="ews-table">
          <thead>
            <tr>
              <TableHeader>Ressourcen für Erdwärmesonden</TableHeader>
            </tr>
          </thead>
          <tbody>
            {identifyEWS.map((result) => {
              return (
                <TableRow key={result.layerId}>
                  <TableData>
                    {formatEWS(
                      result.layerId,
                      result.layerName,
                      result.feature.attributes["Pixel Value"]
                    )}
                  </TableData>
                </TableRow>
              );
            })}
          </tbody>
        </table>
      )}
      {identifyGWWP && (
        <table id="gwwp-table">
          <thead>
            <tr>
              <TableHeader>
                Ressourcen für thermische Grundwassernutzung
              </TableHeader>
            </tr>
          </thead>
          <tbody>
            {identifyGWWP.map((result) => {
              return (
                <TableRow key={result.layerId}>
                  <TableData>
                    {formatGWWP(
                      result.layerId,
                      result.layerName,
                      result.feature.attributes["Pixel Value"]
                    )}
                  </TableData>
                </TableRow>
              );
            })}
          </tbody>
        </table>
      )}
      {identifyAmpelkarte && (
        <AmpelkarteTable
          results={identifyAmpelkarte}
          setTablesAdded={setTablesAdded}
        ></AmpelkarteTable>
      )}
      {Object.keys(computationResult).length !== 0 && (
        <Table id="gesamtpotential-table">
          <thead>
            <tr>
              <TableHeader>
                Gesamtpotential für Erdwärmesonden
              </TableHeader>
            </tr>
          </thead>
          <tbody>
            <TableRow>
              <TableData>Katastralgemeinde: {computationResult.KG}</TableData>
            </TableRow>
            <TableRow>
              <TableData>Grundstücksnummer: {computationResult.GNR}</TableData>
            </TableRow>
            <TableRow>
              <TableData>
                verfügbare Fläche: {computationResult.FF} m
                <sup>2</sup>
              </TableData>
            </TableRow>
            <TableRow>
              <TableData>
                Sondenanzahl:{" "}
                {computationResult.gridPoints}
              </TableData>
            </TableRow>
            <TableRow>
              <TableData>Sondentiefe: {computationResult.bohrtiefe} m</TableData>
            </TableRow>
            <TableRow>
              <TableData>Leistung: {computationResult && parseInt(computationResult.leistung)} kW</TableData>
            </TableRow>
            <TableRow>
              <TableData>
                Jahresenergiemenge Kühlen: {computationResult && parseInt(computationResult.jahresEnergieMengeKuehlen)} kWh/a
              </TableData>
            </TableRow>
            <TableRow>
              <TableData>
                Jahresenergiemenge Heizen: {computationResult && parseInt(computationResult.jahresEnergieMengeHeizen)} kWh/a
              </TableData>
            </TableRow>
          </tbody>
        </Table>
      )}
      {Object.keys(computationResult).length !== 0 && computationResult.sondenleistung !== 0 && (
        <Table id="gebaeude-dimensionierung-table">
          <thead>
            <tr>
              <TableHeader>
                Gebäudespezifisches Potential für Erdwärmesonden
              </TableHeader>
            </tr>
          </thead>
          <tbody>
            <TableRow>
              <TableData>Katastralgemeinde: {computationResult.KG}</TableData>
            </TableRow>
            <TableRow>
              <TableData>Grundstücksnummer: {computationResult.GNR}</TableData>
            </TableRow>
            <TableRow>
              <TableData>
                notwendige Fläche: {computationResult.flaeche} m
                <sup>2</sup>
              </TableData>
            </TableRow>
            <TableRow>
              <TableData>
                notwendige Sondenanzahl:{" "}
                {computationResult.sondenanzahl}
              </TableData>
            </TableRow>
            <TableRow>
              <TableData>notwendige Bohrmeter: {computationResult.bohrmeter} m</TableData>
            </TableRow>
            <TableRow>
              <TableData>spezifische Sondenleistung: {computationResult && parseInt(computationResult.sondenleistung)} W/m</TableData>
            </TableRow>
          </tbody>
        </Table>
      )}
      {identifyAmpelkarte && (
        <>
          <table id="disclaimer">
            <thead>
              <tr>
                <TableHeader>{t("info_div.disclaimer_title")}</TableHeader>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{t("info_div.disclaimer")}</td>
              </tr>
            </tbody>
          </table>
          <table id="contact">
            <thead>
              <tr>
                <TableHeader>Kontakt</TableHeader>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>office@geologie.ac.at</td>
              </tr>
              <tr>
                <td>{t("info_div.gba")}</td>
              </tr>
              <tr>
                <td>{t("info_div.dep")}</td>
              </tr>
              <tr>
                <td>Neulinggasse 38</td>
              </tr>
              <tr>
                <td>1030 {t("info_div.city")}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </StyledInfoPanel>
  );
}
