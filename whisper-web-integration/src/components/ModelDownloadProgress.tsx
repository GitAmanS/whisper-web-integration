import { useState, useEffect } from 'react';
import { useTranscriber } from '../hooks/useTranscriber'; // Assuming this is where you manage transcription state

export function ModelDownloadProgress() {
    const { isModelLoading, progressItems } = useTranscriber(); // Get progress from the transcriber hook
    const [downloadProgress, setDownloadProgress] = useState<number>(0);

    useEffect(() => {
        // If there is a progress item, update the progress
        if (progressItems.length > 0) {
            const modelProgress = progressItems[0]?.progress || 0;
            setDownloadProgress(modelProgress);
        }
    }, [progressItems]);

    return (
        <div>
            {isModelLoading && (
                <div>
                    <h2>Downloading Model...</h2>
                    <progress value={downloadProgress} max={100}></progress>
                    <span>{downloadProgress}%</span>
                </div>
            )}
        </div>
    );
}
