
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { MainMenu } from './components/Menu/MainMenu';
import { CharacterSelect } from './components/Menu/CharacterSelect';
import { Editor } from './components/Editor/Editor';
import { Game } from './components/Game/Game';
import { GameCenter } from './components/GameCenter/GameCenter';
import { UserBar } from './components/User/UserBar';

const App: React.FC = () => {
  return (
    <HashRouter>
      <UserBar />
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/character" element={<CharacterSelect />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/game" element={<Game />} />
        <Route path="/center" element={<GameCenter />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
