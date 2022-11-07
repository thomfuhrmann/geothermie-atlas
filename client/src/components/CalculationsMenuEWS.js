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
        EZ: cadastralData.GNR,
        BT,
        GT,
        WLF,
        BS_HZ_Norm,
        BS_KL_Norm,
        BS_HZ: BS_HZ,
        BS_KL: BS_KL,
        P_HZ: P_HZ,
        P_KL: P_KL,
        FF: cadastralData.FF,
        boreDepth,
        points: pointsText,
      };

      if (BT !== "NoData" && points.length !== 0 && pointsText !== undefined) {
        fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
          .then((res) => res.json())
          .then((data) => {
            const meanBoreholeSpacing = gridSpacing;

            const calculationMode = data[11];
            const heizleistung = parseFloat(data[12]).toFixed(1);
            const kuehlleistung = -parseFloat(data[13]).toFixed(1);
            const strombedarf = parseFloat(data[17]).toFixed(1);
            const heizarbeit = (parseFloat(data[14]) / 1000).toFixed(1);
            const kuehlarbeit = -(parseFloat(data[15]) / 1000).toFixed(1);
            const energiefaktor = parseFloat(data[25]).toFixed(1);
            const energiebedarf = (parseFloat(data[19]) / 1000).toFixed(1);
            const cover = parseInt(data[16]);
            const imagehash = "data:image/png;base64," + data[26];
            const imagehashSondenfeld = "data:image/png;base64," + data[27];

            const balanced = parseInt(data[28]);
            const heizleistung_bal = parseFloat(data[29]).toFixed(1);
            const kuehlleistung_bal = -parseFloat(data[30]).toFixed(1);
            const strombedarf_bal = parseFloat(data[34]).toFixed(1);
            const heizarbeit_bal = (parseFloat(data[31]) / 1000).toFixed(1);
            const kuehlarbeit_bal = -(parseFloat(data[32]) / 1000).toFixed(1);
            const energiefaktor_bal = parseFloat(data[42]).toFixed(1);
            const energiebedarf_bal = (parseFloat(data[36]) / 1000).toFixed(1);
            const cover_bal = parseInt(data[33]);
            const imagehash_bal = "data:image/png;base64," + data[43];

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
                heizleistung,
                kuehlleistung,
                strombedarf,
                heizarbeit,
                kuehlarbeit,
                energiefaktor,
                energiebedarf,
                cover,
                imagehash,
                imagehashSondenfeld,
                balanced,
                heizleistung_bal,
                kuehlleistung_bal,
                strombedarf_bal,
                heizarbeit_bal,
                kuehlarbeit_bal,
                energiefaktor_bal,
                energiebedarf_bal,
                cover_bal,
                imagehash_bal,
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
      } else if (points.length === 0) {
        dispatch(
          updateEWSComputationResult({
            error: "Bitte zeichnen Sie zuerst ein Sondennetz!",
          })
        );
        isLoading(false);
      } else {
        dispatch(
          updateEWSComputationResult({
            error:
              "Aufgrund fehlender Daten ist für dieses Grundstück keine Berechnung möglich.",
          })
        );
        isLoading(false);
      }
    } else if (points.length > 300) {
      dispatch(
        updateEWSComputationResult({
          error: "Es sind maximal 300 Punkte möglich.",
        })
      );
      isLoading(false);
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

  return (
    <CollapsibleSection
      title="Berechnungsmenü"
      marginBottom="0px"
      open={!isMobile}
      ref={ref}
      width="300px"
      isMobile={isMobile}
    >
      <CollapsibleContent id="collapsible-content">
        <>
          <label>Sondenpunkte auswählen oder zeichnen</label>
          <div ref={sketchContainerRef}></div>
          <InputSection>
            <label htmlFor="gridspacing-input">Sondenabstand in Meter</label>
            <Input
              id="gridspacing-input"
              type="number"
              min="5"
              max="15"
              placeholder="Wert zwischen 5 und 15 m (default=10)"
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
              Volllaststunden Heizen (optional)
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
              Volllaststunden Kühlen (optional)
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
          {points.length > 0 ? (
            <ButtonContainer>
              <Button onClick={handlePythonCalculation}>
                Berechnung starten
              </Button>
            </ButtonContainer>
          ) : (
            <Warning>Bitte zeichnen Sie mindestens einen Punkt!</Warning>
          )}
        </>
      </CollapsibleContent>
    </CollapsibleSection>
  );
});

export default CalculationsMenuEWS;
