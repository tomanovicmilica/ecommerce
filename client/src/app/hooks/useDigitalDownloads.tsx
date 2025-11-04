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

    const downloadFile = useCallback(async (downloadId: number, _filename: string) => {
        try {
            // Get a secure download token from the backend
            const { token } = await agent.DigitalDownloads.getDownloadToken(downloadId);

            // Use the token to download the file through the backend
            // This will handle authentication and download counting
            const downloadUrl = `http://localhost:5089/api/digitaldownloads/download/${token}`;

            // Open the download URL in a new tab
            window.open(downloadUrl, '_blank');

            // Refresh the downloads list to show updated download count
            await fetchUserDownloads();

            toast.success('Download started successfully');
        } catch (error: any) {
            console.error('Error downloading file:', error);

            if (error?.status === 400) {
                toast.error('Download limit exceeded or link expired');
            } else if (error?.status === 404) {
                toast.error('Download not found');
            } else {
                toast.error('Failed to download file');
            }
        }
    }, [fetchUserDownloads]);

    return {
        downloads,
        loading,
        fetchUserDownloads,
        downloadFile
    };
}