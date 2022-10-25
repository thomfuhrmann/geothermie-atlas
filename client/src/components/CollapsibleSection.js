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

const CollapsibleContainer = styled.div`
  display: ${(props) => (props.flex === true ? "flex" : "block")};
  flex-flow: column;
  margin-bottom: ${(props) => props.marginBottom};
  box-sizing: border-box;
  min-height: 54px;
  max-height: ${(props) => (props.isMobile ? "90%" : undefined)};
  width: ${(props) => props.width || "100%"};
`;

const CollapsibleContent = styled.div`
  display: ${(props) => (props.isOpened === true ? "block" : "none")};
  overflow-y: auto;
  width: 100%;
  background-color: white;
`;

const CollapsibleSection = React.forwardRef(
  (
    { title, children, open, marginBottom = "1px", flex, width, isMobile },
    ref
  ) => {
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
      <CollapsibleContainer
        marginBottom={marginBottom}
        flex={flex}
        ref={ref}
        width={width}
        isMobile={isMobile}
      >
        <Button type="button" onClick={handleClick}>
          {title} <Span>{opened ? "-" : "+"}</Span>
        </Button>
        <CollapsibleContent isOpened={opened}>{children}</CollapsibleContent>
      </CollapsibleContainer>
    );
  }
);

export default CollapsibleSection;
