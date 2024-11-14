import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { webmFixDuration } from '../utils/BlobFix';
import { formatAudioTimestamp } from '../utils/AudioUtils';
import Constants from '../utils/Constants';

export enum AudioSource {
    URL = 'URL',
    FILE = 'FILE',
    RECORDING = 'RECORDING',
}

function getMimeType() {
    const types = [
        'audio/webm',
        'audio/mp4',
        'audio/ogg',
        'audio/wav',
        'audio/aac',
    ];
    for (let i = 0; i < types.length; i++) {
        if (MediaRecorder.isTypeSupported(types[i])) {
            return types[i];
        }
    }
    return undefined;
}

export const useWhisper = (onRecordingComplete: (blob: Blob) => void) => {
    const [recording, setRecording] = useState<boolean>(false); 
    const [duration, setDuration] = useState<number>(0); 
    
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [audioData, setAudioData] = useState<{
        buffer: AudioBuffer;
        url: string;
        source: AudioSource;
        mimeType: string;
    } | undefined>(undefined);
    const [audioDownloadUrl, setAudioDownloadUrl] = useState<string | undefined>(undefined);
    const [progress, setProgress] = useState<number | undefined>(undefined);
    const streamRef = useRef<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    

    const isAudioLoading = progress !== undefined;

    const resetAudio = () => {
        setAudioData(undefined);
        setAudioDownloadUrl(undefined);
    };

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

            mediaRecorder.addEventListener('dataavailable', async (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
                if (mediaRecorder.state === 'inactive') {
                    const duration = Date.now() - startTime;
                    let blob = new Blob(chunksRef.current, { type: mimeType });

                    if (mimeType === 'audio/webm') {
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
            console.error('Error accessing microphone:', error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
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

    const setAudioFromDownload = useCallback(async (data: ArrayBuffer, mimeType: string) => {
        const audioCTX = new AudioContext({ sampleRate: Constants.SAMPLING_RATE });
        const blobUrl = URL.createObjectURL(new Blob([data], { type: 'audio/*' }));
        const decoded = await audioCTX.decodeAudioData(data);
        setAudioData({
            buffer: decoded,
            url: blobUrl,
            source: AudioSource.URL,
            mimeType: mimeType,
        });
    }, []);

    const setAudioFromRecording = useCallback(async (data: Blob) => {
        resetAudio();
        setProgress(0);
        const blobUrl = URL.createObjectURL(data);
        const fileReader = new FileReader();
        fileReader.onprogress = (event) => {
            setProgress(event.loaded / event.total || 0);
        };
        fileReader.onloadend = async () => {
            const audioCTX = new AudioContext({ sampleRate: Constants.SAMPLING_RATE });
            const arrayBuffer = fileReader.result as ArrayBuffer;
            const decoded = await audioCTX.decodeAudioData(arrayBuffer);
            setProgress(undefined);
            setAudioData({
                buffer: decoded,
                url: blobUrl,
                source: AudioSource.RECORDING,
                mimeType: data.type,
            });
        };
        fileReader.readAsArrayBuffer(data);
    }, []);

    const downloadAudioFromUrl = useCallback(
        async (requestAbortController: AbortController) => {
            if (audioDownloadUrl) {
                try {
                    setAudioData(undefined);
                    setProgress(0);
    
                    // Explicitly define the axios config with 'any' type to avoid the typing issues
                    const config: any = {
                        signal: requestAbortController.signal,
                        responseType: 'arraybuffer',
                        onDownloadProgress: (progressEvent: any) => {  // Use 'any' here for progressEvent
                            setProgress(progressEvent.progress || 0);
                        },
                    };
    
                    const { data, headers }: { data: any; headers: any } = await axios.get(audioDownloadUrl, config);
    
                    let mimeType = headers['content-type'];
                    if (!mimeType || mimeType === 'audio/wave') {
                        mimeType = 'audio/wav';
                    }
                    setAudioFromDownload(data, mimeType);
                } catch (error) {
                    console.log('Request failed or aborted', error);
                } finally {
                    setProgress(undefined);
                }
            }
        },
        [audioDownloadUrl, setAudioFromDownload]
    );

    useEffect(() => {
        if (audioDownloadUrl) {
            const requestAbortController = new AbortController();
            downloadAudioFromUrl(requestAbortController);
            return () => {
                requestAbortController.abort();
            };
        }
    }, [audioDownloadUrl, downloadAudioFromUrl]);

    return {
        recording,
        duration,
        recordedBlob,
        startRecording,
        setRecordedBlob,
        stopRecording,
        formatAudioTimestamp,
        audioData,
        progress,
        isAudioLoading,
        setAudioFromDownload,
        setAudioFromRecording,
        setAudioDownloadUrl,
        resetAudio,
        setAudioData,
    };
};
