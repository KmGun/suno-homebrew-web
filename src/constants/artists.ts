// 이미지 임포트
import isuImg from "../assets/isu.png";
import ljbImg from "../assets/ljb.png";

export interface ArtistOption {
  id: string;
  name: string;
  imageUrl: string;
  isMale: boolean;
}

export const SINGERS: ArtistOption[] = [
  { id: "isu", name: "이수", imageUrl: isuImg, isMale: true },
  { id: "ljb", name: "임재범", imageUrl: ljbImg, isMale: true },
];

// export const POLITICIANS: ArtistOption[] = [
//   { id: "yoon", name: "윤석열", imageUrl: "/src/assets/yoon.png" },
//   { id: "lee", name: "이재명", imageUrl: "/src/assets/lee.png" },
// ];
