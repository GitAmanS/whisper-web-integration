import { useWhisper } from "../hooks/useWhisper";


export default function AudioRecorder(props: { onRecordingComplete: (blob: Blob) => void }) {
    const { recording, duration, recordedBlob, startRecording, stopRecording, formatAudioTimestamp } = useWhisper(props.onRecordingComplete);

    const handleToggleRecording = () => {
        if (recording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <div className="flex flex-col justify-center items-center">
            <button
                type="button"
                className={`m-2 inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-all duration-200 ${
                    recording
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
                }`}
                onClick={handleToggleRecording}
            >
                {recording
                    ? `Stop Recording (${formatAudioTimestamp(duration)})`
                    : "Start Recording"}
            </button>

            {recordedBlob && (
                <audio className="w-full" controls>
                    <source src={URL.createObjectURL(recordedBlob)} type={recordedBlob.type} />
                </audio>
            )}
        </div>
    );
}
