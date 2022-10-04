import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { distance } from "../utils/gridcomputer";
import { compute } from "../utils/gwwp_computations";
import { initializeParameterMenuHandlers } from "../utils/ParameterMenuGWWP";
import { initializeCalculationsMenuHandlers } from "../utils/viewGWWP";
import { updateGWWPComputationResult } from "../redux/gwwpComputationsSlice";
import { takeScreenshot } from "../utils/viewGWWP";
import { Menu, Button, ButtonContainer } from "./CommonStyledElements";

export default function CalculationsMenu({ isLoading }) {
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

  const handleGWWPCalculation = () => {
    isLoading(true);
    takeScreenshot(polygon.centroid);

    const point1 = points[0];
    const point2 = points[1];
    const brunnenabstand = distance([point1.x, point1.y], [point2.x, point2.y]);

    const flurabstand = resources[2].feature.attributes["Pixel Value"];
    const gw_macht = resources[3].feature.attributes["Pixel Value"];
    const kf = resources[4].feature.attributes["Pixel Value"];
    const gwt_max = resources[5].feature.attributes["Pixel Value"];
    const gwt_min = resources[7].feature.attributes["Pixel Value"];

    const gst_flaeche = cadastralData.FF;

    if (
      flurabstand === "NoData" ||
      gw_macht === "NoData" ||
      kf === "NoData" ||
      gwt_max === "NoData" ||
      gwt_min === "NoData"
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
      });

      dispatch(updateGWWPComputationResult(result));
    }

    isLoading(false);
  };

  useEffect(() => {
    initializeCalculationsMenuHandlers(setPoints, setPolygon);

    initializeParameterMenuHandlers(setEHZ, setEKL, setPHZ, setPKL, setCOPWP);
  }, []);

  return (
    <Menu>
      {Object.keys(cadastralData).length > 0 && points.length >= 2 && (
        <ButtonContainer>
          <Button onClick={handleGWWPCalculation}>Berechnung starten</Button>
        </ButtonContainer>
      )}
    </Menu>
  );
}
