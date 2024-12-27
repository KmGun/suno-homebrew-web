import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import PlayIcon from "../assets/play.svg";
import PauseIcon from "../assets/pause.svg";
import ShareIcon from "../assets/share.svg";
import HeartIcon from "../assets/heart.svg";
import HeartFilledIcon from "../assets/heart-filled.svg";
import axios from "axios";
import { formatTime } from "../components/MusicPlayer.tsx";

// 음악 정보 타입 정의
interface SongData {
  title: string;
  artist?: string;
  thumbnailUrl?: string;
  lyric: string;
  audioUrl: string[];
  created_at: string;
  completed_at: string;
  status: string;
  style: string;
}

const LargePlayer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const songRequestId = searchParams.get("song_request_id");
  const version = searchParams.get("ver") || "1"; // 기본값 1
  const navigate = useNavigate();
  
  // 상태 관리
  const [songData, setSongData] = useState<SongData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // 음악 정보 가져오기
  useEffect(() => {
    const fetchSongData = async () => {
      if (!songRequestId) return;
      
      try {
        const { data } = await axios.post(`${process.env.REACT_APP_SONG_GENERATE_API_URL}/songs`, {
          song_ids: songRequestId
        });
        
        const songInfo = data[songRequestId];
        // version에 따라 적절한 오디오 URL 선택
        const audioIndex = version === "1" ? 0 : 3; // version 1이면 [0]1_result.mp3, 2이면 [0]2_result.mp3
        
        setSongData({
          title: songInfo.title,
          lyric: songInfo.lyric,
          audioUrl: [songInfo.audio_links[audioIndex]], // 선택된 버전의 오디오 URL만 사용
          thumbnailUrl: `https://suno-homebrew.s3.ap-northeast-2.amazonaws.com/album-covers/${songRequestId}/cover.png`,
          created_at: songInfo.created_at,
          completed_at: songInfo.completed_at,
          status: songInfo.status,
          style: songInfo.style
        });
      } catch (error) {
        console.error("Failed to fetch song data:", error);
      }
    };

    fetchSongData();
  }, [songRequestId, version]); // version도 의존성 배열에 추가

  // 이벤트 핸들러들
  const handleTogglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleShare = () => {
    // 공유 로직 구현
    if (navigator.share) {
      navigator.share({
        title: songData?.title,
        text: `${songData?.artist} - ${songData?.title}`,
        url: window.location.href,
      });
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // 좋아요 API 호출 로직 구현
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const newTime = ratio * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // 오디오 이벤트 리스너
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const handleMoreSongs = () => {
    navigate('/');
  };

  if (!songData) {
    return <div>로딩 중...</div>;
  }

  return (
    <>
      <ExpandedView>
        <ExpandedContent>
          <LargeThumbnail src={songData.thumbnailUrl} alt="앨범 커버" />
          <SongMainInfo>
            <LargeTitle>{songData.title}</LargeTitle>
            <LargeArtist>{songData.artist}</LargeArtist>
          </SongMainInfo>

          <LyricsSection>
            {songData.lyric ? (
              <Lyrics>{songData.lyric}</Lyrics>
            ) : (
              <Lyrics>가사 정보가 없습니다.</Lyrics>
            )}
          </LyricsSection>

          <LikeButton onClick={handleLike}>
            <img src={isLiked ? HeartFilledIcon : HeartIcon} alt="좋아요" />
            {isLiked ? '좋아요 취소' : '좋아요'}
          </LikeButton>

          <ButtonContainer>
            <ShareButton onClick={handleShare}>
              <img src={ShareIcon} alt="공유하기" />
              공유하기
            </ShareButton>

            <MoreSongsButton onClick={handleMoreSongs}>
              더 많은 노래 보기
            </MoreSongsButton>
          </ButtonContainer>

          <PlayerControls>
            <ProgressContainer>
              <ProgressBar
                onClick={handleProgressClick}
                progress={`${((currentTime || 0) / (duration || 1)) * 100}%`}
              >
                <ProgressBarFill 
                  style={{ width: `${((currentTime || 0) / (duration || 1)) * 100}%` }} 
                />
              </ProgressBar>
              <TimeInfo>
                <span>{formatTime(currentTime || 0)}</span>
                <span>{formatTime(duration || 0)}</span>
              </TimeInfo>
            </ProgressContainer>
            <PlayButton onClick={handleTogglePlay}>
              <img src={isPlaying ? PauseIcon : PlayIcon} alt="재생 버튼" />
            </PlayButton>
          </PlayerControls>
        </ExpandedContent>
      </ExpandedView>
      <audio ref={audioRef} src={songData.audioUrl} />
    </>
  );
};

const PlayerContainer = styled.div<{ expanded: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(24, 24, 24, 0.98);
  color: white;
  transition: all 0.3s ease;
  backdrop-filter: blur(30px);
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;

  ${(props) =>
    props.expanded &&
    `
    top: 0;
    z-index: 1000;
    height: 100%;
    width: 100%;
    position: fixed;
    overflow: hidden;
  `}
`;

const PlayerContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${(props) => (props.expanded ? "0" : "12px 24px")};
`;

const Thumbnail = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 4px;
  object-fit: cover;
`;

const SongInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.div`
  color: white;
  font-weight: bold;
`;

const Artist = styled.div`
  color: #999;
  font-size: 14px;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PlayButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;

  img {
    width: 24px;
    height: 24px;
  }

  &:hover {
    opacity: 0.8;
  }
`;

const MinimizedView = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  height: 64px;
  padding-right: 16px;
`;

const ExpandedView = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgb(24, 24, 24);
  color: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
`;

const ExpandedContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 48px 24px;
  gap: 24px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  position: relative;
  user-select: none;
  -webkit-user-select: none;

  * {
    user-select: none;
    -webkit-user-select: none;
  }
`;

const LargeThumbnail = styled.img`
  width: 300px;
  height: 300px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
`;

const SongMainInfo = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LargeTitle = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: white;
  margin-bottom: 8px;
`;

const LargeArtist = styled.div`
  font-size: 24px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 16px;
`;

const LyricsSection = styled.div`
  width: 100%;
  flex: 1;
  overflow-y: auto;
  text-align: center;
  padding: 24px 0;
  min-height: 200px;
  max-height: 300px;
  margin: 20px 0;
`;

const PlayerControls = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: auto;
  padding: 0 24px;
  margin-bottom: 48px;
`;

const ProgressContainer = styled.div`
  width: 90%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0 auto;
  max-width: 600px;
`;

const ProgressBar = styled.div<{ progress: string }>`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  position: relative;
  cursor: pointer;
`;

const ProgressBarFill = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: #FFB300;
  border-radius: 2px;
  transition: width 0.1s linear;
`;

const TimeInfo = styled.div`
  display: flex;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  padding: 0 12px;
`;

const ShareButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  color: white;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  img {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const Lyrics = styled.div`
  font-size: 16px;
  line-height: 2;
  color: rgba(255, 255, 255, 0.8);
  white-space: pre-line;
  text-align: center;
  padding: 0 16px;
`;

const LikeButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  color: white;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  img {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const MoreSongsButton = styled(ShareButton)`
  background: #FFC700;
  color: black;
  
  &:hover {
    background: #FFD700;
  }
`;

export default LargePlayer;