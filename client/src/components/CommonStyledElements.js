import React from "react";
import styled from "styled-components";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

import info from "../assets/icons/information-line.svg";

const TablePadding = `padding: 10px;`;

export const Table = styled.table`
  width: 100%;
`;

export const TableData = styled.td`
  text-align: ${(props) => props.textAlign || "left"};
  ${TablePadding}
`;

export const TableHeader = styled.th`
  padding-top: 20px;
  padding-bottom: 5px;
  font-size: medium;
  text-align: ${(props) => props.textAlign || "left"};
`;

export const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #eee;
  }
`;

const IconTableData = styled.td`
  text-align: center;
`;

const ToolTipComponent = ({ content }) => (
  <Tippy content={content} placement="left" arrow={true} delay={[100, 0]}>
    <IconTableData>
      <img
        className="tooltip-icon"
        src={info}
        alt="info"
        style={{ padding: 5 }}
      ></img>
    </IconTableData>
  </Tippy>
);

export const ToolTip = styled(ToolTipComponent)``;

export const Dot = styled.span`
  /* position: relative;
  top: 3px; */
  height: ${(props) => props.height || "20px"};
  width: ${(props) => props.width || "20px"};
  background-color: ${(props) => props.backgroundColor};
  border-radius: 50%;
  display: inline-block;
`;

export const returnDot = (color) => {
  switch (color) {
    case "Grün":
      return <Dot backgroundColor="green"></Dot>;
    case "Gelb":
      return <Dot backgroundColor="yellow"></Dot>;
    case "Magenta":
      return <Dot backgroundColor="red"></Dot>;
    default:
      return;
  }
};
