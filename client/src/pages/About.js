import React from "react";

import { Content, Heading, Main } from "../components/CommonStyledElements";

const About = () => {
  return (
    <Main>
      <Content>
        <Heading>Informationen über diese Applikation</Heading>
        <p>
          Diese Applikation ist als Unterstützung bei der Planung
          oberflächennaher geothermischer Anlagen gedacht. Es können
          geothermisch relevante Parameter, und mögliche rechtliche
          Einschränkungen und Hinweise abgefragt werden. Außerdem können
          standortspezifisch Berechnungen in Bezug auf die gewünschte
          Konfiguration der geothermischen Anlage durchgeführt werden.
        </p>
        <p>
          Die der Applikation zugrunde liegenden Daten wurden im Rahmen des
          Green Energy Lab - Spatial Energy Planning Projekts erstellt. Nähere
          Informationen über dieses Projekt finden Sie unter{" "}
          <a href="http://www.waermeplanung.at">http://www.waermeplanung.at</a>.
        </p>
        <p>
          Die Untersuchungsgebiete des Projekts umfassen Wien, den
          Dauersiedlungsraum Salzburg und ausgewählte Gebiete in der Steiermark.
          Diese Applikation beschränkt sich ausschließlich auf Wien.
        </p>
        <Heading>Verwendete 3rd-Party Software</Heading>
        <p>
          Die Berechnungen für Erdwärmesonden werden mit dem Python-Modul{" "}
          <code>pygfunction</code> durchgeführt (siehe{" "}
          <a href="https://pypi.org/project/pygfunction/">
            https://pypi.org/project/pygfunction/
          </a>
          ).
        </p>
        <p>
          THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
          "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
          LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
          A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
          HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
          SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
          LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
          DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
          THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
          (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
          OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
        </p>
        <p>Copyright (c) 2017-2022, Massimo Cimmino All rights reserved.</p>
        <Heading>Glossar</Heading>
        <dl>
          <dt>COP</dt>
          <dd>Coefficient of Performance</dd>

          <dt>JAZ</dt>
          <dd>Jahrearbeitszahl</dd>

          <dt>EER</dt>
          <dd></dd>

          <dt>SEER</dt>
          <dd></dd>

          <dt>Wärmeträgermedium</dt>
          <dd>Ethanol ist umweltneutral und nicht korrosiv.</dd>

          <dt>Ausgeglichene Betriebsweise</dt>
          <dd>
            Bei einer ausgeglichenen Betriebsweise des Sondenfelds können durch
            die jährliche Regeneration größere Leistungen und Energiemengen
            erzielt werden, als bei einem einseitigen Betrieb. Bei einem
            Kühlüberhang ist es empfehlenswert, z.b. für zusätzliche Gebäude,
            mehr Wärme bereitzustellen. Dies kann zum Beispiel im Rahmen eines
            Anergienetzes umgesetzt werden. Auch die Kombination mit einer
            Luftwärmepumpe oder mit Solarthermie kann in Erwägung gezogen
            werden, um eine optimale Nutzung des Sondenfelds zu erreichen.
          </dd>

          <dt>Anergienetz</dt>
          <dd>Auch Niedertemperaturnetz oder kaltes Nahwärmenetz.</dd>

          <dt>Sondentyp</dt>
          <dd>Es gibt verschiedene Arten von Sonden.</dd>

          <dt>Verpressung</dt>
          <dd>Nach Einbau der Sonde in das Bohrloch</dd>
        </dl>

        <p>
          Zusatzinfo für ExpertInnen: Das Energie- und Leistungsverhältnis
          zwischen Heizen und Kühlen ist benutzerdefiniert oder standortbezogen
          vorgegeben. Die Untergrundparameter wird aus den Ressourcenkarten für
          das ausgewählte Grundstück übernommen und fließt in die Berechnung
          ein. Die Norm-Jahresbetriebsstunden wurden nach Vorbild der Schweizer
          Norm SIA xy von der Oberflächentemperatur abgeleitet. Zum
          Speicherbetrieb: Um eine ausgeglichene Jahresenergiebilanz zu
          erreichen, können - alternativ zu einer zusätzlichen Wärmequelle oder
          –senke – auch die Heiz- bzw. Kühlspitzen auf ein bestimmtes Maß
          reduziert werden. Dies kann bei der Berechnung durch Eingabe der
          entsprechenden Gebäudeleistung berücksichtigt werden.
        </p>
      </Content>
    </Main>
  );
};

export default About;
