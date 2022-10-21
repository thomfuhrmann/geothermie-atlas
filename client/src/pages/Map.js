import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";

import InfoPanelEWS from "../components/InfoPanelEWS";
import InfoPanelGWWP from "../components/InfoPanelGWWP";
import CalculationsMenuEWS from "../components/CalculationsMenuEWS";
import CalculationsMenuGWWP from "../components/CalculationsMenuGWWP";
import LoadingSpinner from "../components/LoadingSpinner";

import { initialize } from "../utils/view";

const MapContainer = styled.div`
  position: absolute;
  box-sizing: border-box;
  bottom: 0;
  padding: 0;
  margin: 0;
  top: 7%;
  height: 93%;
  width: 100%;
`;

const Map = ({ theme }) => {
  const mapDiv = useRef(null);
  const calculationsMenuRef = useRef(null);

  const [loading, setLoading] = useState(null);

  useEffect(() => {
    // initialize the map interface
    let view = initialize(mapDiv.current, theme, calculationsMenuRef.current);

    return () => {
      if (view) {
        view.destroy();
      }
    };
  }, [theme]);

  switch (theme) {
    case "EWS":
      return (
        <MapContainer ref={mapDiv} key={theme}>
          <InfoPanelEWS></InfoPanelEWS>
          <CalculationsMenuEWS
            ref={calculationsMenuRef}
            isLoading={setLoading}
          ></CalculationsMenuEWS>
          {loading && <LoadingSpinner></LoadingSpinner>}
        </MapContainer>
      );
    case "GWWP":
      return (
        <MapContainer ref={mapDiv} key={theme}>
          <InfoPanelGWWP></InfoPanelGWWP>
          <CalculationsMenuGWWP
            ref={calculationsMenuRef}
            isLoading={setLoading}
          ></CalculationsMenuGWWP>
          {loading && <LoadingSpinner></LoadingSpinner>}
        </MapContainer>
      );
    default:
      break;
  }
};

export default Map;
