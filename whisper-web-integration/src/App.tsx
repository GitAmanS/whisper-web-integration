import React, { useState, useRef, useEffect } from 'react';
import { useTransition, animated } from '@react-spring/web';
import { AudioManager } from './components/AudioManager';
import Transcript from './components/Transcript';
import { Transcriber, useTranscriber } from './hooks/useTranscriber';
import { AiOutlinePlus } from "react-icons/ai";
import { LANGUAGES } from './utils/Languages';
import Header from './components/Header';
import SettingsTile from './components/modal/SettingsTile';
import { useAutoDownloadModel } from './hooks/useAutoDownloadModel';
import { ModelDownloadProgress } from './components/ModelDownloadProgress';




type TranscriberSettings = {
  model: string;
  language: string;
  subtask: string;
  multilingual: boolean;
  quantized: boolean;
};


interface TranscriberInstanceProps {
  addTranscriber: () => void;
  removeTranscriber: () => void;
  id: string;
  settings: TranscriberSettings; 
}

const TranscriberInstance: React.FC<TranscriberInstanceProps> = ({
  addTranscriber,
  removeTranscriber,
  id,
  settings,
}) => {
  const transcriber = useTranscriber();

  useEffect(() => {
    transcriber.setModel(settings.model);
    transcriber.setMultilingual(settings.multilingual);
    transcriber.setQuantized(settings.quantized);
    transcriber.setLanguage(settings.language);
    transcriber.setSubtask(settings.subtask);
  }, [settings, transcriber]); 

  return (
    <div className="transcriber-instance my-12">
      <AudioManager
        transcriber={transcriber}
        addTranscriber={addTranscriber}
        removeTranscriber={removeTranscriber}
        id={id}
      />
      <Transcript transcribedData={transcriber.output} />
    </div>
  );
};


const App: React.FC = () => {
  const [transcribers, setTranscribers] = useState<number[]>([1]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useAutoDownloadModel();

  const addTranscriber = () => {
    const newId = transcribers.length ? Math.max(...transcribers) + 1 : 1;
    setTranscribers([...transcribers, newId]);

    setTimeout(() => {
      const container = containerRef.current;
      if (container) {
        const newElement = container.querySelector(`#transcriber-${newId}`);
        newElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 0); 
  };

  const removeTranscriber = (id: number) => {
    if (transcribers.length !== 1) {
      const index = transcribers.indexOf(id);
      const nextId = transcribers[index - 1] || transcribers[index + 1];

      setTranscribers(transcribers.filter((transcriberId) => transcriberId !== id));

      setTimeout(() => {
        const container = containerRef.current;
        if (container) {
          const nextElement = container.querySelector(`#transcriber-${nextId}`);
          nextElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 0); 
    }
  };

  const transitions = useTransition(transcribers, {
    from: { opacity: 0, transform: 'scale(0.9)' },
    enter: { opacity: 1, transform: 'scale(1)' },
    leave: { opacity: 0, transform: 'scale(0.9)' },
    keys: (item) => item, 
  });

  const defaults = {
    model: "Xenova/whisper-tiny",
    language: "english",
    subtask: "transcribe",
  };

  const [settings, setSettings] = useState({
    model: defaults.model,
    language: defaults.language,
    subtask: defaults.subtask,
    multilingual: false,
    quantized: false,
  });

  console.log("defaultSet:", settings)
  useEffect(()=>{
    console.log("Settings:", settings)
  }, [settings])

  return (
    <div className="App mx-8 my-8">
      <Header>
        <SettingsTile
          settings={settings}
          setSettings={setSettings} icon={<SettingsIcon/>}        />
      </Header>
      <div className="flex justify-center items-center min-h-screen">
        <ModelDownloadProgress/>
        <div
          ref={containerRef}
          className="container flex flex-col justify-center items-center"
        >
          {transitions((style, id) => (
            <animated.div
              style={style}
              className="w-full"
              id={`transcriber-${id}`} 
            >
              <TranscriberInstance
                key={id}
                id={id}
                addTranscriber={addTranscriber}
                removeTranscriber={removeTranscriber}
                settings={settings}
              />
            </animated.div>
          ))}
        </div>
      </div>
      <div className="fixed bottom-8 right-8">
        <button
          onClick={addTranscriber}
          className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600"
        >
          <AiOutlinePlus />
        </button>
      </div>
    </div>
  );
};



function SettingsIcon() {
  return (
      <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth='1.25'
          stroke='currentColor'
      >
          <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z'
          />
          <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
          />
      </svg>
  );
}



export default App;
