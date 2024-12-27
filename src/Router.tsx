import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home.tsx";
import NotFound from "./pages/NotFound.tsx";
import Artist from "./pages/Make/Artist.tsx";
import Genre from "./pages/Make/Genre.tsx";
import Lyrics from "./pages/Make/Lyrics.tsx";
import My from "./pages/My.tsx";
import LargePlayer from "./pages/LargerPlayer.tsx";
function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Main />} /> */}
        <Route path="/" element={<Home />} />
        <Route path="/make/artist" element={<Artist />} />
        <Route path="/make/genre" element={<Genre />} />
        <Route path="/make/lyrics" element={<Lyrics />} />
        <Route path="/my" element={<My />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/large-player" element={<LargePlayer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
