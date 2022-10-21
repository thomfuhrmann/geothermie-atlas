import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

import { Placeholder, Content } from "../components/CommonStyledElements";

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
