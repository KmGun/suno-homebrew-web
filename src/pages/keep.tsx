import React from "react";
import styled from "styled-components";
import homebrewLogo from "../assets/homebrewlogo.png";

const keep = () => {
  return (
    <Container>
      <TitleWrapper>
        <Logo src={homebrewLogo} alt="홈브루 로고" />
        <Title>Homebrew</Title>
      </TitleWrapper>

      <SectionTitle>다른 사람이 만든 인기 노래!</SectionTitle>
      <GridContainer>
        {/* 6개의 인기 노래 아이템 */}
        {Array(6)
          .fill(0)
          .map((_, index) => (
            <SongItem key={index}>
              <SongImage />
              <SongTitle>민물장어의 꿈 part 2</SongTitle>
              <ArtistName>아이유</ArtistName>
            </SongItem>
          ))}
      </GridContainer>

      <SectionTitle>가수별로 보기!</SectionTitle>
      <CategoryWrapper>
        <CategoryButton>이것</CategoryButton>
        <CategoryButton>아이유</CategoryButton>
        <CategoryButton>임재범</CategoryButton>
        <CategoryButton>뉴진스</CategoryButton>
      </CategoryWrapper>

      <GridContainer>
        {/* 3개의 가수별 노래 아이템 */}
        {Array(3)
          .fill(0)
          .map((_, index) => (
            <SongItem key={index}>
              <SongImage />
              <SongTitle>민물장어의 꿈 part 2</SongTitle>
              <ArtistName>아이유</ArtistName>
            </SongItem>
          ))}
      </GridContainer>

      <MakeButton>🍸 만들어 보기</MakeButton>
    </Container>
  );
};

const Container = styled.div`
  padding: 20px;
  background-color: black;
  color: white;
  min-height: 100vh;
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 30px;
`;

const Logo = styled.img`
  width: 40px;
  height: 40px;
`;

const Title = styled.h1`
  font-size: 24px;
  color: #ffd700;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  margin: 20px 0;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 30px;
`;

const SongItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const SongImage = styled.div`
  width: 100%;
  aspect-ratio: 1;
  background-color: #333;
  border-radius: 4px;
`;

const SongTitle = styled.p`
  font-size: 14px;
  margin: 0;
`;

const ArtistName = styled.p`
  font-size: 12px;
  color: #888;
  margin: 0;
`;

const CategoryWrapper = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  overflow-x: auto;
`;

const CategoryButton = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  background-color: #333;
  color: white;
  border: none;
  white-space: nowrap;
`;

const MakeButton = styled.button`
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  padding: 15px;
  background-color: #ffd700;
  color: black;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  z-index: 100;
`;

export default keep;
