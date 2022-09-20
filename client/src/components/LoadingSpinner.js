import React from "react";
import styled, { keyframes } from "styled-components";

const spinner = keyframes`
0% {transform: rotate(0deg);}
100% {transform: rotate(360deg);}`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 10px solid #f3f3f3; /* Light grey */
  border-top: 10px solid #383636; /* Black */
  border-radius: 50%;
  animation: ${spinner} 1.5s linear infinite;
  position: absolute;
  left: 50%;
  transform: translate(-50%);
  display: inline-block;
`;

const SpinnerContainer = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%);
  width: 100%;
`;

export default function LoadingSpinner() {
  return (
    <SpinnerContainer>
      <Spinner></Spinner>
    </SpinnerContainer>
  );
}
