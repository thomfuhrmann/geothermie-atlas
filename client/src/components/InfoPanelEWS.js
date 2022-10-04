import React, { useRef, useState, useEffect } from "react";
import "jspdf-autotable";
import { useDispatch, useSelector } from "react-redux";

import { updateWithResult } from "../redux/computationResultSlice";
import { initializeInfoPanelHandlers } from "../utils/viewEWS";
import { AmpelkarteTable } from "./AmpelkarteTable";
import { ews_erklaerungen } from "../assets/Beschreibungen";
import CollapsibleSection from "./CollapsibleSection";
import { print } from "../utils/print";

import Footer from "./Footer";
import {
  Table,
  TableRow,
  TableData,
  Placeholder,
  Underline,
  Container,
  InfoPanelContent,
  PDFButton,
  PDFButtonDiv,
  Image,
} from "./CommonStyledElements";

export default function InfoPanel(props) {
  const sketchToolColor = useRef(null);
  const image_bal = useRef(null);
  const image_unbal = useRef(null);

  const [screenshot, setScreenshot] = useState(null);
  const [ampelkarte, setAmpelkarte] = useState(null);
  const [resources, setResources] = useState(null);
  const [address, setAddress] = useState(null);

  const cadastralData = useSelector((store) => store.cadastre.value);
  const computationResult = useSelector(
    (store) => store.computationResult.value
  );

  const dispatch = useDispatch();

  // record which tables should be printed
  let [einschraenkungen, hinweise] = [false, false];

  // initialize query handlers
  useEffect(() => {
    initializeInfoPanelHandlers(
      setResources,
      setAmpelkarte,
      setScreenshot,
      setAddress,
      dispatch
    );
    return () => dispatch(updateWithResult({}));
  }, [dispatch]);

  // print pdf report
  const clickHandler = () => {
    print(
      einschraenkungen,
      hinweise,
      Object.keys(computationResult).length > 0,
      screenshot,
      image_bal,
      image_unbal,
      cadastralData
    );
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
      return layerName + ": keine Daten";
    } else {
      return (
        ews_erklaerungen[layerId][0] + value + ews_erklaerungen[layerId][1]
      );
    }
  };

  const setTables = (einschraenkungenAdded, hinweiseAdded) => {
    einschraenkungen = einschraenkungenAdded;
    hinweise = hinweiseAdded;
  };

  return (
    <Container>
      <CollapsibleSection
        title={!ampelkarte ? "Erklärung" : "Bericht"}
        open={true}
        marginBottom="0px"
      >
        <InfoPanelContent>
          {!address ? (
            <>
              <p>
                Zoomen Sie hinein und klicken Sie auf Ihr gewünschtes
                Grundstück. Sie können nun einen Erdwärmesondenraster zeichnen
                und Berechnungen durchführen lassen.
              </p>
              <p>
                Benutzen Sie das{" "}
                <span onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
                  <Underline>Zeichen-Werkzeug</Underline>
                </span>{" "}
                um zusätzliche Sondenpunkte zu zeichnen oder bestehende Punkte
                zu verschieben oder zu löschen.
              </p>
              <p>
                Im Menü "Parameter" können Sie optional Parameter für
                Erdwärmesonden festlegen.
              </p>
              <p>
                Der gesetzliche Mindestabstand der Erdwärmesonden zur
                Grundstücksgrenze beträgt zwei Meter.
              </p>
            </>
          ) : (
            <>
              <h3>
                Standortbasierter Bericht{" "}
                <PDFButtonDiv className="pdf-button-div">
                  <PDFButton onClick={clickHandler}>PDF erstellen</PDFButton>
                </PDFButtonDiv>
              </h3>
              <Image src={screenshot} id="screenshot"></Image>
            </>
          )}
          {cadastralData && (
            <>
              <Table id="cadastral-data-table">
                <tbody>
                  <tr>
                    <td>
                      Katastralgemeinde: {cadastralData.KG}
                      <br></br>
                      Grundstücksnummer: {cadastralData.GNR}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </>
          )}
          {address && address.length > 0 && (
            <>
              <Table id="address-table">
                <tbody>
                  <tr>
                    <td>
                      {address[0]}
                      <br></br>
                      {address[1]} {address[3]}
                    </td>
                  </tr>
                </tbody>
              </Table>
              <Placeholder></Placeholder>
            </>
          )}
          {resources && (
            <CollapsibleSection title="Ressourcen">
              <Table id="resources-table">
                <thead>
                  <tr>
                    <td></td>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((result) => {
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
              </Table>
              <Placeholder></Placeholder>
            </CollapsibleSection>
          )}
          {ampelkarte && (
            <AmpelkarteTable
              results={ampelkarte}
              setTables={setTables}
              layerId={0}
            ></AmpelkarteTable>
          )}
          {Object.keys(computationResult).length !== 0 && (
            <CollapsibleSection title="Berechnungsergebnis">
              <Table id="calculations-output-table">
                <thead>
                  <tr>
                    <td></td>
                  </tr>
                </thead>
                <tbody>
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
                      Leistung Heizen: {parseInt(computationResult.leistungHZ)}{" "}
                      kW
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      Leistung Kühlen: {-parseInt(computationResult.leistungKL)}{" "}
                      kW
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
            <CollapsibleSection title="Berechnungsergebnis (bilanzierter Betrieb)">
              <Table id="calculations-bal-output-table">
                <thead>
                  <tr>
                    <td></td>
                  </tr>
                </thead>
                <tbody>
                  <TableRow>
                    <TableData>
                      Für einen bilanzierten Betrieb muss eine zusätzliche
                      Quelle mit {parseInt(computationResult.differenz_PKL)} W/m
                      über einen Zeitraum von{" "}
                      {computationResult.differenz_BS_KL} Stunden betrieben
                      werden. Bei bilanziertem Betrieb kann der Sondenabstand
                      auf bis zu 5 Meter reduziert werden.
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
                      Leistung Heizen:{" "}
                      {parseInt(computationResult.leistungHZ_bal)} kW
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      Leistung Kühlen:{" "}
                      {-parseInt(computationResult.leistungKL_bal)} kW
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      Jahresenergiemenge Heizen:{" "}
                      {parseInt(computationResult.jahresEnergieMengeHZ_bal)}{" "}
                      kWh/a
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      Jahresenergiemenge Kühlen:{" "}
                      {-parseInt(computationResult.jahresEnergieMengeKL_bal)}{" "}
                      kWh/a
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
          {address && <Footer></Footer>}
        </InfoPanelContent>
      </CollapsibleSection>
    </Container>
  );
}
