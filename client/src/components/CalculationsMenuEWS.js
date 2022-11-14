import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { useMediaQuery } from "react-responsive";

import { updateEWSComputationResult } from "../redux/ewsComputationsSlice";
import { view, initializeCalculationsMenuHandlers } from "../utils/view";
import { calculateGrid } from "../utils/gridcomputer";
import { takeScreenshot } from "../utils/screenshot";
import { Button, ButtonContainer, Warning } from "./CommonStyledElements";
import CollapsibleSection from "./CollapsibleSection";

const InputSection = styled.div`
  padding-bottom: 10px;
`;

const Input = styled.input`
  box-sizing: border-box;
  width: 100%;
  padding: 0;
  margin: 0;
`;

const CollapsibleContent = styled.div`
  box-sizing: border-box;
  padding: 15px 15px;
`;

const CalculationsMenuEWS = React.forwardRef(({ isLoading, sketch }, ref) => {
  const [polygon, setPolygon] = useState(null);
  const [gridSpacing, setGridSpacing] = useState(10);
  const [boreDepth, setBoreDepth] = useState(100);
  const [BS_HZ, setBS_HZ] = useState(0);
  const [BS_KL, setBS_KL] = useState(0);
  const [P_KL, setP_KL] = useState(0);
  const [P_HZ, setP_HZ] = useState(0);
  const [points, setPoints] = useState([]);
  const [heating, setHeating] = useState(35);

  const cadastralData = useSelector((store) => store.cadastre.value);
  const resources = useSelector((store) => store.ewsResources.value);
  const betriebsstunden = useSelector((store) => store.betriebsstunden.value);

  const sketchContainerRef = useRef(null);

  const dispatch = useDispatch();

  const isMobile = useMediaQuery({ maxWidth: 480 });

  // run python script with values from layers
  const handlePythonCalculation = () => {
    if (cadastralData && resources && points.length <= 300) {
      isLoading(true);
      takeScreenshot(view, polygon.centroid, dispatch);

      let pointsText = JSON.stringify(points);

      const BT = resources.find((result) => result.layerId === 4)?.feature
        ?.attributes["Pixel Value"];
      const GT = resources.find((result) => result.layerId === 5)?.feature
        ?.attributes["Pixel Value"];
      const WLF = resources.find((result) => result.layerId === 6)?.feature
        ?.attributes["Pixel Value"];

      const BS_KL_Norm = parseInt(
        betriebsstunden.find((result) => result.layerId === 0)?.feature
          ?.attributes["Pixel Value"]
      );
      const BS_HZ_Norm = parseInt(
        betriebsstunden.find((result) => result.layerId === 1)?.feature
          ?.attributes["Pixel Value"]
      );

      let url = "/api";

      const data = {
        BT,
        GT,
        WLF,
        BS_HZ_Norm,
        BS_KL_Norm,
        BS_HZ: BS_HZ,
        BS_KL: BS_KL,
        P_HZ: P_HZ,
        P_KL: P_KL,
        boreDepth,
        points: pointsText,
        heating,
      };

      if (
        Object.values(data).every(
          (x) => typeof x !== "undefined" && x !== null
        ) &&
        BT !== "NoData" &&
        GT !== "NoData" &&
        WLF !== "NoData" &&
        BS_HZ_Norm !== "NoData" &&
        BS_KL_Norm !== "NoData"
      ) {
        fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
          .then((res) => res.json())
          .then((data) => {
            // user defined input
            const calculationMode = data[0];
            const P_HZ_user = parseFloat(data[1]);
            const P_KL_user = -parseFloat(data[2]);
            const E_HZ_user = parseFloat(data[3]) / 1000;
            const E_KL_user = -(parseFloat(data[4]) / 1000);
            const cover = parseInt(data[5]);
            const Pel_heatpump_user = parseFloat(data[6]);
            const Pel_chiller_user = -parseFloat(data[7]);
            const Eel_heatpump_user = parseFloat(data[8]) / 1000;
            const Eel_chiller_user = -parseFloat(data[9]) / 1000;

            const COP = parseFloat(data[15]);
            const EER = parseFloat(data[16]);
            const SCOP = parseFloat(data[17]);
            const SEER = parseFloat(data[18]);
            const Efactor_user = parseFloat(data[19]);

            const imagehash = "data:image/png;base64," + data[20];
            const imagehashSondenfeld = "data:image/png;base64," + data[21];

            const GTcalc = parseFloat(data[22]);

            const heizleistung = P_HZ_user + Pel_heatpump_user;
            const heizarbeit = E_HZ_user + Eel_heatpump_user;

            const kuehlleistung = P_KL_user - Pel_chiller_user;
            const kuehlarbeit = E_KL_user - Eel_chiller_user;

            // automatically balanced
            const balanced = parseInt(data[23]);
            const P_HZ_bal = parseFloat(data[24]);
            const P_KL_bal = -parseFloat(data[25]);
            const E_HZ_bal = parseFloat(data[26]) / 1000;
            const E_KL_bal = -parseFloat(data[27]) / 1000;
            const cover_bal = parseInt(data[28]);
            const Pel_heatpump_bal = parseFloat(data[29]);
            const Pel_chiller_bal = -parseFloat(data[30]);
            const Eel_heatpump_bal = parseFloat(data[31]) / 1000;
            const Eel_chiller_bal = -parseFloat(data[32]) / 1000;

            const meanBoreholeSpacing = parseFloat(data[36]);
            const cover_rise = parseFloat(data[37]);
            const COP_bal = parseFloat(data[38]);
            const EER_bal = parseFloat(data[39]);
            const SCOP_bal = parseFloat(data[40]);
            const SEER_bal = parseFloat(data[41]);

            const Efactor_bal = parseFloat(data[42]);

            const imagehashBal = "data:image/png;base64," + data[43];

            const BS_HZ_bal = parseFloat(data[44]);
            const BS_KL_bal = parseFloat(data[45]);

            const T_radiator = parseInt(data[46]);

            const heizleistungBal = P_HZ_bal + Pel_heatpump_bal;
            const heizarbeitBal = Eel_heatpump_bal + E_HZ_bal;

            const kuehlleistungBal = P_KL_bal - Pel_chiller_bal;
            const kuehlarbeitBal = E_KL_bal - Eel_chiller_bal;

            dispatch(
              updateEWSComputationResult({
                calculationMode,
                points: points.length,
                meanBoreholeSpacing,
                boreDepth,
                P_HZ,
                P_KL,
                BS_HZ,
                BS_KL,
                BS_HZ_Norm,
                BS_KL_Norm,
                P_HZ_user,
                P_KL_user,
                Pel_heatpump_user,
                Pel_chiller_user,
                E_HZ_user,
                E_KL_user,
                Efactor_user,
                Eel_heatpump_user,
                Eel_chiller_user,
                cover,
                imagehash,
                imagehashSondenfeld,
                balanced,
                P_HZ_bal,
                P_KL_bal,
                Pel_heatpump_bal,
                Pel_chiller_bal,
                Eel_heatpump_bal,
                Efactor_bal,
                E_HZ_bal,
                cover_bal,
                imagehashBal,
                heizleistung,
                heizarbeit,
                kuehlleistung,
                kuehlarbeit,
                heizleistungBal,
                heizarbeitBal,
                kuehlleistungBal,
                GTcalc,
                COP,
                SCOP,
                EER,
                SEER,
                BS_HZ_bal,
                BS_KL_bal,
                COP_bal,
                EER_bal,
                E_KL_bal,
                SEER_bal,
                SCOP_bal,
                Eel_chiller_bal,
                kuehlarbeitBal,
                cover_rise,
                T_radiator,
              })
            );
            isLoading(false);
          })
          .catch((err) => {
            dispatch(
              updateEWSComputationResult({
                error: JSON.stringify(err),
              })
            );
          });
      } else {
        dispatch(
          updateEWSComputationResult({
            error:
              "Aufgrund ungültiger Daten ist für dieses Grundstück keine Berechnung möglich.",
          })
        );
        isLoading(false);
      }
    }
  };

  useEffect(() => {
    // initialize callback functions
    initializeCalculationsMenuHandlers(setPoints, setPolygon);

    // add sketch widget to calculations menu
    sketch.container = sketchContainerRef.current;

    // cleanup
    return () => {
      // set polygon to null when user switches to mobile
      setPolygon(null);
    };
  }, [isMobile, sketch]);

  // reset state
  useEffect(() => {
    setGridSpacing(10);
    // setBoreDepth(100);
    // setBS_HZ(0);
    // setBS_KL(0);
    // setP_HZ(0);
    // setP_KL(0);
  }, [polygon]);

  const handleGridSpacing = (event) => {
    if (event.target.value < 5) {
      event.target.value = 5;
    } else if (event.target.value > 15) {
      event.target.value = 15;
    }
    const value = parseInt(event.target.value);
    setGridSpacing(value);
    calculateGrid(polygon, value, setPoints);
  };

  const handleDepth = (event) => {
    if (event.target.value > 250) {
      event.target.value = 250;
    } else if (event.target.value < 80) {
      event.target.value = 80;
    }
    setBoreDepth(parseInt(event.target.value));
  };

  const handleBS_HZ = (event) => {
    if (event.target.value > 4379) {
      event.target.value = 4379;
    } else if (event.target.value < 0) {
      event.target.value = 0;
    }
    setBS_HZ(parseInt(event.target.value));
  };

  const handleBS_KL = (event) => {
    if (event.target.value > 4379) {
      event.target.value = 4379;
    } else if (event.target.value < 0) {
      event.target.value = 0;
    }
    setBS_KL(parseInt(event.target.value));
  };

  const handleP_HZ = (event) => {
    if (event.target.value < 0) {
      event.target.value = 0;
    }
    setP_HZ(parseInt(event.target.value));
  };

  const handleP_KL = (event) => {
    if (event.target.value < 0) {
      event.target.value = 0;
    }
    setP_KL(parseInt(event.target.value));
  };

  const handleKeyDown = (event) => {
    event.preventDefault();
  };

  const handleHeating = (event) => {
    setHeating(event.target.value);
  };

  return (
    <CollapsibleSection
      title="Berechnungsmenü"
      marginBottom="0px"
      open={!isMobile}
      ref={ref}
      width="300px"
      isMobile={isMobile}
      flex={true}
    >
      <CollapsibleContent id="collapsible-content">
        <>
          <InputSection>
            <label>Sondenpunkte auswählen oder zeichnen</label>
            <div ref={sketchContainerRef}></div>
          </InputSection>
          <InputSection>
            <label htmlFor="gridspacing-input">Heizart </label>
            <select id="gridspacing-input" onChange={handleHeating}>
              <option value={35}>Fußbodenheizung</option>
              <option value={50}>Radiator</option>
            </select>
          </InputSection>
          <InputSection>
            <label htmlFor="gridspacing-input">Sondenabstand in Meter</label>
            <Input
              id="gridspacing-input"
              type="number"
              min="5"
              max="15"
              placeholder="Wert zwischen 15 und 15 m (default=100)"
              value={gridSpacing}
              onChange={handleGridSpacing}
              onKeyDown={handleKeyDown}
            ></Input>
          </InputSection>
          <InputSection>
            <label htmlFor="depth-input">Sondentiefe in Meter</label>
            <Input
              id="depth-input"
              type="number"
              min="80"
              max="250"
              placeholder="Wert zwischen 80 und 250 m (default=100)"
              value={boreDepth}
              onChange={handleDepth}
              onKeyDown={handleKeyDown}
            ></Input>
          </InputSection>
          <InputSection>
            <label htmlFor="phz-input">Heizleistung in kW (optional)</label>
            <Input
              id="phz-input"
              type="number"
              min="0"
              placeholder="Wert größer 0"
              onChange={handleP_HZ}
              value={P_HZ}
            ></Input>
          </InputSection>
          <InputSection>
            <label htmlFor="pkl-input">Kühlleistung in kW (optional)</label>
            <Input
              id="pkl-input"
              type="number"
              min="0"
              placeholder="Wert größer 0"
              onChange={handleP_KL}
              value={P_KL}
            ></Input>
          </InputSection>
          <InputSection>
            <label htmlFor="bshz-input">
              Jahresbetriebsstunden Heizen (optional)
            </label>
            <Input
              id="bshz-input"
              type="number"
              min="0"
              max="4379"
              placeholder="Wert zwischen 0 und 4379"
              onChange={handleBS_HZ}
              value={BS_HZ}
            ></Input>
          </InputSection>
          <InputSection>
            <label htmlFor="bskl-input">
              Jahresbetriebsstunden Kühlen (optional)
            </label>
            <Input
              id="bskl-input"
              type="number"
              min="0"
              max="4379"
              placeholder="Wert zwischen 0 und 4379"
              onChange={handleBS_KL}
              value={BS_KL}
            ></Input>
          </InputSection>
          {(P_HZ > 0 || P_KL > 0 || BS_HZ > 0 || BS_KL > 0) &&
            (P_HZ === 0 || P_KL === 0 || BS_HZ === 0 || BS_KL === 0) && (
              <Warning>
                Solange nicht alle Parameter ausgefüllt sind, wird mit
                Normwerten gerechnet.
              </Warning>
            )}
          {points.length > 300 && (
            <Warning>
              Es sind maximal 300 Punkte möglich. Bitte löschen Sie zuerst
              Punkte.
            </Warning>
          )}
          {points.length === 0 && (
            <Warning>Bitte zeichnen Sie mindestens einen Punkt!</Warning>
          )}
          {points.length > 0 && points.length <= 300 && (
            <ButtonContainer>
              <Button onClick={handlePythonCalculation}>
                Berechnung starten
              </Button>
            </ButtonContainer>
          )}
        </>
      </CollapsibleContent>
    </CollapsibleSection>
  );
});

export default CalculationsMenuEWS;
