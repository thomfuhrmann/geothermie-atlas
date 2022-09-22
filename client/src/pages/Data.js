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

const Data = () => {
    return (
        <Content>
            <Heading>Daten</Heading>
            <Paragraph>
                Hier kommen die Links zu den Daten auf Tethys. <br></br>
                <a href="https://www.tethys.at/">https://www.tethys.at/</a>
            </Paragraph>
        </Content>
    );
};

export default Data;