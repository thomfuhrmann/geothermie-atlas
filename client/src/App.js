import React, { useRef, useEffect } from "react";

import styled from "styled-components";

import Header from "./components/Header";
import InfoPanel from "./components/InfoPanel";

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

  useEffect(() => {
    // initialize the map interface
    initialize(mapDiv.current);
  }, []);

  return (
    <div>
      <Header></Header>
      <StyledMapDiv ref={mapDiv}>
        <InfoPanel></InfoPanel>
      </StyledMapDiv>
    </div>
  );
}

export default App;
