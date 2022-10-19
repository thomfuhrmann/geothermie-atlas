import { Outlet, NavLink } from "react-router-dom";
import styled from "styled-components";

import Header from "../components/Header";

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
  let name = "nav-link";
  return (
    <>
      <Header>
        <Title>Geothermie Atlas</Title>
        <Nav>
          <NavMenu>
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? name + " active" : name)}
              end
            >
              <span>Home</span>
            </NavLink>
            <NavLink
              to="ews"
              className={({ isActive }) => (isActive ? name + " active" : name)}
            >
              <span>Erdwärmesonden</span>
            </NavLink>
            <NavLink
              to="gwwp"
              className={({ isActive }) => (isActive ? name + " active" : name)}
            >
              <span>Thermische Grundwassernutzung</span>
            </NavLink>
            <NavLink
              to="data"
              className={({ isActive }) => (isActive ? name + " active" : name)}
            >
              <span>Daten</span>
            </NavLink>
            <NavLink
              to="about"
              className={({ isActive }) => (isActive ? name + " active" : name)}
            >
              <span>About</span>
            </NavLink>
            <NavLink
              to="impressum"
              className={({ isActive }) => (isActive ? name + " active" : name)}
            >
              <span>Impressum</span>
            </NavLink>
          </NavMenu>
        </Nav>
      </Header>
      <Outlet />
    </>
  );
};

export default Layout;
