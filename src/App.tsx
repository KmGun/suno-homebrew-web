import React from "react";
import { RecoilRoot } from "recoil";
import Router from "./Router.tsx";
import MusicPlayer from "./components/MusicPlayer.tsx";
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body, #root {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    position: relative;
  }

  body {
    background-color: #000;
    color: #fff;
  }
`;

function App() {
  return (
    <RecoilRoot>
      <GlobalStyle />
      <Router />
      <MusicPlayer />
    </RecoilRoot>
  );
}

export default App;
