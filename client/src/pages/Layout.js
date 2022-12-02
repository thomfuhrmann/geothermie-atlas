import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { useMediaQuery } from 'react-responsive';
import { FaBars, FaTimes } from 'react-icons/fa';

import Header from '../components/Header';
import logo from '../assets/icons/logo_only.png';

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
`;

const Title = styled.span`
  position: absolute;
  left: 90px;
  top: 50%;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  font-size: ${(props) => (props.isMobile ? 'medium' : 'x-large')};
  color: #122e37;
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
  border-left: 1px solid #ededed;
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

const LogoImage = styled.img`
  width: 50px;
  height: 50px;
  object-fit: contain;
  padding-left: 20px;
  padding-top: 10px;
`;

const MenuItem = styled.span`
  color: #153039;
  font-size: medium;
`;

const Layout = () => {
  const [navToggled, setNavToggled] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 480 });

  let name = 'nav-link';
  const navLinks = (
    <>
      <NavLink to="/" className={({ isActive }) => (isActive ? name + ' active' : name)} end>
        <MenuItem>Home</MenuItem>
      </NavLink>
      <NavLink to="ews" className={({ isActive }) => (isActive ? name + ' active' : name)}>
        <MenuItem>Erdwärmesonden</MenuItem>
      </NavLink>
      <NavLink to="gwwp" className={({ isActive }) => (isActive ? name + ' active' : name)}>
        <MenuItem style={{ textAlign: 'center' }}>Thermische Grundwassernutzung</MenuItem>
      </NavLink>
      <NavLink to="data" className={({ isActive }) => (isActive ? name + ' active' : name)}>
        <MenuItem>Daten</MenuItem>
      </NavLink>
      <NavLink to="about" className={({ isActive }) => (isActive ? name + ' active' : name)}>
        <MenuItem>About</MenuItem>
      </NavLink>
    </>
  );

  const handleNavToggle = () => {
    setNavToggled(!navToggled);
  };

  return (
    <PageContent>
      <Header>
        <LogoImage src={logo} alt="Logo"></LogoImage>
        <Title isMobile={isMobile}>Geothermie Atlas 1.0</Title>
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
