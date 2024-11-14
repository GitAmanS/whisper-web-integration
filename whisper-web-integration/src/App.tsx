import React, { useState } from 'react';
import { AudioManager } from './components/AudioManager';
import Transcript from './components/Transcript';
import { useTranscriber } from './hooks/useTranscriber';

interface TranscriberInstanceProps {
  addTranscriber: () => void;
  removeTranscriber: (id: number) => void; 
  id: number; 
}

const TranscriberInstance: React.FC<TranscriberInstanceProps> = ({ addTranscriber, removeTranscriber, id }) => {
  const transcriber = useTranscriber();

  return (
    <div className="transcriber-instance">
      <AudioManager transcriber={transcriber} addTranscriber={addTranscriber} removeTranscriber={removeTranscriber} id={id}/>
      <Transcript transcribedData={transcriber.output} />
    </div>
  );
};

const App: React.FC = () => {
  const [transcribers, setTranscribers] = useState<number[]>([1]);

  const addTranscriber = () => {
    const newId = transcribers.length ? Math.max(...transcribers) + 1 : 1;
    setTranscribers([...transcribers, newId]);
  };

  const removeTranscriber = (id: number) => {
    setTranscribers(transcribers.filter(transcriberId => transcriberId !== id));
  };

  return (
    <div className="App">
      <div className="flex justify-center items-center min-h-screen">
        <div className="container flex flex-col justify-center items-center">
          {transcribers.map(id => (
            <TranscriberInstance key={id} id={id} addTranscriber={addTranscriber} removeTranscriber={removeTranscriber} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
