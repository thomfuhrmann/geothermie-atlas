import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";

import { updateEWSComputationResult } from "../redux/ewsComputationsSlice";
import {
  view,
  initializeCalculationsMenuHandlers,
  updateGridSpacing,
} from "../utils/view";
import { calculateGrid } from "../utils/gridcomputer";
import { takeScreenshot } from "../utils/screenshot";
import { Menu, Button, ButtonContainer } from "./CommonStyledElements";
import CollapsibleSection from "./CollapsibleSection";

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

const CollapsibleContent = styled.div`
  padding: 15px 18px;
`;

const CalculationsMenuEWS = React.forwardRef(({ isLoading }, ref) => {
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

  const gridSpacingInputRef = useRef(null);

  const dispatch = useDispatch();

  // run python script with values from layers
  const handlePythonCalculation = () => {
    if (cadastralData && resources) {
      isLoading(true);
      takeScreenshot(view, polygon.centroid, dispatch);

      let pointsText = JSON.stringify(
        points.map((point) => [point.x, point.y])
      );

      const BT = resources.find((result) => result.layerId === 4)?.feature
        ?.attributes["Pixel Value"];
      const GT = resources.find((result) => result.layerId === 5)?.feature
        ?.attributes["Pixel Value"];
      const WLF = resources.find((result) => result.layerId === 6)?.feature
        ?.attributes["Pixel Value"];

      const BS_KL_Norm = betriebsstunden.find((result) => result.layerId === 0)
        ?.feature?.attributes["Pixel Value"];
      const BS_HZ_Norm = betriebsstunden.find((result) => result.layerId === 1)
        ?.feature?.attributes["Pixel Value"];

      let url = "/api";
      url +=
        "?" +
        new URLSearchParams({
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
        }).toString();

      if (BT !== "NoData" && points.length !== 0 && pointsText !== undefined) {
        fetch(url)
          .then((res) => res.json())
          .then((data) => {
            const PHZ_L3 = parseFloat(data[11]);
            const PKL_L3 = Math.abs(parseFloat(data[12]));
            const BS_HZ_L3 = parseFloat(data[13]);
            const BS_KL_L3 = parseFloat(data[14]);
            // const BB_L3 = parseInt(data[15])
            const cover = parseFloat(data[16]);

            const PHZ_L3_bal = parseFloat(data[17]);
            const PKL_L3_bal = Math.abs(parseFloat(data[18]));
            const BS_HZ_bal = parseFloat(data[19]);
            const BS_KL_bal = parseFloat(data[20]);

            const imagehash = "data:image/png;base64," + data[21];
            const imagehash_bal = "data:image/png;base64," + data[22];

            const leistungHZ = (points.length * boreDepth * PHZ_L3) / 1000;
            const jahresEnergieMengeHZ = leistungHZ * BS_HZ_L3;

            const leistungKL = (points.length * boreDepth * PKL_L3) / 1000;
            const jahresEnergieMengeKL = leistungKL * BS_KL_L3;

            const leistungHZ_bal =
              (points.length * boreDepth * PHZ_L3_bal) / 1000;
            const jahresEnergieMengeHZ_bal = leistungHZ_bal * BS_HZ_bal;

            const leistungKL_bal =
              (points.length * boreDepth * PKL_L3_bal) / 1000;
            const jahresEnergieMengeKL_bal = leistungKL_bal * BS_KL_L3;

            const differenz_PHZ = PHZ_L3_bal - PHZ_L3;
            const differenz_BS_HZ = BS_HZ_bal - BS_HZ_L3;

            const differenz_PKL = PKL_L3_bal - PKL_L3;
            const differenz_BS_KL = BS_KL_bal - BS_KL_L3;

            dispatch(
              updateEWSComputationResult({
                KG: cadastralData.KG,
                GNR: cadastralData.GNR,
                FF: cadastralData.FF,
                points: points.length,
                boreDepth,
                leistungHZ,
                jahresEnergieMengeHZ,
                leistungKL,
                jahresEnergieMengeKL,
                cover,
                leistungHZ_bal,
                jahresEnergieMengeHZ_bal,
                leistungKL_bal,
                jahresEnergieMengeKL_bal,
                differenz_PHZ,
                differenz_BS_HZ,
                differenz_PKL,
                differenz_BS_KL,
                imagehash,
                imagehash_bal,
                BS_HZ,
                BS_KL,
                P_HZ,
                P_KL,
              })
            );
            isLoading(false);
          })
          .catch((err) => {
            console.log(err);
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
    }
  };

  useEffect(() => {
    initializeCalculationsMenuHandlers(setPoints, setPolygon);
  }, []);

  // update current value of grid spacing
  // used when user clicks on a new parcel
  useEffect(() => {
    updateGridSpacing(gridSpacing);
  }, [gridSpacing]);

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

  return (
    <Menu width="300px" ref={ref}>
      <CollapsibleSection
        title="Berechnnungen"
        marginBottom="0px"
        open={polygon !== null}
      >
        <CollapsibleContent id="collapsible-content">
          {!polygon && <p>Bitte wählen Sie zuerst ein Grundstück aus!</p>}
          {polygon && (
            <>
              <InputSection>
                <label htmlFor="gridspacing-input">
                  Sondenabstand in Meter
                </label>
                <Input
                  id="gridspacing-input"
                  type="number"
                  min="5"
                  max="15"
                  placeholder="zwischen 5 und 15 m (default=10)"
                  value={gridSpacing}
                  onChange={handleGridSpacing}
                  ref={gridSpacingInputRef}
                ></Input>
              </InputSection>
              <InputSection>
                <label htmlFor="depth-input">Sondentiefe in Meter</label>
                <Input
                  id="depth-input"
                  type="number"
                  min="80"
                  max="250"
                  placeholder="zwischen 80 und 250 m (default=100)"
                  value={boreDepth}
                  onChange={handleDepth}
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
                  placeholder="zwischen 0 und 4379"
                  onChange={handleBS_HZ}
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
                  placeholder="zwischen 0 und 4379"
                  onChange={handleBS_KL}
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
                ></Input>
              </InputSection>
              <ButtonContainer>
                <Button onClick={handlePythonCalculation}>
                  Berechnung starten
                </Button>
              </ButtonContainer>
            </>
          )}
        </CollapsibleContent>
      </CollapsibleSection>
    </Menu>
  );
});

export default CalculationsMenuEWS;
