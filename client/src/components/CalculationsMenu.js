import React, { useState, useEffect } from "react";

import styled from "styled-components";

import { useDispatch } from "react-redux";
import { updateWithResult } from "../redux/computationResultSlice";

import {
  initializeCalculationsMenuHandlers,
  takeScreenshot,
} from "../utils/view";
import { calculateGrid } from "../utils/orthogonal_gridcomputer";
import { initializeParameterMenuHandlers } from "../utils/ParameterMenu";

const Menu = styled.div`
  position: absolute;
  top: 15px;
  left: 50%;
  transform: translate(-50%);
  margin: 0px;
  border: none;
  color: #444444;
  background-color: white;
  width: 250px;
  height: auto;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  flex-direcation: column;
`;

const ButtonDiv = styled.div`
  padding: 5px;
  width: 100%;
`;

const Button = styled.button`
  position: relative;
  width: 100%;
  height: 40px;
  margin: 0px;
  padding: 0px;
  border: none;
  cursor: pointer;
`;

export default function CalculationsMenu({ isLoading }) {
  const [polygon, setPolygon] = useState(null);
  const [gridSpacing, setGridSpacing] = useState(10);
  const [bohrtiefe, setBohrtiefe] = useState(100);
  const [BS_HZ, setBS_HZ] = useState(0);
  const [BS_KL, setBS_KL] = useState(0);
  const [P_KL, setP_KL] = useState(0);
  const [P_HZ, setP_HZ] = useState(0);
  const [identifyResults, setIdentifyResults] = useState(null);
  const [gridPoints, setGridPoints] = useState([]);
  const [cadastralData, setCadastralData] = useState(null);

  const dispatch = useDispatch();

  const handleGridCalculation = () => {
    calculateGrid(polygon, gridSpacing, setGridPoints);
  };

  // run python script with values from layers
  const handlePythonCalculation = () => {
    if (cadastralData && identifyResults) {
      takeScreenshot(polygon.centroid);
      isLoading(true);
      let points = JSON.stringify(
        gridPoints.map((point) => [point.x, point.y])
      );
      let url = "https://geothermie-atlas.herokuapp.com/api";
      url +=
        "?" +
        new URLSearchParams({
          EZ: cadastralData.EZ,
          BT: identifyResults.BT,
          GT: identifyResults.GT,
          WLF: identifyResults.WLF,
          BS_HZ_Norm: identifyResults.BS_HZ_Norm,
          BS_KL_Norm: identifyResults.BS_KL_Norm,
          BS_HZ: BS_HZ,
          BS_KL: BS_KL,
          P_HZ: P_HZ,
          P_KL: P_KL,
          FF: cadastralData.FF,
          bohrtiefe,
          points,
        }).toString();
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

          const leistungHZ = (gridPoints.length * bohrtiefe * PHZ_L3) / 1000;
          const jahresEnergieMengeHZ = leistungHZ * BS_HZ_L3;

          const leistungKL = (gridPoints.length * bohrtiefe * PKL_L3) / 1000;
          const jahresEnergieMengeKL = leistungKL * BS_KL_L3;

          const leistungHZ_bal =
            (gridPoints.length * bohrtiefe * PHZ_L3_bal) / 1000;
          const jahresEnergieMengeHZ_bal = leistungHZ_bal * BS_HZ_bal;

          const leistungKL_bal =
            (gridPoints.length * bohrtiefe * PKL_L3_bal) / 1000;
          const jahresEnergieMengeKL_bal = leistungKL_bal * BS_KL_L3;

          const differenz_PKL = PKL_L3 - PKL_L3_bal;
          const differenz_BS_KL = BS_KL_bal - BS_KL_L3;

          dispatch(
            updateWithResult({
              KG: cadastralData.KG,
              GNR: cadastralData.GNR,
              FF: cadastralData.FF,
              gridPoints: gridPoints.length,
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
            })
          );
          isLoading(false);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  useEffect(() => {
    initializeCalculationsMenuHandlers(
      setPolygon,
      setIdentifyResults,
      setGridPoints,
      dispatch,
      setCadastralData
    );

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
    <Menu>
      {polygon && (
        <>
          <ButtonDiv>
            <Button onClick={handleGridCalculation}>
              Erdwärmesondennetz zeichnen
            </Button>
          </ButtonDiv>
          <ButtonDiv>
            <Button onClick={handlePythonCalculation}>
              Berechnung starten
            </Button>
          </ButtonDiv>
        </>
      )}
    </Menu>
  );
}
