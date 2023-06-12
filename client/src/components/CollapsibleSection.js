import React, { useState } from 'react';
import styled from 'styled-components';
// import Tippy from "@tippyjs/react";
import 'tippy.js/dist/tippy.css';

const CollapsibleHeader = styled.div`
  display: flex;
  box-sizing: border-box;
  background-color: #d3d3d3;
  color: #212529;
  cursor: pointer;
  margin-bottom: ${(props) => props.marginBottom};
  padding: 15px 20px;
  width: 100%;
  border: none;
  text-align: left;
  font-size: 16px;
  &:hover {
    background-color: #052e37;
    color: white;
  }
  min-height: 50px;
  align-items: center;
  justify-content: space-between;
`;

const Span = styled.span`
  font-size: 13px;
  float: right;
`;

const CollapsibleContainer = styled.div`
  display: ${(props) => (props.flex === true ? 'flex' : 'block')};
  flex-flow: column;
  margin-bottom: ${(props) => props.marginBottom};
  box-sizing: border-box;
  min-height: 50px;
  max-height: ${(props) => (!props.isMobile ? '100%' : '35%')};
  height: fit-content;
  width: ${(props) => props.width || '100%'};
`;

const CollapsibleContent = styled.div`
  display: ${(props) => (props.isOpened === true ? 'block' : 'none')};
  overflow-y: auto;
  max-height: 100%;
  background-color: white;
`;

const CollapsibleSection = React.forwardRef(
  ({ title, children, open, marginBottom = '1px', flex, width, isMobile, display }, ref) => {
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
        isOpened={opened}
        display={display}
      >
        <CollapsibleHeader onClick={handleClick}>
          {title} <Span>{opened ? '-' : '+'}</Span>
        </CollapsibleHeader>
        <CollapsibleContent isOpened={opened}>{children}</CollapsibleContent>
      </CollapsibleContainer>
    );
  }
);

export default CollapsibleSection;
