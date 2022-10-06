import React from "react";

import {
  Paragraph,
  Content,
  Heading,
} from "../components/CommonStyledElements";

const About = () => {
  return (
    <Content>
      <Heading>Informationen über diese Applikation</Heading>
      <Paragraph>
        Diese Applikation ist als Unterstützung bei der Planung oberflächennaher
        geothermischer Anlagen gedacht. Es können geothermisch relevante
        Parameter, und mögliche rechtliche Einschränkungen und Hinweise
        abgefragt werden. Außerdem können standortspezifisch Berechnungen in
        Bezug auf die gewünschte Konfiguration der geothermischen Anlage
        durchgeführt werden.
      </Paragraph>
      <Paragraph></Paragraph>
      <Paragraph>
        Die der Applikation zugrunde liegenden Daten wurden im Rahmen des Green
        Energy Lab - Spatial Energy Planning Projekts erstellt. Nähere
        Informationen über dieses Projekt finden Sie unter{" "}
        <a href="http://www.waermeplanung.at">http://www.waermeplanung.at</a>.
      </Paragraph>
      <Paragraph>
        Die Untersuchungsgebiete des Projekts umfassen Wien, den
        Dauersiedlungsraum Salzburg und ausgewählte Gebiete in der Steiermark.
        Diese Applikation beschränkt sich ausschließlich auf Wien.
      </Paragraph>
      <Heading>Verwendete 3rd-Party Software</Heading>
      <Paragraph>
        Die Berechnungen für Erdwärmesonden werden mit dem Python-Modul{" "}
        <code>pygfunction</code> durchgeführt (siehe{" "}
        <a href="https://pypi.org/project/pygfunction/">
          https://pypi.org/project/pygfunction/
        </a>
        ).
      </Paragraph>
    </Content>
  );
};

export default About;
