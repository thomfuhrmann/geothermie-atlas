import React, { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";
import styled from "styled-components";

import { initializeHandlers } from "../utils/view";
import { PointQueryTable } from "./PointQueryTable";
import LoadingSpinner from "./LoadingSpinner";

import { ToolTip } from "./CommonStyledElements";

import {
  Table,
  TableRow,
  TableBody,
  TableData,
  Dot,
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
  display: flex;
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

const Heading = styled.h2`
  text-align: center;
`;

const HeadingSmall = styled.h4``;

const Screenshot = styled.img`
  width: 100%;
  height: 100%;
`;

const Error = styled.p`
  color: red;
`;

const Span = styled.span`
  padding: 10px;
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
  const [isCalculating, setIsCalculating] = useState(false);
  const [computationResults, setComputationResults] = useState(null);

  const { t } = useTranslation();

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
      setIdentifyEWS
    );
  }, []);

  const runPythonScript = (params) => {
    let url = "/api";
    url += "?" + new URLSearchParams(params).toString();
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
    const infoDiv = infoDivRef.current.cloneNode(true);
    infoDiv.style.width = "170mm";
    infoDiv.style.height = "260mm";
    infoDiv.style.fontSize = "small";
    infoDiv.className = "info-div-print";

    // remove elements not needed in pdf report
    const tooltipIcons = infoDiv.querySelectorAll('img[class*="tooltip-icon"]');
    tooltipIcons.forEach((tooltipIcon) => tooltipIcon.remove());
    infoDiv.querySelector('[class*="pdf-button-div"]').remove();
    infoDiv.querySelector('[class*="scale-alert"]') &&
      infoDiv.querySelector('[class*="scale-alert"]').remove();

    var doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    doc.html(infoDiv, {
      callback: function (doc) {
        doc.save();
      },
      x: 10,
      y: 0,
      margin: [15, 0, 20, 0],
      autoPaging: "text",
      html2canvas: {
        scale: 0.3,
      },
    });
  };

  const handleMouseOver = () => {
    const sketchTool = document.querySelector("div.esri-sketch__panel");
    sketchToolColor.current = sketchTool.style.backgroundColor;
    sketchTool.style.backgroundColor = "red";
  };

  const handleMouseOut = () => {
    document.querySelector("div.esri-sketch__panel").style.backgroundColor =
      sketchToolColor.current;
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
          <Heading>{t("info_div.title")}</Heading>
          <Screenshot src={screenshot}></Screenshot>
        </div>
      )}
      {error && (
        <div>
          <Error>{t("info_div.error")}</Error>
        </div>
      )}
      {(!scale || scale > 20000) && (
        <Error className="scale-alert">{t("info_div.scale_alert")}</Error>
      )}
      {identifyAmpelkarte && (
        <PointQueryTable
          pointQueryResult={identifyAmpelkarte}
        ></PointQueryTable>
      )}
      {identifyEWS && (
        <>
          <HeadingSmall>Erdwärmesonden</HeadingSmall>
          <Table className="ews-table">
            <TableBody>
              {identifyEWS.map((result) => {
                return (
                  <TableRow key={result.layerId}>
                    <ToolTip className="tooltip" content={""}></ToolTip>
                    <TableData>{result.layerName}</TableData>
                    <TableData>
                      {result.feature.attributes["Stretch.Pixel Value"] !==
                      "NoData"
                        ? parseFloat(
                            result.feature.attributes["Stretch.Pixel Value"]
                          ).toFixed(3)
                        : t("info_div.no_data")}
                    </TableData>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </>
      )}
      {identifyGWWP && (
        <>
          <HeadingSmall>Grundwasserwärmepumpen</HeadingSmall>
          <Table className="gwwp-table">
            <TableBody>
              {identifyGWWP.map((result) => {
                return (
                  <TableRow key={result.layerId}>
                    <ToolTip className="tooltip" content={""}></ToolTip>
                    <TableData>{result.layerName}</TableData>
                    <TableData>
                      {result.feature.attributes["Stretch.Pixel Value"] !==
                      "NoData"
                        ? parseFloat(
                            result.feature.attributes["Stretch.Pixel Value"]
                          ).toFixed(3)
                        : t("info_div.no_data")}
                    </TableData>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </>
      )}
      {isCalculating ? (
        <LoadingSpinner></LoadingSpinner>
      ) : (
        computationResults && (
          <>
            <HeadingSmall>Ergebnis der Berechnung</HeadingSmall>
            <Table className="python-output-table">
              <TableBody>
                <TableRow>
                  <TableData>Einlagezahl</TableData>
                  <TableData textAlign="center">
                    {parseInt(computationResults[0])}
                  </TableData>
                </TableRow>
                <TableRow>
                  <TableData>Sondenanzahl</TableData>
                  <TableData textAlign="center">
                    {parseInt(computationResults[12])}
                  </TableData>
                </TableRow>
                <TableRow>
                  <TableData>benötigte Fläche</TableData>
                  <TableData textAlign="center">
                    {parseInt(computationResults[14])}
                  </TableData>
                </TableRow>
                <TableRow>
                  <TableData>verfügbare Fläche</TableData>
                  <TableData textAlign="center">
                    {parseInt(computationResults[10])}
                  </TableData>
                </TableRow>
              </TableBody>
            </Table>
          </>
        )
      )}
      {identifyAmpelkarte && (
        <>
          <HeadingSmall>Anmerkungen</HeadingSmall>
          <p>
            <Dot backgroundColor="green" width="15px" height="15px"></Dot>
            <Span>Nutzung generell möglich</Span>
            <br />
            <Dot backgroundColor="yellow" width="15px" height="15px"></Dot>
            <Span>Genauere Beurteilung notwendig</Span>
            <br />
            <Dot backgroundColor="red" width="15px" height="15px"></Dot>
            <Span>Nutzung generell nicht möglich</Span>
            <br /> <br />
            EWS = Erdwärmesonde <br />
            GWWP = Grundwasserwärmepumpe <br />
          </p>
        </>
      )}
      {identifyAmpelkarte && (
        <div>
          <h4>{t("info_div.disclaimer_title")}</h4>
          <p>{t("info_div.disclaimer")}</p>
          <h4>{t("info_div.contact")}</h4>
          <p>
            {t("info_div.gba")} <br />
            {t("info_div.dep")} <br />
            Neulinggasse 38 <br />
            1030 {t("info_div.city")}
          </p>
          <PDFButtonDiv className="pdf-button-div">
            <PDFButton onClick={clickHandler}>PDF</PDFButton>
          </PDFButtonDiv>
        </div>
      )}
    </StyledInfoPanel>
  );
}
