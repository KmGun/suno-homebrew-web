import { atom } from "recoil";

export interface ArtistOption {
  id: string;
  name: string;
  imageUrl: string;
}

export interface MakeState {
  selectedArtist?: ArtistOption;
  selectedGenres: string[];
  title: string;
  lyrics: string;
  notificationState: {
    isSupported: boolean;
    permission: NotificationPermission;
    notificationSent: boolean;
  };
}

export const makeState = atom<MakeState>({
  key: "makeState",
  default: {
    selectedArtist: undefined,
    selectedGenres: [],
    title: "",
    lyrics: "",
    notificationState: {
      isSupported: false,
      permission: "default",
      notificationSent: false,
    },
  },
});

export interface WebSocketMessage {
  message: string;
  timestamp: number;
}

export interface WebSocketState {
  messages: WebSocketMessage[];
  status: "connecting" | "connected" | "disconnected";
  error?: string;
  ws: WebSocket | null;
}

export const webSocketState = atom<WebSocketState>({
  key: "webSocketState",
  default: {
    status: "disconnected",
    messages: [],
    error: undefined,
    ws: null,
  },
});

export interface PlayerState {
  isPlaying: boolean;
  currentSong: {
    title: string;
    artist: string;
    lyric: string;
    audioUrl: string;
  } | null;
}

export const playerState = atom<PlayerState>({
  key: "playerState",
  default: {
    isPlaying: false,
    currentSong: null,
  },
});

interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  audioUrl: string;
  lyric: string;
}
