import React, { useState } from "react";
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
  background-color: white;
`;

const CollapsibleContent = styled.div`
  display: ${(props) => (props.isOpened === true ? "block" : "none")};
`;

export default function CollapsibleSection({
  title,
  children,
  open,
  marginBottom = "1px",
}) {
  const [opened, setOpened] = useState(open);
  const [previouslyOpened, setPreviouslyOpened] = useState();

  if (open !== previouslyOpened) {
    setOpened(open);
    setPreviouslyOpened(open);
  }

  const handleClick = () => {
    setOpened(!opened);
  };

  return (
    <Container>
      <Button type="button" onClick={handleClick} marginBottom={marginBottom}>
        {title} <Span>{opened ? "-" : "+"}</Span>
      </Button>
      <CollapsibleContent isOpened={opened}>{children}</CollapsibleContent>
    </Container>
  );
}
