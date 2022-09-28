import React, { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";
import styled from "styled-components";
import "jspdf-autotable";
import { useSelector } from "react-redux";

import { initializeInfoPanelHandlers } from "../utils/view";
import { AmpelkarteTable } from "./AmpelkarteTable";
import { ews_erklaerungen, gwwp_erklaerungen } from "../assets/Beschreibungen";
import CollapsibleSection from "./CollapsibleSection";

import {
  Table,
  TableRow,
  TableData,
  TableHeader,
  Placeholder,
} from "./CommonStyledElements";

const InfoPanelContainer = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
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

const Image = styled.img`
  width: 100%;
  height: 100%;
`;

const Underline = styled.u`
  text-decoration-line: underline;
  text-decoration-style: dotted;
`;

export default function InfoPanel(props) {
  const infoDivRef = useRef(null);
  const sketchToolColor = useRef(null);
  const image_bal = useRef(null);
  const image_unbal = useRef(null);

  const [screenshot, setScreenshot] = useState(null);
  const [identifyAmpelkarte, setIdentifyAmpelkarte] = useState(null);
  const [identifyGWWP, setIdentifyGWWP] = useState(null);
  const [identifyEWS, setIdentifyEWS] = useState(null);
  const [address, setAddress] = useState(null);

  const computationResult = useSelector(
    (store) => store.computationResult.value
  );

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
    initializeInfoPanelHandlers(
      setIdentifyAmpelkarte,
      setScreenshot,
      setIdentifyGWWP,
      setIdentifyEWS,
      setAddress
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
        willDrawCell: function (data) {
          if (data.section === "head") {
            data.cell.text = "Ressourcen für Erdwärmesonden";
          }
        },
      });
    }

    finalY = doc.lastAutoTable.finalY;
    if (identifyGWWP) {
      doc.autoTable({
        html: "#gwwp-table",
        rowPageBreak: "avoid",
        startY: finalY + 10,
        willDrawCell: function (data) {
          if (data.section === "head") {
            data.cell.text = "Ressourcen für thermische Grundwassernutzung";
          }
        },
      });
    }

    finalY = doc.lastAutoTable.finalY;
    if (hinweiseEWS) {
      doc.autoTable({
        html: "#hinweise-ews-table",
        rowPageBreak: "avoid",
        startY: finalY + 10,
        willDrawCell: function (data) {
          if (data.section === "head") {
            data.cell.text = "Hinweise Erdwärmesonden";
          }
        },
      });
    }

    finalY = doc.lastAutoTable.finalY;
    if (hinweiseGWWP) {
      doc.autoTable({
        html: "#hinweise-gwwp-table",
        rowPageBreak: "avoid",
        startY: finalY + 10,
        willDrawCell: function (data) {
          if (data.section === "head") {
            data.cell.text = "Hinweise thermische Grundwassernutzung";
          }
        },
      });
    }

    finalY = doc.lastAutoTable.finalY;
    if (einschraenkungenEWS) {
      doc.autoTable({
        html: "#einschraenkungen-ews-table",
        rowPageBreak: "avoid",
        startY: finalY + 10,
        willDrawCell: function (data) {
          if (data.section === "head") {
            data.cell.text = "Einschränkungen Erdwärmesonden";
          }
        },
      });
    }

    finalY = doc.lastAutoTable.finalY;
    if (einschraenkungenGWWP) {
      doc.autoTable({
        html: "#einschraenkungen-gwwp-table",
        rowPageBreak: "avoid",
        startY: finalY + 10,
        willDrawCell: function (data) {
          if (data.section === "head") {
            data.cell.text = "Einschränkungen thermische Grundwassernutzung";
          }
        },
      });
    }

    finalY = doc.lastAutoTable.finalY;
    if (erlaeuterungen) {
      doc.autoTable({
        html: "#erlaeuterungen-table",
        rowPageBreak: "avoid",
        startY: finalY + 10,
        willDrawCell: function (data) {
          if (data.section === "head") {
            data.cell.text = "Erläuterungen zu den Einschränkungen";
          }
        },
      });
    }

    finalY = doc.lastAutoTable.finalY;
    if (Object.keys(computationResult).length !== 0) {
      doc.autoTable({
        html: "#calculations-output-table",
        rowPageBreak: "avoid",
        startY: finalY + 10,
        willDrawCell: function (data) {
          if (data.section === "head") {
            data.cell.text = "Berechnungsergebnis für Erdwärmesonden";
          }
        },
      });
    }

    finalY = doc.lastAutoTable.finalY;
    let height = 0;
    if (Object.keys(computationResult).length !== 0) {
      const imgProps = doc.getImageProperties(image_unbal.current);
      const width = doc.internal.pageSize.getWidth() - 40;
      const totalHeight = doc.internal.pageSize.getHeight();
      height = (imgProps.height * width) / imgProps.width;
      if (height > totalHeight - finalY) {
        doc.addPage();
        doc.addImage(image_unbal.current, "PNG", 20, 20, width, height);
      } else {
        doc.addImage(image_unbal.current, "PNG", 20, finalY, width, height);
      }
    }

    finalY = doc.lastAutoTable.finalY;
    if (Object.keys(computationResult).length !== 0) {
      doc.autoTable({
        html: "#calculations-bal-output-table",
        rowPageBreak: "avoid",
        startY: finalY + height + 10,
        willDrawCell: function (data) {
          if (data.section === "head") {
            data.cell.text =
              "Berechnungsergebnis für Erdwärmesonden (bilanzierter Betrieb)";
          }
        },
      });
    }

    finalY = doc.lastAutoTable.finalY;
    height = 0;
    if (Object.keys(computationResult).length !== 0) {
      const imgProps = doc.getImageProperties(image_bal.current);
      const width = doc.internal.pageSize.getWidth() - 40;
      const totalHeight = doc.internal.pageSize.getHeight();
      height = (imgProps.height * width) / imgProps.width;
      if (height > totalHeight - finalY) {
        doc.addPage();
        doc.addImage(image_bal.current, "PNG", 20, 20, width, height);
      } else {
        doc.addImage(image_bal.current, "PNG", 20, finalY, width, height);
      }
    }

    finalY = doc.lastAutoTable.finalY;
    doc.autoTable({
      html: "#disclaimer",
      rowPageBreak: "avoid",
      startY: finalY + height + 10,
      willDrawCell: function (data) {
        if (data.section === "head") {
          data.cell.text = "Haftungsausschluss";
        }
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
        if (data.section === "head") {
          data.cell.text = "Kontakt";
        }
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
    sketchTool.style.backgroundColor = "#ffdc01";
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
    <InfoPanelContainer ref={infoDivRef}>
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
          <Image src={screenshot} id="screenshot"></Image>
        </div>
      )}
      {address && address.length > 0 && (
        <>
          <table id="address-table">
            <tbody>
              <tr>
                <td>
                  {address[0]}
                  <br></br>
                  {address[1]} {address[3]}
                </td>
              </tr>
            </tbody>
          </table>
          <Placeholder></Placeholder>
        </>
      )}
      {identifyEWS && (
        <CollapsibleSection title="Ressourcen für Erdwärmesonden">
          <table id="ews-table">
            <thead>
              <tr>
                <td></td>
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
          <Placeholder></Placeholder>
        </CollapsibleSection>
      )}
      {identifyGWWP && (
        <CollapsibleSection title="Ressourcen für thermische Grundwassernutzung">
          <table id="gwwp-table">
            <thead>
              <tr>
                <td></td>
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
          <Placeholder></Placeholder>
        </CollapsibleSection>
      )}
      {identifyAmpelkarte && (
        <AmpelkarteTable
          results={identifyAmpelkarte}
          setTablesAdded={setTablesAdded}
        ></AmpelkarteTable>
      )}
      {Object.keys(computationResult).length !== 0 && (
        <CollapsibleSection title="Berechnungsergebnis für Erdwärmesonden">
          <Table id="calculations-output-table">
            <thead>
              <tr>
                <TableHeader></TableHeader>
              </tr>
            </thead>
            <tbody>
              <TableRow>
                <TableData>Katastralgemeinde: {computationResult.KG}</TableData>
              </TableRow>
              <TableRow>
                <TableData>
                  Grundstücksnummer: {computationResult.GNR}
                </TableData>
              </TableRow>
              <TableRow>
                <TableData>
                  Sondenanzahl: {computationResult.gridPoints}
                </TableData>
              </TableRow>
              <TableRow>
                <TableData>
                  Sondentiefe: {computationResult.bohrtiefe} m
                </TableData>
              </TableRow>
              <TableRow>
                <TableData>
                  Leistung Heizen: {parseInt(computationResult.leistungHZ)} kW
                </TableData>
              </TableRow>
              <TableRow>
                <TableData>
                  Leistung Kühlen: {-parseInt(computationResult.leistungKL)} kW
                </TableData>
              </TableRow>
              <TableRow>
                <TableData>
                  Jahresenergiemenge Heizen:{" "}
                  {parseInt(computationResult.jahresEnergieMengeHZ)} kWh/a
                </TableData>
              </TableRow>
              <TableRow>
                <TableData>
                  Jahresenergiemenge Kühlen:{" "}
                  {-parseInt(computationResult.jahresEnergieMengeKL)} kWh/a
                </TableData>
              </TableRow>
              {computationResult.cover > 0 && (
                <TableRow>
                  <TableData>
                    Deckungsgrad: {parseInt(computationResult.cover)} %
                  </TableData>
                </TableRow>
              )}
            </tbody>
          </Table>
          <Image
            src={computationResult.imagehash}
            alt="Grafik mit Berechnungsergebnissen"
            ref={image_unbal}
          ></Image>
          <Placeholder></Placeholder>
        </CollapsibleSection>
      )}
      {Object.keys(computationResult).length !== 0 && (
        <CollapsibleSection title="Berechnungsergebnis für Erdwärmesonden (bilanzierter Betrieb)">
          <Table id="calculations-bal-output-table">
            <thead>
              <tr>
                <td></td>
              </tr>
            </thead>
            <tbody>
              <TableRow>
                <TableData>
                  Für einen bilanzierten Betrieb muss eine zusätzliche Quelle
                  mit {parseInt(computationResult.differenz_PKL)} W/m über einen
                  Zeitraum von {computationResult.differenz_BS_KL} Stunden
                  betrieben werden. Bei bilanziertem Betrieb kann der
                  Sondenabstand auf bis zu 5 Meter reduziert werden.
                </TableData>
              </TableRow>
              <TableRow>
                <TableData>Katastralgemeinde: {computationResult.KG}</TableData>
              </TableRow>
              <TableRow>
                <TableData>
                  Grundstücksnummer: {computationResult.GNR}
                </TableData>
              </TableRow>
              <TableRow>
                <TableData>
                  Sondenanzahl: {computationResult.gridPoints}
                </TableData>
              </TableRow>
              <TableRow>
                <TableData>
                  Sondentiefe: {computationResult.bohrtiefe} m
                </TableData>
              </TableRow>
              <TableRow>
                <TableData>
                  Leistung Heizen: {parseInt(computationResult.leistungHZ_bal)}{" "}
                  kW
                </TableData>
              </TableRow>
              <TableRow>
                <TableData>
                  Leistung Kühlen: {-parseInt(computationResult.leistungKL_bal)}{" "}
                  kW
                </TableData>
              </TableRow>
              <TableRow>
                <TableData>
                  Jahresenergiemenge Heizen:{" "}
                  {parseInt(computationResult.jahresEnergieMengeHZ_bal)} kWh/a
                </TableData>
              </TableRow>
              <TableRow>
                <TableData>
                  Jahresenergiemenge Kühlen:{" "}
                  {-parseInt(computationResult.jahresEnergieMengeKL_bal)} kWh/a
                </TableData>
              </TableRow>
            </tbody>
          </Table>
          <Image
            src={computationResult.imagehash_bal}
            alt="Grafik mit bilanzierten Berechnungsergebnissen"
            ref={image_bal}
          ></Image>
          <Placeholder></Placeholder>
        </CollapsibleSection>
      )}
      {identifyAmpelkarte && (
        <>
          <CollapsibleSection title="Haftungsausschluss">
            <table id="disclaimer">
              <thead>
                <tr>
                  <td></td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{t("info_div.disclaimer")}</td>
                </tr>
              </tbody>
            </table>
            <Placeholder></Placeholder>
          </CollapsibleSection>
          <CollapsibleSection title="Kontakt">
            <table id="contact">
              <thead>
                <tr>
                  <td></td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    office@geologie.ac.at<br></br>
                    Geologische Bundesanstalt<br></br>
                    Fachbereich Hydrogeologie und Geothermie<br></br>
                    Neulinggasse 38<br></br>
                    1030 Wien
                  </td>
                </tr>
              </tbody>
            </table>
          </CollapsibleSection>
        </>
      )}
    </InfoPanelContainer>
  );
}
