import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Folder } from 'lucide-react';
import Table from '../../../app/components/ui/Table';
import LoadingComponent from '../../../app/layout/LoadingComponent';
import AdminLayout from '../layout/AdminLayout';
import agent from '../../../app/api/agent';
import { toast } from 'react-toastify';

interface Category {
    id: number;
    name: string;
    description?: string;
    productCount: number;
    createdAt: string;
}

export default function CategoryManagement() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await agent.Admin.getCategories();
            setCategories(response);
        } catch (error) {
            console.error('Neuspešno učitavanje kategorija:', error);
            toast.error('Neuspešno učitavanje kategorija');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCategory = async (categoryData: { name: string; description: string }) => {
        try {
            await agent.Admin.createCategory(categoryData);
            toast.success('Kategorija uspešno kreirana');
            fetchCategories();
            setShowCreateModal(false);
        } catch (error) {
            console.error('Neuspešno kreiranje kategorije:', error);
            toast.error('Neuspešno kreiranje kategorije');
        }
    };

    const handleUpdateCategory = async (id: number, categoryData: { name: string; description: string }) => {
        try {
            await agent.Admin.updateCategory(id, categoryData);
            toast.success('Kategorija uspešno ažurirana');
            fetchCategories();
            setEditingCategory(null);
        } catch (error) {
            console.error('Neuspešno ažuriranje kategorije:', error);
            toast.error('Neuspešno ažuriranje kategorije');
        }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!confirm('Da li ste sigurni da želite da obrišete ovu kategoriju? Ova opcija ne može biti poništena.')) return;

        try {
            await agent.Admin.deleteCategory(id);
            toast.success('Kategorija uspešno obrisana');
            fetchCategories();
        } catch (error) {
            console.error('Neuspešno brisanje kategorije:', error);
            toast.error('Neuspešno brisanje kategorije');
        }
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <LoadingComponent />;

    const headers = ["Kategorija", "Opis", "Proizvodi", "Kreirano", "Akcije"];

    return (
        <AdminLayout>
            <div className="p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Upravljanje kategorijama</h1>
                        <p className="text-gray-600 mt-1">{categories.length} kategorija ukupno</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center px-4 py-2 bg-brown text-white rounded-lg hover:bg-dark-grey transition-colors"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Dodaj kategoriju
                    </button>
                </div>

                {/* Search */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Pretraži kategorije..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Categories Table */}
                <div className="bg-white rounded-lg shadow-md">
                    <Table headers={headers}>
                        {filteredCategories.map((category) => (
                            <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                            <Folder className="w-5 h-5 text-dark-grey" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{category.name}</p>
                                            <p className="text-sm text-gray-500">ID: {category.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                                    <div className="truncate">
                                        {category.description || 'Nema opis'}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        {category.productCount} proizvoda
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                    {new Date(category.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            className="p-1 text-gray-400 hover:text-dark-grey transition-colors"
                                            onClick={() => setEditingCategory(category)}
                                            title="Edit category"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                            onClick={() => handleDeleteCategory(category.id)}
                                            title="Delete category"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </Table>

                    {filteredCategories.length === 0 && (
                        <div className="text-center py-12">
                            <Folder className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Nema pronađenih kategorija</p>
                        </div>
                    )}
                </div>

                {/* Create/Edit Modal */}
                {(showCreateModal || editingCategory) && (
                    <CategoryModal
                        category={editingCategory}
                        onSave={editingCategory
                            ? (data) => handleUpdateCategory(editingCategory.id, data)
                            : handleCreateCategory
                        }
                        onClose={() => {
                            setShowCreateModal(false);
                            setEditingCategory(null);
                        }}
                    />
                )}
            </div>
        </AdminLayout>
    );
}

interface CategoryModalProps {
    category?: Category | null;
    onSave: (data: { name: string; description: string }) => void;
    onClose: () => void;
}

function CategoryModal({ category, onSave, onClose }: CategoryModalProps) {
    const [name, setName] = useState(category?.name || '');
    const [description, setDescription] = useState(category?.description || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Naziv kategorije je obavezno');
            return;
        }
        onSave({ name: name.trim(), description: description.trim() });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">
                    {category ? 'Izmeni kategoriju' : 'Kreiraj kategoriju'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Naziv kategorije *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-grey focus:border-transparent"
                            placeholder="Upiši naziv kategorije"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Opis
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-grey focus:border-transparent"
                            placeholder="Upiši opis kategorije (opcionalno)"
                        />
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Poništi
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-brown text-white rounded-lg hover:bg-dark-grey transition-colors"
                        >
                            {category ? 'Ažuriraj' : 'Kreiraj'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}