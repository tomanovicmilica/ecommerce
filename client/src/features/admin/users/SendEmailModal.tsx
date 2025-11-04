import { useState } from 'react';
import { X, Mail, Send } from 'lucide-react';
import { toast } from 'react-toastify';

interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
}

interface Props {
    user: User;
    onClose: () => void;
    onSend: (userId: number, subject: string, message: string) => Promise<void>;
}

export default function SendEmailModal({ user, onClose, onSend }: Props) {
    const [formData, setFormData] = useState({
        subject: '',
        message: ''
    });
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.subject.trim()) {
            toast.error('Naslov email-a je obavezan');
            return;
        }
        if (!formData.message.trim()) {
            toast.error('Poruka je obavezna');
            return;
        }

        try {
            setIsSending(true);
            await onSend(user.id, formData.subject, formData.message);
            toast.success('Email uspešno poslat');
            onClose();
        } catch (error) {
            console.error('Failed to send email:', error);
            toast.error('Greška pri slanju email-a');
        } finally {
            setIsSending(false);
        }
    };

    // Email templates
    const templates = [
        {
            name: 'Dobrodošlica',
            subject: 'Dobrodošli u našu prodavnicu!',
            message: `Poštovani/a ${user.firstName} ${user.lastName},\n\nDobrodošli u našu online prodavnicu!\n\nHvala što ste se pridružili našoj zajednici. Nadamo se da ćete uživati u kupovini kod nas.\n\nSrdačan pozdrav,\nTim prodavnice`
        },
        {
            name: 'Promocija',
            subject: 'Specijalna ponuda samo za Vas!',
            message: `Poštovani/a ${user.firstName} ${user.lastName},\n\nImamo sjajne vesti! Samo za Vas imamo specijalnu ponudu.\n\nPosetite našu prodavnicu i iskoristite popuste.\n\nSrdačan pozdrav,\nTim prodavnice`
        },
        {
            name: 'Potvrda naloga',
            subject: 'Potvrdite Vaš nalog',
            message: `Poštovani/a ${user.firstName} ${user.lastName},\n\nMolimo Vas da potvrdite Vaš nalog.\n\nAko niste Vi kreirali ovaj nalog, molimo Vas kontaktirajte nas.\n\nSrdačan pozdrav,\nTim prodavnice`
        }
    ];

    const handleTemplateSelect = (template: typeof templates[0]) => {
        setFormData({
            subject: template.subject,
            message: template.message
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center">
                        <Mail className="w-6 h-6 text-brown mr-3" />
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Pošalji Email</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Za: {user.firstName} {user.lastName} ({user.email})
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Templates */}
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Izaberite predložak (opciono)
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {templates.map((template, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => handleTemplateSelect(template)}
                                className="px-4 py-2 text-sm border border-brown text-brown rounded-lg hover:bg-brown hover:text-white transition-colors"
                            >
                                {template.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Subject */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Naslov <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown focus:border-transparent"
                            placeholder="Unesite naslov email-a"
                            required
                        />
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Poruka <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            rows={10}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown focus:border-transparent"
                            placeholder="Unesite poruku..."
                            required
                        />
                        <p className="text-sm text-gray-500 mt-2">
                            {formData.message.length} karaktera
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                            disabled={isSending}
                        >
                            Otkaži
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-brown text-white rounded-lg hover:bg-dark-grey transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                            disabled={isSending}
                        >
                            {isSending ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Slanje...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Pošalji Email
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
