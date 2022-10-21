import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";

import { distance } from "../utils/gridcomputer";
import { compute } from "../utils/gwwpComputations";
import { view } from "../utils/view";
import { initializeCalculationsMenuHandlers } from "../utils/view";
import { updateGWWPComputationResult } from "../redux/gwwpComputationsSlice";
import { takeScreenshot } from "../utils/screenshot";
import CollapsibleSection from "./CollapsibleSection";
import { Menu, Button, ButtonContainer } from "./CommonStyledElements";

const CollapsibleContent = styled.div`
  padding: 15px 18px;
`;

const InputSection = styled.div`
  padding-bottom: 10px;
`;

const Input = styled.input`
  font-family: inherit;
  font-size: 100%;
  box-sizing: border-box;
  width: 100%;
  padding: 0;
  margin: 0;
`;

const CalculationsMenuGWWP = React.forwardRef(({ isLoading }, ref) => {
  const dispatch = useDispatch();

  const [points, setPoints] = useState([]);
  const [polygon, setPolygon] = useState(null);

  const [eHZ, setEHZ] = useState(0);
  const [eKL, setEKL] = useState(0);
  const [pHZ, setPHZ] = useState(0);
  const [pKL, setPKL] = useState(0);
  const [copWP, setCOPWP] = useState(0);

  const cadastralData = useSelector((store) => store.cadastre.value);
  const resources = useSelector((store) => store.gwwpResources.value);
  const bodentemperatur = useSelector((store) =>
    store.ewsResources.value.filter((resource) => resource.layerId === 4)
  );

  const handleGWWPCalculation = () => {
    isLoading(true);
    takeScreenshot(view, polygon.centroid, dispatch);

    const point1 = points[0];
    const point2 = points[1];
    // const brunnenabstand = distance([point1.x, point1.y], [point2.x, point2.y]);
    const brunnenabstand = distance(point1, point2);

    const flurabstand = resources[2].feature.attributes["Pixel Value"];
    const gw_macht = resources[3].feature.attributes["Pixel Value"];
    const kf = resources[4].feature.attributes["Pixel Value"];
    const gwt_max = resources[5].feature.attributes["Pixel Value"];
    const gwt_min = resources[7].feature.attributes["Pixel Value"];

    const gst_flaeche = cadastralData.FF;

    const LST =
      bodentemperatur &&
      bodentemperatur.length > 0 &&
      bodentemperatur[0].feature?.attributes?.["Pixel Value"];

    if (
      flurabstand === "NoData" ||
      gw_macht === "NoData" ||
      kf === "NoData" ||
      gwt_max === "NoData" ||
      gwt_min === "NoData" ||
      LST === "NoData"
    ) {
      dispatch(
        updateGWWPComputationResult([
          "Aufgrund fehlender Daten ist für dieses Grundstück keine Berechnung möglich.",
        ])
      );
    } else {
      const result = compute({
        brunnenabstand,
        flurabstand,
        gw_macht,
        gwt_min,
        gwt_max,
        kf,
        gst_flaeche,
        E_HZ: eHZ,
        E_KL: eKL,
        P_HZ: pHZ,
        P_KL: pKL,
        COP_WP: copWP,
        LST,
      });

      dispatch(updateGWWPComputationResult(result));
    }

    isLoading(false);
  };

  useEffect(() => {
    initializeCalculationsMenuHandlers(setPoints, setPolygon);
  }, []);

  const handleEHZ = (event) => {
    if (event.target.value < 0) {
      event.target.value = 0;
    }
    setEHZ(parseInt(event.target.value));
  };

  const handleEKL = (event) => {
    if (event.target.value < 0) {
      event.target.value = 0;
    }
    setEKL(parseInt(event.target.value));
  };

  const handlePHZ = (event) => {
    if (event.target.value < 0) {
      event.target.value = 0;
    }
    setPHZ(parseInt(event.target.value));
  };

  const handlePKL = (event) => {
    if (event.target.value < 0) {
      event.target.value = 0;
    }
    setPKL(parseInt(event.target.value));
  };

  const handleCOPWP = (event) => {
    if (event.target.value < 0) {
      event.target.value = 0;
    }
    setCOPWP(parseInt(event.target.value));
  };

  return (
    <Menu width="300px" ref={ref}>
      <CollapsibleSection
        title="Brunnenpaar berechnen"
        marginBottom="0px"
        open={polygon !== null}
      >
        <CollapsibleContent id="collapsible-content">
          {!polygon && <p>Bitte wählen Sie zuerst ein Grundstück aus!</p>}
          {polygon && (
            <>
              <InputSection>
                <label htmlFor="ehz-input">Jahresheizenergie (optional)</label>
                <Input
                  id="ehz-input"
                  type="number"
                  min="0"
                  placeholder="Wert größer gleich 0"
                  onChange={handleEHZ}
                ></Input>
              </InputSection>
              <InputSection>
                <label htmlFor="ekl-input">Jahreskühlenergie (optional)</label>
                <Input
                  id="ekl-input"
                  type="number"
                  min="0"
                  placeholder="Wert größer gleich 0"
                  onChange={handleEKL}
                ></Input>
              </InputSection>
              <InputSection>
                <label htmlFor="phz-input">Heizleistung in kW (optional)</label>
                <Input
                  id="phz-input"
                  type="number"
                  min="0"
                  placeholder="Wert größer gleich 0"
                  onChange={handlePHZ}
                ></Input>
              </InputSection>
              <InputSection>
                <label htmlFor="pkl-input">Kühlleistung in kW (optional)</label>
                <Input
                  id="pkl-input"
                  type="number"
                  min="0"
                  placeholder="Wert größer gleich 0"
                  onChange={handlePKL}
                ></Input>
              </InputSection>
              <InputSection>
                <label htmlFor="cop-wp-input">
                  durchschnittliche Leistungszahl der Wärmepumpen (optional)
                </label>
                <Input
                  id="cop-wp-input"
                  type="number"
                  min="0"
                  placeholder="Wert größer gleich 0"
                  onChange={handleCOPWP}
                ></Input>
              </InputSection>
              {points.length === 2 && (
                <ButtonContainer>
                  <Button onClick={handleGWWPCalculation}>
                    Berechnung starten
                  </Button>
                </ButtonContainer>
              )}
            </>
          )}
        </CollapsibleContent>
      </CollapsibleSection>
    </Menu>
  );
});

export default CalculationsMenuGWWP;
