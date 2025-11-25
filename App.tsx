
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { MainMenu } from './components/Menu/MainMenu';
import { Editor } from './components/Editor/Editor';
import { Game } from './components/Game/Game';
import { UserBar } from './components/User/UserBar';

const App: React.FC = () => {
  return (
    <HashRouter>
      <UserBar />
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
