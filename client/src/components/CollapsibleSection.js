import React, { useState, useRef } from "react";
import { Collapse } from "react-collapse";
import styled from "styled-components";

const Button = styled.button`
  box-sizing: border-box;
  background-color: ${(props) => (props.isOpened ? "#555" : "#777")};
  color: white;
  cursor: pointer;
  margin-bottom: ${(props) => props.marginBottom};
  padding: 18px;
  width: 100%;
  border: none;
  text-align: left;
  outline: none;
  font-size: 15px;
  &:hover {
    background-color: #555;
  }
`;

const Span = styled.span`
  font-size: 13px;
  color: white;
  float: right;
`;

const Container = styled.div`
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: fit-content;
`;

export default function CollapsibleSection({
  title,
  children,
  open = false,
  marginBottom = "1px",
}) {
  const collapse = useRef(null);
  const button = useRef(null);
  const [opened, setOpened] = useState(open);

  return (
    <Container>
      <Button
        type="button"
        onClick={() => {
          setOpened(!collapse.current.props.isOpened);
        }}
        ref={button}
        isOpened={opened}
        marginBottom={marginBottom}
      >
        {title} <Span>{opened ? "-" : "+"}</Span>
      </Button>
      <Collapse isOpened={opened} ref={collapse}>
        {children}
      </Collapse>
    </Container>
  );
}
