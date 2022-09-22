import React from "react";

import styled from "styled-components";

const Content = styled.div`
    position: absolute;
    top: 100px;
    left: 10%;
    margin: 0px;
    width: 60%;
    margin-left:auto;
    margin-right:auto;
`;

const Heading = styled.h1`
    margin: 0px;
    color: #808080;
`;

const Paragraph = styled.p`
    width: 100%;
    white-space: normal;
    word-break: normal
`;

const Impressum = () => {
    return (
        <Content>
            <Heading>Für den Inhalt verantwortlich</Heading>
            <p>
                Geologische Bundesanstalt <br></br>
                Neulinggasse 38, 1030 Wien <br></br>
                <a href="mailto:office@geologie.ac.at">office@geologie.ac.at</a><br></br>
                Telefon: +43-1-7125674<br></br>
                Fax: +43-1-7125674-56
            </p>
            <Heading>Hinweise und Haftungsausschluss</Heading>
            <Paragraph>
                Eine Haftung oder Garantie für Aktualität, Richtigkeit und Vollständigkeit der zur Verfügung gestellten Informationen und Daten ist ausgeschlossen.
                Dieser Hinweis gilt auch für alle anderen Website, auf die durch Hyperlinks verwiesen wird. Die Geologische Bundesanstalt ist für den Inhalt von Websites, die mittels einer solchen Verbindung erreicht werden, nicht verantwortlich.
                Der Inhalt der Website ist urheberrechtlich geschützt. Deshalb bedarf die Vervielfältigung von Informationen oder Daten der vorherigen schriftlichen Zustimmung.
                <br></br><br></br>
                (c) Copyright 2022 und presserechtliche Verantwortung: Geologische Bundesanstalt
            </Paragraph>
            <Heading>Verwendete 3rd Party Software-Pakete</Heading>
            <Paragraph>
                Die für die Berechnung für Erdwärmesonden notwendigen g-Funktionen wurden mit dem Python-Modul <code>pygfunction</code> berechnet (siehe <a href="https://pypi.org/project/pygfunction/">https://pypi.org/project/pygfunction/</a>).
            </Paragraph>
        </Content>
    );
};

export default Impressum;