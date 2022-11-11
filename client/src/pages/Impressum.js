import React from "react";

import {
  Paragraph,
  Content,
  Heading,
  Main,
} from "../components/CommonStyledElements";

const Impressum = () => {
  return (
    <Main>
      <Content>
        <Heading>Hinweise und Haftungsausschluss</Heading>
        <Paragraph>
          Die thematischen Inhalte auf unserem Webportal dienen dazu, einen
          Überblick über Potentiale und Konflikte in Zusammenhang mit
          geothermischen Anlagen zu geben. Sie ersetzen keine detaillierten
          Planungen. Aus unseren Karten ergibt sich keinerlei
          Genehmigungsanspruch einer geplanten Nutzung gegenüber den zuständigen
          Behörden. Der Anbieter dieses Webportals und der damit verbundenen
          Dienstleistungen übernimmt keine Haftung für Schäden, die durch den
          ungeeigneten Gebrauch des Webportals entstehen.
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
    </Main>
  );
};

export default Impressum;
