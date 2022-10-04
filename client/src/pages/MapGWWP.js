import React, { useRef, useEffect, useState } from "react";

import styled from "styled-components";

import InfoPanelGWWP from "../components/InfoPanelGWWP";
import CalculationsMenuGWWP from "../components/CalculationsMenuGWWP";
import LoadingSpinner from "../components/LoadingSpinner";

import { initialize } from "../utils/viewGWWP";

const MapContainer = styled.div`
  position: absolute;
  bottom: 0;
  padding: 0;
  margin: 0;
  height: 95%;
  width: 100%;
`;

const MapGWWP = () => {
  const mapDiv = useRef(null);

  const [loading, setLoading] = useState(null);

  useEffect(() => {
    // initialize the map interface
    let view = initialize(mapDiv.current);
    return () => {
      //view.container = null; view.map = null;
      view.destroy();
    };
  }, []);

  return (
    <MapContainer ref={mapDiv}>
      <CalculationsMenuGWWP isLoading={setLoading}></CalculationsMenuGWWP>
      <InfoPanelGWWP></InfoPanelGWWP>
      {loading && <LoadingSpinner></LoadingSpinner>}
    </MapContainer>
  );
};

export default MapGWWP;
