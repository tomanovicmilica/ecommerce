import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import agent from '../api/agent';
import type { DigitalDownload } from '../models/digitalDownload';

export function useDigitalDownloads() {
    const [downloads, setDownloads] = useState<DigitalDownload[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchUserDownloads = useCallback(async () => {
        setLoading(true);
        try {
            const result: DigitalDownload[] = await agent.DigitalDownloads.getUserDownloads();
            setDownloads(result);
        } catch (error: any) {
            console.log('Digital downloads fetch info:', error?.status || 'No downloads available');
            // Silently handle - just set empty array, no toast for no downloads
            setDownloads([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const downloadFile = useCallback(async (downloadId: number, filename: string) => {
        try {
            const tokenResponse = await agent.DigitalDownloads.getDownloadToken(downloadId);
            const { blob, filename: serverFilename } = await agent.DigitalDownloads.downloadFile(tokenResponse.token);

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', serverFilename || filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            await agent.DigitalDownloads.markDownloadCompleted(downloadId);

            await fetchUserDownloads();
            toast.success('Download started successfully');
        } catch (error) {
            console.error('Error downloading file:', error);
            toast.error('Failed to download file');
        }
    }, [fetchUserDownloads]);

    return {
        downloads,
        loading,
        fetchUserDownloads,
        downloadFile
    };
}