import React from "react";
import styled from "styled-components";

export const Warning = styled.p`
  width: 100%;
  white-space: normal;
  word-break: normal;
  background-color: #fffbd6;
  color: #715100;
  margin: 5px 0;
  padding: 10px;
  box-sizing: border-box;
  border-radius: 10px;
`;

export const Content = styled.div`
  position: absolute;
  top: 100px;
  left: 10%;
  width: 60%;
`;

export const Heading = styled.h1`
  margin: 0px;
  color: #808080;
`;

export const Paragraph = styled.p`
  width: 100%;
  white-space: normal;
  word-break: normal;
`;

export const Container = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  width: 23%;
  height: fit-content;
  max-height: 95%;
  overflow-y: auto;
  overflow-x: auto;
  padding: 0px;
  background-color: white;
`;

export const InfoPanelContent = styled.div`
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: fit-content;
  overflow-y: auto;
  overflow-x: auto;
  padding: 10px 30px 30px;
  color: #444444;
  background-color: white;
`;

export const PDFButtonDiv = styled.div`
  float: right;
  justify-content: center;
`;

export const PDFButton = styled.button`
  color: white;
  background-color: #9c4b4b;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #9c0d0d;
    transition: 0.7s;
  }
`;

export const Image = styled.img`
  width: 100%;
  height: 100%;
`;

export const Menu = styled.div`
  position: relative;
  width: ${(props) => props.width || "100%"};
  height: fit-content;
  margin: 0px;
  border: none;
  color: #444444;
  background-color: white;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  flex-direcation: column;
`;

export const ButtonContainer = styled.div`
  padding: 5px;
  width: 100%;
  box-sizing: border-box;
`;

export const Button = styled.button`
  position: relative;
  width: 100%;
  height: 40px;
  margin: 0px;
  padding: 0px;
  border: none;
  cursor: pointer;
`;

export const Underline = styled.u`
  text-decoration-line: underline;
  text-decoration-style: dotted;
`;

export const Placeholder = styled.div`
  padding: 15px;
`;

const TablePadding = `padding: 10px;`;

export const Table = styled.table`
  table-layout: fixed;
  width: 100%;
`;

export const TableData = styled.td`
  width: 100%;
  text-align: ${(props) => props.textAlign || "left"};
  ${TablePadding};
  word-break: break-word;
`;

export const TableHeader = styled.th`
  padding-top: 15px;
  padding-bottom: 10px;
  font-size: medium;
  font-weight: normal;
  text-align: ${(props) => props.textAlign || "left"};
`;

export const TableRow = styled.tr`
  width: 100%;
  &:nth-child(even) {
    background-color: #eee;
  }
`;

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
