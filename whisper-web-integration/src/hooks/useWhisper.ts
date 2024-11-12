import { useState, useRef, useEffect } from "react";
import { webmFixDuration } from "../utils/BlobFix"; // Assuming this is in utils/BlobFix
import { formatAudioTimestamp } from "../utils/AudioUtils";
function getMimeType() {
    const types = [
        "audio/webm",
        "audio/mp4",
        "audio/ogg",
        "audio/wav",
        "audio/aac",
    ];
    for (let i = 0; i < types.length; i++) {
        if (MediaRecorder.isTypeSupported(types[i])) {
            return types[i];
        }
    }
    return undefined;
}

export function useWhisper(onRecordingComplete: (blob: Blob) => void) {
    const [recording, setRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

    const streamRef = useRef<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        setRecordedBlob(null); // Reset any previous recording
        let startTime = Date.now();

        try {
            if (!streamRef.current) {
                streamRef.current = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                });
            }

            const mimeType = getMimeType();
            const mediaRecorder = new MediaRecorder(streamRef.current, {
                mimeType,
            });

            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.addEventListener("dataavailable", async (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
                if (mediaRecorder.state === "inactive") {
                    const duration = Date.now() - startTime;
                    let blob = new Blob(chunksRef.current, { type: mimeType });

                    if (mimeType === "audio/webm") {
                        blob = await webmFixDuration(blob, duration, blob.type);
                    }

                    setRecordedBlob(blob);
                    onRecordingComplete(blob);

                    chunksRef.current = [];
                }
            });

            mediaRecorder.start();
            setRecording(true);
        } catch (error) {
            console.error("Error accessing microphone:", error);
        }
    };

    const stopRecording = () => {
        if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state === "recording"
        ) {
            mediaRecorderRef.current.stop();
            setDuration(0);
            setRecording(false);
        }
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (recording) {
            timer = setInterval(() => {
                setDuration((prevDuration) => prevDuration + 1);
            }, 1000);
        } else {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
        }

        return () => {
            if (timer) {
                clearInterval(timer);
            }
        };
    }, [recording]);

    return {
        recording,
        duration,
        recordedBlob,
        startRecording,
        stopRecording,
        formatAudioTimestamp
    };
}
