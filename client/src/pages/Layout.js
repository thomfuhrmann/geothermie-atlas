import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import styled from "styled-components";
import { useMediaQuery } from "react-responsive";
import { FaBars, FaTimes } from "react-icons/fa";

import Header from "../components/Header";

const Nav = styled.nav`
  position: absolute;
  right: 0;
  top: 50%;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  padding-right: 5%;
`;

const NavMenu = styled.div`
  display: flex;
  justify-content: space-between;
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
  font-size: ${(props) => (props.isMobile ? "medium" : "x-large")};
  color: #444444;
`;

const PageContent = styled.div`
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
`;

const Toggle = styled.button`
  position: absolute;
  right: 5%;
  top: 50%;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  color: #777777;
  background: white;
  padding: 0;
  display: flex;
  place-items: center;
  font-size: 20px;
  cursor: pointer;
  border: 0px;
  &:hover {
  }
`;

const StyledMenu = styled.div`
  position: fixed;
  box-sizing: border-box;
  top: 0;
  right: 0;
  height: 100%;
  width: 70%;
  background-color: white;
  z-index: 99;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  padding: 30% 0;
`;

const CloseToggle = styled.button`
  position: fixed;
  top: 2%;
  right: 4%;
  background: #fff;
  color: #444444;
  padding: 0.75rem;
  display: flex;
  place-items: center;
  font-size: 2rem;
  cursor: pointer;
  border: 0;
`;

const Layout = () => {
  const [navToggled, setNavToggled] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 480 });

  let name = "nav-link";
  const navLinks = (
    <>
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
        <span style={{ textAlign: "center" }}>
          Thermische Grundwassernutzung
        </span>
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
    </>
  );

  const handleNavToggle = () => {
    setNavToggled(!navToggled);
  };

  return (
    <PageContent>
      <Header>
        <Title isMobile={isMobile}>Geothermie Atlas</Title>
        {!isMobile && (
          <Nav>
            <NavMenu>{navLinks}</NavMenu>
          </Nav>
        )}
        {isMobile && (
          <Toggle onClick={handleNavToggle}>
            <FaBars />
          </Toggle>
        )}
      </Header>
      {isMobile && navToggled && (
        <StyledMenu>
          <CloseToggle onClick={handleNavToggle}>
            <FaTimes />
          </CloseToggle>
          {navLinks}
        </StyledMenu>
      )}
      <Outlet />
    </PageContent>
  );
};

export default Layout;
