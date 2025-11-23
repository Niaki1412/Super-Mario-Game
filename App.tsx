import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { MainMenu } from './components/Menu/MainMenu';
import { Editor } from './components/Editor/Editor';
import { Game } from './components/Game/Game';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </HashRouter>
  );
};

export default App;