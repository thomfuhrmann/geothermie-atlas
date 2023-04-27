import React from 'react';

import CollapsibleSection from './CollapsibleSection';
import { Placeholder, Table } from './CommonStyledElements';

export default function Footer() {
  return (
    <>
      <CollapsibleSection title="Haftungsausschluss">
        <Table id="disclaimer">
          <thead>
            <tr>
              <td></td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                Die thematischen Inhalte auf unserem Webportal dienen dazu, einen Überblick über Potentiale und
                Konflikte in Zusammenhang mit geothermischen Anlagen zu geben. Sie ersetzen keine detaillierten
                Planungen. Aus unseren Karten ergibt sich keinerlei Genehmigungsanspruch einer geplanten Nutzung
                gegenüber den zuständigen Behörden. Der Anbieter dieses Webportals und der damit verbundenen
                Dienstleistungen übernimmt keine Haftung für Schäden, die durch den ungeeigneten Gebrauch des Webportals
                entstehen.
              </td>
            </tr>
          </tbody>
        </Table>
        <Placeholder></Placeholder>
      </CollapsibleSection>
      <CollapsibleSection title="Kontakt">
        <Table id="contact">
          <thead>
            <tr>
              <td></td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                GeoSphere Austria<br></br>
                Department für Rohstoffgeologie und Geoenergie<br></br>
                Hohe Warte 38<br></br>
                1190 Wien <br></br>
                <br></br>
                Email: geothermie@geosphere.at
              </td>
            </tr>
          </tbody>
        </Table>
      </CollapsibleSection>
    </>
  );
}
