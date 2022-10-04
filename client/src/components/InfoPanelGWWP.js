import React, { useState, useEffect, useRef } from "react";
import "jspdf-autotable";
import { useDispatch, useSelector } from "react-redux";

import { updateAmpelkarte } from "../redux/ampelkarteSlice";
import { updateGWWPResources } from "../redux/gwwpResourcesSlice";
import { updateCadastralData } from "../redux/cadastreSlice";
import { updateGWWPComputationResult } from "../redux/gwwpComputationsSlice";
import { initializeInfoPanelHandlers } from "../utils/viewGWWP";
import { print } from "../utils/print";
import { AmpelkarteTable } from "./AmpelkarteTable";
import CollapsibleSection from "./CollapsibleSection";
import Footer from "./Footer";
import {
  Table,
  TableRow,
  TableData,
  Placeholder,
  Underline,
  Container,
  PDFButton,
  PDFButtonDiv,
  InfoPanelContent,
  Image,
} from "./CommonStyledElements";

const textTemplates = {
  0: [
    `Die flächenspezifische Jahresenergie für eine thermische Grundwassernutzung mit ausgeglichener Jahresbilanz, wobei die im Winter zur Heizung entzogene Wärme  im Sommer vollständig wieder zurückgegeben wird, 
  abhängig von der bestehenden Grundwassertemperatur und einer minimalen Rückgabetemperatur von 5 °C und einer maximalen Rückgabetemperatur von 18 °C beträgt rund `,
    " kWh/m²/a",
  ],
  1: [
    `Die flächenspezifische Jahresenergie für eine thermische Grundwassernutzung im Heiz- und Kühlbetrieb bei Normbetriebsstunden, 
  abhängig von der bestehenden Grundwassertemperatur und einer minimalen Rückgabetemperatur von 5 °C und einer maximalen Rückgabetemperatur von 18 °C beträgt rund `,
    " kWh/m²/a",
  ],
  2: [
    "Der Grundwasserspiegel ist am Grundstück in einer Tiefe von rund ",
    " m zu erwarten.",
  ],
  3: ["Das Grundwasser ist am Grundstück rund ", " m mächtig."],
  4: [
    "Die hydraulische Leitfähigkeit (kf-Wert) beträgt am Grundstück rund ",
    " m/s.",
  ],
  5: [
    "Die maximale Jahrestemperatur des Grundwassers (für das Jahr 2020) liegt bei ",
    " °C.",
  ],
  6: [
    "Die mittlere Jahrestemperatur des Grundwassers (für das Jahr 2020) liegt bei ",
    " °C.",
  ],
  7: [
    "Die minimale Jahrestemperatur des Grundwassers (für das Jahr 2020) liegt bei ",
    " °C.",
  ],
  8: [
    "Die maximale Pumpleistung eines Brunnenpaars mit 50 m Abstand zwischen Entnahme- und Rückgabebrunnen beträgt rund ",
    " l/s.",
  ],
  9: [
    "Die maximale Volllast-Leistung eines Brunnenpaars mit 50 m Abstand zwischen Entnahme- und Rückgabebrunnen beträgt rund ",
    " kW.",
  ],
};

