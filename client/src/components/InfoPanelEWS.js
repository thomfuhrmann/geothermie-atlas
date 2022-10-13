import React, { useRef, useState, useEffect } from "react";
import "jspdf-autotable";
import { useDispatch, useSelector } from "react-redux";

import { updateEWSResources } from "../redux/ewsResourcesSlice";
import { updateGWWPResources } from "../redux/gwwpResourcesSlice";
import { updateAmpelkarte } from "../redux/ampelkarteSlice";
import { updateCadastralData } from "../redux/cadastreSlice";
import { updateEWSComputationResult } from "../redux/ewsComputationsSlice";
import { updateGWWPComputationResult } from "../redux/gwwpComputationsSlice";
import { updateScreenshot } from "../redux/screenshotSlice";

import { initializeInfoPanelHandlers } from "../utils/view";
import { AmpelkarteTable } from "./AmpelkarteTable";
import CollapsibleSection from "./CollapsibleSection";
import { print } from "../utils/print";

import Footer from "./Footer";
import {
  Table,
  TableRow,
  TableData,
  TableHeader,
  Placeholder,
  Underline,
  Container,
  InfoPanelContent,
  PDFButton,
  PDFButtonDiv,
  Image,
} from "./CommonStyledElements";

const textTemplates = {
  0: [
    `Die flächenspezifische Jahresenergie eines Sondenfelds mit 7 x 7 Sonden in 5 m Abstand und einer Tiefe von jeweils 100 m, das als Speicher verwendet wird (es wird eine ausgeglichene Jahresbilanz angenommen, das bedeutet, die im Winter zur Heizung entzogene Wärme wird im Sommer vollständig wieder zurückgegeben), beträgt rund `,
    " kWh/m²/a.",
  ],
  1: [
    `Die flächenspezifische Jahresenergie eines Sondenfelds mit 4 x 4 Sonden in 10 m Abstand und einer Tiefe von jeweils 100 m, das primär als Wärmequelle dient wobei ein Teil im Sommer durch Gebäudekühlung entsprechend des Bedarfs wieder regeneriert wird, 
  (der Heiz- und Kühlbedarf ist klimaabhängig von der Jahresmitteltemperatur (Normbetriebsstunden)) beträgt rund `,
    " kWh/m²/a.",
  ],
  2: [
    "Die Entzugsleistung einer 100 m tiefen Einzelsonde, die als Speicher mit einer ausgeglichenen Jahresbilanz (im Winter entzogene Wärme wird im Sommer wieder vollständig zurück gegeben) betrieben wird, beträgt am Grundstück ",
    " W/lfm.",
  ],
  3: [
    "Die Entzugsleistung einer 100 m tiefen Einzelsonde, die primär als Wärmequelle dient wobei ein Teil im Sommer durch Gebäudekühlung entsprechend des Bedarfs wieder regeneriert wird (je nach klimaabhängigen Normbetriebsstunden), beträgt am Grundstück ",
    " W/lfm.",
  ],
  4: [
    "Die mittlere jährliche Bodentemperatur beträgt laut Satellitendaten (MODIS) ",
    " °C.",
  ],
  5: [
    "Die mittlere Temperatur des Untergrunds für eine Tiefe von 0 bis 100 m beträgt ",
    " °C.",
  ],
  6: [
    "Die mittlere konduktive Wärmeleitfähigkeit des Untergrunds für eine Tiefe von 0 bis 100 m beträgt ",
    " W/m/K.",
  ],
};

