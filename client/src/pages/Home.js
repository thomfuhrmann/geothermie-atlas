import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { useMediaQuery } from 'react-responsive';

import { Heading, Paragraph } from '../components/CommonStyledElements';

import graphicEWS from '../assets/images/EWS.jpg';
import graphicGWWP from '../assets/images/GWWP.jpg';

const Content = styled.div`
  box-sizing: border-box;
  margin: 0;
  position: absolute;
  top: 70px;
  bottom: 0;
  width: 100%;
`;

const ImageContainer = styled.div`
  position: absolute;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: ${(props) => props.isMobile && 'stretch'};
  height: 85%;
  width: 100%;
  flex-direction: ${(props) => (props.isMobile ? 'column' : 'row')};
`;

const ImageFrame = styled.div`
  position: relative;
  box-sizing: border-box;
  width: 100%;
  min-height: 50%;
  border-left: ${(props) => props.borderLeft || '0px'} solid white;
  border-right: ${(props) => props.borderRight || '0px'} solid white;
`;

const Image = styled.img`
  display: block;
  height: 100%;
  max-width: 100%;
  object-fit: cover;
  margin: ${(props) => (props.isMobile ? '0 auto' : '0')};
  float: ${(props) => props.float};
`;

const Card = styled.div`
  position: absolute;
  box-sizing: border-box;
  bottom: 15px;
  height: 8%;
  width: 100%;
  padding: 0 10%;
  margin: 0 0 15px 0;
  color: #e9e6ff;
  font-size: 'small';
  text-align: 'left';
`;

const TextBlock = styled.div`
  position: absolute;
  top: 0;
  height: 15%;
  margin: 15px 20% 0;
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
    <div className={className} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut} ref={ref}>
      {mouseOver && children}
    </div>
  );
});

const Overlay = styled(OverlayComponent)`
  position: absolute;
  right: ${(props) => props.right && '0px'};
  left: ${(props) => props.left && '0px'};
  width: ${(props) => (props.width > 0 ? props.width + 'px' : '100%')};
  height: 100%;
  background-color: rgba(255, 255, 255, 0);
  &:hover {
    background-color: rgba(100, 100, 100, 0.5);
  }
`;

const ImageTitle = styled.div`
  position: absolute;
  top: 93%;
  left: 12%;
  color: #89e9ff;
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
      setTimeout(() => setImgWidth(imgRef.current.offsetWidth), 50);
    }
  }, [imgRef, windowSize]);

  window.onresize = () => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  };

  return (
    <Content>
      <TextBlock>
        <Heading>Willkommen beim Geothermie-Atlas!</Heading>
        <Paragraph>
          Hier erhalten Sie maßgeschneiderte Informationen, um fundierte Entscheidungen über Oberflächennahe Geothermie
          Systeme an gewählten Standorten treffen zu können. Ob Sie HausbesitzerIn, ProjektentwicklerIn, InvestorIn
          sind, oder sich allgemein für erneuerbare Energiequellen interessieren, unsere Karten und die
          Grundstücksabfrage bieten Ihnen wertvolle Einblicke in das Energiepotential Ihres Grundstücks. Momentan ist
          der Geothermie-Atlas für Wien verfügbar, an einer österreichweiten Ergänzung wird gearbeitet. Nutzen Sie die
          Kraft der Geothermie! Klicken Sie unten, um zu den Karten und der Grundstücksabfrage zu gelangen.
        </Paragraph>
      </TextBlock>
      <ImageContainer isMobile={isMobile}>
        <ImageFrame borderRight={!isMobile ? '1px' : '0px'}>
          <NavLink to="/ews">
            <Image
              src={graphicEWS}
              alt="Erdwärmesonden"
              float={!isMobile ? 'right' : undefined}
              ref={imgRef}
              isMobile={isMobile}
            ></Image>
            {!isMobile && (
              <Overlay right width={imgWidth}>
                <Card textAlign="right">
                  Nutzen Sie die Wärme des Untergrunds mit Erdwärmesonden. Dieses System nutzt vertikale Bohrungen, in
                  denen eine Wärmeträgerflüssigkeit zirkuliert und über die der Wärmeaustausch stattfindet. Weiter zum
                  Geothermie-Atlas für Erdwärmesonden.
                </Card>
              </Overlay>
            )}
          </NavLink>
          {isMobile && <ImageTitle>Erdwärmesonden</ImageTitle>}
        </ImageFrame>
        <ImageFrame borderLeft={!isMobile ? '1px' : '0px'}>
          <NavLink to="/gwwp">
            <Image
              src={graphicGWWP}
              alt="Grundwasserwärmepumpen"
              float={!isMobile ? 'left' : undefined}
              isMobile={isMobile}
            ></Image>
            {!isMobile && (
              <Overlay left width={imgWidth}>
                <Card textAlign="left" isMobile={isMobile}>
                  Ein weiteres effizientes System ist die thermische Grundwassernutzung. Hier wird nach der Entnahme von
                  einem Brunnen die Wärme des Grundwassers an das Gebäude übertragen und anschließend das Wasser über
                  einen Schluckbrunnen dem Grundwasserkörper zurückgegeben. Weiter zum Geothermie-Atlas für thermische
                  Grundwassernutzung.
                </Card>
              </Overlay>
            )}
          </NavLink>
          {isMobile && <ImageTitle>Grundwasserwärmepumpen</ImageTitle>}
        </ImageFrame>
      </ImageContainer>
    </Content>
  );
};

export default Home;
