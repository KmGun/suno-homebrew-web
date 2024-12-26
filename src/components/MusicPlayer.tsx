import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useRecoilState } from "recoil";
import { playerState } from "../atom.ts";
import PlayIcon from "../assets/play.svg";
import PauseIcon from "../assets/pause.svg";
import ShareIcon from "../assets/share.svg";

const MusicPlayer = () => {
  const [player, setPlayer] = useRecoilState(playerState);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!player.currentSong) return;

    if (player.isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }

    setPlayer((prev) => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }));
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: player.currentSong.title,
        text: `${player.currentSong.artist} - ${player.currentSong.title}`,
        url: window.location.href,
      });
    } catch (error) {
      console.error("공유하기 실패:", error);
    }
  };

  const handleMinimizedClick = () => {
    setIsExpanded(true);
  };

  useEffect(() => {
    if (player.currentSong) {
      if (audioRef.current) {
        audioRef.current.src = player.currentSong.audioUrl;
        audioRef.current.load();
        
        audioRef.current.addEventListener('loadedmetadata', () => {
          audioRef.current?.play()
            .then(() => {
              setPlayer((prev) => ({
                ...prev,
                isPlaying: true,
              }));
              setDuration(audioRef.current?.duration || 0);
            })
            .catch((error) => {
              console.error("재생 실패:", error);
              setPlayer((prev) => ({
                ...prev,
                isPlaying: false,
              }));
            });
        }, { once: true });
      }
    }
  }, [player.currentSong?.audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = player.currentSong?.audioUrl || "";
    }
  }, [player.currentSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      console.log('Duration loaded:', audio.duration);
    };

    const handleEnded = () => {
      setPlayer((prev) => ({
        ...prev,
        isPlaying: false,
      }));
      setCurrentTime(0);
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

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = e.currentTarget;
    const clickPosition = e.clientX - progressBar.getBoundingClientRect().left;
    const percentageClicked = clickPosition / progressBar.offsetWidth;

    if (audioRef.current) {
      const newTime = percentageClicked * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [isExpanded]);

  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(false);
  };

  if (!player.currentSong) return null;

  return (
    <PlayerContainer expanded={isExpanded}>
      {!isExpanded ? (
        <PlayerContent onClick={() => setIsExpanded(true)}>
          <MinimizedView>
            <Thumbnail src={player.currentSong.thumbnailUrl} alt="앨범 커버" />
            <SongInfo>
              <Title>{player.currentSong.title}</Title>
              <Artist>{player.currentSong.artist}</Artist>
            </SongInfo>
            <Controls>
              <PlayButton className="play-button" onClick={togglePlay}>
                <img
                  src={player.isPlaying ? PauseIcon : PlayIcon}
                  alt="재생 버튼"
                />
              </PlayButton>
            </Controls>
          </MinimizedView>
        </PlayerContent>
      ) : (
        <>
          <CloseButton
            type="button"
            onClick={handleClose}
            style={{ zIndex: 1001 }}
          >
            ×
          </CloseButton>
          <ExpandedView>
            <ExpandedContent>
              <LargeThumbnail
                src={player.currentSong.thumbnailUrl}
                alt="앨범 커버"
              />
              <SongMainInfo>
                <LargeTitle>{player.currentSong.title}</LargeTitle>
                <LargeArtist>{player.currentSong.artist}</LargeArtist>
              </SongMainInfo>

              <LyricsSection>
                {player.currentSong.lyric ? (
                  <Lyrics>{player.currentSong.lyric}</Lyrics>
                ) : (
                  <Lyrics>가사 정보가 없습니다.</Lyrics>
                )}
              </LyricsSection>

              <ShareButton onClick={handleShare}>
                <img src={ShareIcon} alt="공유하기" />
                공유하기
              </ShareButton>

              <PlayerControls>
                <ProgressContainer className="progress-container">
                  <ProgressBar
                    onClick={handleProgressClick}
                    progress={`${(currentTime / duration) * 100}%`}
                  />
                  <TimeInfo>
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </TimeInfo>
                </ProgressContainer>
                <PlayButton onClick={togglePlay}>
                  <img
                    src={player.isPlaying ? PauseIcon : PlayIcon}
                    alt="재생 버튼"
                  />
                </PlayButton>
              </PlayerControls>
            </ExpandedContent>
          </ExpandedView>
        </>
      )}
      <audio ref={audioRef} />
    </PlayerContainer>
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
  margin-left: auto;
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
  background: rgba(0, 0, 0, 0.3);
  border-radius: 2px;
  position: relative;
  cursor: pointer;
  transition: height 0.2s ease;

  &:hover {
    height: 6px;
  }

  &::after {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${props => props.progress};
    background: #FFB300;
    border-radius: 2px;
  }

  &::before {
    content: "";
    position: absolute;
    right: calc(100% - ${props => props.progress});
    top: 50%;
    transform: translateY(-50%);
    width: 12px;
    height: 12px;
    background: #FFB300;
    border-radius: 50%;
    transition: transform 0.2s ease;
  }

  &:hover::before {
    transform: translateY(-50%) scale(1.2);
  }
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

const CloseButton = styled.button`
  position: fixed;
  top: 24px;
  right: 24px;
  background: none;
  border: none;
  color: white;
  font-size: 32px;
  cursor: pointer;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  z-index: 1001;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

export default MusicPlayer;
