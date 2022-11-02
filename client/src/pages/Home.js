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

const Card = styled.div`
  position: absolute;
  box-sizing: border-box;
  bottom: 0;
  height: 8%;
  width: 100%;
  padding: 15px 60px;
  color: #89e9ff;
  font-size: xxx-large;
  text-align: ${(props) => props.textAlign};
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
      {mouseOver && children}
    </div>
  );
};

const Overlay = styled(OverlayComponent)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.5);
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
              borderRight="1px"
            ></Image>
            <Overlay>
              <Card textAlign="right">Erdwärmesonden</Card>
            </Overlay>
          </NavLink>
        </ImageFrame>
        <ImageFrame>
          <NavLink to="/gwwp">
            <Image
              src={graphicGWWP}
              alt="Grundwasserwärmepumpen"
              float="left"
              borderLeft="1px"
            ></Image>
            <Overlay>
              <Card textAlign="left">Grundwasserwärmepumpen</Card>
            </Overlay>
          </NavLink>
        </ImageFrame>
      </ImageContainer>
    </Content>
  );
};

export default Home;