export default function InfoPanelEWS() {
  const sketchToolColor = useRef(null);
  const image_bal = useRef(null);
  const image_unbal = useRef(null);

  const [address, setAddress] = useState(null);

  const resources = useSelector((store) => store.ewsResources.value);
  const ampelkarte = useSelector((store) => store.ampelkarte.value);
  const cadastralData = useSelector((store) => store.cadastre.value);
  const computationResult = useSelector((store) => store.ewsComputations.value);
  const screenshot = useSelector((store) => store.screenshot.value);

  const dispatch = useDispatch();

  // record which tables should be printed
  let [einschraenkungen, hinweise] = [false, false];

  // initialize query handlers
  useEffect(() => {
    initializeInfoPanelHandlers(setAddress, dispatch);

    return () => {
      dispatch(updateEWSResources([]));
      dispatch(updateGWWPResources([]));
      dispatch(updateCadastralData({}));
      dispatch(updateAmpelkarte([]));
      dispatch(updateGWWPComputationResult([]));
      dispatch(updateEWSComputationResult({}));
      dispatch(updateScreenshot(""));
    };
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
      return textTemplates[layerId][0] + value + textTemplates[layerId][1];
    }
  };

  const setTables = (einschraenkungenAdded, hinweiseAdded) => {
    einschraenkungen = einschraenkungenAdded;
    hinweise = hinweiseAdded;
  };

  return (
    <Container>
      <CollapsibleSection
        title={!address ? "Der Weg zu Ihrer Erdwärmesonde" : "Bericht"}
        open={true}
        marginBottom="0px"
      >
        <InfoPanelContent>
          {!address ? (
            <>
              <p>
                Zoomen Sie hinein und klicken Sie auf Ihr gewünschtes Grundstück
                um Informationen abzufragen. Sie können nun einen
                Erdwärmesondenraster zeichnen und die Berechnung starten.
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
                Optional können sie im Menü "Berechnungen" die Konfiguration der
                Erdwärmesonden verändern und gebäudespezifische Parameter
                festlegen.
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
          {Object.keys(cadastralData).length > 0 && (
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
          {resources.length > 0 && (
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
          {Object.keys(computationResult).includes("error") && (
            <CollapsibleSection title="Berechnungsergebnis">
              <Table id="calculations-output-table">
                <thead>
                  <tr>
                    <td></td>
                  </tr>
                </thead>
                <tbody>
                  <TableRow>
                    <TableHeader textAlign="center">
                      {computationResult.error}
                    </TableHeader>
                  </TableRow>
                </tbody>
              </Table>
              <Placeholder></Placeholder>
            </CollapsibleSection>
          )}
          {Object.keys(computationResult).length > 1 && (
            <CollapsibleSection title="Berechnungsergebnis">
              <Table id="calculations-output-table">
                <thead>
                  <tr>
                    <td></td>
                  </tr>
                </thead>
                <tbody>
                  <TableRow>
                    <TableHeader textAlign="center">
                      Gewählte Parameter
                    </TableHeader>
                  </TableRow>
                </tbody>
                <tbody>
                  <TableRow>
                    <TableData>
                      Sondenanzahl: {computationResult.points}
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      Sondentiefe: {computationResult.bohrtiefe} m
                    </TableData>
                  </TableRow>
                  {computationResult.BS_HZ > 0 && (
                    <TableRow>
                      <TableData>
                        Betriebsstunden Heizen: {computationResult.BS_HZ} h
                      </TableData>
                    </TableRow>
                  )}
                  {computationResult.BS_KL > 0 && (
                    <TableRow>
                      <TableData>
                        Betriebsstunden Heizen: {computationResult.BS_KL} h
                      </TableData>
                    </TableRow>
                  )}
                  {computationResult.P_HZ > 0 && (
                    <TableRow>
                      <TableData>
                        Heizleistung: {computationResult.P_HZ} kW
                      </TableData>
                    </TableRow>
                  )}
                  {computationResult.P_KL > 0 && (
                    <TableRow>
                      <TableData>
                        Kühlleistung: {computationResult.P_KL} kW
                      </TableData>
                    </TableRow>
                  )}
                </tbody>
                <tbody>
                  <TableRow>
                    <TableHeader textAlign="center">
                      Berechnungsergebnis
                    </TableHeader>
                  </TableRow>
                </tbody>
                <tbody>
                  <TableRow>
                    <TableData>
                      Heizleistung: {parseInt(computationResult.leistungHZ)} kW
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      Kühlleistung: {-parseInt(computationResult.leistungKL)} kW
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
              <Placeholder></Placeholder>
              <Image
                src={computationResult.imagehash}
                alt="Grafik mit Berechnungsergebnissen"
                ref={image_unbal}
              ></Image>
              <Placeholder></Placeholder>
            </CollapsibleSection>
          )}
          {Object.keys(computationResult).length > 1 && (
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
                  <tr>
                    <td></td>
                  </tr>
                </tbody>
                <tbody>
                  <TableRow>
                    <TableHeader textAlign="center">
                      Gewählte Parameter
                    </TableHeader>
                  </TableRow>
                </tbody>
                <tbody>
                  <TableRow>
                    <TableData>
                      Sondenanzahl: {computationResult.points}
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      Sondentiefe: {computationResult.bohrtiefe} m
                    </TableData>
                  </TableRow>
                  {computationResult.BS_HZ > 0 && (
                    <TableRow>
                      <TableData>
                        Betriebsstunden Heizen: {computationResult.BS_HZ} h
                      </TableData>
                    </TableRow>
                  )}
                  {computationResult.BS_KL > 0 && (
                    <TableRow>
                      <TableData>
                        Betriebsstunden Kühlen: {computationResult.BS_KL} h
                      </TableData>
                    </TableRow>
                  )}
                  {computationResult.P_HZ > 0 && (
                    <TableRow>
                      <TableData>
                        Heizleistung: {computationResult.P_HZ} kW
                      </TableData>
                    </TableRow>
                  )}
                  {computationResult.P_KL > 0 && (
                    <TableRow>
                      <TableData>
                        Kühlleistung: {computationResult.P_KL} kW
                      </TableData>
                    </TableRow>
                  )}
                </tbody>
                <tbody>
                  <TableRow>
                    <TableHeader textAlign="center">
                      Berechnungsergebnis
                    </TableHeader>
                  </TableRow>
                </tbody>
                <tbody>
                  <TableRow>
                    <TableData>
                      Heizleistung: {parseInt(computationResult.leistungHZ_bal)}{" "}
                      kW
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      Kühlleistung:{" "}
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
              <Placeholder></Placeholder>
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
