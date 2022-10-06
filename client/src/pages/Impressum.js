import React from "react";

import {
  Paragraph,
  Content,
  Heading,
} from "../components/CommonStyledElements";

const Impressum = () => {
  return (
    <Content>
      <Heading>Hinweise und Haftungsausschluss</Heading>
      <Paragraph>
        Eine Haftung oder Garantie für Aktualität, Richtigkeit und
        Vollständigkeit der zur Verfügung gestellten Informationen und Daten ist
        ausgeschlossen. Dieser Hinweis gilt auch für alle anderen Websites, auf
        die durch Hyperlinks verwiesen wird.
        <br></br>
        <br></br>
      </Paragraph>
      <Heading>Kontakt</Heading>
      <Paragraph>
        Geologische Bundesanstalt <br></br>
        Neulinggasse 38, 1030 Wien <br></br>
        <a href="mailto:office@geologie.ac.at">office@geologie.ac.at</a>
        <br></br>
        Telefon: +43-1-7125674<br></br>
        Fax: +43-1-7125674-56
      </Paragraph>
    </Content>
  );
};

export default Impressum;
