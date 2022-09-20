import React, { useRef, useEffect, useState } from "react";

import styled from "styled-components";

import Header from "./components/Header";
import InfoPanel from "./components/InfoPanel";
import CalculationsMenu from "./components/CalculationsMenu";
import LoadingSpinner from "./components/LoadingSpinner";

import { initialize } from "./utils/view";

const StyledMapDiv = styled.div`
  padding: 0;
  margin: 0;
  height: 95%;
  width: 100%;
  position: absolute;
  bottom: 0;
`;

function App() {
  const mapDiv = useRef(null);

  const [loading, setLoading] = useState(null);

  useEffect(() => {
    // initialize the map interface
    initialize(mapDiv.current);
  }, []);

  return (
    <div>
      <Header></Header>
      <StyledMapDiv ref={mapDiv}>
        <CalculationsMenu isLoading={setLoading}></CalculationsMenu>
        <InfoPanel></InfoPanel>
        {loading && <LoadingSpinner></LoadingSpinner>}
      </StyledMapDiv>
    </div>
  );
}

export default App;
