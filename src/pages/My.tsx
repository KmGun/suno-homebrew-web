import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { SINGERS } from "../constants/artists.ts";
import { useSetRecoilState } from "recoil";
import { playerState } from "../atom.ts";
import { useNavigate } from "react-router-dom";
import { ReactComponent as HomeIcon } from "../assets/home.svg";
import InstallAppButton from "../components/InstallAppButton.tsx";

interface SongData {
  lyric: string;
  title: string;
  style: string;
  style_negative: string;
  model_name: string;
  created_at: string;
  status: "pending" | "complete";
  audio_links: string[];
}

interface SongDataResponse {
  [key: string]: SongData;
}

const My = () => {
  const navigate = useNavigate();
  const [songs, setSongs] = useState<SongDataResponse>({});
  const [likedSongs, setLikedSongs] = useState<SongDataResponse>({});
  const setPlayer = useSetRecoilState(playerState);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        // 내가 만든 노래들 가져오기
        const songIds = localStorage.getItem("song_request_id");
        if (songIds) {
          const response = await axios.post(
            `${process.env.REACT_APP_SONG_GENERATE_API_URL}/songs`,
            { song_ids: songIds }
          );
          setSongs(response.data);
        }

        // 좋아요한 노래들 가져오기 (내가 만든 노래 제외)
        const likedIds = localStorage.getItem("likes");
        if (likedIds) {
          const response = await axios.post(
            `${process.env.REACT_APP_SONG_GENERATE_API_URL}/songs`,
            { song_ids: likedIds }
          );
          
          // 내가 만든 노래는 제외하고 좋아요 목록에 표시
          const filteredLikedSongs = Object.entries(response.data).reduce((acc, [id, song]) => {
            if (!songs[id]) {
              acc[id] = song;
            }
            return acc;
          }, {} as SongDataResponse);
          
          setLikedSongs(filteredLikedSongs);
        }
      } catch (error) {
        console.error("노래 데이터를 가져오는데 실패했습니다:", error);
      }
    };

    fetchSongs();
    const interval = setInterval(fetchSongs, 5000);
    return () => clearInterval(interval);
  }, [songs]);

  const findArtistName = (songData: SongData) => {
    const artist = SINGERS.find((singer) => singer.id === songData.model_name);
    return artist ? artist.name : songData.model_name;
  };

  const handleSongClick = (song: SongData, version: number) => {
    if (song.status === "complete") {
      const audioIndex = song.audio_links.findIndex((link) =>
        link.includes(`[0]${version}_result.mp3`)
      );
      
      // 노래 ID 추출
      const songId = song.audio_links[audioIndex].split('/song-requests/')[1].split('/')[0];
      
      setPlayer({
        isPlaying: true,
        currentSong: {
          title: `${song.title} VER ${version}`,
          artist: findArtistName(song),
          lyric: song.lyric,
          audioUrl: song.audio_links[audioIndex],
          thumbnailUrl: `https://suno-homebrew.s3.ap-northeast-2.amazonaws.com/album-covers/${songId}/cover.png`,
          id: songId,
        },
      });
    }
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate("/")}>
          <HomeIcon width="24" height="24" />
        </BackButton>
        <Title>내 음악 보기</Title>
        <InstallButtonWrapper>
          <InstallAppButton/>
        </InstallButtonWrapper>
      </Header>
      
      <SectionTitle>내가 만든 음악</SectionTitle>
      <SongList>
        {Object.keys(songs).length === 0 ? (
          <EmptyMessage>
            내가 만든 곡이 없다면,<br/> 홈 화면에서 확인해 주세요!
          </EmptyMessage>
        ) : (
          Object.entries(songs).map(([id, song]) => (
            <React.Fragment key={id}>
              {[1, 2].map((version) => (
                <SongItem
                  key={`${id}-${version}`}
                  status={song.status}
                  onClick={() => handleSongClick(song, version)}
                  style={{
                    cursor: song.status === "complete" ? "pointer" : "default",
                  }}
                >
                  <SongThumbnail 
                    src={`https://suno-homebrew.s3.ap-northeast-2.amazonaws.com/album-covers/${id}/cover.png`}
                    alt={`${song.title} 커버 이미지`}
                  />
                  <SongInfo song={song} version={version} />
                </SongItem>
              ))}
            </React.Fragment>
          ))
        )}
      </SongList>

      <SectionTitle>좋아요한 음악</SectionTitle>
      <SongList>
        {Object.entries(likedSongs).map(([id, song]) => (
          <React.Fragment key={id}>
            {[1, 2].map((version) => (
              <SongItem
                key={`${id}-${version}`}
                status={song.status}
                onClick={() => handleSongClick(song, version)}
                style={{
                  cursor: song.status === "complete" ? "pointer" : "default",
                }}
              >
                <SongThumbnail 
                  src={`https://suno-homebrew.s3.ap-northeast-2.amazonaws.com/album-covers/${id}/cover.png`}
                  alt={`${song.title} 커버 이미지`}
                />
                <SongInfo song={song} version={version} />
              </SongItem>
            ))}
          </React.Fragment>
        ))}
      </SongList>
    </Container>
  );
};

const Container = styled.div`
  padding: 20px;
  background-color: #000000;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.8;
  }
`;

const Title = styled.h1`
  font-size: 24px;
  margin: 0;
`;

const SongList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SongItem = styled.div<{ status: string }>`
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: #1e1e1e;
  border-radius: 12px;
  margin-bottom: 8px;
  position: relative;
`;

const SongThumbnail = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 4px;
  object-fit: cover;
`;

const SongInfo = ({ song, version }: { song: SongData; version: number }) => {
  const findArtistName = (songData: SongData) => {
    const artist = SINGERS.find((singer) => singer.id === songData.model_name);
    return artist ? artist.name : songData.model_name;
  };

  return (
    <SongInfoWrapper status={song.status}>
      <SongTitle>{`${song.title} VER ${version}`}</SongTitle>
      <ArtistName status={song.status}>{findArtistName(song)}</ArtistName>
      <SongDate status={song.status}>
        {new Date(song.created_at).toLocaleDateString()}
      </SongDate>
    </SongInfoWrapper>
  );
};

const SongInfoWrapper = styled.div<{ status: string }>`
  margin-left: 16px;
  position: relative;
  flex: 1;

  ${(props) =>
    props.status === "pending" &&
    `
    &::after {
      content: "제작중... 5~10분 뒤에 새로고침 해주세요!";
      position: absolute;
      left: 0;
      top: 48px;
      color: #FFA500;
      font-size: 16px;
      white-space: nowrap;
    }
  `}
`;

const SongTitle = styled.h2`
  font-size: 16px;
  margin-bottom: 4px;
  color: #ffffff;
  font-weight: normal;
`;

const ArtistName = styled.p<{ status: string }>`
  font-size: 14px;
  color: #999999;
  margin-bottom: 4px;
  visibility: ${(props) => (props.status === "pending" ? "hidden" : "visible")};
`;

const SongDate = styled.p<{ status: string }>`
  font-size: 14px;
  color: #444444;
  visibility: ${(props) => (props.status === "pending" ? "hidden" : "visible")};
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  margin: 24px 0 16px 0;
  color: #ffffff;
`;

const InstallButtonWrapper = styled.div`
  margin-left: auto;
`;

const EmptyMessage = styled.div`
  color: #999999;
  text-align: center;
  padding: 24px;
  background-color: #1e1e1e;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
`;

export default My;
