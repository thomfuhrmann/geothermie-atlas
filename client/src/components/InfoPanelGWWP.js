import React, { useState, useEffect } from 'react';
import 'jspdf-autotable';
import { useDispatch, useSelector } from 'react-redux';
import { useMediaQuery } from 'react-responsive';

import { updateScreenshot } from '../redux/screenshotSlice';
import { updateEWSResources } from '../redux/ewsResourcesSlice';
import { updateGWWPResources } from '../redux/gwwpResourcesSlice';
import { updateAmpelkarte } from '../redux/ampelkarteSlice';
import { updateCadastralData } from '../redux/cadastreSlice';
import { updateEWSComputationResult } from '../redux/ewsComputationsSlice';
import { updateGWWPComputationResult } from '../redux/gwwpComputationsSlice';
import { initializeInfoPanelHandlers } from '../utils/view';
import { print } from '../utils/print';
import { AmpelkarteTable } from './AmpelkarteTable';
import CollapsibleSection from './CollapsibleSection';
import Footer from './Footer';
import {
  Table,
  TableRow,
  TableData,
  TableHeader,
  Placeholder,
  PDFButton,
  PDFButtonDiv,
  InfoPanelContent,
  Image,
  Warning,
  InfoPanelContainer,
  Clearance,
  Line,
  GridContainer,
} from './CommonStyledElements';

const textTemplates = {
  0: [
    `Die flächenspezifische Jahresenergie für eine thermische Grundwassernutzung mit ausgeglichener Jahresbilanz, wobei die im Winter zur Heizung entzogene Wärme  im Sommer vollständig wieder zurückgegeben wird, 
  abhängig von der bestehenden Grundwassertemperatur und einer minimalen Rückgabetemperatur von 5 °C und einer maximalen Rückgabetemperatur von 18 °C beträgt rund `,
    ' kWh/m²/a',
  ],
  1: [
    `Die flächenspezifische Jahresenergie für eine thermische Grundwassernutzung im Heiz- und Kühlbetrieb bei Normbetriebsstunden, 
  abhängig von der bestehenden Grundwassertemperatur und einer minimalen Rückgabetemperatur von 5 °C und einer maximalen Rückgabetemperatur von 18 °C beträgt rund `,
    ' kWh/m²/a',
  ],
  2: ['Der Grundwasserspiegel ist am Grundstück in einer Tiefe von rund ', ' m zu erwarten.'],
  3: ['Das Grundwasser ist am Grundstück rund ', ' m mächtig.'],
  4: ['Die hydraulische Leitfähigkeit (kf-Wert) beträgt am Grundstück rund ', ' m/s.'],
  5: ['Die maximale Jahrestemperatur des Grundwassers (für das Jahr 2020) liegt bei ', ' °C.'],
  6: ['Die mittlere Jahrestemperatur des Grundwassers (für das Jahr 2020) liegt bei ', ' °C.'],
  7: ['Die minimale Jahrestemperatur des Grundwassers (für das Jahr 2020) liegt bei ', ' °C.'],
  8: [
    'Die maximale Pumpleistung eines Brunnenpaars mit 50 m Abstand zwischen Entnahme- und Rückgabebrunnen beträgt rund ',
    ' l/s.',
  ],
  9: [
    'Die maximale Volllast-Leistung eines Brunnenpaars mit 50 m Abstand zwischen Entnahme- und Rückgabebrunnen beträgt rund ',
    ' kW.',
  ],
};

