import React from "react";
import styled from "styled-components";
import StatusBar from "../../components/StatusBar.tsx";
import { useRecoilState } from "recoil";
import { makeState } from "../../atom.ts";
import { useNavigate } from "react-router-dom";
import OpenAI from 'openai';
import axios from "axios";

// OpenAI 클라이언트 설정
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// 장르 매핑 추가
export const genreMapping: { [key: string]: string } = {
  댄스: "Dance",
  JPOP: "J-pop",
  씨티팝: "City Pop",
  발라드: "Ballad",
  락: "Rock",
  메탈: "Metal",
  테크노: "Techno",
  힙합: "Hip-hop",
  재즈: "Jazz",
  팝: "Pop",
  클래식: "Classical",
  블루스: "Blues",
  랩: "Rap",
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
  const [isGenerating, setIsGenerating] = React.useState(false);

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

    try {
      // 1. 장르 변환 (한글 -> 영어)
      const selectedGenresInEnglish = make.selectedGenres.map(genre => genreMapping[genre]);
      
      // 2. 선택되지 않은 장르 목록 생성
      const unselectedGenres = Object.keys(genreMapping)
        .filter(genre => !make.selectedGenres.includes(genre))
        .map(genre => genreMapping[genre]);
      
      // 3. 성별에 따른 프롬프트 설정
      const genderPrompt = (make.selectedArtist as any).isMale ? "make vocal male version" : "make vocal female version";
      
      // 4. 임시 요청 ID 생성 (예: 타임스탬프)
      const tempRequestId = Date.now().toString();
      
      // 5. 로컬 스토리지에 임시 요청 ID 저장
      const existingIds = localStorage.getItem("song_request_id");
      if (existingIds) {
        localStorage.setItem("song_request_id", `${existingIds},${tempRequestId}`);
      } else {
        localStorage.setItem("song_request_id", tempRequestId);
      }
      
      // 6. 마이페이지로 이동
      navigate("/");
      
      // 7. API 요청 (비동기로 실행)
      axios.post(
        `${process.env.REACT_APP_SONG_GENERATE_API_URL}/generate-audio`,
        {
          title: make.title,
          lyric: make.lyrics,
          prompt: genderPrompt,
          style: `${selectedGenresInEnglish.join(", ")}`,
          style_negative: unselectedGenres.join(", "),
          model_name: make.selectedArtist.id,
          phone_number: phone,
          request_id: tempRequestId, // 임시 요청 ID 전달
        }
      );
    } catch (error) {
      console.error("API 요청 오류:", error);
      alert("요청 중 오류가 발생했습니다.");
    }
  };

  // 가사 확장 함수 추가
  const expandLyrics = async () => {
    if (!make.lyrics.trim()) {
      alert("가사를 조금이라도 입력해주세요!");
      return;
    }

    // 한글 감지를 위한 정규식
    const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(make.lyrics);
    
    setIsGenerating(true);
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: hasKorean
              ? "당신은 전문 작사가입니다. 노래 제목과 주어진 가사를 바탕으로 더 확장된 가사를 작성해주세요. 제목의 의미와 감성이 가사에 잘 반영되도록 해주세요."
              : "You are a professional lyricist. Please expand the given lyrics based on both the song title and existing lyrics. Make sure the meaning and emotion of the title are well reflected in the expanded lyrics."
          },
          {
            role: "user",
            content: hasKorean
              ? `노래 제목: "${make.title}"\n\n다음 가사를 확장해서 작성해주세요. 제목의 의미를 ��� 살리고 기존 구조([Intro], [Verse], [Chorus] 등)를 유지하면서 확장해주세요: \n\n${make.lyrics}`
              : `Song title: "${make.title}"\n\nPlease expand these lyrics while maintaining the existing structure ([Intro], [Verse], [Chorus], etc.) and incorporating the meaning of the title: \n\n${make.lyrics}`
          }
        ],
        model: "gpt-4o",
      });

      const expandedLyrics = completion.choices[0]?.message?.content;
      if (expandedLyrics) {
        setMake((prev) => ({
          ...prev,
          lyrics: expandedLyrics,
        }));
      }
    } catch (error) {
      console.error("가사 생성 오류:", error);
      alert("가사 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Container>
      <ContentWrapper>
        <Title>제목과 가사를 입력해보세요!</Title>
        <TitleInput
          value={make.title}
          onChange={handleTitleChange}
          placeholder="노래 제목을 입력하세요..."
        />
        <LyricsWrapper>
          <LyricsTextArea
            value={make.lyrics}
            onChange={handleLyricsChange}
            placeholder="여기에 가사를 입력하세요..."
          />
          <ExpandButton 
            onClick={expandLyrics}
            disabled={isGenerating}
          >
            {isGenerating ? "생성 중..." : "AI 가사 도움받기"}
          </ExpandButton>
        </LyricsWrapper>
        <GuideText>
          [Intro]: 곡의 시작 부분. 음악의 분위기를 서서히 잡아감.
          <br />
          [Verse]: 노래의 본문 부분. 곡의 이야기를 전달하는 역할.
          <br />
          [Chorus]: 후렴구. 기억에 남는 멜로디나 주제를 반복해 강조.
          <br />
          [Outro]: 곡의 마무리 부분. 자연스럽게 곡의 끝맺음.
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
  width: 100%;
  height: 55vh;
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

// 새로운 스타일 컴포넌트 추가
const LyricsWrapper = styled.div`
  width: 80%;
  position: relative;
`;

const ExpandButton = styled.button`
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  background-color: #ffd700;
  color: black;
  cursor: pointer;
  white-space: nowrap;
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 10;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    background-color: #666;
    cursor: not-allowed;
  }
`;

export default Lyrics;
