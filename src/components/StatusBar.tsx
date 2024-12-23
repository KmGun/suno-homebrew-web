import styled from "styled-components";
import React from "react";

interface StatusBarProps {
  current: number;
  total: number;
}

const StatusBar = ({ current, total }: StatusBarProps) => {
  return (
    <Container>
      <ProgressBar>
        <Progress width={(current / total) * 100} />
      </ProgressBar>
      <Counter>
        {current}/{total}
      </Counter>
    </Container>
  );
};

const Container = styled.div`
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: #333;
  border-radius: 4px;
  overflow: hidden;
`;

const Progress = styled.div<{ width: number }>`
  width: ${(props) => props.width}%;
  height: 100%;
  background-color: #ffd700;
  transition: width 0.3s ease;
`;

const Counter = styled.div`
  color: #ffd700;
  text-align: right;
  font-size: 14px;
`;

export default StatusBar;
