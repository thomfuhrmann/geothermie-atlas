import React, { useRef, useEffect, useState } from "react";

import styled from "styled-components";

import InfoPanel from "../components/InfoPanel";
import CalculationsMenu from "../components/CalculationsMenu";
import LoadingSpinner from "../components/LoadingSpinner";

import { initialize } from "../utils/view";

const MapContainer = styled.div`
  position: absolute;
  bottom: 0;
  padding: 0;
  margin: 0;
  height: 95%;
  width: 100%;
`;

const Map = () => {
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
      <CalculationsMenu isLoading={setLoading}></CalculationsMenu>
      <InfoPanel></InfoPanel>
      {loading && <LoadingSpinner></LoadingSpinner>}
    </MapContainer>
  );
};

export default Map;
