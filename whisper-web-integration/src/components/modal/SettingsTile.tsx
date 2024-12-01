import { useState } from "react";
import { Transcriber } from "../../hooks/useTranscriber";
import SettingsModal from "./SettingModal";


type TranscriberSettings = {
    model: string;
    language: string;
    subtask: string;
    multilingual: boolean;
    quantized: boolean;
  };

export default function SettingsTile(props: {
    icon: JSX.Element;
    className?: string;
    // transcriber: Transcriber;
    settings: TranscriberSettings;
    setSettings: React.Dispatch<React.SetStateAction<TranscriberSettings>>;
}) {
    const [showModal, setShowModal] = useState<boolean>(false);


    const onClick = () => {
        setShowModal(true);
    };

    const onClose = () => {
        setShowModal(false);
    };

    const onSubmit = () => {
        onClose();
    };

    return (
        <div className={props.className}>
            <Tile icon={props.icon} onClick={onClick} text={"Change Model"} />
            <SettingsModal
                show={showModal}
                onSubmit={onSubmit}
                onClose={onClose}
                settings={props.settings}
                setSettings={props.setSettings}
                // transcriber={props.transcriber}
            />
        </div>
    );
}


function Tile({ icon, text, onClick }: { icon: any; text: any; onClick: any }) {
    return (
        <button onClick={onClick} className='flex items-center justify-center rounded-lg p-2 bg-blue text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'>
            <div className='w-fit h-fit'>{icon}</div>
            {text && <div className='ml-2 break-text text-center text-md w-30'>{text}</div>}
        </button>
    );
}