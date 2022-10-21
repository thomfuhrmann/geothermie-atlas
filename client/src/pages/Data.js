import React from "react";
import styled from "styled-components";

import { Content, Placeholder } from "../components/CommonStyledElements";

const Heading = styled.h1`
  margin: 0px;
  color: #808080;
`;

const Paragraph = styled.p`
  width: 100%;
  white-space: normal;
  word-break: normal;
`;

const Data = () => {
  return (
    <Content>
      <Placeholder></Placeholder>
      <Heading>Daten</Heading>
      <Paragraph>
        Hier kommen die Links zu Tethys. <br></br>
        <br></br>
        <a href="https://www.tethys.at/">https://www.tethys.at/</a>
      </Paragraph>
    </Content>
  );
};

export default Data;
