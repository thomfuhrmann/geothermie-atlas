import React from "react";
import { useTranslation } from "react-i18next";

import styled from "styled-components";

const StyledHeader = styled.div`
  position: absolute;
  top: 0;
  height: 5%;
  width: 100%;
`;

const StyledTitle = styled.span`
  position: absolute;
  left: 5%;
  top: 50%;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  width: auto;
  font-size: large;
  color: #444444;
`;

export default function Header({ children }) {
  const { t } = useTranslation();
  const title = t("header.title");

  return (
    <StyledHeader>
      <StyledTitle>{title}</StyledTitle>
      {children}
    </StyledHeader>
  );
}
