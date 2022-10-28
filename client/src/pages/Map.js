import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import { useMediaQuery } from "react-responsive";

import InfoPanelEWS from "../components/InfoPanelEWS";
import InfoPanelGWWP from "../components/InfoPanelGWWP";
import CalculationsMenuEWS from "../components/CalculationsMenuEWS";
import CalculationsMenuGWWP from "../components/CalculationsMenuGWWP";
import LoadingSpinner from "../components/LoadingSpinner";

import { initialize } from "../utils/view";

const MapContainer = styled.div`
  box-sizing: border-box;
  position: absolute;
  top: 7%;
  bottom: 0;
  height: 93%;
  width: 100%;
  padding: 0;
  margin: 0;
`;

const MenuContainer = styled.div`
  position: absolute;
  display: flex;
  flex-flow: column;
  box-sizing: border-box;
  top: 0px;
  right: 0px;
  margin: 15px;
  width: ${(props) => props.width};
  height: fit-content;
  max-height: ${(props) => props.maxHeight};
`;

const Map = ({ theme }) => {
  const mapDiv = useRef(null);
  const calculationsMenuRef = useRef(null);

  const isMobile = useMediaQuery({ maxWidth: 480 });

  const [loading, setLoading] = useState(null);

  useEffect(() => {
    // initialize the map interface
    let calculationsMenu = calculationsMenuRef.current;
    let { mapView, sketch } = initialize(
      mapDiv.current,
      theme,
      calculationsMenu,
      isMobile
    );

    return () => {
      // destroy map view when component gets unmounted
      if (mapView && sketch) {
        sketch.destroy();
        mapView.destroy();
      }
    };
  }, [theme, isMobile]);

  switch (theme) {
    case "EWS":
      return (
        <MapContainer ref={mapDiv} key={theme}>
          <MenuContainer
            width={isMobile ? "300px" : "23%"}
            maxHeight={isMobile ? "80%" : "93%"}
          >
            <InfoPanelEWS></InfoPanelEWS>
            <CalculationsMenuEWS
              ref={calculationsMenuRef}
              isLoading={setLoading}
            ></CalculationsMenuEWS>
          </MenuContainer>
          {loading && <LoadingSpinner></LoadingSpinner>}
        </MapContainer>
      );
    case "GWWP":
      return (
        <MapContainer ref={mapDiv} key={theme}>
          <MenuContainer
            width={isMobile ? "300px" : "23%"}
            maxHeight={isMobile ? "80%" : "93%"}
          >
            <InfoPanelGWWP></InfoPanelGWWP>
            <CalculationsMenuGWWP
              ref={calculationsMenuRef}
              isLoading={setLoading}
            ></CalculationsMenuGWWP>
          </MenuContainer>
          {loading && <LoadingSpinner></LoadingSpinner>}
        </MapContainer>
      );
    default:
      break;
  }
};

export default Map;
