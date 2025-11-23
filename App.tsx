import React, { useState } from 'react';
import { MainMenu } from './components/Menu/MainMenu';
import { Editor } from './components/Editor/Editor';
import { Game } from './components/Game/Game';

type AppMode = 'menu' | 'editor' | 'game';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('menu');

  // Simple Router
  switch (mode) {
    case 'editor':
      return <Editor onExit={() => setMode('menu')} />;
    case 'game':
      return <Game mapData={null} onExit={() => setMode('menu')} />; // Game handles map loading internally for now
    case 'menu':
    default:
      return <MainMenu onSelectMode={setMode} />;
  }
};

export default App;
