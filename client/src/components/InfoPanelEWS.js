import React, { useRef, useState, useEffect } from "react";
import "jspdf-autotable";
import { useDispatch, useSelector } from "react-redux";
import { useMediaQuery } from "react-responsive";

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
  InfoPanelContainer,
  InfoPanelContent,
  PDFButton,
  PDFButtonDiv,
  Image,
  Warning,
  Clearance,
  Line,
  GridContainer,
} from "./CommonStyledElements";

const textTemplates = {
  0: [
    `Die flächenspezifische Jahresenergie eines 1156 m² großen und 100 m tiefen Sondenfeldes im saisonalem Speicherbetrieb (7 x 7 Sonden mit je 5 m Abstand - die im Winter zur Heizung entzogene Wärme wird im Sommer vollständig wieder zurückgegeben) beträgt rund `,
    " kWh/m²/a.",
  ],
  1: [
    `Die flächenspezifische Jahresenergie eines 1156 m² großen und 100 m tiefen Sondenfeldes im standortbezogenen Normbetrieb (4 x 4 Sonden mit je 10 m Abstand - Heizen und Kühlen mit Normbetriebsstunden eines typischen Wohngebäudes am Standort) beträgt rund `,
    " kWh/m²/a.",
  ],
  2: [
    "Die Entzugsleistung einer 100 m tiefen Einzelsonde im saisonalem Speicherbetrieb (die im Winter zur Heizung entzogene Wärme wird im Sommer vollständig wieder zurückgegeben) beträgt am Grundstück rund ",
    " W/lfm.",
  ],
  3: [
    "Die Entzugsleistung einer 100 m tiefen Einzelsonde im standortbezogenen Normbetrieb (Heizen und Kühlen mit Normbetriebsstunden eines typischen Wohngebäudes am Standort) beträgt am Grundstück rund ",
    " W/lfm.",
  ],
  4: [
    "Die mittlere jährliche Bodentemperatur beträgt laut Satellitendaten (MODIS) rund ",
    " °C.",
  ],
  5: [
    "Die mittlere Temperatur des Untergrunds für eine Tiefe von 0 bis 100 m beträgt rund ",
    " °C.",
  ],
  6: [
    "Die mittlere konduktive Wärmeleitfähigkeit des Untergrunds für eine Tiefe von 0 bis 100 m beträgt rund ",
    " W/m/K.",
  ],
};

