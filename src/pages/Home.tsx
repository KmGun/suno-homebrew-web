import React, { useEffect, useState } from "react";
import styled from "styled-components";
import ysr2 from "../assets/ysr2.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SINGERS } from "../constants/artists.ts";
import { useSetRecoilState } from "recoil";
import { playerState } from "../atom.ts";
import InstallAppButton from "../components/InstallAppButton.tsx";

// 음악 데이터 타입 정의
interface SongData {
  id?: string;
  lyric: string;
  title: string;
  style: string;
  model_name: string;
  created_at: string;
  audio_links: string[];
}

interface SongResponse {
  [key: string]: SongData;
}

const Home = () => {
  const navigate = useNavigate();
  const [hasSongRequest, setHasSongRequest] = useState<boolean>(false);
  const [songs, setSongs] = useState<SongData[]>([]);
  const [allSongs, setAllSongs] = useState<SongData[]>([]);
  const setPlayer = useSetRecoilState(playerState);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    // localStorage 확인
    const songRequestId = localStorage.getItem("song_request_id");
    setHasSongRequest(!!songRequestId);
  }, []);

  useEffect(() => {
    // 완성된 음악 목록 가져오기
    const fetchSongs = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SONG_GENERATE_API_URL}/all-completed-songs`);
        
        const songsData: SongResponse = response.data;

        if (!songsData || Object.keys(songsData).length === 0) {
          console.log('받아온 데이터가 비어있습니다');
          return;
        }

        // 객체를 배열로 변환하고 최신순으로 정렬
        const songsArray = Object.entries(songsData)
          .map(([id, data]) => ({
            id,
            ...data,
          }))
          .sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

        setAllSongs(songsArray);
        setSongs(songsArray.slice(0, 3));
      } catch (error) {
        console.error("음악 목록을 가져오는데 실패했습니다:", error);
      }
    };

    fetchSongs();
  }, []);

  const findArtistName = (songData: SongData) => {
    const artist = SINGERS.find((singer) => singer.id === songData.model_name);
    return artist ? artist.name : songData.model_name;
  };

  const handleSongClick = (song: SongData, version: number) => {
    const audioUrl = song.audio_links.find((link) => 
      link.endsWith(`[0]${version}_result.mp3`)
    );

    if (audioUrl) {
      setPlayer((prev) => ({
        ...prev,
        currentSong: {
          title: `${song.title} VER ${version}`,
          artist: findArtistName(song),
          lyric: song.lyric,
          audioUrl: audioUrl,
          thumbnailUrl: `https://suno-homebrew.s3.ap-northeast-2.amazonaws.com/album-covers/${song.id}/cover.png`,
          id: song.id,
        },
        isPlaying: true,
      }));
    }
  };

  return (
    <Container>
      <Title>🔥 탄핵 음악 만들기 🔥</Title>
      <MainImage src={ysr2} alt="윤석열 이미지" />
      <ButtonContainer>
        <Button onClick={() => navigate("/make/artist")}>바로 만들기</Button>
        {hasSongRequest && (
          <Button onClick={() => navigate("/my")}>내 음악</Button>
        )}
      </ButtonContainer>

      <ProfileSection>
        <SectionTitleWrapper>
          <SectionTitle>둘러보기</SectionTitle>
          <MoreButton onClick={() => setIsModalOpen(true)}>
            더보기 +
          </MoreButton>
        </SectionTitleWrapper>
        {songs.map((song) => (
          <React.Fragment key={song.id}>
            {[1, 2].map((version) => (
              <ProfileCard
                key={`${song.id}-${version}`}
                onClick={() => handleSongClick(song, version)}
                style={{ cursor: "pointer" }}
              >
                <SongThumbnail 
                  src={`https://suno-homebrew.s3.ap-northeast-2.amazonaws.com/album-covers/${song.id}/cover.png`}
                  alt={`${song.title} 커버 이미지`}
                />
                <ProfileInfo>
                  <ProfileName>{`${song.title} VER ${version}`}</ProfileName>
                  <ProfileDescription>
                    {findArtistName(song)}
                  </ProfileDescription>
                </ProfileInfo>
              </ProfileCard>
            ))}
          </React.Fragment>
        ))}
      </ProfileSection>

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <ModalHeader>
            <ModalTitle>전체 음악 목록</ModalTitle>
            <CloseButton onClick={() => setIsModalOpen(false)}>✕</CloseButton>
          </ModalHeader>
          <ModalContent>
            {allSongs.map((song) => (
              <React.Fragment key={song.id}>
                {[1, 2].map((version) => (
                  <ProfileCard
                    key={`${song.id}-${version}`}
                    onClick={() => handleSongClick(song, version)}
                    style={{ cursor: "pointer" }}
                  >
                    <SongThumbnail 
                      src={`https://suno-homebrew.s3.ap-northeast-2.amazonaws.com/album-covers/${song.id}/cover.png`}
                      alt={`${song.title} 커버 이미지`}
                    />
                    <ProfileInfo>
                      <ProfileName>{`${song.title} VER ${version}`}</ProfileName>
                      <ProfileDescription>
                        {findArtistName(song)}
                      </ProfileDescription>
                    </ProfileInfo>
                  </ProfileCard>
                ))}
              </React.Fragment>
            ))}
          </ModalContent>
        </Modal>
      )}
      
      <FixedInstallButtonWrapper>
        <InstallAppButton />
      </FixedInstallButtonWrapper>
    </Container>
  );
};

// 스타일 컴포넌트
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #000000;
  min-height: 100vh;
  justify-content: center;
  position: relative;
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 50px;
  position: absolute;
  top: 40px;
  color: #ffffff;
`;

const MainImage = styled.img`
  width: 200px;
  height: 200px;
  margin-bottom: 50px;
  margin-top: 80px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 40px;
`;

const Button = styled.button`
  background-color: #ffd700;
  color: #000000;
  padding: 12px 24px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
`;

const ProfileSection = styled.div`
  width: 100%;
  max-width: 500px;
  margin-top: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  margin-bottom: 20px;
  color: #ffffff;
`;

const ProfileCard = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  margin-bottom: 10px;
  background-color: #333333;
  border-radius: 10px;
`;

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.div`
  font-weight: bold;
  color: #ffffff;
`;

const ProfileDescription = styled.div`
  font-size: 14px;
  color: #cccccc;
  margin-top: 4px;
  display: block;
`;

const CreatedAt = styled.div`
  font-size: 12px;
  color: #888888;
  margin-top: 4px;
`;

const SongThumbnail = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 4px;
  margin-right: 15px;
  object-fit: cover;
`;

const FixedInstallButtonWrapper = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(66% - 40px);
  max-width: 400px;
  z-index: 100;
`;

const SectionTitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const MoreButton = styled.button`
  background: none;
  border: none;
  color: #ffd700;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    text-decoration: underline;
  }
`;

const Modal = styled.div<{ onClose: () => void }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 999;
  padding: 20px;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  width: 100%;
  max-width: 500px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  &:hover {
    opacity: 0.8;
  }
`;

const ModalTitle = styled.h2`
  color: white;
  margin-bottom: 20px;
  font-size: 20px;
`;

const ModalContent = styled.div`
  width: 100%;
  max-width: 500px;
  padding: 20px;
`;

export default Home;
