import React, { useState } from 'react';
import { AudioManager } from './components/AudioManager';
import Transcript from './components/Transcript';
import { useTranscriber } from './hooks/useTranscriber';

const App: React.FC = () => {
  const transcriber = useTranscriber();
  return (
    <div className="App">
                <AudioManager transcriber={transcriber} />
                <Transcript transcribedData={transcriber.output} />
    </div>
  );
};

export default App;
