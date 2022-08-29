import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import { config } from "../config";
import {
  Table,
  TableRow,
  TableData,
  TableHeading,
  TableBody,
  ToolTip,
  returnDot,
} from "./CommonStyledElements";

const Heading = styled.h4``;

export const PointQueryTable = ({ pointQueryResult }) => {
  const { t } = useTranslation();

  const renderUnits = (id) => {
    switch (id) {
      case "layer-2":
        return " W/m/K";
      case "layer-3":
        return " °C";
      case "layer-4":
        return " °C";
      default:
        break;
    }
  };

  let tableRows = [];
  let tableRowsRaster = [];
  config.layers.forEach((layer) => {
    const result = pointQueryResult[layer.id];
    if (result !== undefined && Array.isArray(result)) {
      result.forEach((attributes) => {
        tableRows.push(
          <TableRow key={attributes["FID"]}>
            {attributes["KATEGORIE"].trim().length !== 0 ? (
              <ToolTip
                className="tooltip"
                content={attributes["KATEGORIE"]}
              ></ToolTip>
            ) : (
              <TableData></TableData>
            )}
            <TableHeading>{attributes["Parameter"]}</TableHeading>
            <TableData>{returnDot(attributes["EWS"])}</TableData>
            <TableData>{returnDot(attributes["GWWP"])}</TableData>
          </TableRow>
        );
      });
    } else if (result !== undefined) {
      tableRowsRaster.push(
        <TableRow key={layer.id}>
          <ToolTip
            className="tooltip"
            content={t(`layers.${layer.id}.des`)}
          ></ToolTip>
          <TableHeading>{t(`layers.${layer.id}.title`)}</TableHeading>

          <TableData>&nbsp;</TableData>
          <TableData>
            {result !== "NoData"
              ? parseFloat(result).toFixed(2) + renderUnits(layer.id)
              : t("info_div.no_data")}
          </TableData>
        </TableRow>
      );
    }
  });

  return (
    <div>
      <Heading>Rechtliche Parameter</Heading>
      <Table className="table">
        <TableBody>
          {tableRows.length !== 0 && (
            <TableRow>
              <TableData>&nbsp;</TableData>
              <TableData>&nbsp;</TableData>
              <TableHeading textAlign={"center"}>EWS</TableHeading>
              <TableHeading textAlign={"center"}>GWWP</TableHeading>
            </TableRow>
          )}
          {tableRows}
        </TableBody>
      </Table>
      <Heading>Geowissenschaftliche Parameter</Heading>
      <Table className="table">
        <TableBody>
          {tableRowsRaster.length !== 0 && (
            <TableRow>
              <TableData>&nbsp;</TableData>
              <TableData>&nbsp;</TableData>
              <TableData>&nbsp;</TableData>
              <TableHeading textAlign={"center"}>Ø</TableHeading>
            </TableRow>
          )}
          {tableRowsRaster}
        </TableBody>
      </Table>
    </div>
  );
};
