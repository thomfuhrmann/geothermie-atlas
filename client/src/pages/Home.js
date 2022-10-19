import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

import { Placeholder } from "../components/CommonStyledElements";

const Content = styled.div`
  position: absolute;
  top: 100px;
  left: 10%;
  margin: 0px;
  width: 60%;
  margin-left: auto;
  margin-right: auto;
`;

const Heading = styled.h1`
  margin: 0px;
  color: #808080;
`;

const Paragraph = styled.p`
  margin: 30px 0;
  width: 100%;
  white-space: normal;
  word-break: normal;
`;

const NavLinkContainer = styled.div`
  display: flex;
  margin: 20px;
`;

const Home = () => {
  let name = "nav-link";
  return (
    <Content>
      <Placeholder></Placeholder>
      <Heading>Willkomen bei der Geothermie Atlas Applikation!</Heading>
      <Paragraph>Wählen Sie Ihr gewünschtes Thema:</Paragraph>
      <div>
        <NavLinkContainer>
          <NavLink
            to="/ews"
            className={({ isActive }) => (isActive ? name + " active" : name)}
          >
            <span>Erdwärmesonden</span>
          </NavLink>
        </NavLinkContainer>
        <NavLinkContainer>
          <NavLink
            to="/gwwp"
            className={({ isActive }) => (isActive ? name + " active" : name)}
          >
            <span>Thermische Grundwassernutzung</span>
          </NavLink>
        </NavLinkContainer>
      </div>
    </Content>
  );
};

export default Home;
