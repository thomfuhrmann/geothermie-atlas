import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

import graphicEWS from "../assets/images/EWS.jpg";
import graphicGWWP from "../assets/images/GWWP.jpg";

const Content = styled.div`
  bos-sizing: border-box;
  margin: 0;
  position: absolute;
  top: 7%;
  bottom: 0;
  width: 100%;
`;

const ImageContainer = styled.div`
  display: flex;
  height: 100%;
  justify-content: center;
`;

const ImageFrame = styled.div`
  position: relative;
  border-left: ${(props) => props.borderLeft} solid white;
  border-right: ${(props) => props.borderRight} solit white;
`;

const Image = styled.img`
  height: 100%;
  max-width: 100%;
  object-fit: cover;
  padding: 0;
  margin: 0;
  float: ${(props) => props.float};
`;

const OverlayComponent = ({ className, children }) => {
  const [mouseOver, setMouseOver] = useState(false);

  const handleMouseOver = () => {
    setMouseOver(true);
  };

  const handleMouseOut = () => {
    setMouseOver(false);
  };

  return (
    <div
      className={className}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      {mouseOver && <div>Hallo!</div>}
    </div>
  );
};

const Overlay = styled(OverlayComponent)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(100, 100, 100, 0.3);
  &:hover {
    background-color: rgba(255, 255, 255, 0);
  }
`;

const Home = () => {
  return (
    <Content>
      <ImageContainer>
        <ImageFrame>
          <NavLink to="/ews">
            <Image
              src={graphicEWS}
              alt="Erdwärmesonden"
              float="right"
              borderRight="0.5px"
            ></Image>
            <Overlay></Overlay>
          </NavLink>
        </ImageFrame>
        <ImageFrame>
          <NavLink to="/gwwp">
            <Image
              src={graphicGWWP}
              alt="Grundwasserwärmepumpen"
              float="left"
              borderLeft="0.5px"
            ></Image>
            <Overlay></Overlay>
          </NavLink>
        </ImageFrame>
      </ImageContainer>
    </Content>
  );
};

export default Home;
