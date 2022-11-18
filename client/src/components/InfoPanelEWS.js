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
  const image = useRef(null);
  const image_bal = useRef(null);
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
      Object.keys(cadastralData).length > 0,
      closenessWarning || outsideWarning ? true : false,
      image_borefield,
      computationResult.calculationMode,
      "EWS",
      Object.keys(resources).length > 0
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
      return textTemplates[layerId][0] + value + textTemplates[layerId][1];
    } else {
      return layerName + ": keine Daten";
    }
  };

  const setTables = (einschraenkungenAdded, hinweiseAdded) => {
    einschraenkungen = einschraenkungenAdded;
    hinweise = hinweiseAdded;
  };

  return (
    <InfoPanelContainer>
      <CollapsibleSection
        title="Grundstücksabfrage"
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
              <Table id="cadastral-data-table" margin="10px 0px 0px 0px">
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
              <span>2,5-Meter-Abstand zur Grundstücksgrenze</span>
            </GridContainer>
          )}
          {scaleWarning && (
            <Warning id="scale-warning">
              Bitte zoomen Sie hinein um die grundstücksbezogenen Abfragen und
              Berechnungen des geothermischen Potentials zu ermöglichen. Mit
              Klick auf ein Grundstück starten Sie die Abfrage.
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
          {resources && resources.length > 0 && (
            <CollapsibleSection title="Ressourcen">
              <Table id="resources-table">
                <thead>
                  <tr>
                    <td></td>
                  </tr>
                </thead>
                <tbody>
                  <TableRow>
                    <TableHeader textAlign="center">
                      Ressourcen für vordefinierte Erdwärmesondenanlage
                    </TableHeader>
                  </TableRow>
                  {resources.slice(0, 4).map((result) => {
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
                  <TableRow>
                    <TableHeader textAlign="center">
                      Standortabhängige Parameter
                    </TableHeader>
                  </TableRow>
                  {resources.slice(4).map((result) => {
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
          {ampelkarte && ampelkarte.length > 0 && (
            <AmpelkarteTable
              results={ampelkarte}
              setTables={setTables}
              layerId={0}
            ></AmpelkarteTable>
          )}
          {Object.keys(computationResult).includes("error") && (
            <CollapsibleSection title="Berechnungsergebnisse" open={true}>
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
                    <TableHeader textAlign="center">
                      Berechnungsvorgaben
                    </TableHeader>
                  </TableRow>
                  <TableRow>
                    {computationResult.calculationMode === "norm" ? (
                      <td>
                        Es wurde keine Betriebsfunktion vom Benutzer vorgeben.
                        Die Berechnung der möglichen Leistung des gewählten
                        Sondenfelds erfolgt mit Norm-Jahresbetriebsstunden für
                        Heizen und Kühlen am Standort eines typischen
                        Wohngebäudes. Die Berechnung berücksichtigt zudem
                        Untergrunddaten, fixe Sondenparameter und
                        Temperaturgrenzen für die Fluidtemperatur in der Sonde.
                        Ergebnisse sind die maximal erzielbare Leistung (kW) und
                        Energiemenge (MWh/a) bei einem Betrieb von 20 Jahren.
                      </td>
                    ) : (
                      <td>
                        Die Berechnung erfolgt für das gewählte Sondenfeld mit
                        der benutzerdefinierten Betriebsfunktion, bestehend aus
                        den Jahresbetriebsstunden und dem Leistungsverhältnis
                        zwischen Heizen und Kühlen. Die Berechnung
                        berücksichtigt zudem Untergrunddaten, fixe
                        Sondenparameter und Temperaturgrenzen für die
                        Fluidtemperatur in der Sonde. Ergebnisse sind die
                        maximal erzielbare Leistung (kW) und Energiemenge
                        (MWh/a) bei einem Betrieb von 20 Jahren.
                      </td>
                    )}
                  </TableRow>
                  <TableRow>
                    <TableHeader textAlign="center">
                      Benutzereingabe
                    </TableHeader>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      Sondenanzahl: {computationResult.points}
                    </TableData>
                  </TableRow>
                  {computationResult.meanBoreholeSpacing > 0 && (
                    <TableRow>
                      <TableData>
                        Durchschnittlicher Sondenabstand:{" "}
                        {computationResult.meanBoreholeSpacing} m
                      </TableData>
                    </TableRow>
                  )}

                  <TableRow>
                    <TableData>
                      Sondentiefe: {computationResult.boreDepth} m
                    </TableData>
                  </TableRow>
                  {computationResult.calculationMode === "user" && (
                    <>
                      <TableRow>
                        <TableData>
                          Jahresbetriebsstunden Heizen:{" "}
                          {computationResult.BS_HZ} h
                        </TableData>
                      </TableRow>
                      <TableRow>
                        <TableData>
                          Jahresbetriebsstunden Kühlen:{" "}
                          {computationResult.BS_KL} h
                        </TableData>
                      </TableRow>
                      <TableRow>
                        <TableData>
                          Heizleistung Gebäude: {computationResult.P_HZ} kW
                        </TableData>
                      </TableRow>
                      <TableRow>
                        <TableData>
                          Kühlleistung Gebäude: {computationResult.P_KL} kW
                        </TableData>
                      </TableRow>
                    </>
                  )}
                  <TableRow>
                    <TableData>
                      Vorlauftemperatur Heizung: {computationResult.T_radiator}{" "}
                      °C
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableHeader textAlign="center">
                      Standortabhängige Parameter
                    </TableHeader>
                  </TableRow>
                  {computationResult.calculationMode === "norm" && (
                    <>
                      <TableRow>
                        <TableData>
                          Norm-Jahresbetriebsstunden Heizen:{" "}
                          {computationResult.BS_HZ_Norm} h
                        </TableData>
                      </TableRow>
                      <TableRow>
                        <TableData>
                          Norm-Jahresbetriebsstunden Kühlen:{" "}
                          {computationResult.BS_KL_Norm} h
                        </TableData>
                      </TableRow>
                    </>
                  )}
                  {resources &&
                    resources.length > 0 &&
                    computationResult &&
                    computationResult.GTcalc && (
                      <>
                        <TableRow>
                          <TableData>
                            Wärmeleitfähigkeit{" "}
                            {parseFloat(
                              resources[6].feature.attributes["Pixel Value"]
                            ).toFixed(1)}{" "}
                            W/m/K
                          </TableData>
                        </TableRow>
                        <TableRow>
                          <TableData>
                            Untergrundtemperatur{" "}
                            {computationResult.GTcalc.toFixed(1)} °C
                          </TableData>
                        </TableRow>
                      </>
                    )}
                  {computationResult.points >= 10 &&
                    (computationResult.Efactor_user > 1.1 ||
                      computationResult.Efactor_user < 0.9) && (
                      <>
                        <TableRow>
                          <td>
                            Hinweis: Größere Sondenfelder sollten mit einer
                            möglichst ausgeglichenen Jahresenergiebilanz
                            zwischen Heizen und Kühlen betrieben werden. Dadurch
                            beeinflussen sich die Sonden gegenseitig kaum und
                            der Sondenabstand kann auf ungefähr 5 Meter
                            reduziert werden. Dies ermöglicht eine optimale
                            thermische Nutzung des Untergrunds und es können
                            höhere Leistungen erreicht werden. Überlegen Sie
                            eine Verbesserung der Energiebilanz zwischen Heizen
                            und Kühlen!
                          </td>
                        </TableRow>
                      </>
                    )}
                </tbody>
              </Table>
              <Placeholder></Placeholder>
              <Image
                src={computationResult.imagehashSondenfeld}
                alt="Grafik mit Sondenfeld"
                ref={image_borefield}
              ></Image>
              <Table id="calculations-output-table">
                <tbody>
                  <TableRow>
                    <TableHeader textAlign="center">
                      {computationResult.calculationMode === "norm"
                        ? "Berechnungsergebnisse für den Normbetrieb"
                        : "Berechnungsergebnisse für den benutzerdefinierten Betrieb "}
                    </TableHeader>
                  </TableRow>
                  <TableRow>
                    <TableHeader textAlign="center">
                      Heizbetrieb mit{" "}
                      {computationResult.BS_HZ > 0
                        ? computationResult.BS_HZ
                        : computationResult.BS_HZ_Norm}{" "}
                      h/a
                    </TableHeader>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      Wärmeentzugsleistung aus Erdwärmesonden:{" "}
                      {computationResult.P_HZ_user.toFixed(1)} kW
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      + Elektrische Leistung Wärmepumpe (bei COP{" "}
                      {computationResult.COP.toFixed(1)}):{" "}
                      {computationResult.Pel_heatpump_user.toFixed(1)} kW
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      = Heizleistung Erdwärmeanlage:{" "}
                      {computationResult.heizleistung.toFixed(1)} kW
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      Jährlicher Wärmeentzug aus Erdwärmesonden:{" "}
                      {computationResult.E_HZ_user.toFixed(1)} MWh/a
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      + Strombedarf Wärmepumpe (bei JAZ{" "}
                      {computationResult.SCOP.toFixed(1)}):{" "}
                      {computationResult.Eel_heatpump_user.toFixed(1)} MWh/a
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      = Heizarbeit Erdwärmeanlage:{" "}
                      {computationResult.heizarbeit.toFixed(1)} MWh/a
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableHeader textAlign="center">
                      Kühlbetrieb mit{" "}
                      {computationResult.BS_KL > 0
                        ? computationResult.BS_KL
                        : computationResult.BS_KL_Norm}{" "}
                      h/a
                    </TableHeader>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      Wärmeeintragsleistung in Erdwärmesonden:{" "}
                      {computationResult.P_KL_user.toFixed(1)} kW
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      - Elektrische Leistung Wärmepumpe (bei EER{" "}
                      {computationResult.EER.toFixed(1)}):{" "}
                      {computationResult.Pel_chiller_user.toFixed(1)} kW
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      = Kühlleistung Erdwärmeanlage:{" "}
                      {computationResult.kuehlleistung.toFixed(1)} kW
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      Jährlicher Wärmeeintrag in Erdwärmesonde:{" "}
                      {computationResult.E_KL_user.toFixed(1)} MWh/a
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      - Strombedarf Wärmepumpe (bei SEER{" "}
                      {computationResult.SEER.toFixed(1)}
                      ): {computationResult.Eel_chiller_user.toFixed(1)} MWh/a
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      = Kühlarbeit Erdwärmeanlage:{" "}
                      {computationResult.kuehlarbeit.toFixed(1)} MWh/a
                    </TableData>
                  </TableRow>
                  {computationResult.cover > 0 && (
                    <TableRow>
                      <TableData>
                        Deckungsgrad gesamt: {computationResult.cover} %
                      </TableData>
                    </TableRow>
                  )}
                  {computationResult.balanced === 0 && (
                    <TableRow>
                      <td>
                        Ihre Energie- und Leistungsvorgaben des Gebäudes für
                        Heizen und Kühlen bewirken eine ausgeglichene
                        Betriebsweise im Erdsondenfeld. Die Auslegung ist
                        optimal für den saisonalen Speicherbetrieb geeignet.
                      </td>
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
                title="Berechnungsergebnisse für den saisonalen Speicherbetrieb"
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
                      <td>
                        Die Berechnung erfolgt für das gewählte Sondenfeld im
                        saisonalen Speicherbetrieb. Die folgenden Ergebnisse
                        beziehen sich auf eine automatisch angepasste
                        Betriebsweise, wobei das Sondenfeld über das Jahr
                        gesehen gleich stark be- und entladen wird.{" "}
                        {computationResult.Efactor_user >= 1 &&
                          `Um eine ausgeglichene Betriebsweise zu erreichen ist eine zusätzliche Wärmequelle notwendig. Die Zusatzquelle (Solar, Luft, Abwärme, etc.) kann außerhalb der Heizsaison betrieben werden und gleicht die Jahresenergiebilanz der Erdwärmesonden aus. Alternativ zur Zusatzquelle kann auch eine Reduktion der vorgegebenen Heizleistung mit klassischen Wärmequellen (Fernwärme, Biomasse, etc.) in Betracht gezogen werden. Versuchen Sie auch eine manuelle Anpassung der Leistungsvorgabe!`}
                        {computationResult.Efactor_user < 1 &&
                          `Um eine ausgeglichene Betriebsweise zu erreichen ist eine zusätzliche Wärmesenke notwendig. Als Zusatzsenke bietet sich eine Wärmeversorgung benachbarter Objekte an, wodurch die Jahresenergiebilanz in den Erdwärmesonden ausgeglichen werden kann.`}
                      </td>
                    </TableRow>
                    {computationResult.meanBoreholeSpacing > 5 && (
                      <>
                        <TableRow>
                          <td>
                            Hinweis: Im saisonalen Speicherbetrieb kann der
                            Sondenabstand auf ungefähr fünf Meter reduziert
                            werden ohne dass sich die einzelnen Erdwärmesonden
                            nennenswert gegenseitig beeinflussen. Somit kann der
                            Flächenbedarf ohne signifikante Einbußen der
                            Sondenleistung reduziert werden. Versuchen Sie eine
                            Reduktion des Sondenabstands!
                          </td>
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
                    <TableRow>
                      <TableHeader textAlign="center">
                        Heizbetrieb{" "}
                        {computationResult.Efactor_user < 1 &&
                          "und Zusatzsenke"}{" "}
                        mit {computationResult.BS_HZ_bal} h/a
                      </TableHeader>
                    </TableRow>
                    <TableRow>
                      <TableData>
                        Wärmeentzugsleistung aus Erdwärmesonden:{" "}
                        {computationResult.P_HZ_bal.toFixed(1)} kW
                      </TableData>
                    </TableRow>
                    <TableRow>
                      <TableData>
                        + Elektrische Leistung Wärmepumpe (bei COP{" "}
                        {computationResult.COP_bal.toFixed(1)}):{" "}
                        {computationResult.Pel_heatpump_bal.toFixed(1)} kW
                      </TableData>
                    </TableRow>
                    <TableRow>
                      <TableData>
                        = Heizleistung Erdwärmeanlage:{" "}
                        {computationResult.heizleistungBal.toFixed(1)} kW
                      </TableData>
                    </TableRow>
                    <TableRow>
                      <TableData>
                        Jährlicher Wärmeentzug aus Erdwärmesonden:{" "}
                        {computationResult.E_HZ_bal.toFixed(1)} MWh/a
                      </TableData>
                    </TableRow>
                    <TableRow>
                      <TableData>
                        + Strombedarf Wärmepumpe (bei JAZ{" "}
                        {computationResult.SCOP_bal}):{" "}
                        {computationResult.Eel_heatpump_bal.toFixed(1)} MWh/a
                      </TableData>
                    </TableRow>
                    <TableRow>
                      <TableData>
                        = Heizarbeit Erdwärmeanlage:{" "}
                        {computationResult.heizarbeitBal.toFixed(1)} MWh/a
                      </TableData>
                    </TableRow>
                    <TableRow>
                      <TableHeader textAlign="center">
                        Kühlbetrieb{" "}
                        {computationResult.Efactor_user >= 1 &&
                          "und Zusatzquelle"}{" "}
                        mit {computationResult.BS_KL_bal} h/a
                      </TableHeader>
                    </TableRow>
                    <TableRow>
                      <TableData>
                        Wärmeeintragsleistung in Erdwärmesonden:{" "}
                        {computationResult.P_KL_bal.toFixed(1)} kW
                      </TableData>
                    </TableRow>
                    <TableRow>
                      <TableData>
                        - Elektrische Leistung Wärmepumpe (bei EER{" "}
                        {computationResult.EER_bal.toFixed(1)}):{" "}
                        {computationResult.Pel_chiller_bal.toFixed(1)} kW
                      </TableData>
                    </TableRow>
                    <TableRow>
                      <TableData>
                        = Kühlleistung Erdwärmeanlage:{" "}
                        {computationResult.kuehlleistungBal.toFixed(1)} kW
                      </TableData>
                    </TableRow>
                    <TableRow>
                      <TableData>
                        Jährlicher Wärmeeintrag in Erdwärmesonden:{" "}
                        {computationResult.E_KL_bal.toFixed(1)} MWh/a
                      </TableData>
                    </TableRow>
                    <TableRow>
                      <TableData>
                        - Strombedarf Wärmepumpe (bei SEER{" "}
                        {computationResult.SEER_bal.toFixed(1)}):{" "}
                        {computationResult.Eel_chiller_bal.toFixed(1)} MWh/a
                      </TableData>
                    </TableRow>
                    <TableRow>
                      <TableData>
                        = Kühlarbeit Erdwärmeanlage:{" "}
                        {computationResult.kuehlarbeitBal.toFixed(1)} MWh/a
                      </TableData>
                    </TableRow>
                    {computationResult.cover > 0 && (
                      <TableRow>
                        <TableData>
                          Deckungsgrad: {computationResult.cover_bal} %
                        </TableData>
                      </TableRow>
                    )}
                    {computationResult.Efactor_user >= 1 ? (
                      <TableRow>
                        <td>
                          Bei einer ausgeglichenen Betriebsweise mit einer
                          zusätzlichen Wärmequelle kann die Heizarbeit um{" "}
                          {computationResult.cover_rise.toFixed(1)} % gesteigert
                          werden.
                        </td>
                      </TableRow>
                    ) : (
                      <TableRow>
                        <td>
                          Bei einer ausgeglichenen Betriebsweise mit einer
                          zusätzlichen Wärmesenke kann die Kühlarbeit um{" "}
                          {computationResult.cover_rise.toFixed(1)} % gesteigert
                          werden.
                        </td>
                      </TableRow>
                    )}
                  </tbody>
                </Table>
                <Placeholder></Placeholder>
                <Image
                  src={computationResult.imagehashBal}
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
