import React from "react";
import styled from "styled-components";
import StatusBar from "../../components/StatusBar.tsx";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { makeState } from "../../atom.ts";
import { SINGERS, ArtistOption } from "../../constants/artists.ts";

const Artist = () => {
  const navigate = useNavigate();
  const [make, setMake] = useRecoilState(makeState);

  const handleArtistSelect = (artist: ArtistOption) => {
    setMake((prev) => ({
      ...prev,
      selectedArtist: artist,
    }));
  };

  const handleNext = () => {
    navigate("/make/genre");
  };

  return (
    <Container>
      <Title>누가 불러줄으면 좋겠나요?</Title>

      <SingerGrid>
        {SINGERS.map((singer) => (
          <ArtistItem
            key={singer.id}
            onClick={() => handleArtistSelect(singer)}
            isSelected={make.selectedArtist?.id === singer.id}
          >
            <ArtistImage src={singer.imageUrl} alt={singer.name} />
            <ArtistName>{singer.name}</ArtistName>
          </ArtistItem>
        ))}
      </SingerGrid>

      {/* <SubTitle>정치인은 어때요?</SubTitle>
      <PoliticianGrid>
        {POLITICIANS.map((politician) => (
          <ArtistItem key={politician.id}>
            <ArtistImage src={politician.imageUrl} alt={politician.name} />
            <ArtistName>{politician.name}</ArtistName>
          </ArtistItem>
        ))}
      </PoliticianGrid> */}

      <NextButton onClick={handleNext}>다음</NextButton>
      <StatusBar current={1} total={3} />
    </Container>
  );
};

const Container = styled.div`
  background-color: #000000;
  min-height: 100vh;
  padding: 20px;
  position: relative;
`;

const Title = styled.h1`
  color: #ffffff;
  font-size: 24px;
  margin-bottom: 40px;
  white-space: pre-line;
`;

const SubTitle = styled.h2`
  color: #ffffff;
  font-size: 20px;
  margin: 40px 0 20px;
`;

const SingerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
`;

const PoliticianGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
`;

const ArtistItem = styled.div<{ isSelected?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 10px;
  border-radius: 10px;
  background-color: ${(props) => (props.isSelected ? "#333" : "transparent")};
  transition: all 0.3s ease;

  &:hover {
    background-color: #222;
  }
`;

const ArtistImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid transparent;
  transition: all 0.3s ease;

  ${ArtistItem}:hover & {
    border-color: #ffd700;
  }

  ${ArtistItem}[isSelected="true"] & {
    border-color: #ffd700;
  }
`;

const ArtistName = styled.span`
  color: #ffffff;
  font-size: 14px;
`;

const NextButton = styled.button`
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 15px 60px;
  border-radius: 25px;
  border: none;
  background-color: #ffd700;
  color: black;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.8;
  }
`;

export default Artist;
