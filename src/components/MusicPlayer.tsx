import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useRecoilState } from "recoil";
import { playerState } from "../atom.ts";
import PlayIcon from "../assets/play.svg";
import PauseIcon from "../assets/pause.svg";
import ShareIcon from "../assets/share.svg";
import HeartIcon from "../assets/heart.svg";
import HeartFilledIcon from "../assets/heart-filled.svg";

export const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const MusicPlayer = () => {
  const [player, setPlayer] = useRecoilState(playerState);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);

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
      // 현재 URL에서 song_request_id와 version 추출
      const songId = player.currentSong.id;
      const version = player.currentSong.title.includes("VER 2") ? 2 : 1;
      const shareUrl = `${window.location.origin}/large-player?song_request_id=${songId}&ver=${version}`;

      // 기본 공유 데이터
      const shareData = {
        title: player.currentSong.title,
        text: `${player.currentSong.artist}가 불러주는 탄핵 AI 노래 ${player.currentSong.title}을 지금 바로 들어보세요!`,
        url: shareUrl,
      };

      // 이미지가 있고 파일 공유가 지원되는 경우에만 이미지 추가 시도
      if (player.currentSong.thumbnailUrl && navigator.canShare) {
        try {
          const imageResponse = await fetch(player.currentSong.thumbnailUrl);
          if (imageResponse.ok) {
            const imageBlob = await imageResponse.blob();
            const imageFile = new File([imageBlob], 'thumbnail.jpg', { type: 'image/jpeg' });
            
            const shareDataWithImage = {
              ...shareData,
              files: [imageFile]
            };

            if (navigator.canShare(shareDataWithImage)) {
              await navigator.share(shareDataWithImage);
              return;
            }
          }
        } catch (imageError) {
          console.log("이미지 공유 실패, 텍스트만 공유합니다:", imageError);
        }
      }

      // 이미지 공유가 실패하거나 지원되지 않는 경우 기본 공유 사용
      await navigator.share(shareData);
      
    } catch (error) {
      console.error("공유하기 실패:", error);
      alert("공유하기가 지원되지 않거나 실패했습니다.");
    }
  };

  const handleMinimizedClick = () => {
    setIsExpanded(true);
  };

  useEffect(() => {
    if (player.currentSong && audioRef.current) {
      audioRef.current.src = player.currentSong.audioUrl;
      audioRef.current.load();
      
      const handleLoadedMetadata = () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
          setCurrentTime(0);
          
          if (player.isPlaying) {
            audioRef.current.play().catch(console.error);
          } else {
            audioRef.current.pause();
          }
        }
      };

      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        }
      };
    }
  }, [player.currentSong, player.isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.currentTime >= 0) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleDurationChange = () => {
      if (audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("loadedmetadata", handleDurationChange);

    if (audio.duration) {
      setDuration(audio.duration);
    }
    if (audio.currentTime) {
      setCurrentTime(audio.currentTime);
    }

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("loadedmetadata", handleDurationChange);
    };
  }, [isExpanded]);

  useEffect(() => {
    if (audioRef.current) {
      if (player.isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [player.isPlaying]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const percentageClicked = clickPosition / rect.width;
    
    const newTime = percentageClicked * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
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
    e.stopPropagation();
    
    if (!isExpanded) {
      // 최소화된 상태에서만 음악 재생을 중지하고 현재 곡을 제거
      setPlayer(prev => ({
        ...prev,
        currentSong: null,
        isPlaying: false
      }));
    }
    
    // 확장된 상태에서는 단순히 크기만 줄임
    setIsExpanded(false);
  };

  useEffect(() => {
    if (player.currentSong) {
      console.log('현재 곡 정보:', player.currentSong);
      const likes = localStorage.getItem('likes') || '';
      const songId = player.currentSong.id;
      console.log('현재 likes 상태:', likes);
      console.log('현재 songId:', songId);
      setIsLiked(likes.split(',').includes(songId));
    }
  }, [player.currentSong]);

  const handleSongClick = (song: SongData, version: number) => {
    const audioUrl = song.audio_links.find((link) => 
      link.endsWith(`[0]${version}_result.mp3`)
    );

    if (audioUrl) {
      const songId = audioUrl.split('/song-requests/')[1].split('/')[0];
      
      setPlayer((prev) => ({
        ...prev,
        currentSong: {
          title: `${song.title} VER ${version}`,
          artist: findArtistName(song),
          lyric: song.lyric,
          audioUrl: audioUrl,
          thumbnailUrl: "",
          id: songId,
        },
        isPlaying: true,
      }));
    }
  };

  const handleLike = () => {
    if (!player.currentSong) return;
    
    console.log('좋아요 클릭시 현재 곡 데이터:', player.currentSong);
    const likes = localStorage.getItem('likes');
    console.log('현재 저장된 likes:', likes);
    
    const likesList = likes ? likes.split(',').filter(id => id !== '') : [];
    const songId = player.currentSong.id;
    
    console.log('현재 likes:', likes);
    console.log('현재 likesList:', likesList);
    console.log('현재 songId:', songId);
    
    if (isLiked) {
      const newLikes = likesList.filter(id => id !== songId);
      console.log('좋아요 취소 후:', newLikes);
      localStorage.setItem('likes', newLikes.join(','));
      setIsLiked(false);
      alert('좋아요가 취소되었습니다.');
    } else {
      const newLikes = [...likesList, songId];
      console.log('좋아요 추가 후:', newLikes);
      localStorage.setItem('likes', newLikes.join(','));
      setIsLiked(true);
      alert('좋아요가 추가되었습니다.');
    }

    console.log('저장 후 localStorage:', localStorage.getItem('likes'));
  };

  if (!player.currentSong) return null;

  return (
    <PlayerContainer expanded={isExpanded}>
      {!isExpanded ? (
        <PlayerContent onClick={handleMinimizedClick}>
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
              <CloseButton onClick={handleClose}>×</CloseButton>
            </Controls>
          </MinimizedView>
        </PlayerContent>
      ) : (
        <>
          <CloseButton onClick={handleClose}>×</CloseButton>
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
                  <Lyrics>사 정보가 없습니다.</Lyrics>
                )}
              </LyricsSection>

              <LikeButton onClick={handleLike}>
                <img src={isLiked ? HeartFilledIcon : HeartIcon} alt="좋아요" />
                {isLiked ? '좋아요 취소' : '좋아요'}
              </LikeButton>

              <ShareButton onClick={handleShare}>
                <img src={ShareIcon} alt="공유하기" />
                공유하기
              </ShareButton>

              <PlayerControls>
                <ProgressContainer>
                  <ProgressBar
                    onClick={handleProgressClick}
                    progress={`${((currentTime || 0) / (duration || 1)) * 100}%`}
                  >
                    <ProgressBarFill style={{ width: `${((currentTime || 0) / (duration || 1)) * 100}%` }} />
                  </ProgressBar>
                  <TimeInfo>
                    <span>{formatTime(currentTime || 0)}</span>
                    <span>{formatTime(duration || 0)}</span>
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
  gap: 16px;
  margin-left: auto;
  min-width: 100px;
`;

const PlayButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;

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
  padding: 0 16px;
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

export default MusicPlayer;
