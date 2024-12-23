import React, { useEffect, useState } from "react";
import styled from "styled-components";
import ysr2 from "../assets/ysr2.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SINGERS } from "../constants/artists.ts";
import { useSetRecoilState } from "recoil";
import { playerState } from "../atom.ts";

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
  const setPlayer = useSetRecoilState(playerState);

  useEffect(() => {
    // localStorage 확인
    const songRequestId = localStorage.getItem("song_request_id");
    setHasSongRequest(!!songRequestId);
  }, []);

  useEffect(() => {
    // 완성된 음악 목록 가져오기
    const fetchSongs = async () => {
      try {
        const response = await axios.get('/all-completed-songs');
        const songsData: SongResponse = response.data;

        // 객체를 배열로 변환하고 최신순으로 정렬
        const songsArray = Object.entries(songsData)
          .map(([id, data]) => ({
            id,
            ...data,
          }))
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );

        // 최대 3개만 선택
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

  const handleSongClick = (song: SongData) => {
    // audio_links 배열에서 '[0]1_result.mp3'로 끝나는 링크 찾기
    const audioUrl =
      song.audio_links.find((link) => link.endsWith("[0]1_result.mp3")) ||
      song.audio_links[0];

    setPlayer((prev) => ({
      ...prev,
      currentSong: {
        title: song.title,
        artist: findArtistName(song),
        lyric: song.lyric,
        audioUrl: audioUrl,
        thumbnailUrl: "",
      },
      isPlaying: false,
    }));
  };

  return (
    <Container>
      <Title>탄핵 음악 만들기</Title>
      <MainImage src={ysr2} alt="윤석열 이미지" />
      <Button onClick={() => navigate("/make/artist")}>바로 만들기</Button>

      <ProfileSection>
        <SectionTitle>둘러보기</SectionTitle>
        {songs.map((song) => (
          <ProfileCard
            key={song.id}
            onClick={() => handleSongClick(song)}
            style={{ cursor: "pointer" }}
          >
            <SongThumbnail />
            <ProfileInfo>
              <ProfileName>{song.title}</ProfileName>
              <ProfileDescription>{findArtistName(song)}</ProfileDescription>
              <CreatedAt>
                {new Date(song.created_at).toLocaleDateString()}
              </CreatedAt>
            </ProfileInfo>
          </ProfileCard>
        ))}
      </ProfileSection>
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

const Button = styled.button`
  background-color: #ffd700;
  color: #000000;
  padding: 12px 24px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  margin-bottom: 40px;
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
`;

const CreatedAt = styled.div`
  font-size: 12px;
  color: #888888;
  margin-top: 4px;
`;

const SongThumbnail = styled.div`
  width: 48px;
  height: 48px;
  background-color: #2a2a2a;
  border-radius: 4px;
  margin-right: 15px;
`;

export default Home;
