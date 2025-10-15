import { useEffect, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { useDigitalDownloads } from '../../app/hooks/useDigitalDownloads';
import type { DigitalDownload } from '../../app/models/digitalDownload';

interface DigitalDownloadSuccessProps {
    orderNumber: number;
}

export default function DigitalDownloadSuccess({ orderNumber }: DigitalDownloadSuccessProps) {
    const { downloads, loading, fetchUserDownloads, downloadFile } = useDigitalDownloads();
    const [orderDownloads, setOrderDownloads] = useState<DigitalDownload[]>([]);

    useEffect(() => {
        fetchUserDownloads();
    }, [fetchUserDownloads]);

    useEffect(() => {
        if (downloads.length > 0) {
            const currentOrderDownloads = downloads.filter(download =>
                download.orderId === orderNumber
            );
            setOrderDownloads(currentOrderDownloads);
        }
    }, [downloads, orderNumber]);

    if (loading) {
        return (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-blue-800">Loading your digital products...</span>
                </div>
            </div>
        );
    }

    if (orderDownloads.length === 0) {
        return null;
    }

    return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Your Digital Products
            </h3>
            <p className="text-green-700 mb-4">
                Your digital products are ready for download! You can also access them anytime from your profile.
            </p>

            <div className="space-y-3">
                {orderDownloads.map((download) => (
                    <div key={download.downloadId || download.id} className="bg-white rounded-lg p-4 border border-green-200">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{download.productName}</h4>
                                <p className="text-sm text-gray-600">
                                    Downloads remaining: {download.maxDownloads - download.downloadCount} of {download.maxDownloads}
                                </p>
                                {download.expiryDate && (
                                    <p className="text-xs text-gray-500">
                                        Expires: {new Date(download.expiryDate).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => downloadFile(download.downloadId || download.id, download.productName)}
                                disabled={!download.isActive || download.downloadCount >= download.maxDownloads}
                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                <Download className="mr-1 h-4 w-4" />
                                Download
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}