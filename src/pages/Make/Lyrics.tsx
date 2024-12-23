import React from "react";
import styled from "styled-components";
import StatusBar from "../../components/StatusBar.tsx";
import { useRecoilState } from "recoil";
import { makeState } from "../../atom.ts";
import { useNavigate } from "react-router-dom";

// 장르 매핑 추가
const genreMapping: { [key: string]: string } = {
  댄스: "Dance",
  JPOP: "J-pop",
  발라드: "Ballad",
  메탈: "Metal",
  힙합: "Hip-hop",
  재즈: "Jazz",
  락: "Rock",
};

// PhoneModal 컴포넌트 추가
const PhoneModal = ({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (phone: string) => void;
}) => {
  const [phone, setPhone] = React.useState("");

  const handleSubmit = () => {
    if (phone.length !== 11) {
      alert("올바른 전화번호를 입력해주세요");
      return;
    }
    onSubmit(phone);
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <h2>전화번호를 입력해주세요</h2>
        <ModalInput
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="전화번호 입력 (-없이 입력)"
          maxLength={11}
        />
        <ModalButtonGroup>
          <ModalButton onClick={onClose}>취소</ModalButton>
          <ModalButton onClick={handleSubmit}>확인</ModalButton>
        </ModalButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

const Lyrics = () => {
  const [make, setMake] = useRecoilState(makeState);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (!make.lyrics) {
      setMake((prev) => ({
        ...prev,
        title: "",
        lyrics: `[Intro]

[Verse 1]

[Chorus]

[Verse 2]

[Verse 3]

[Outro]`,
      }));
    }
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMake((prev) => ({
      ...prev,
      title: e.target.value,
    }));
  };

  const handleLyricsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMake((prev) => ({
      ...prev,
      lyrics: e.target.value,
    }));
  };

  const handleNextClick = () => {
    if (!make.selectedArtist) {
      alert("아티스트를 선택해주세요.");
      return;
    }
    setIsModalOpen(true);
  };

  const handlePhoneSubmit = async (phone: string) => {
    if (!make.selectedArtist) return;

    const selectedGenresInEnglish = make.selectedGenres.map(
      (genre) => genreMapping[genre]
    );

    const allGenres = Object.keys(genreMapping);
    const unselectedGenres = allGenres
      .filter((genre) => !make.selectedGenres.includes(genre))
      .map((genre) => genreMapping[genre]);

    const genderPrompt = make.selectedArtist.isMale
      ? "make vocal male version"
      : "make vocal female version";

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SONG_GENERATE_API_URL}/generate-audio`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
          mode: "cors",
          body: JSON.stringify({
            title: make.title,
            lyric: make.lyrics,
            prompt: genderPrompt,
            style: `${selectedGenresInEnglish.join(
              ", "
            )}, gentle piano accompaniment, warm atmosphere`,
            style_negative: unselectedGenres.join(", "),
            modelName: make.selectedArtist.id,
            phoneNumber: phone,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("API 요청 실패");
      }

      const data = await response.json();

      // 기존 요청 ID들을 가져옴
      const existingIds = localStorage.getItem("song_request_id");

      // 새로운 ID를 추가
      if (existingIds) {
        localStorage.setItem(
          "song_request_id",
          `${existingIds},${data.song_request_id}`
        );
      } else {
        localStorage.setItem("song_request_id", data.song_request_id);
      }

      navigate("/my");
    } catch (error) {
      console.error("API 요청 오류:", error);
      alert("요청 중 오류가 발생했습니다.");
    }
  };

  return (
    <Container>
      <ContentWrapper>
        <Title>제목과 가사를 입력해 보세요!</Title>
        <TitleInput
          value={make.title}
          onChange={handleTitleChange}
          placeholder="노래 제목을 입력하세요..."
        />
        <LyricsTextArea
          value={make.lyrics}
          onChange={handleLyricsChange}
          placeholder="여기에 가사를 입력하세요..."
        />
        <GuideText>
          *자유롭게 배치는 커스텀 하실수 있어요!
          <br /> [Intro]: 곡의 시작 부분. 음악의 분위기를 서서히 잡아감.
          <br />
          [Verse]: 노래의 본문 부분. 곡의 이야기를 전달하는 역할.
          <br />
          [Chorus]: 후렴구. 기억에 남는 멜로디나 주제를 반복해 강조.
          <br />
          [Outro]: 곡의 마무리 부분. 자연스럽게 곡을 끝맺음.
        </GuideText>
        <NextButton onClick={handleNextClick}>다음</NextButton>
      </ContentWrapper>
      <StatusBar current={3} total={3} />
      <PhoneModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handlePhoneSubmit}
      />
    </Container>
  );
};

const Container = styled.div`
  padding: 20px;
  height: 100vh;
  background-color: black;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 10px;
  text-align: center;
`;

const ContentWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const LyricsTextArea = styled.textarea`
  width: 80%;
  height: 40vh;
  background-color: #333;
  border: none;
  border-radius: 10px;
  padding: 20px;
  color: white;
  font-size: 16px;
  resize: none;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #ffd700;
  }

  &::placeholder {
    color: #666;
  }
`;

const NextButton = styled.button`
  padding: 15px 60px;
  border-radius: 25px;
  border: none;
  background-color: #ffd700;
  color: black;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: auto;

  &:hover {
    opacity: 0.8;
  }
`;

const GuideText = styled.div`
  width: 80%;
  margin-top: 15px;
  font-size: 12px;
  color: #888;
  white-space: pre-line;
  line-height: 1.4;
`;

const TitleInput = styled.input`
  width: 80%;
  padding: 15px;
  background-color: #333;
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 16px;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #ffd700;
  }

  &::placeholder {
    color: #666;
  }
`;

// 모달 관련 스타일 컴포넌트 추가
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #333;
  padding: 20px;
  border-radius: 10px;
  width: 80%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  h2 {
    text-align: center;
    margin: 0;
  }
`;

const ModalInput = styled.input`
  padding: 10px;
  border-radius: 5px;
  border: none;
  background-color: #444;
  color: white;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #ffd700;
  }
`;

const ModalButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
`;

const ModalButton = styled.button`
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  background-color: #ffd700;
  color: black;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;

export default Lyrics;
