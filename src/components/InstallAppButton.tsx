import styled from 'styled-components';
import logo from '../assets/logo.png' ;

const StyledButton = styled.a`
  position: fixed;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 400px;
  height: 56px;
  background-color: #FFC700;
  border-radius: 28px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  text-decoration: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const LogoContainer = styled.div`
  position: relative;
  width: 32px;
  height: 32px;
  margin-right: 12px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const ButtonText = styled.span`
  color: #000;
  font-size: 16px;
  font-weight: 600;
  flex: 1;
  text-align: center;
`;

const InstallAppButton = () => {
  return (
    <StyledButton href="https://homebrewmusic.onelink.me/CxhH/zgcwe9qv" target="_blank" rel="noopener noreferrer">
      <LogoContainer>
        <img
          src={logo}
          alt="App Logo"
        />
      </LogoContainer>
      <ButtonText>백그라운드에서 계속 듣기</ButtonText>
    </StyledButton>
  );
};

export default InstallAppButton;