export default function InfoPanelEWS() {
  const image_bal = useRef(null);
  const image = useRef(null);
  const image_borefield = useRef(null);

  const [address, setAddress] = useState(null);
  const [closenessWarning, setClosenessWarning] = useState(false);
  const [outsideWarning, setOutsideWarning] = useState(false);
  const [scaleWarning, setScaleWarning] = useState(true);

  const resources = useSelector((store) => store.ewsResources.value);
  const ampelkarte = useSelector((store) => store.ampelkarte.value);
  const cadastralData = useSelector((store) => store.cadastre.value);
  const computationResult = useSelector((store) => store.ewsComputations.value);
  const screenshot = useSelector((store) => store.screenshot.value);

  const dispatch = useDispatch();

  const isMobile = useMediaQuery({ maxWidth: 480 });

  // record which tables should be printed
  let [einschraenkungen, hinweise] = [false, false];

  // initialize query handlers
  useEffect(() => {
    initializeInfoPanelHandlers(
      setAddress,
      dispatch,
      setClosenessWarning,
      setOutsideWarning,
      setScaleWarning
    );

    return () => {
      setAddress(null);
      dispatch(updateEWSResources([]));
      dispatch(updateGWWPResources([]));
      dispatch(updateCadastralData({}));
      dispatch(updateAmpelkarte([]));
      dispatch(updateGWWPComputationResult({}));
      dispatch(updateEWSComputationResult({}));
      dispatch(updateScreenshot(""));
    };
  }, [dispatch, isMobile]);

  // print pdf report
  const clickHandler = () => {
    print(
      einschraenkungen,
      hinweise,
      Object.keys(computationResult).length > 0,
      screenshot,
      image_bal,
      image,
      cadastralData,
      closenessWarning || outsideWarning ? true : false,
      image_borefield,
      computationResult.calculationMode
    );
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
    <InfoPanelContainer>
      <CollapsibleSection
        title="Standortbasierter Bericht"
        open={!isMobile ? true : false}
        marginBottom="0px"
        flex={true}
      >
        <InfoPanelContent>
          {address && (
            <>
              <PDFButtonDiv className="pdf-button-div">
                <PDFButton onClick={clickHandler}>PDF erstellen</PDFButton>
              </PDFButtonDiv>
              <Image src={screenshot} id="screenshot"></Image>
            </>
          )}
          {Object.keys(cadastralData).length > 0 && (
            <>
              <Table id="cadastral-data-table">
                <tbody>
                  <tr>
                    <td>
                      Katastralgemeinde {cadastralData.KG}
                      <br></br>
                      Grundstücksnummer {cadastralData.GNR}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </>
          )}
          {address && address.length > 0 && (
            <>
              <Table id="address-table" margin="10px 0px">
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
            </>
          )}
          {Object.keys(cadastralData).length > 0 && (
            <GridContainer>
              <Line color="blue"></Line>
              <span>Grundstücksgrenze</span>
              <Line color="#00890c"></Line>
              <span>Zwei-Meter-Abstand zur Grundstücksgrenze</span>
            </GridContainer>
          )}
          {scaleWarning && (
            <Warning id="scale-warning">
              Bitte zoomen Sie hinein um die grundstücksbezogenen Abfragen und
              Berechnungen zu ermöglichen!
            </Warning>
          )}
          {!scaleWarning && !address && (
            <Clearance>Sie können jetzt ein Grundstück auswählen.</Clearance>
          )}
          {(closenessWarning || outsideWarning) && (
            <Table id="warnings-table">
              <tbody>
                <tr>
                  <td>
                    {closenessWarning && (
                      <Warning>
                        Achtung: Mindestens ein Punkt liegt näher als fünf Meter
                        zu einem anderen Punkt!
                      </Warning>
                    )}
                  </td>
                </tr>
                <tr>
                  <td>
                    {outsideWarning && (
                      <Warning>
                        Achtung: Mindestens ein Punkt liegt außerhalb der
                        zugelassenen Grenzen!
                      </Warning>
                    )}
                  </td>
                </tr>
              </tbody>
            </Table>
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
          {address && ampelkarte && (
            <AmpelkarteTable
              results={ampelkarte}
              setTables={setTables}
              layerId={0}
            ></AmpelkarteTable>
          )}
          {Object.keys(computationResult).includes("error") && (
            <CollapsibleSection title="Berechnungsergebnis" open={true}>
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
            <CollapsibleSection title="Berechnungsergebnisse" open={true}>
              <Table id="calculations-input-table">
                <thead>
                  <tr>
                    <td></td>
                  </tr>
                </thead>
                <tbody>
                  <TableRow>
                    {computationResult.calculationMode === "norm" ? (
                      <TableData>
                        Die Berechnung basiert auf einer vereinfachten
                        Betriebsfunktion im standortbezogenen Normbetrieb auf 20
                        Jahre, d.h. es werden die Norm-Volllaststunden für
                        Heizen und Kühlen eines typischen Wohngebäudes am
                        Standort verwendet. Ergebnis ist die erzielbare Leistung
                        für die benutzerdefiniert vorgegebene Sondenfeldgröße,
                        sodass die mittlere Fluidtemperatur zwischen -1.5 °C und
                        28 °C bleibt. Zudem werden folgende standortabhängige
                        Erdreich- und fixe Sondenparameter berücksichtigt:
                      </TableData>
                    ) : (
                      <TableData>
                        Die Berechnung basiert auf einer vereinfachten
                        Betriebsfunktion mit benutzerdefinierten Angaben zu
                        Leistung und Volllaststunden für Heizen und Kühlen auf
                        20 Jahre. Ergebnis ist die erzielbare Leistung für die
                        benutzerdefiniert vorgegebene Sondenfeldgröße, sodass
                        die mittlere Fluidtemperatur zwischen -1.5 °C und 28 °C
                        bleibt. Zudem werden folgende standortabhängige
                        Erdreich- und fixe Sondenparameter berücksichtigt:
                      </TableData>
                    )}
                  </TableRow>
                  <tr>
                    <td></td>
                  </tr>
                  <TableRow>
                    <TableData>
                      Volumetrische Wärmekapazität des Erdreichs: 2.2 MJ/m³/K
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>Wärmeträgermedium: Ethanol 12 %</TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      Wärmeleitfähigkeit der Verpressung: 2 W/m/K
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>Massenstrom pro Sonde: 0.35 kg/s</TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      Sondentyp: Duplex 32 mm, 0.04 m Rohrabstand
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>Bohrradius: 0.075 m</TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>Sondenkopf Überdeckung: 1 m</TableData>
                  </TableRow>
                  <tr>
                    <td></td>
                  </tr>
                  <TableRow>
                    <TableData>
                      Das Energie- und Leistungsverhältnis zwischen Heizen und
                      Kühlen ist{" "}
                      {computationResult.calculationMode === "norm"
                        ? "standortbezogen"
                        : "benutzerdefiniert"}{" "}
                      vorgegeben. Die vereinfachte Betriebsvorgabe in Watt pro
                      Bohrmeter und die Entwicklung der Fluidtemperaturen werden
                      als Grafik ausgegeben.
                    </TableData>
                  </TableRow>
                  {computationResult.points >= 10 &&
                    (computationResult.energiefaktor > 1.1 ||
                      computationResult.energiefaktor < 0.9) && (
                      <>
                        <tr>
                          <td></td>
                        </tr>
                        <TableRow>
                          <TableData>
                            Hinweis: Größere Sondenfelder sollten mit einer
                            möglichst ausgeglichenen Jahresenergiebilanz
                            zwischen Heizen und Kühlen betrieben werden. Dies
                            hat den Vorteil, dass sich die Sonden gegenseitig
                            kaum beeinflussen und eine möglichst hohe
                            spezifische Sondenleistung erreicht werden kann. Der
                            Sondenabstand kann so auf ca. 5 m reduziert und die
                            Flächendichte wesentlich erhöht werden. Überlegen
                            Sie eine Verbesserung der Energiebilanz zwischen
                            Heizen und Kühlen!
                          </TableData>
                        </TableRow>
                      </>
                    )}
                  <tr>
                    <td></td>
                  </tr>
                  <TableRow>
                    <TableHeader textAlign="center">
                      Benutzerdefinierte Vorgaben
                    </TableHeader>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      Sondenanzahl: {computationResult.points}
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      Sondentiefe: {computationResult.boreDepth} m
                    </TableData>
                  </TableRow>
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
                  <TableRow>
                    {computationResult.calculationMode === "norm" ? (
                      <TableData>
                        Norm-Volllaststunden Heizen:{" "}
                        {computationResult.BS_HZ_Norm} h
                      </TableData>
                    ) : (
                      <TableData>
                        Volllaststunden Heizen: {computationResult.BS_HZ} h
                      </TableData>
                    )}
                  </TableRow>
                  <TableRow>
                    {computationResult.calculationMode === "norm" ? (
                      <TableData>
                        Norm-Volllaststunden Kühlen:{" "}
                        {computationResult.BS_KL_Norm} h
                      </TableData>
                    ) : (
                      <TableData>
                        Volllaststunden Kühlen: {computationResult.BS_KL} h
                      </TableData>
                    )}
                  </TableRow>
                </tbody>
              </Table>
              <Image
                src={computationResult.imagehashSondenfeld}
                alt="Grafik mit Sondenfeld"
                ref={image_borefield}
              ></Image>
              <Table id="calculations-output-table">
                <tbody>
                  <TableRow>
                    <TableHeader textAlign="center">
                      Berechnungsergebnisse
                    </TableHeader>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      Heizleistung aus Erdwärmesonden:{" "}
                      {computationResult.heizleistung} kW
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      Kühlleistung aus Erdwärmesonden:{" "}
                      {computationResult.kuehlleistung} kW
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      Strombedarf Wärmepumpe Heizen bei Leistungszahl 5.0:{" "}
                      {computationResult.strombedarf} kW
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      Heizarbeit pro Jahr aus Erdwärmesonden:{" "}
                      {computationResult.heizarbeit} MWh/a
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      Kühlarbeit pro Jahr aus Erdwärmesonden:{" "}
                      {computationResult.kuehlarbeit} MWh/a
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      Energieverhältnis Entladen/Beladen (benutzerdefiniert):{" "}
                      {computationResult.energiefaktor}
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      Energiebedarf Wärmepumpe Heizen bei Leistungszahl 5.0:{" "}
                      {computationResult.energiebedarf} MWh
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
                ref={image}
              ></Image>
              <Placeholder></Placeholder>
            </CollapsibleSection>
          )}
          {Object.keys(computationResult).length > 1 &&
            computationResult.balanced === 1 && (
              <CollapsibleSection
                title="Berechnungsergebnisse mit automatischer Vorgabe im Speicherbetrieb"
                open={true}
              >
                <Table id="calculations-bal-output-table">
                  <thead>
                    <tr>
                      <td></td>
                    </tr>
                  </thead>
                  <tbody>
                    <TableRow>
                      <TableData>
                        Diese Berechnung liefert die erzielbare Leistung des
                        benutzerdefiniert vorgegebenen Sondenfeldes mit einer
                        automatisch angepassten Betriebsfunktion, sodass das
                        Energieverhältnis zwischen Ent- und Beladen des
                        Erdwärmesondenfeldes ausgeglichen ist. Das Sondenfeld
                        wird im saisonalem Speicherbetrieb bewirtschaftet,
                        wodurch eine zusätzliche Wärmequelle bzw. Wärmesenke zur
                        Regeneration erforderlich wird, oder die Heiz- bzw.
                        Kühlspitzen auf ein bestimmtes Maß reduziert werden
                        müssen.
                      </TableData>
                    </TableRow>
                    {computationResult.meanBoreholeSpacing > 6 && (
                      <>
                        <tr>
                          <td></td>
                        </tr>
                        <TableRow>
                          <TableData>
                            Hinweis: Im saisonalem Speicherbetrieb kann der
                            Sondenabstand auf ca. 5 Meter reduziert werden ohne
                            dass sich die einzelnen Erdwärmesonden nennenswert
                            gegenseitig beeinflussen. Somit kann der
                            Flächenbedarf reduziert werden ohne signifikante
                            Einbußen der Sondenleistung. Versuchen Sie eine
                            Reduktion des Sondenabstandes!
                          </TableData>
                        </TableRow>
                      </>
                    )}
                  </tbody>
                  <tbody>
                    <TableRow>
                      <TableHeader textAlign="center">
                        Berechnungsergebnisse
                      </TableHeader>
                    </TableRow>
                    {computationResult.energiefaktor >= 1 && (
                      <>
                        <TableRow>
                          <TableData>
                            Heizleistung aus Erdwärmesonden:{" "}
                            {computationResult.heizleistung_bal} kW
                          </TableData>
                        </TableRow>
                        <TableRow>
                          <TableData>
                            Kühlleistung aus Erdwärmesonden und
                            Regenerationsleistung aus Zusatzquelle:{" "}
                            {computationResult.kuehlleistung_bal} kW
                          </TableData>
                        </TableRow>
                        <TableRow>
                          <TableData>
                            Strombedarf Wärmepumpe Heizen bei Leistungszahl 5.0:{" "}
                            {computationResult.strombedarf_bal} kW
                          </TableData>
                        </TableRow>
                        <TableRow>
                          <TableData>
                            Heizarbeit pro Jahr aus Erdwärmesonden:{" "}
                            {computationResult.heizarbeit_bal} MWh/a
                          </TableData>
                        </TableRow>
                        <TableRow>
                          <TableData>
                            Kühlarbeit und Regenerationsarbeit pro Jahr aus
                            Erdwärmesonden: {computationResult.kuehlarbeit_bal}{" "}
                            MWh/a
                          </TableData>
                        </TableRow>
                        <TableRow>
                          <TableData>
                            Energieverhältnis Entladen/Beladen (automatisch):{" "}
                            {computationResult.energiefaktor_bal}
                          </TableData>
                        </TableRow>
                        <TableRow>
                          <TableData>
                            Energiebedarf Wärmepumpe Heizen bei Leistungszahl
                            5.0: {computationResult.energiebedarf_bal} MWh
                          </TableData>
                        </TableRow>
                        {computationResult.cover > 0 && (
                          <TableRow>
                            <TableData>
                              Deckungsgrad: {computationResult.cover} %
                            </TableData>
                          </TableRow>
                        )}
                      </>
                    )}
                    {computationResult.energiefaktor < 1 && (
                      <>
                        <TableRow>
                          <TableData>
                            Heizleistung aus Erdwärmesonden und
                            Regenerationsleistung aus Zusatzsenke:{" "}
                            {computationResult.heizleistung_bal} kW
                          </TableData>
                        </TableRow>
                        <TableRow>
                          <TableData>
                            Kühlleistung aus Erdwärmesonden:{" "}
                            {computationResult.kuehlleistung_bal} kW
                          </TableData>
                        </TableRow>
                        <TableRow>
                          <TableData>
                            Strombedarf Wärmepumpe Heizen bei Leistungszahl 5.0:{" "}
                            {computationResult.strombedarf_bal} kW
                          </TableData>
                        </TableRow>
                        <TableRow>
                          <TableData>
                            Heizarbeit und Regenerationsarbeit pro Jahr aus
                            Erdwärmesonden: {computationResult.heizarbeit_bal}{" "}
                            MWh/a
                          </TableData>
                        </TableRow>
                        <TableRow>
                          <TableData>
                            Kühlarbeit pro Jahr aus Erdwärmesonden:{" "}
                            {computationResult.kuehlarbeit_bal} MWh/a
                          </TableData>
                        </TableRow>
                        <TableRow>
                          <TableData>
                            Energieverhältnis Entladen/Beladen (automatisch):{" "}
                            {computationResult.energiefaktor_bal}
                          </TableData>
                        </TableRow>
                        <TableRow>
                          <TableData>
                            Energiebedarf Wärmepumpe Heizen bei Leistungszahl
                            5.0: {computationResult.energiebedarf_bal} MWh
                          </TableData>
                        </TableRow>
                        {computationResult.cover > 0 && (
                          <TableRow>
                            <TableData>
                              Deckungsgrad: {computationResult.cover} %
                            </TableData>
                          </TableRow>
                        )}
                      </>
                    )}
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
    </InfoPanelContainer>
  );
}
