import { useEffect, useState } from 'react';
import { Download, FileText, Calendar, RotateCcw, Clock } from 'lucide-react';
import { useDigitalDownloads } from '../../app/hooks/useDigitalDownloads';
import type { DigitalDownload } from '../../app/models/digitalDownload';

export default function DigitalDownloadsPage() {
    const { downloads, loading, fetchUserDownloads, downloadFile } = useDigitalDownloads();
    const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');

    useEffect(() => {
        fetchUserDownloads();
    }, [fetchUserDownloads]);

    const filteredDownloads = downloads.filter(download => {
        if (filter === 'active') return download.canDownload;
        if (filter === 'expired') return download.isExpired || download.downloadCount >= download.maxDownloads;
        return true;
    });

    const getStatusBadge = (download: DigitalDownload) => {
        if (download.isExpired) {
            return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Istekao</span>;
        }
        if (download.downloadCount >= download.maxDownloads) {
            return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Iscrpljen</span>;
        }
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Aktivan</span>;
    };

    const canDownload = (download: DigitalDownload) => {
        return download.canDownload;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-lg border border-light-grey p-8">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brown"></div>
                    <span className="ml-3 text-dark-grey">Učitavam vaše digitalne proizvode...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-light-grey p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-serif-bold text-dark-grey mb-2">Digitalni proizvodi</h1>
                <p className="text-gray-600">Pristupite svojim kupljenim digitalnim proizvodima</p>
            </div>

            {/* Filter buttons */}
            <div className="flex space-x-4 mb-8">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                        filter === 'all'
                            ? 'bg-brown text-white'
                            : 'bg-light-brown/10 text-dark-grey hover:bg-light-brown/20'
                    }`}
                >
                    Svi ({downloads.length})
                </button>
                <button
                    onClick={() => setFilter('active')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                        filter === 'active'
                            ? 'bg-brown text-white'
                            : 'bg-light-brown/10 text-dark-grey hover:bg-light-brown/20'
                    }`}
                >
                    Aktivni ({downloads.filter(d => d.canDownload).length})
                </button>
                <button
                    onClick={() => setFilter('expired')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                        filter === 'expired'
                            ? 'bg-brown text-white'
                            : 'bg-light-brown/10 text-dark-grey hover:bg-light-brown/20'
                    }`}
                >
                    Istekli ({downloads.filter(d => d.isExpired || d.downloadCount >= d.maxDownloads).length})
                </button>
            </div>

            {filteredDownloads.length === 0 ? (
                <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-brown mx-auto mb-4" />
                    <h2 className="text-2xl font-serif-bold text-dark-grey mb-2">
                        {filter === 'all' ? 'Nemate digitalne proizvode' : `Nemate ${filter === 'active' ? 'aktivne' : 'istekle'} proizvode`}
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {filter === 'all'
                            ? 'Kada kupite digitalne proizvode, pojaviće se ovde za preuzimanje.'
                            : 'Trenutno nemate proizvode u ovoj kategoriji.'
                        }
                    </p>
                    {filter !== 'all' && (
                        <button
                            onClick={() => setFilter('all')}
                            className="px-6 py-3 bg-brown text-white rounded-xl hover:bg-dark-grey transition-colors"
                        >
                            Prikaži sve proizvode
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredDownloads.map((download) => (
                        <div
                            key={download.id}
                            className="bg-gradient-to-r from-brown/5 to-light-brown/5 rounded-xl p-6 border border-light-grey"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <FileText className="w-6 h-6 text-brown" />
                                        <h3 className="text-xl font-serif-bold text-dark-grey">
                                            {download.productName}
                                        </h3>
                                        {getStatusBadge(download)}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>Kupljen: {new Date(download.createdAt).toLocaleDateString('sr-RS')}</span>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <RotateCcw className="w-4 h-4" />
                                            <span>
                                                Preuzimanja: {download.downloadCount}/{download.maxDownloads}
                                            </span>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Clock className="w-4 h-4" />
                                            <span>
                                                Ističe: {new Date(download.expiresAt).toLocaleDateString('sr-RS')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() => downloadFile(download.downloadId || download.id, download.productName)}
                                            disabled={!canDownload(download)}
                                            className={`inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                                                canDownload(download)
                                                    ? 'bg-brown text-white hover:bg-dark-grey focus:outline-none focus:ring-2 focus:ring-brown focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                        >
                                            <Download className="w-4 h-4" />
                                            <span>
                                                {canDownload(download) ? 'Preuzmi' : 'Nedostupno'}
                                            </span>
                                        </button>

                                        {!canDownload(download) && (
                                            <span className="text-sm text-gray-500">
                                                {download.isExpired
                                                    ? 'Proizvod je istekao'
                                                    : 'Maksimalan broj preuzimanja dostignut'
                                                }
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}