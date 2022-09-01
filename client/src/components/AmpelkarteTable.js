import React from "react";
import styled from "styled-components";

import {
  Table,
  TableRow,
  TableData,
  TableBody,
  ToolTip,
  returnDot,
} from "./CommonStyledElements";

const Heading = styled.h4``;

export const AmpelkarteTable = ({ results }) => {
  let tableRowsEWS = [];
  let tableRowsGWWP = [];

  results.forEach((result) => {
    const attributes = result.feature.attributes;
    switch (result.layerId) {
      case 0:
        tableRowsGWWP.push(
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
              {returnDot(attributes["GWWP"])}
            </TableData>
          </TableRow>
        );
        break;
      case 1:
        tableRowsEWS.push(
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
          </TableRow>
        );
        break;
      default:
        break;
    }
  });

  return (
    <div>
      {tableRowsEWS.length > 0 && (
        <>
          <Heading>Rechtliche Einschränkungen EWS</Heading>
          <Table className="table-ews">
            <TableBody>{tableRowsEWS}</TableBody>
          </Table>
        </>
      )}
      {tableRowsGWWP.length > 0 && (
        <>
          <Heading>Rechtliche Einschränkungen GWWP</Heading>
          <Table className="table-gwwp">
            <TableBody>{tableRowsGWWP}</TableBody>
          </Table>
        </>
      )}
    </div>
  );
};