export default function InfoPanelGWWP() {
  const [address, setAddress] = useState(null);
  const [closenessWarning, setClosenessWarning] = useState(false);
  const [outsideWarning, setOutsideWarning] = useState(false);
  const [scaleWarning, setScaleWarning] = useState(true);

  const dispatch = useDispatch();

  const cadastralData = useSelector((store) => store.cadastre.value);
  const resources = useSelector((store) => store.gwwpResources.value);
  const ampelkarte = useSelector((store) => store.ampelkarte.value);
  const computationResult = useSelector((store) => store.gwwpComputations.value);
  const screenshot = useSelector((store) => store.screenshot.value);

  const isMobile = useMediaQuery({ maxWidth: 480 });

  // record which tables should be printed
  let [einschraenkungen, hinweise] = [false, false];

  // initialize query handlers
  useEffect(() => {
    initializeInfoPanelHandlers(setAddress, dispatch, setClosenessWarning, setOutsideWarning, setScaleWarning);

    return () => {
      setAddress(null);
      dispatch(updateEWSResources([]));
      dispatch(updateGWWPResources([]));
      dispatch(updateCadastralData({}));
      dispatch(updateAmpelkarte([]));
      dispatch(updateGWWPComputationResult({}));
      dispatch(updateEWSComputationResult({}));
      dispatch(updateScreenshot(''));
    };
  }, [dispatch]);

  // print pdf report
  const clickHandler = () => {
    print(
      einschraenkungen,
      hinweise,
      Object.keys(computationResult).length > 0,
      screenshot,
      null,
      null,
      Object.keys(cadastralData).length > 0,
      closenessWarning || outsideWarning ? true : false,
      null,
      null,
      'GWWP',
      Object.keys(resources).length > 0
    );
  };

  // format values
  const formatGWWP = (layerId, layerName, value) => {
    if (value !== 'NoData') {
      if ([5, 6, 7].includes(layerId)) {
        value = parseFloat(value).toFixed(1);
      } else if (layerId === 4) {
        value = parseFloat(value).toFixed(4);
      } else {
        value = parseFloat(value).toFixed(0);
      }
    }

    if (value === 'NoData') {
      return layerName + ': keine Daten';
    } else {
      return textTemplates[layerId][0] + value + textTemplates[layerId][1];
    }
  };

  // register which tables are added to the report
  const setTables = (einschraenkungenAdded, hinweiseAdded) => {
    einschraenkungen = einschraenkungenAdded;
    hinweise = hinweiseAdded;
  };

  return (
    <InfoPanelContainer>
      <CollapsibleSection title="Grundstücksabfrage" open={!isMobile ? true : false} marginBottom="0px" flex={true}>
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
            </GridContainer>
          )}
          {scaleWarning && (
            <Warning id="scale-warning">
              Bitte zoomen Sie hinein um die grundstücksbezogenen Abfragen und Berechnungen des geothermischen
              Potentials zu ermöglichen. Mit Klick auf ein Grundstück starten Sie die Abfrage.
            </Warning>
          )}
          {!scaleWarning && !address && <Clearance>Sie können jetzt ein Grundstück auswählen.</Clearance>}
          {outsideWarning && (
            <Table id="warnings-table">
              <tbody>
                <tr>
                  <td>
                    {outsideWarning && (
                      <Warning>Achtung: Mindestens ein Punkt liegt außerhalb des Grundstücks!</Warning>
                    )}
                  </td>
                </tr>
                <tr>
                  <td>{closenessWarning && <></>}</td>
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
                    <TableHeader textAlign="center">Ressourcen für vordefinierte Grundwassernutzung</TableHeader>
                  </TableRow>
                  {resources.slice(0, 2).map((result) => {
                    return (
                      <TableRow key={result.layerId}>
                        <TableData>
                          {formatGWWP(result.layerId, result.layerName, result.feature.attributes['Pixel Value'])}
                        </TableData>
                      </TableRow>
                    );
                  })}
                  <TableRow>
                    <TableHeader textAlign="center">Standortabhängige Parameter</TableHeader>
                  </TableRow>
                  {resources.slice(2).map((result) => {
                    return (
                      <TableRow key={result.layerId}>
                        <TableData>
                          {formatGWWP(result.layerId, result.layerName, result.feature.attributes['Pixel Value'])}
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
            <AmpelkarteTable results={ampelkarte} setTables={setTables} layerId={1}></AmpelkarteTable>
          )}
          {computationResult && computationResult.error && (
            <CollapsibleSection title="Berechnungsergebnisse" open={true}>
              <Table id="calculations-output-table">
                <thead>
                  <tr>
                    <td></td>
                  </tr>
                </thead>
                <tbody>
                  <TableRow>
                    <TableData>{computationResult.error}</TableData>
                  </TableRow>
                </tbody>
              </Table>
              <Placeholder></Placeholder>
            </CollapsibleSection>
          )}
          {computationResult && computationResult.result && (
            <CollapsibleSection title="Berechnungsergebnisse" open={true}>
              <Table id="calculations-input-table">
                <thead>
                  <tr>
                    <td></td>
                  </tr>
                </thead>
                {(computationResult.eHZ > 0 ||
                  computationResult.eKL > 0 ||
                  computationResult.pHZ > 0 ||
                  computationResult.pKL > 0 ||
                  computationResult.copWP > 0) && (
                  <>
                    <tbody>
                      <TableRow>
                        <TableHeader textAlign="center">Benutzerdefinierte Vorgaben</TableHeader>
                      </TableRow>
                      {computationResult.eHZ > 0 && (
                        <TableRow>
                          <TableData>Jahresheizenergie: {computationResult.eHZ} MWh</TableData>
                        </TableRow>
                      )}
                      {computationResult.eKL > 0 && (
                        <TableRow>
                          <TableData>Jahreskühlenergie: {computationResult.eKL} MWh</TableData>
                        </TableRow>
                      )}
                      {computationResult.pHZ > 0 && (
                        <TableRow>
                          <TableData>Heizleistung: {computationResult.pHZ} kW</TableData>
                        </TableRow>
                      )}
                      {computationResult.pKL > 0 && (
                        <TableRow>
                          <TableData>Kühlleistung: {computationResult.pKL} kW</TableData>
                        </TableRow>
                      )}
                      {computationResult.copWP > 0 && (
                        <TableRow>
                          <TableData>Leistungszahl der Wärmepumpe: {computationResult.copWP}</TableData>
                        </TableRow>
                      )}
                    </tbody>
                  </>
                )}
              </Table>
              <Table id="calculations-output-table">
                <tbody>
                  <TableRow>
                    <TableHeader textAlign="center">Berechnungsergebnisse</TableHeader>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      Energieflächendichte im einseitigen Heizbetrieb: {computationResult.result[0]} kWh/m²/a
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      Energieflächendichte im einseitigen Kühlbetrieb: {computationResult.result[1]} kWh/m²/a
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      Energieflächendichte im Heiz- und Kühlbetrieb mit ausgeglichener Betriebsweise:{' '}
                      {computationResult.result[2]} kWh/m²/a
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>
                      Energieflächendichte im Heiz- und Kühlbetrieb nach Energieverhältnis Heizen/Kühlen:{' '}
                      {computationResult.result[3]} kWh/m²/a
                    </TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>Maximale Entnahmemenge: {computationResult.result[4]} l/s</TableData>
                  </TableRow>
                  <TableRow>
                    <TableData>Thermische Leistung des Brunnenpaars: {computationResult.result[5]} kW</TableData>
                  </TableRow>
                  {computationResult.result[6] !== null && (
                    <TableRow>
                      <TableData>Deckungsbeitrag der Leistung: {computationResult.result[6]} %</TableData>
                    </TableRow>
                  )}
                  {computationResult.result[7] !== null && (
                    <TableRow>
                      <TableData>
                        Größe der thermischen Fahne in % der Grundstücksfläche: {computationResult.result[7]} %
                      </TableData>
                    </TableRow>
                  )}
                </tbody>
              </Table>
              <Placeholder></Placeholder>
            </CollapsibleSection>
          )}
          {address && <Footer></Footer>}
        </InfoPanelContent>
      </CollapsibleSection>
    </InfoPanelContainer>
  );
}
