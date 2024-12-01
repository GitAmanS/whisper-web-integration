import { useState } from "react";
import { Transcriber } from "../../hooks/useTranscriber";
import { LANGUAGES } from "../../utils/Languages";
import Modal from "./Modal";


type TranscriberSettings = {
    model: string;
    language: string;
    subtask: string;
    multilingual: boolean;
    quantized: boolean;
  };
export default function SettingsModal(props: {
    show: boolean;
    onSubmit: (url: string) => void;
    onClose: () => void;
    // transcriber: Transcriber;
    settings: TranscriberSettings;
    setSettings: React.Dispatch<React.SetStateAction<TranscriberSettings>>;
}) {
    const names = Object.values(LANGUAGES).map(titleCase);

    // const defaults = {
    //     model: "Xenova/whisper-tiny",
    //     language: "english",
    //     subtask: "transcribe",
    // };

    // const [settings, setSettings] = useState({
    //     model: defaults.model,
    //     language: defaults.language,
    //     subtask: defaults.subtask,
    //     multilingual: false,
    //     quantized: false,
    // });

    const models = {
        "Xenova/whisper-tiny": [41, 152],
        "Xenova/whisper-base": [77, 291],
        "Xenova/whisper-small": [249],
        "Xenova/whisper-medium": [776],
        "distil-whisper/distil-medium.en": [402],
        "distil-whisper/distil-large-v2": [767],
    };

    const handleSettingChange = (key: string, value: any) => {
        props.setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = () => {
        // props.transcriber.setModel(settings.model);
        // props.transcriber.setLanguage(settings.language);
        // props.transcriber.setSubtask(settings.subtask);
        // props.transcriber.setMultilingual(settings.multilingual);
        // props.transcriber.setQuantized(settings.quantized);
        // props.onSubmit(settings.model); 
    };

    return (
        <Modal
            show={props.show}
            title={"Settings"}
            content={
                <>
                    <label>Select the model to use.</label>
                    <select
                        className="mt-1 mb-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        value={props.settings.model}
                        onChange={(e) =>
                            handleSettingChange("model", e.target.value)
                        }
                    >
                        {Object.keys(models)
                            .filter(
                                (key) =>
                                    props.settings.quantized ||
                                    // @ts-ignore
                                    models[key].length == 2
                            )
                            .filter(
                                (key) =>
                                    props.settings.multilingual ||
                                    !key.startsWith("distil-whisper/")
                            )
                            .map((key) => (
                                <option key={key} value={key}>{`${key}${
                                    props.settings.multilingual ||
                                    key.startsWith("distil-whisper/")
                                        ? ""
                                        : ".en"
                                } (${
                                    // @ts-ignore
                                    models[key][
                                        props.settings.quantized ? 0 : 1
                                    ]
                                }MB)`}</option>
                            ))}
                    </select>
                    <div className="flex justify-between items-center mb-3 px-1">
                        <div className="flex">
                            <input
                                id="multilingual"
                                type="checkbox"
                                checked={props.settings.multilingual}
                                onChange={(e) =>
                                    handleSettingChange(
                                        "multilingual",
                                        e.target.checked
                                    )
                                }
                            ></input>
                            <label htmlFor={"multilingual"} className="ms-1">
                                Multilingual
                            </label>
                        </div>
                        <div className="flex">
                            <input
                                id="quantize"
                                type="checkbox"
                                checked={props.settings.quantized}
                                onChange={(e) =>
                                    handleSettingChange(
                                        "quantized",
                                        e.target.checked
                                    )
                                }
                            ></input>
                            <label htmlFor={"quantize"} className="ms-1">
                                Quantized
                            </label>
                        </div>
                    </div>
                    {props.settings.multilingual && (
                        <>
                            <label>Select the source language.</label>
                            <select
                                className="mt-1 mb-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                value={props.settings.language}
                                onChange={(e) =>
                                    handleSettingChange("language", e.target.value)
                                }
                            >
                                {Object.keys(LANGUAGES).map((key, i) => (
                                    <option key={key} value={key}>
                                        {names[i]}
                                    </option>
                                ))}
                            </select>
                            <label>Select the task to perform.</label>
                            <select
                                className="mt-1 mb-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                value={props.settings.subtask}
                                onChange={(e) =>
                                    handleSettingChange("subtask", e.target.value)
                                }
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

function titleCase(str: string) {
    return str
        .toLowerCase()
        .match(/\w+.?/g)
        ?.map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join("") || "";
}
