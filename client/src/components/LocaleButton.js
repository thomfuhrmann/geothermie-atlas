import React from "react";
import { useTranslation } from "react-i18next";

import styled from "styled-components";

import { updateLocale } from "../utils/view";

const StyledDiv = styled.div`
  padding: 5px;
  margin: 0;
  position: absolute;
  top: 50%;
  right: 5%;
  border: none;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
`;

const StyledButton = styled.button`
  width: 30px;
  height: 30px;
  border: none;
  cursor: pointer;
`;

export default function LocaleButton(props) {
  const { t, i18n } = useTranslation();
  const localeButtonTitle = t("locale_button.title");

  function handleClick() {
    localeButtonTitle === "en"
      ? i18n.changeLanguage("en")
      : i18n.changeLanguage("de");

    const layerTitles = config.layers.map((layer) =>
      t(`layers.${layer.id}.title`)
    );
    updateLocale(layerTitles, i18n.language);
  }

  return (
    <StyledDiv>
      <StyledButton onClick={handleClick}>{localeButtonTitle}</StyledButton>
    </StyledDiv>
  );
}
