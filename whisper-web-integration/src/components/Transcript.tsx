import { useRef, useEffect, useState } from "react";
import { TranscriberData } from "../hooks/useTranscriber";
import { formatAudioTimestamp } from "../utils/AudioUtils";

interface Props {
    transcribedData: TranscriberData | undefined;
}

export default function Transcript({ transcribedData }: Props) {
    const [editableData, setEditableData] = useState<TranscriberData | undefined>(transcribedData);
    const divRef = useRef<HTMLDivElement>(null);

    // Update editableData when transcribedData changes
    useEffect(() => {
        if (transcribedData) {
            setEditableData(transcribedData);
        }
    }, [transcribedData]);

    const saveBlob = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    };

    const exportTXT = () => {
        let chunks = editableData?.chunks ?? [];
        let text = chunks.map((chunk) => chunk.text).join("").trim();
        const blob = new Blob([text], { type: "text/plain" });
        saveBlob(blob, "transcript.txt");
    };

    const exportJSON = () => {
        let jsonData = JSON.stringify(editableData?.chunks ?? [], null, 2);
        const regex = /(    "timestamp": )\[\s+(\S+)\s+(\S+)\s+\]/gm;
        jsonData = jsonData.replace(regex, "$1[$2 $3]");

        const blob = new Blob([jsonData], { type: "application/json" });
        saveBlob(blob, "transcript.json");
    };

    // Scroll to the bottom when the component updates
    useEffect(() => {
        if (divRef.current) {
            const diff = Math.abs(
                divRef.current.offsetHeight + divRef.current.scrollTop - divRef.current.scrollHeight
            );
            if (diff <= 64) {
                divRef.current.scrollTop = divRef.current.scrollHeight;
            }
        }
    });

    // Handle text changes locally (without using onDataChange)
    const handleInputChange = (index: number, newText: string) => {
        if (!editableData) return;
        const updatedChunks = editableData.chunks.map((chunk, i) =>
            i === index ? { ...chunk, text: newText } : chunk
        );
        setEditableData({ ...editableData, chunks: updatedChunks });
    };

    return (
        <div ref={divRef} className="w-full flex flex-col my-2 p-4 max-h-[20rem] overflow-y-auto">
            {editableData?.chunks &&
                editableData.chunks.map((chunk, i) => (
                    <div
                        key={chunk.timestamp[0]} // Use timestamp as key for stability
                        className="w-full flex flex-row mb-2 bg-white rounded-lg p-4 shadow-xl shadow-black/5 ring-1 ring-slate-700/10"
                    >
                        <div className="mr-5">{formatAudioTimestamp(chunk.timestamp[0])}</div>
                        <input
                            type="text"
                            value={chunk.text}
                            onChange={(e) => handleInputChange(i, e.target.value)}
                            className="flex-1 bg-transparent outline-none"
                        />
                    </div>
                ))}
            {editableData && !editableData.isBusy && (
                <div className="w-full text-right">
                    <button
                        onClick={exportTXT}
                        className="text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2 text-center mr-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 inline-flex items-center"
                    >
                        Export TXT
                    </button>
                    <button
                        onClick={exportJSON}
                        className="text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2 text-center mr-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 inline-flex items-center"
                    >
                        Export JSON
                    </button>
                </div>
            )}
        </div>
    );
}
