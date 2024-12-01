import { useEffect } from 'react';
import { useWorker } from './useWorker';
import Constants from '../utils/Constants';

export function useAutoDownloadModel() {
    const webWorker = useWorker((event) => {
        const message = event.data;
        switch (message.status) {
            case 'initiate':
                console.log('Model loading started');
                break;
            case 'ready':
                console.log('Model is ready to use');
                break;
            case 'error':
                console.error('Error downloading model:', message.data.message);
                break;
            default:
                break;
        }
    });

    useEffect(() => {
        webWorker.postMessage({
            action: 'initiate',
            model: Constants.DEFAULT_MODEL, 
        });
        return () => {
            webWorker.terminate();
        };
    }, [webWorker]);

}
