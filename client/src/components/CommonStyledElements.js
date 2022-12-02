import styled from 'styled-components';

export const Main = styled.div`
  position: absolute;
  box-sizing: border-box;
  top: 70px;
  left: 0;
  height: calc(100% - 70px);
  width: 100%;
  overflow-y: auto;
`;

export const Content = styled.div`
  position: absolute;
  top: 5%;
  left: 10%;
  width: 80%;
  height: 93%;
`;

export const Line = styled.span`
  display: inline-block;
  width: 80%;
  height: 0;
  border: 1px solid ${(props) => props.color};
  margin: 12px 0;
`;

export const GridContainer = styled.div`
  display: grid;
  box-sizing: border-box;
  grid-template-columns: 30% 70%;
  grid-template-rows: min-content min-content;
  margin: 5px 0px 10px 0;
`;

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

export const Clearance = styled.p`
  width: 100%;
  white-space: normal;
  word-break: normal;
  background-color: #aded8d;
  color: #009045;
  margin: 5px 0;
  padding: 10px;
  box-sizing: border-box;
  border-radius: 10px;
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

export const InfoPanelContainer = styled.div`
  display: flex;
  flex-flow: column;
  min-height: 54px;
`;

export const InfoPanelContent = styled.div`
  display: flex;
  flex-flow: column;
  overflow-y: auto;
  position: relative;
  box-sizing: border-box;
  width: 100%;
  padding: 15px 30px;
  color: #444444;
  background-color: white;
`;

export const PDFButtonDiv = styled.div`
  display: flex;
  align-self: end;
  margin: 5px 0;
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
  height: auto;
  object-fit: cover;
`;

export const Menu = styled.div`
  position: relative;
  box-sizing: border-box;
  width: ${(props) => props.width || '100%'};
  margin: 0px;
  border: none;
  color: #444444;
  background-color: white;
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
  margin: ${(props) => props.margin || '0px'};
`;

export const TableData = styled.td`
  width: 100%;
  text-align: ${(props) => props.textAlign || 'left'};
  ${TablePadding};
  word-break: break-word;
  border-bottom: 1px solid #d1d1d1;
`;

export const TableHeader = styled.th`
  padding-top: 15px;
  padding-bottom: 10px;
  font-size: medium;
  font-weight: normal;
  text-align: ${(props) => props.textAlign || 'left'};
`;

export const TableRow = styled.tr`
  width: 100%;
`;
