import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home.tsx";
import NotFound from "./pages/NotFound.tsx";
import Artist from "./pages/Make/Artist.tsx";
import Genre from "./pages/Make/Genre.tsx";
import Lyrics from "./pages/Make/Lyrics.tsx";
import Main from "./pages/Main/Main.tsx";
import My from "./pages/My.tsx";
function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/home" element={<Home />} />
        <Route path="/make/artist" element={<Artist />} />
        <Route path="/make/genre" element={<Genre />} />
        <Route path="/make/lyrics" element={<Lyrics />} />
        <Route path="/my" element={<My />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
