import React, { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";
import styled from "styled-components";

import { initializeHandlers } from "../utils/view";
import { PointQueryTable } from "./PointQueryTable";
import { TableHeading } from "./CommonStyledElements";
import LoadingSpinner from "./LoadingSpinner";

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
  height: 10%;
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

  const [pointQueryResult, setPointQueryResult] = useState(null);
  const [error, setError] = useState(false);
  const [scale, setScale] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [computationResults, setComputationResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const { t } = useTranslation();

  // initialize query handlers
  useEffect(() => {
    initializeHandlers(
      setPointQueryResult,
      setError,
      setScale,
      setScreenshot,
      runPythonScript,
      setIsCalculating
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
      margin: [20, 0, 20, 0],
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
      {!pointQueryResult ? (
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
      {pointQueryResult && (
        <PointQueryTable pointQueryResult={pointQueryResult}></PointQueryTable>
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
                  <TableHeading>Einlagezahl</TableHeading>
                  <TableData>{parseInt(computationResults[0])}</TableData>
                </TableRow>
                <TableRow>
                  <TableHeading>Sondenanzahl</TableHeading>
                  <TableData>{parseInt(computationResults[12])}</TableData>
                </TableRow>
                <TableRow>
                  <TableHeading>benötigte Fläche</TableHeading>
                  <TableData>{parseInt(computationResults[14])}</TableData>
                </TableRow>
                <TableRow>
                  <TableHeading>verfügbare Fläche</TableHeading>
                  <TableData>{parseInt(computationResults[10])}</TableData>
                </TableRow>
              </TableBody>
            </Table>
          </>
        )
      )}
      {pointQueryResult && (
        <>
          <HeadingSmall>Anmerkungen</HeadingSmall>
          <p>
            <Dot backgroundColor="green" width="15px" height="15px"></Dot>{" "}
            Nutzung generell möglich
            <br />
            <Dot backgroundColor="yellow" width="15px" height="15px"></Dot>{" "}
            Genauere Beurteilung notwendig
            <br />
            <Dot backgroundColor="red" width="15px" height="15px"></Dot> Nutzung
            generell nicht möglich
            <br /> <br />
            EWS = Erdwärmesonde <br />
            GWWP = Grundwasserwärmepumpe <br />
          </p>
        </>
      )}
      {pointQueryResult && (
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
