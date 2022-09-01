import React from "react";
import styled from "styled-components";

import { config } from "../config";
import {
  Table,
  TableRow,
  TableData,
  TableBody,
  ToolTip,
  returnDot,
} from "./CommonStyledElements";

const Heading = styled.h4``;

export const PointQueryTable = ({ pointQueryResult }) => {
  let tableRows = [];
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
            <TableData>{attributes["Parameter"]}</TableData>
            <TableData textAlign={"center"}>
              {returnDot(attributes["EWS"])}
            </TableData>
            <TableData textAlign={"center"}>
              {returnDot(attributes["GWWP"])}
            </TableData>
          </TableRow>
        );
      });
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
              <TableData textAlign={"center"}>EWS</TableData>
              <TableData textAlign={"center"}>GWWP</TableData>
            </TableRow>
          )}
          {tableRows}
        </TableBody>
      </Table>
    </div>
  );
};
