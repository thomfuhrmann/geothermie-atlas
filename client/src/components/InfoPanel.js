import React, { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";
import styled from "styled-components";
import "jspdf-autotable";

import { initializeHandlers } from "../utils/view";
import { AmpelkarteTable } from "./AmpelkarteTable";
import LoadingSpinner from "./LoadingSpinner";
import { ews_erklaerungen, gwwp_erklaerungen } from "../Beschreibungen";

import {
  Table,
  TableRow,
  TableData,
  TableHeader,
} from "./CommonStyledElements";

const StyledInfoPanel = styled.div`
  position: absolute;
  top: 30px;
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

  const [error, setError] = useState(false);
  const [scale, setScale] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [identifyAmpelkarte, setIdentifyAmpelkarte] = useState(null);
  const [identifyGWWP, setIdentifyGWWP] = useState(null);
  const [identifyEWS, setIdentifyEWS] = useState(null);
  const [identifyBetriebsstunden, setIdentifyBetriebsstunden] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [computationResults, setComputationResults] = useState(null);
  const [address, setAddress] = useState(null);
  const [cadastralData, setCadastralData] = useState(null);
  const [probeheads, setProbeheads] = useState(null);

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
    initializeHandlers(
      setIdentifyAmpelkarte,
      setError,
      setScale,
      setScreenshot,
      runPythonScript,
      setIsCalculating,
      setIdentifyGWWP,
      setIdentifyEWS,
      setIdentifyBetriebsstunden,
      setAddress
    );
  }, []);

  const runPythonScript = ({
    KG,
    GNR,
    EZ,
    FF,
    BT,
    GT,
    WLF,
    BS_HZ_Norm,
    BS_KL_Norm,
    drawnProbeheads,
  }) => {
    setCadastralData({ KG, GNR, EZ });
    setProbeheads(drawnProbeheads);
    let url = "/api";
    url +=
      "?" +
      new URLSearchParams({
        EZ,
        BT,
        GT,
        WLF,
        BS_HZ_Norm,
        BS_KL_Norm,
        FF,
      }).toString();
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setComputationResults(data);
        setIsCalculating(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // event handler for PDF button
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
    if (computationResults) {
      doc.autoTable({
        html: "#python-output-table",
        rowPageBreak: "avoid",
        startY: finalY + 10,
      });
    }

    finalY = doc.lastAutoTable.finalY;
    doc.autoTable({
      html: "#disclaimer",
      rowPageBreak: "avoid",
      startY: finalY + 10,
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

  // mouse over and out events to highlight sketch tool
  const handleMouseOver = () => {
    const sketchTool = document.querySelector("div.esri-sketch__panel");
    sketchToolColor.current = sketchTool.style.backgroundColor;
    sketchTool.style.backgroundColor = "red";
  };

  const handleMouseOut = () => {
    document.querySelector("div.esri-sketch__panel").style.backgroundColor =
      sketchToolColor.current;
  };

  // format values according to requirements
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

  // calculate values for EWS
  let leistung = 0;
  if (computationResults) {
    if (probeheads > 0) {
      leistung = parseInt(
        parseFloat(probeheads * 100 * parseFloat(computationResults[15])) / 1000
      );
    } else {
      leistung = parseInt(
        parseFloat(
          computationResults[17] * 100 * parseFloat(computationResults[15])
        ) / 1000
      );
    }
  }

  let jahresenergiemenge = 0;
  if (identifyBetriebsstunden) {
    identifyBetriebsstunden.forEach((result) => {
      jahresenergiemenge +=
        parseInt(result.feature.attributes["Pixel Value"]) * leistung;
    });
  }

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
      {isCalculating && <LoadingSpinner></LoadingSpinner>}
      {error && (
        <div>
          <Error>{t("info_div.error")}</Error>
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
      {computationResults && (
        <Table id="python-output-table">
          <thead>
            <tr>
              <TableHeader>
                Berechnungsergebnisse für Erdwärmesonden
              </TableHeader>
            </tr>
          </thead>
          <tbody>
            <TableRow>
              <TableData>Katastralgemeinde: {cadastralData.KG}</TableData>
            </TableRow>
            <TableRow>
              <TableData>Grundstücksnummer: {cadastralData.GNR}</TableData>
            </TableRow>
            <TableRow>
              <TableData>
                verfügbare Fläche: {parseInt(computationResults[10])} m
                <sup>2</sup>
              </TableData>
            </TableRow>
            <TableRow>
              <TableData>
                Sondenanzahl:{" "}
                {probeheads > 0 ? probeheads : parseInt(computationResults[17])}
              </TableData>
            </TableRow>
            <TableRow>
              <TableData>Leistung: {leistung} kW</TableData>
            </TableRow>
            <TableRow>
              <TableData>
                Jahresenergiemenge: {jahresenergiemenge} kWh/a
              </TableData>
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
