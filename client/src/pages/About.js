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
          <dd>
            Leistungszahl der Wärmepumpe im Heizbetrieb (Coefficient of
            Performance). Die Leistungszahl für Heizen (COP) wird soleseitig
            immer auf die untere Grenztemperatur der Erdsonden (Vorlauf -3 /
            Rücklauf 0 °C) ausgelegt. Wasserseitig wird zur Berechnung des COP
            die vorgegebene Heizungs-Vorlauftemperatur verwendet, welche ohne
            Nutzereingabe auf 35 °C voreingestellt ist. Diese Leistungszahl
            tritt also nur im Extremfall auf, wenn die Fluidtemperatur der
            Sonden den unteren Grenzwert erreicht haben (in der Regel am Ende
            der Heizsaison nach 20 Betriebsjahren).
          </dd>

          <dt>JAZ</dt>
          <dd>
            Jahresarbeitszahl oder saisonale Leistungszahl der Wärmepumpe im
            Heizbetrieb. Die Berechnung der Jahresarbeitszahl im Heizbetrieb
            (JAZ) berücksichtigt die Sole-Fluidtemperaturen jeder Betriebsstunde
            im Jahr, berechnet den COP und bildet daraus den Mittelwert über
            alle Betriebsstunden.
          </dd>

          <dt>EER</dt>
          <dd>
            Leistungszahl der Wärmepumpe im Kühlbetrieb (Energy Efficiency
            Rating). Die Leistungszahl für Kühlen (EER) ist statisch auf eine
            Fluidtemperatur von 18 °C auf der kalten Seite (Gebäudeseitig) und
            30 °C auf der warmen Seite ausgelegt (Erdseitig)
          </dd>

          <dt>SEER</dt>
          <dd>
            Saisonale Leistungszahl der Wärmepumpe im Kühlbetrieb (Seasonal
            Energy Efficiency Rating).Die Berechnung der saisonalen
            Leistungszahl im Kühlbetrieb (SEER) berücksichtigt die berechneten
            Fluid-Temperaturen aller Kühlbetriebsstunden, insbesondere werden
            Fluidtemperaturen unterhalb 18 °C für die freie Kühlung ohne
            Wärmepumpe berücksichtigt. Für die Betriebsstunden mir freier
            Kühlung wird pauschal ein EER-Wert von 20 angenommen. Die
            Berechnungsformel basiert auf Messwerte verschiedener Betriebspunkte
            einer realen Sole-Wasser Wärmepumpe in der Klimakammer und wurde im
            FFG Projekt ZWEIFELDSPEICHER ermittelt.
          </dd>

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
          <dd>
            Es gibt grundsätzlich drei Sondentypen: Simplex, Duplex und
            Koaxialsonden. Bei Simplex wird eine U-Rohrsonde in das Bohrloch
            eingebraucht, bei Duplex zwei U-Rohrsonden. Als U-Rohre werden
            üblicherweise PE100 Rohre eingesetzt mit einem Durchmesser von DN32
            oder DN40. Eine Koaxialsonde ist radialsymmetrisch aufgebaut, wobei
            das Sondenfluid im Außenrohr und im Innenrohr nach unten bzw. nach
            oben fließt.
          </dd>

          <dt>Verpressung</dt>
          <dd>
            Nach Einbringung der Sondenrohre wird der verbleibende Ringraum mit
            einem Spezialmörtel verfüllt. Dieser sollte eine möglichst hohe
            Wärmeleitfähigkeit aufweisen.
          </dd>
        </dl>

        <Heading>Zusatzinfo für ExpertInnen</Heading>
        <p>
          Das Programm berechnet die mögliche Leistung und Energie, die aus dem
          vorgegebenen Sondenfeld gewonnen werden kann. Dabei wird die Geometrie
          des Sondenfeldes (Lage, Tiefe, Sondenabstand) vom Benutzer interaktiv
          vorgegeben. Für dieses Sondenfeld wird zuerst die g-Funktion berechnet
          und danach das maximale Potenzial (Leistung und Jahresenergie)
          ermittelt. Das ermittelte Potenzial berücksichtigt die Betriebsweise
          (siehe unten) und ist auf die Grenzwerte der mittleren
          Fluidtemperturen ausgelegt. Im Heizbetrieb werden -1.5 °C nicht
          unterschritten und im Kühlbetrieb werden 28 °C nicht überschritten.
          Die Betriebsweise wird vereinfacht in vier Phasen pro Jahr unterteilt:
          Heizbetrieb – Stillstand – Kühlbetrieb - Stillstand.
        </p>

        <h3>Betriebsweise</h3>
        <p>
          Die Betriebsfunktion kann durch den Benutzer durch Angabe der
          gebäudeseitigen Heiz- und Kühlleistung sowie der Jahresbetriebsstunden
          für Heizen und Kühlen vorgegeben werden. In diesem Fall wird die
          erzielbare Sondenleistung für das benutzerdefinierte Sondenfeld so
          ermittelt, dass das Leistungsverhältnis zwischen Heizen und Kühlen
          eingehalten wird. Es kann auch ein reiner Heiz- bzw. Kühlbetrieb
          vorgegeben werden. Bei der benutzerdefinierten Betriebsweise wird auch
          ein Deckungsgrad berechnet, also wieviel Prozent das vorgegebene
          Sondenfeld von der vorgegebenen Betriebsfunktion abdecken kann. Wird
          die Betriebsfunktion nicht durch den Benutzer vorgegeben, so wird mit
          einem Normbetrieb gerechnet. Dabei werden die Jahresbetriebsstunden
          für Heizen und Kühlen aus der standortbezogenen Bodentemperatur für
          ein typisches Wohnhaus herangezogen. Die mittlere
          Oberflächentemperatur des Bodens wird dabei aus den Ressourcenkarten
          für den Standort abgefragt. Ein Deckungsgrad wird hier nicht
          ausgegeben. Ist die Jahresenergiebilanz des Sondenfeldes nicht
          ausgeglichen (mit einer Toleranz von +/- 10 %) wird zusätzlich die
          Betriebsweise „saisonaler Speicherbetrieb“ gerechnet. Wenn der
          Wärmeentzug überwiegt, wird automatisch eine Zusatzquelle verwendet,
          welche die Bilanz mit dem zusätzlichen Wärmeeintrag ausgleicht. Wenn
          der Wärmeeintrag überwiegt, wird automatisch eine Zusatzsenke zur
          Betriebsfunktion hinzugefügt, welche die Bilanz mit einem zusätzlichen
          Wärmeentzug ausgleicht. Dabei wird angegeben, um wieviel Prozent die
          Leistungsfähigkeit des Sondenfeldes im Speicherbetrieb gesteigert
          werden kann. Ist der gegenseitige Sondenabstand größer als 6 m wird
          ein Hinweis ausgegeben, dass der gegenseitige Sondenabstand auf 5 m
          reduziert werden kann. Die mittlere Wärmeleitfähigkeit und die
          mittlere Untergrundtemperatur von 0 bis 100 m Tiefe werden aus den
          Ressourcenkarten für das ausgewählte Grundstück übernommen und fließen
          in die Berechnung ein. Ist die Vorgabe der Sondentiefe größer als 100
          m, so wird die Untergrundtemperatur mit einem Gradienten von 0.03 K/m
          mit der Tiefe erhöht. Zusätzlich wird eine Grafik mit der Entwicklung
          der mittleren Fluidtemperatur in Zusammenhang mit der berechneten
          Betriebsfunktion ausgegeben.
        </p>
        <h3>Parameter für die Berechnung</h3>
        <p>
          Die folgenden Parameter werden für alle Simulationen verwendet und
          können vom Benutzer nicht verändert werden. Simulationsjahre: 20 Jahre
          Volumetrische Wärmekapazität des Erdreichs: 2.2 MJ/m³/K Sondenkopf
          Überdeckung: 1 m Bohrradius: 0.075 m Sondentyp: Duplex 32 mm, 0.04 m
          Rohrabstand Wärmeträgermedium: Ethanol 12 % Massenstrom pro Sonde: 0.4
          kg /s Wärmeleitfähigkeit der Verpressung: 2 W/m/K
        </p>
        <h3>Grenztemperaturen</h3>
        <p>
          Minimale mittlere Fluidtemperatur am Ende der Heizsaison: -1.5 °C
          Maximale mittlere Fluidtemperatur am Ende der Kühlsaison: 28 °C{" "}
          <br></br>
          Das Sondenfeld wird im Heizbetrieb auf die minimale Grenztemperatur
          ausgelegt, im Kühlbetrieb auf die maximale Grenztemperatur.
        </p>
      </Content>
    </Main>
  );
};

export default About;
