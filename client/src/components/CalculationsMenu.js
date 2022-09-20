import React, { useState, useEffect } from "react";

import styled from "styled-components";

import { useDispatch } from "react-redux";
import { updateWithResult } from "../redux/computationResultSlice";

import { initializeCalculationsMenu, takeScreenshot } from "../utils/view";
import { calculateGrid } from "../utils/orthogonal_gridcomputer";
import { initializeParameterMenu } from "../utils/ParameterMenu";

const Menu = styled.div`
    position: absolute;
    top: 15px;
    left: 50%;
    transform: translate(-50%);
    margin:0px;
    border: none;
    color: #444444;
    background-color: white;
    width: 200px;
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
    height: 30px;
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
        if (identifyResults) {
            takeScreenshot(polygon.centroid);
            isLoading(true);
            let url = "/api";
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
                    bohrtiefe
                }).toString();
            fetch(url)
                .then((res) => res.json())
                .then((data) => {
                    const leistung = gridPoints.length * bohrtiefe * parseFloat(data[15]) / 1000;
                    const jahresEnergieMengeKuehlen = leistung * identifyResults.BS_KL_Norm;
                    const jahresEnergieMengeHeizen = leistung * identifyResults.BS_HZ_Norm;

                    const sondenleistung = parseFloat(data[11]);
                    const sondenanzahl = parseInt(data[12]);
                    const bohrmeter = parseInt(data[13]);
                    const flaeche = parseInt(data[14]);

                    dispatch(updateWithResult({ KG: cadastralData.KG, GNR: cadastralData.GNR, FF: cadastralData.FF, leistung, jahresEnergieMengeKuehlen, jahresEnergieMengeHeizen, gridPoints: gridPoints.length, bohrtiefe, sondenleistung, sondenanzahl, bohrmeter, flaeche }));
                    isLoading(false);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    };

    useEffect(() => {
        initializeCalculationsMenu(
            setPolygon,
            setIdentifyResults,
            setGridPoints,
            dispatch,
            setCadastralData
        );

        initializeParameterMenu(setGridSpacing, setBohrtiefe, setBS_HZ, setBS_KL, setP_HZ, setP_KL);
    }, [dispatch]);


    return ((<Menu> {
        polygon && <>
            <ButtonDiv><Button onClick={handleGridCalculation}>Erdwärmesondennetz zeichnen</Button></ButtonDiv>
            <ButtonDiv><Button onClick={handlePythonCalculation}>Berechnung starten</Button></ButtonDiv>
        </>}
    </Menu>)
    );
}