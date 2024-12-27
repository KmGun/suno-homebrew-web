// 이미지 임포트
import ljbImg from "../assets/ljb.png";
import tenCmImg from "../assets/10cm.png";
import shImg from "../assets/akmu_suhyeon.png";
import byrImg from "../assets/baekyerin.png";
import bol4Img from "../assets/bol4.png";
import deanImg from "../assets/dean.png";
import iuImg from "../assets/iu_new.png";
import jannabiImg from "../assets/jannabi.png";
import jojungseokImg from "../assets/jjs.png";
import kgsImg from "../assets/kgs.png";
import kimdrImg from "../assets/kimdr.png";
import leemoonsaeImg from "../assets/leemoonsae.png";
import imchangjungImg from "../assets/limchangjung.png";
import minkyunghoonImg from "../assets/minkyunghoon.png";
import naulImg from "../assets/naul.png";
import newjeans_danielImg from "../assets/newjeans_daniel.png";
import newjeans_hanniImg from "../assets/newjeans_hanni.png";
import newjeans_heinImg from "../assets/newjeans_hein.png";
import newjeans_minjiImg from "../assets/newjeans_minji.png";
import nmixx_haewonImg from "../assets/nmixx_haewon.png";
import ohyukv2Img from "../assets/ohyuk.png";
import phs12Img from "../assets/parkhyosin.png";
import paulKimImg from "../assets/paulkim.png";
import sskImg from "../assets/ssk.png";
import sullyoonImg from "../assets/sullyoon.png";
import taeyeonImg from "../assets/taeyeon.png";
import winterImg from "../assets/winter.png";
import yunhaImg from "../assets/yunha.png";
import ybImg from "../assets/yb_v2.png";
import youngkImg from "../assets/younk.png";
import phs03Img from "../assets/phs03.png";

export interface ArtistOption {
  id: string;
  name: string;
  imageUrl: string;
  isMale: boolean;
}

export const SINGERS: ArtistOption[] = [
  { id: "kgs", name: "김광석", imageUrl: kgsImg, isMale: true },
  { id: "kimdr", name: "김동률", imageUrl: kimdrImg, isMale: true },
  { id: "winter_v2", name: "윈터", imageUrl: winterImg, isMale: false },
  { id: "yunha", name: "윤하", imageUrl: yunhaImg, isMale: false },
  { id: "yb_v2", name: "윤도현", imageUrl: ybImg, isMale: true },
  { id: "youngk", name: "영케이", imageUrl: youngkImg, isMale: true },
  { id: "ljb", name: "임재범", imageUrl: ljbImg, isMale: true },
  { id: "imchangjung", name: "임창정", imageUrl: imchangjungImg, isMale: true },
  { id: "iu_new", name: "아이유", imageUrl: iuImg, isMale: false },
  { id: "ohyuk_v2", name: "오혁", imageUrl: ohyukv2Img, isMale: true },
  { id: "nmixx_sullyoon", name: "설윤 (엔믹스)", imageUrl: sullyoonImg, isMale: false },
  { id: "akmu_suhyeon", name: "수현", imageUrl: shImg, isMale: false },
  { id: "ssk", name: "성시경", imageUrl: sskImg, isMale: true },
  { id: "bol4", name: "볼빨간사춘기", imageUrl: bol4Img, isMale: false },
  { id: "parkhyosin12_v2", name: "박효신 (12년도)", imageUrl: phs12Img, isMale: true },
  { id: "phs03", name: "박효신 (03년도)", imageUrl: phs03Img, isMale: true },
  { id: "paulkim", name: "폴킴", imageUrl: paulKimImg, isMale: true },
  { id: "naul", name: "나얼", imageUrl: naulImg, isMale: true },
  { id: "newjeans_minji", name: "민지 (뉴진스)", imageUrl: newjeans_minjiImg, isMale: false },
  { id: "minkyunghoon", name: "민경훈", imageUrl: minkyunghoonImg, isMale: true },
  { id: "leemoonsae", name: "이문세", imageUrl: leemoonsaeImg, isMale: true },
  { id: "jojungseok", name: "조정석", imageUrl: jojungseokImg, isMale: true },
  { id: "jannabi", name: "잔나비", imageUrl: jannabiImg, isMale: true },
  { id: "dean", name: "dean", imageUrl: deanImg, isMale: true },
  { id: "taeyeon", name: "태연", imageUrl: taeyeonImg, isMale: false },
  { id: "nmixx_haewon", name: "해원 (엔믹스)", imageUrl: nmixx_haewonImg, isMale: false },
  { id: "newjeans_hanni", name: "하니 (뉴진스)", imageUrl: newjeans_hanniImg, isMale: false },
  { id: "newjeans_hein", name: "혜인 (뉴진스)", imageUrl: newjeans_heinImg, isMale: false },
  { id: "newjeans_daniel", name: "다니엘 (뉴진스)", imageUrl: newjeans_danielImg, isMale: false },
  { id: "baekyerin", name: "백예린", imageUrl: byrImg, isMale: false },
  { id: "10cm", name: "10cm", imageUrl: tenCmImg, isMale: true },















];

// export const POLITICIANS: ArtistOption[] = [
//   { id: "yoon", name: "윤석열", imageUrl: "/src/assets/yoon.png" },
//   { id: "lee", name: "이재명", imageUrl: "/src/assets/lee.png" },
// ];
