import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { updateEWSComputationResult } from "../redux/ewsComputationsSlice";
import { view, initializeCalculationsMenuHandlers } from "../utils/view";
import { calculateGrid } from "../utils/gridcomputer";
import { takeScreenshot } from "../utils/screenshot";
import { initializeParameterMenuHandlers } from "../utils/ParameterMenuEWS";
import { Menu, Button, ButtonContainer } from "./CommonStyledElements";

const CalculationsMenuEWS = React.forwardRef(({ isLoading }, ref) => {
  const [polygon, setPolygon] = useState(null);
  const [gridSpacing, setGridSpacing] = useState(10);
  const [bohrtiefe, setBohrtiefe] = useState(100);
  const [BS_HZ, setBS_HZ] = useState(0);
  const [BS_KL, setBS_KL] = useState(0);
  const [P_KL, setP_KL] = useState(0);
  const [P_HZ, setP_HZ] = useState(0);
  const [points, setPoints] = useState([]);

  const cadastralData = useSelector((store) => store.cadastre.value);
  const resources = useSelector((store) => store.ewsResources.value);
  const betriebsstunden = useSelector((store) => store.betriebsstunden.value);

  const dispatch = useDispatch();

  const handleGridCalculation = () => {
    calculateGrid(polygon, gridSpacing, setPoints);
  };

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
          bohrtiefe,
          points: pointsText,
        }).toString();

      if (BT !== "NoData" && points.length !== 0 && pointsText !== undefined) {
        fetch(url)
          .then((res) => res.json())
          .then((data) => {
            const PHZ_L3 = parseFloat(data[11]);
            const PKL_L3 = parseFloat(data[12]);
            const BS_HZ_L3 = parseFloat(data[13]);
            const BS_KL_L3 = parseFloat(data[14]);
            // const BB_L3 = parseInt(data[15])
            const cover = parseFloat(data[16]);

            const PHZ_L3_bal = parseFloat(data[17]);
            const PKL_L3_bal = parseFloat(data[18]);
            const BS_HZ_bal = parseFloat(data[19]);
            const BS_KL_bal = parseFloat(data[20]);

            const imagehash = "data:image/png;base64," + data[21];
            const imagehash_bal = "data:image/png;base64," + data[22];

            const leistungHZ = (points.length * bohrtiefe * PHZ_L3) / 1000;
            const jahresEnergieMengeHZ = leistungHZ * BS_HZ_L3;

            const leistungKL = (points.length * bohrtiefe * PKL_L3) / 1000;
            const jahresEnergieMengeKL = leistungKL * BS_KL_L3;

            const leistungHZ_bal =
              (points.length * bohrtiefe * PHZ_L3_bal) / 1000;
            const jahresEnergieMengeHZ_bal = leistungHZ_bal * BS_HZ_bal;

            const leistungKL_bal =
              (points.length * bohrtiefe * PKL_L3_bal) / 1000;
            const jahresEnergieMengeKL_bal = leistungKL_bal * BS_KL_L3;

            const differenz_PKL = PKL_L3 - PKL_L3_bal;
            const differenz_BS_KL = BS_KL_bal - BS_KL_L3;

            dispatch(
              updateEWSComputationResult({
                KG: cadastralData.KG,
                GNR: cadastralData.GNR,
                FF: cadastralData.FF,
                points: points.length,
                bohrtiefe,
                leistungHZ,
                jahresEnergieMengeHZ,
                leistungKL,
                jahresEnergieMengeKL,
                cover,
                leistungHZ_bal,
                jahresEnergieMengeHZ_bal,
                leistungKL_bal,
                jahresEnergieMengeKL_bal,
                differenz_PKL,
                differenz_BS_KL,
                imagehash,
                imagehash_bal,
                BS_HZ,
                BS_KL,
                P_HZ,
                P_KL,
                gridSpacing,
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

    initializeParameterMenuHandlers(
      setGridSpacing,
      setBohrtiefe,
      setBS_HZ,
      setBS_KL,
      setP_HZ,
      setP_KL
    );
  }, [dispatch]);

  return (
    <Menu ref={ref}>
      {polygon && (
        <>
          <ButtonContainer>
            <Button onClick={handleGridCalculation}>
              Erdwärmesondennetz zeichnen
            </Button>
          </ButtonContainer>
          <ButtonContainer>
            <Button onClick={handlePythonCalculation}>
              Berechnung starten
            </Button>
          </ButtonContainer>
        </>
      )}
    </Menu>
  );
});

export default CalculationsMenuEWS;
