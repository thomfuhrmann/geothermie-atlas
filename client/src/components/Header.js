import React from 'react';

import styled from 'styled-components';

const StyledHeader = styled.div`
  position: absolute;
  top: 0;
  height: 70px;
  width: 100%;
  align-items: center;
`;

export default function Header({ children }) {
  return <StyledHeader>{children}</StyledHeader>;
}
