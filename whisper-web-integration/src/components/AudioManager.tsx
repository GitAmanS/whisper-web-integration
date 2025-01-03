// AudioManager.tsx
import React, {useState } from "react";
import Modal from "./modal/Modal";
import { UrlInput } from "./modal/UrlInput";
import AudioPlayer from "./AudioPlayer";
import { TranscribeButton } from "./TranscribeButton";
import Constants from "../utils/Constants";

// import { Transcriber } from "../hooks/useTranscriber";
import Progress from "./Progress";
// import AudioRecorder from "./AudioRecorder";
// import { useAudioManager } from "../hooks/useAudioManager";

import { useWhisper } from "../hooks/useWhisper";
import AudioRecorder from "./AudioRecorder";
import PlusIcon from "../icons/PlusIcon";
import MinusIcon from "../icons/MinusIcon";
import { Transcriber } from "../hooks/useTranscriber";

function titleCase(str: string) {
    str = str.toLowerCase();
    return (str.match(/\w+.?/g) || [])
        .map((word) => {
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join("");
}

// List of supported languages:
// https://help.openai.com/en/articles/7031512-whisper-api-faq
// https://github.com/openai/whisper/blob/248b6cb124225dd263bb9bd32d060b6517e067f8/whisper/tokenizer.py#L79
const LANGUAGES = {
    en: "english",
    zh: "chinese",
    de: "german",
    es: "spanish/castilian",
    ru: "russian",
    ko: "korean",
    fr: "french",
    ja: "japanese",
    pt: "portuguese",
    tr: "turkish",
    pl: "polish",
    ca: "catalan/valencian",
    nl: "dutch/flemish",
    ar: "arabic",
    sv: "swedish",
    it: "italian",
    id: "indonesian",
    hi: "hindi",
    fi: "finnish",
    vi: "vietnamese",
    he: "hebrew",
    uk: "ukrainian",
    el: "greek",
    ms: "malay",
    cs: "czech",
    ro: "romanian/moldavian/moldovan",
    da: "danish",
    hu: "hungarian",
    ta: "tamil",
    no: "norwegian",
    th: "thai",
    ur: "urdu",
    hr: "croatian",
    bg: "bulgarian",
    lt: "lithuanian",
    la: "latin",
    mi: "maori",
    ml: "malayalam",
    cy: "welsh",
    sk: "slovak",
    te: "telugu",
    fa: "persian",
    lv: "latvian",
    bn: "bengali",
    sr: "serbian",
    az: "azerbaijani",
    sl: "slovenian",
    kn: "kannada",
    et: "estonian",
    mk: "macedonian",
    br: "breton",
    eu: "basque",
    is: "icelandic",
    hy: "armenian",
    ne: "nepali",
    mn: "mongolian",
    bs: "bosnian",
    kk: "kazakh",
    sq: "albanian",
    sw: "swahili",
    gl: "galician",
    mr: "marathi",
    pa: "punjabi/panjabi",
    si: "sinhala/sinhalese",
    km: "khmer",
    sn: "shona",
    yo: "yoruba",
    so: "somali",
    af: "afrikaans",
    oc: "occitan",
    ka: "georgian",
    be: "belarusian",
    tg: "tajik",
    sd: "sindhi",
    gu: "gujarati",
    am: "amharic",
    yi: "yiddish",
    lo: "lao",
    uz: "uzbek",
    fo: "faroese",
    ht: "haitian creole/haitian",
    ps: "pashto/pushto",
    tk: "turkmen",
    nn: "nynorsk",
    mt: "maltese",
    sa: "sanskrit",
    lb: "luxembourgish/letzeburgesch",
    my: "myanmar/burmese",
    bo: "tibetan",
    tl: "tagalog",
    mg: "malagasy",
    as: "assamese",
    tt: "tatar",
    haw: "hawaiian",
    ln: "lingala",
    ha: "hausa",
    ba: "bashkir",
    jw: "javanese",
    su: "sundanese",
};

export enum AudioSource {
    URL = "URL",
    FILE = "FILE",
    RECORDING = "RECORDING",
}

export function AudioManager(props: {   transcriber: any;
    addTranscriber: () => void;
    removeTranscriber: (id: number) => void;
    id: number;}) {
    const {
        audioData,
        progress,
        isAudioLoading,
        setAudioFromRecording,
        setAudioDownloadUrl,
        setAudioData,
    }: any = useWhisper(props.transcriber);

    const isTranscribing = props.transcriber.isBusy;


    const handleAddTranscriber = () => {
        props.addTranscriber();
        console.log("handle add")
      };

    const handleRemoveTranscriber =()=>{
        props.removeTranscriber(props.id);
    }

    return (
        <>
            <div className="flex flex-col w-fit justify-center items-center rounded-t-lg  bg-white shadow-xl shadow-black/5 ring-1 ring-slate-700/10">
                <div className="flex w-fit flex-row space-x-2  w-full px-2">
                    <UrlTile
                        icon={<AnchorIcon />}
                        text={"From URL"}
                        onUrlUpdate={(e: React.SetStateAction<string | undefined>) => {
                            props.transcriber.onInputChange();
                            setAudioDownloadUrl(e);
                        }}
                    />
                    <VerticalBar />
                    <FileTile
                        icon={<FolderIcon />}
                        text={"From file"}
                        onFileUpdate={(decoded: any, blobUrl: any, mimeType: any) => {
                            props.transcriber.onInputChange();
                            setAudioData({
                                buffer: decoded,
                                url: blobUrl,
                                source: AudioSource.FILE,
                                mimeType: mimeType,
                            });
                        }}
                    />
                    {navigator.mediaDevices && (
                        <>
                            <VerticalBar />
                            <RecordTile
                                icon={<MicrophoneIcon />}
                                text={"Record"}
                                setAudioData={(e: Blob) => {
                                    props.transcriber.onInputChange();
                                    setAudioFromRecording(e);
                                }}
                            />
                        </>
                    )}
                    <VerticalBar />
                    
                    <Tile icon={<PlusIcon />} onClick={handleAddTranscriber} text={undefined}/>

                    <VerticalBar />
                    
                    <Tile icon={<MinusIcon />} onClick={handleRemoveTranscriber} text={undefined}/>
                        
                    
                </div>
                <AudioDataBar progress={isAudioLoading ? progress : +!!audioData} />
            </div>
            {audioData && (
                <>
                    <div className="flex">

                        <AudioPlayer audioUrl={audioData.url} mimeType={audioData.mimeType} />

                        <div className="flex flex-row pb-2 w-auto">
                        <SettingsTile
                            className=''
                            transcriber={props.transcriber}
                            icon={<SettingsIcon />}
                        />
                        <TranscribeButton
                                onClick={() => {
                                    props.transcriber.start(audioData.buffer);
                                }}
                                isModelLoading={props.transcriber.isModelLoading}
                                isTranscribing={isTranscribing}
                            />

                        </div>

                    </div>

                    <div className="relative w-full flex justify-center items-center">

                        {/* <SettingsTile
                            className=""
                            transcriber={props.transcriber}
                            icon={<SettingsIcon />}
                        /> */}
                    </div>
                    {props.transcriber.progressItems.length > 0 && (
                        <div className="relative z-10 p-4 w-full">
                            <label>Loading model files... (only run once)</label>
                            {props.transcriber.progressItems.map((data: { file: React.Key | null | undefined; progress: number; }) => (
                                <div key={data.file}>
                                    <Progress text={data.file ? String(data.file) : ''} percentage={data.progress} />
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </>
    );
}

function SettingsTile(props: {
    icon: JSX.Element;
    className?: string;
    transcriber: Transcriber;
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
                transcriber={props.transcriber}
            />
        </div>
    );
}

function SettingsModal(props: {
    show: boolean;
    onSubmit: (url: string) => void;
    onClose: () => void;
    transcriber: Transcriber;
}) {
    const names = Object.values(LANGUAGES).map(titleCase);

    const models = {
        // Original checkpoints
        'Xenova/whisper-tiny': [41, 152],
        'Xenova/whisper-base': [77, 291],
        'Xenova/whisper-small': [249],
        'Xenova/whisper-medium': [776],

        // Distil Whisper (English-only)
        'distil-whisper/distil-medium.en': [402],
        'distil-whisper/distil-large-v2': [767],
    };
    return (
        <Modal
            show={props.show}
            title={"Settings"}
            content={
                <>
                    <label>Select the model to use.</label>
                    {console.log("model:",props.transcriber.model)}
                    {console.log("langugage:", props.transcriber.language)}
                    {console.log("subtask:", props.transcriber.subtask)}
                    {console.log("quant:", props.transcriber.quantized)}
                    {console.log("mult:", props.transcriber.multilingual)}
                    
                    <select
                        className='mt-1 mb-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                        defaultValue={props.transcriber.model}
                        onChange={(e) => {
                            props.transcriber.setModel(e.target.value);
                        }}
                    >
                        {Object.keys(models)
                            .filter(
                                (key) =>
                                    props.transcriber.quantized ||
                                    // @ts-ignore
                                    models[key].length == 2,
                            )
                            .filter(
                                (key) => (
                                    !props.transcriber.multilingual || !key.startsWith('distil-whisper/')
                                )
                            )
                            .map((key) => (
                                <option key={key} value={key}>{`${key}${
                                    (props.transcriber.multilingual || key.startsWith('distil-whisper/')) ? "" : ".en"
                                } (${
                                    // @ts-ignore
                                    models[key][
                                        props.transcriber.quantized ? 0 : 1
                                    ]
                                }MB)`}</option>
                            ))}
                    </select>
                    <div className='flex justify-between items-center mb-3 px-1'>
                        <div className='flex'>
                            <input
                                id='multilingual'
                                type='checkbox'
                                checked={props.transcriber.multilingual}
                                onChange={(e) => {
                                    props.transcriber.setMultilingual(
                                        e.target.checked,
                                    );
                                }}
                            ></input>
                            <label htmlFor={"multilingual"} className='ms-1'>
                                Multilingual
                            </label>
                        </div>
                        <div className='flex'>
                            <input
                                id='quantize'
                                type='checkbox'
                                checked={props.transcriber.quantized}
                                onChange={(e) => {
                                    props.transcriber.setQuantized(
                                        e.target.checked,
                                    );
                                }}
                            ></input>
                            <label htmlFor={"quantize"} className='ms-1'>
                                Quantized
                            </label>
                        </div>
                    </div>
                    {props.transcriber.multilingual && (
                        <>
                            <label>Select the source language.</label>
                            <select
                                className='mt-1 mb-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                                defaultValue={props.transcriber.language}
                                onChange={(e) => {
                                    props.transcriber.setLanguage(
                                        e.target.value,
                                    );
                                }}
                            >
                                {Object.keys(LANGUAGES).map((key, i) => (
                                    <option key={key} value={key}>
                                        {names[i]}
                                    </option>
                                ))}
                            </select>
                            <label>Select the task to perform.</label>
                            <select
                                className='mt-1 mb-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                                defaultValue={props.transcriber.subtask}
                                onChange={(e) => {
                                    props.transcriber.setSubtask(
                                        e.target.value,
                                    );
                                }}
                            >
                                <option value={"transcribe"}>Transcribe</option>
                                <option value={"translate"}>
                                    Translate (to English)
                                </option>
                            </select>
                        </>
                    )}
                </>
            }
            onClose={props.onClose}
            onSubmit={() => {}}
        />
    ); 
}

function VerticalBar() {
    return <div className='w-[1px] bg-slate-200'></div>;
}

function AudioDataBar({ progress }: { progress: any }) {
    return <ProgressBar progress={`${Math.round(progress * 100)}%`} />;
}

function ProgressBar({ progress }: { progress: any }) {
    return (
        <div className='w-full bg-gray-200  h-1 dark:bg-gray-700'>
            <div className='bg-blue-600 h-1  transition-all' style={{ width: progress }}></div>
        </div>
    );
}

function UrlTile({ icon, text, onUrlUpdate }: { icon: any; text: any; onUrlUpdate: any }) {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <Tile icon={icon} text={text} onClick={() => setShowModal(true)} />
            <UrlModal show={showModal} onSubmit={onUrlUpdate} onClose={() => setShowModal(false)} />
        </>
    );
}

function UrlModal({ show, onSubmit, onClose }: { show: any; onSubmit: any; onClose: any }) {
    const [url, setUrl] = useState(Constants.DEFAULT_AUDIO_URL);

    return (
        <Modal
            show={show}
            title="From URL"
            content={<UrlInput onChange={(e) => setUrl(e.target.value)} value={url} />}
            onClose={onClose}
            submitText="Load"
            onSubmit={() => {onSubmit(url), onClose()}}
        />
    );
}

function FileTile({ icon, text, onFileUpdate }: { icon: any; text: any; onFileUpdate: any }) {
    let elem = document.createElement("input");
    elem.type = "file";
    elem.oninput = (e) => {
        const target = e.target as HTMLInputElement;
        if (!target || !target.files) return; // Null check for target and files
        let files = target.files;
        const urlObj = URL.createObjectURL(files[0]);
        const mimeType = files[0].type;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const target = e.target as FileReader; // Type assertion to FileReader
            if (!target || !target.result) return; // Null check for target and result
        
            const result = target.result;
        
            // Ensure that result is an ArrayBuffer before calling decodeAudioData
            if (result instanceof ArrayBuffer) {
                const decoded = await new AudioContext({ sampleRate: Constants.SAMPLING_RATE }).decodeAudioData(result);
                onFileUpdate(decoded, urlObj, mimeType);
            } else {
                console.error('File result is not an ArrayBuffer');
            }
        };
        
        reader.readAsArrayBuffer(files[0]);
        elem.value = "";
    };

    return <Tile icon={icon} text={text} onClick={() => elem.click()} />;
}

function RecordTile({ icon, text, setAudioData }: { icon: any; text: any; setAudioData: any }) {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <Tile icon={icon} text={text} onClick={() => setShowModal(true)} />
            <RecordModal show={showModal} onSubmit={setAudioData} onClose={() => setShowModal(false)} />
        </>
    );
}

function RecordModal({ show, onSubmit, onClose }: { show: any; onSubmit: any; onClose: any }) {
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

    return (
        <Modal
            show={show}
            title="From Recording"
            content={<AudioRecorder onRecordingComplete={setAudioBlob} />}
            onClose={onClose}
            submitText="Load"
            submitEnabled={audioBlob !== undefined}
            onSubmit={() => { onSubmit(audioBlob); setAudioBlob(null); onClose(); }}
        />
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

function AnchorIcon() {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth='1.5' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' d='M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244' />
        </svg>
    );
}

function FolderIcon() {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth='1.5' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' d='M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883' />
        </svg>
    );
}


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

function MicrophoneIcon() {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
        >
            <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z'
            />
        </svg>
    );
}
