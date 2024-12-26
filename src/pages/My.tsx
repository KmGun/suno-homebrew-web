import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { SINGERS } from "../constants/artists.ts";
import { useSetRecoilState } from "recoil";
import { playerState } from "../atom.ts";

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
  const [songs, setSongs] = useState<SongDataResponse>({});
  const setPlayer = useSetRecoilState(playerState);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const songIds = localStorage.getItem("song_request_id");
        if (!songIds) return;

        const response = await axios.post(
          `${process.env.REACT_APP_SONG_GENERATE_API_URL}/songs`,
          { song_ids: songIds }
        );
        setSongs(response.data);
      } catch (error) {
        console.error("노래 데이터를 가져오는데 실패했습니다:", error);
      }
    };

    // 컴포넌트 마운트 시 즉시 실행
    fetchSongs();

    // 5초마다 데이터 새로 가져오기
    const interval = setInterval(fetchSongs, 5000);

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => clearInterval(interval);
  }, []);

  const findArtistName = (songData: SongData) => {
    const artist = SINGERS.find((singer) => singer.id === songData.model_name);
    return artist ? artist.name : songData.model_name;
  };

  const handleSongClick = (song: SongData, version: number) => {
    if (song.status === "complete") {
      const audioIndex = song.audio_links.findIndex((link) =>
        link.includes(`[0]${version}_result.mp3`)
      );
      setPlayer({
        isPlaying: true,
        currentSong: {
          title: `${song.title} VER ${version}`,
          artist: findArtistName(song),
          lyric: song.lyric,
          audioUrl: song.audio_links[audioIndex],
        },
      });
    }
  };

  return (
    <Container>
      <Title>내 음악 보기</Title>
      <SongList>
        {Object.entries(songs).map(([id, song]) => (
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
                <SongThumbnail />
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

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 20px;
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

const SongThumbnail = styled.div`
  width: 48px;
  height: 48px;
  background-color: #2a2a2a;
  border-radius: 4px;
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

export default My;
