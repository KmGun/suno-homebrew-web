import React, { useState } from "react";
import styled from "styled-components";
import StatusBar from "../../components/StatusBar.tsx";
import { useRecoilState } from "recoil";
import { makeState } from "../../atom.ts";
import { useNavigate } from "react-router-dom";
import { genreMapping } from "./Lyrics.tsx";

const genres = Object.keys(genreMapping);

const Genre = () => {
  const [make, setMake] = useRecoilState(makeState);
  const navigate = useNavigate();

  const toggleGenre = (genre: string) => {
    setMake((prev) => ({
      ...prev,
      selectedGenres: prev.selectedGenres.includes(genre)
        ? prev.selectedGenres.filter((g) => g !== genre)
        : [...prev.selectedGenres, genre],
    }));
  };

  return (
    <Container>
      <Title>어떤 장르가 좋나요? <br /> 복수선택 가능!</Title>
      <GenreContainer>
        {genres.map((genre) => (
          <GenreButton
            key={genre}
            isSelected={make.selectedGenres.includes(genre)}
            onClick={() => toggleGenre(genre)}
          >
            {genre}
          </GenreButton>
        ))}
      </GenreContainer>
      <NextButton onClick={() => navigate("/make/lyrics")}>다음</NextButton>
      <StatusBar current={2} total={3} />
    </Container>
  );
};

const Container = styled.div`
  padding: 20px;
  min-height: 100vh;
  background-color: black;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 40px;
  text-align: center;
  position: absolute;
  top: 20px;
`;

const GenreContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  max-width: 500px;
  margin: 0 auto;
  padding: 0 20px;
`;

const GenreButton = styled.button<{ isSelected: boolean }>`
  padding: 10px 20px;
  border-radius: 20px;
  border: none;
  background-color: ${(props) => (props.isSelected ? "#FFD700" : "#333")};
  color: ${(props) => (props.isSelected ? "black" : "white")};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.8;
  }
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

export default Genre;
