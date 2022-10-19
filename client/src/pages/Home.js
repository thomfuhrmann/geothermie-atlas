import React from "react";
import { NavLink } from "react-router-dom";

import styled from "styled-components";

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
  width: 100%;
  white-space: normal;
  word-break: normal;
`;

const Nav = styled.nav`
  height: 100%;
  display: flex;
  justify-content: space-between;
  float: right;
  padding-right: 300px;
`;

const NavMenu = styled.div`
  display: flex;
  .current {
    border-bottom: 2px solid black;
  }
`;

const Home = () => {
  let name = "nav-link";
  return (
    <Content>
      <Heading>Willkomen bei der Geothermie Atlas Applikation!</Heading>
      <Paragraph>Wählen Sie hier Ihr gewünschtes Thema:</Paragraph>

      <Nav>
        <NavMenu>
          <NavLink
            to="/ews"
            className={({ isActive }) => (isActive ? name + " active" : name)}
          >
            <span>Erdwärmesonden</span>
          </NavLink>
          <NavLink
            to="/gwwp"
            className={({ isActive }) => (isActive ? name + " active" : name)}
          >
            <span>Thermische Grundwassernutzung</span>
          </NavLink>
        </NavMenu>
      </Nav>
    </Content>
  );
};

export default Home;
