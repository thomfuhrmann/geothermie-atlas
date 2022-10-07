import { Outlet, Link } from "react-router-dom";
import styled from "styled-components";

import Header from "../components/Header";

const Nav = styled.nav`
  height: 100%;
  display: flex;
  justify-content: space-between;
  float: right;
  padding-right: 300px;
`;

const NavLink = styled(Link)`
  color: #808080;
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: 0 1rem;
  height: 100%;
  cursor: pointer;
  &:active {
    color: #4d4dff;
  }
`;

const NavMenu = styled.div`
  display: flex;
`;

const Title = styled.span`
  position: absolute;
  left: 5%;
  top: 50%;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  width: auto;
  font-size: x-large;
  color: #444444;
`;

const Layout = () => {
  return (
    <>
      <Header>
        <Title>Geothermie Atlas</Title>
        <Nav>
          <NavMenu>
            <NavLink to="/">Erdwärmesonden</NavLink>
            <NavLink to="/gwwp">Thermische Grundwassernutzung</NavLink>
            <NavLink to="/data">Daten</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/impressum">Impressum</NavLink>
          </NavMenu>
        </Nav>
      </Header>
      <Outlet />
    </>
  );
};

export default Layout;