export default function InfoPanel(props) {
  const sketchToolColor = useRef(null);
  const [screenshot, setScreenshot] = useState(null);
  const [address, setAddress] = useState(null);

  const dispatch = useDispatch();

  const cadastralData = useSelector((store) => store.cadastre.value);
  const resources = useSelector((store) => store.gwwpResources.value);
  const ampelkarte = useSelector((store) => store.ampelkarte.value);
  const computationResult = useSelector(
    (store) => store.gwwpComputations.value
  );

  // record which tables should be printed
  let [einschraenkungen, hinweise] = [false, false];

  // initialize query handlers
  useEffect(() => {
    initializeInfoPanelHandlers(setScreenshot, setAddress, dispatch);

    return () => {
      dispatch(updateCadastralData({}));
      dispatch(updateGWWPResources([]));
      dispatch(updateAmpelkarte([]));
      dispatch(updateGWWPComputationResult([]));
    };
  }, [dispatch]);

  // print pdf report
  const clickHandler = () => {
    print(
      einschraenkungen,
      hinweise,
      computationResult.length > 0,
      screenshot,
      null,
      null,
      cadastralData
    );
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
      return layerName + ": keine Daten";
    } else {
      return textTemplates[layerId][0] + value + textTemplates[layerId][1];
    }
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
                Zoomen Sie hinein und klicken Sie auf Ihr gewünschtes Grundstück
                um Informationen abzufragen. Sie können nun mit dem{" "}
                <Underline
                  onMouseOver={handleMouseOver}
                  onMouseOut={handleMouseOut}
                >
                  Zeichen-Werkzeug
                </Underline>{" "}
                zwei Punkte für ein Brunnenpaar setzen und die Berechnung
                starten.
              </p>
            </>
          ) : (
            <>
              <h3>
                Standortbasierter Bericht
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
              </Table>
              <Placeholder></Placeholder>
            </CollapsibleSection>
          )}
          {ampelkarte.length > 0 && (
            <AmpelkarteTable
              results={ampelkarte}
              setTables={setTables}
              layerId={1}
            ></AmpelkarteTable>
          )}
          {computationResult.length > 0 &&
            (computationResult.length === 1 ? (
              <CollapsibleSection title="Berechnungsergebnis">
                <Table id="calculations-output-table">
                  <thead>
                    <tr>
                      <td></td>
                    </tr>
                  </thead>
                  <tbody>
                    <TableRow>
                      <TableData>{computationResult[0]}</TableData>
                    </TableRow>
                  </tbody>
                </Table>
                <Placeholder></Placeholder>
              </CollapsibleSection>
            ) : (
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
                        Energieflächendichte im einseitigen Heizbetrieb:{" "}
                        {computationResult[0]} kWh/m²/a
                      </TableData>
                    </TableRow>
                    <TableRow>
                      <TableData>
                        Energieflächendichte im einseitigen Kühlbetrieb:{" "}
                        {computationResult[1]} kWh/m²/a
                      </TableData>
                    </TableRow>
                    <TableRow>
                      <TableData>
                        Energieflächendichte im Heiz- und Kühlbetrieb mit
                        ausgeglichener Betriebsweise: {computationResult[2]}{" "}
                        kWh/m²/a
                      </TableData>
                    </TableRow>
                    <TableRow>
                      <TableData>
                        Energieflächendichte im Heiz- und Kühlbetrieb nach
                        Energieverhältnis Heizen/Kühlen: {computationResult[3]}{" "}
                        kWh/m²/a
                      </TableData>
                    </TableRow>
                    <TableRow>
                      <TableData>
                        Leistung einer Brunnendublette mit 2R Brunnenabstand:{" "}
                        {computationResult[4]} l/s
                      </TableData>
                    </TableRow>
                    <TableRow>
                      <TableData>
                        Leistung einer Brunnendublette mit 2R Brunnenabstand:{" "}
                        {computationResult[5]} kW
                      </TableData>
                    </TableRow>
                    {computationResult[6] !== "-1" && (
                      <TableRow>
                        <TableData>
                          Deckungsbeitrag der Leistung: {computationResult[6]} %
                        </TableData>
                      </TableRow>
                    )}
                    {computationResult[7] !== "-1.0" && (
                      <TableRow>
                        <TableData>
                          Größe der thermischen Fahne in % der
                          Grundstücksfläche: {computationResult[7]} %
                        </TableData>
                      </TableRow>
                    )}
                  </tbody>
                </Table>
                <Placeholder></Placeholder>
              </CollapsibleSection>
            ))}
          {address && <Footer></Footer>}
        </InfoPanelContent>
      </CollapsibleSection>
    </Container>
  );
}
