import React from "react";

import styled from "styled-components";

const Content = styled.div`
    position: absolute;
    top: 100px;
    left: 10%;
    margin: 0px;
`;

const Heading = styled.h1`
    margin: 0px;
    color: #808080;
`;

const Help = () => {
    return (
        <Content>
            <Heading>Hier kommt die Hilfe hin</Heading>
            <p>
                Hier kommt der Text
            </p>
        </Content>
    );
};

export default Help;