import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Constants from '../utils/Constants';

export enum AudioSource {
    URL = 'URL',
    FILE = 'FILE',
    RECORDING = 'RECORDING',
}

export const useAudioManager = (transcriber: any) => {
    const [progress, setProgress] = useState<number | undefined>(undefined);
    const [audioData, setAudioData] = useState<{
        buffer: AudioBuffer;
        url: string;
        source: AudioSource;
        mimeType: string;
    } | undefined>(undefined);
    const [audioDownloadUrl, setAudioDownloadUrl] = useState<string | undefined>(undefined);

    const isAudioLoading = progress !== undefined;

    const resetAudio = () => {
        setAudioData(undefined);
        setAudioDownloadUrl(undefined);
    };

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
                    const { data, headers } = await axios.get(audioDownloadUrl, {
                        signal: requestAbortController.signal,
                        responseType: 'arraybuffer',
                        onDownloadProgress: (progressEvent) => {
                            setProgress(progressEvent.progress || 0);
                        },
                    });

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
        audioData,
        progress,
        isAudioLoading,
        setAudioFromDownload,
        setAudioFromRecording,
        setAudioDownloadUrl,
        resetAudio,
        setAudioData
    };
};
