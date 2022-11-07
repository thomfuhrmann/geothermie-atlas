import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { useMediaQuery } from "react-responsive";

import graphicEWS from "../assets/images/EWS.jpg";
import graphicGWWP from "../assets/images/GWWP.jpg";

const Content = styled.div`
  box-sizing: border-box;
  margin: 0;
  position: absolute;
  top: 7%;
  bottom: 0;
  width: 100%;
`;

const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: ${(props) => props.isMobile && "stretch"};
  height: 100%;
  width: 100%;
  flex-direction: ${(props) => (props.isMobile ? "column" : "row")};
`;

const ImageFrame = styled.div`
  position: relative;
  box-sizing: border-box;
  width: 100%;
  min-height: 50%;
  border-left: ${(props) => props.borderLeft || "0px"} solid white;
  border-right: ${(props) => props.borderRight || "0px"} solid white;
`;

const Image = styled.img`
  display: block;
  height: 100%;
  max-width: 100%;
  object-fit: cover;
  margin: ${(props) => (props.isMobile ? "0 auto" : "0")};
  float: ${(props) => props.float};
`;

const Card = styled.div`
  position: absolute;
  box-sizing: border-box;
  bottom: 0;
  height: 6%;
  width: 100%;
  padding: 0 10%;
  color: #89e9ff;
  font-size: ${(props) => (props.isMobile ? "small" : "x-large")};
  text-align: ${(props) => props.textAlign};
`;

const OverlayComponent = React.forwardRef(({ className, children }, ref) => {
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
      ref={ref}
    >
      {mouseOver && children}
    </div>
  );
});

const Overlay = styled(OverlayComponent)`
  position: absolute;
  right: ${(props) => props.right && "0px"};
  left: ${(props) => props.left && "0px"};
  width: ${(props) => (props.width > 0 ? props.width + "px" : "100%")};
  height: 100%;
  background-color: rgba(255, 255, 255, 0);
  &:hover {
    background-color: rgba(100, 100, 100, 0.5);
  }
`;

const Home = () => {
  const imgRef = useRef(null);
  const [imgWidth, setImgWidth] = useState(0);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const isMobile = useMediaQuery({ maxWidth: 480 });

  useEffect(() => {
    if (imgRef.current) {
      setTimeout(() => setImgWidth(imgRef.current.offsetWidth), 10);
    }
  }, [imgRef, windowSize]);

  window.onresize = () => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  };

  return (
    <Content>
      <ImageContainer isMobile={isMobile}>
        <ImageFrame borderRight="1px">
          <NavLink to="/ews">
            <Image
              src={graphicEWS}
              alt="Erdwärmesonden"
              float={!isMobile ? "right" : undefined}
              ref={imgRef}
              isMobile={isMobile}
            ></Image>
            {!isMobile && (
              <Overlay right width={imgWidth}>
                <Card textAlign="right" isMobile={isMobile}>
                  Erfahren Sie mehr über Erdwärmesonden
                </Card>
              </Overlay>
            )}
          </NavLink>
        </ImageFrame>
        <ImageFrame borderLeft="1px">
          <NavLink to="/gwwp">
            <Image
              src={graphicGWWP}
              alt="Grundwasserwärmepumpen"
              float={!isMobile ? "left" : undefined}
              isMobile={isMobile}
            ></Image>
            {!isMobile && (
              <Overlay left width={imgWidth}>
                <Card textAlign="left" isMobile={isMobile}>
                  Erfahren Sie mehr über Grundwasserwärmepumpen
                </Card>
              </Overlay>
            )}
          </NavLink>
        </ImageFrame>
      </ImageContainer>
    </Content>
  );
};

export default Home;
