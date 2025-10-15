import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, Save } from 'lucide-react';
import AdminLayout from '../layout/AdminLayout';
import { toast } from 'react-toastify';
import agent from '../../../app/api/agent';

interface AttributeValue {
    id: number;
    value: string;
    attributeId: number;
}

interface Attribute {
    id: number;
    name: string;
    type: string;
    values: AttributeValue[];
}

export default function AttributeManagement() {
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null);
    const [newAttribute, setNewAttribute] = useState({
        name: '',
        type: 'text'
    });
    const [newValue, setNewValue] = useState('');
    const [addingValueToId, setAddingValueToId] = useState<number | null>(null);

    useEffect(() => {
        fetchAttributes();
    }, []);

    const fetchAttributes = async () => {
        try {
            setLoading(true);
            const response = await agent.Admin.getAttributes();
            setAttributes(response);
        } catch (error: any) {
            console.error('Neuspešno učitavanje atributa:', error);
            if (error?.status === 500) {
                toast.error('Server error. Please make sure the API is running and try again.');
            } else if (error?.status === 404) {
                toast.error('Attributes endpoint not found. Please check the API configuration.');
            } else if (!error?.status) {
                toast.error('Cannot connect to API. Please make sure the backend is running.');
            } else {
                toast.error('Neuspešno učitavanje atributa');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAttribute = async () => {
        if (!newAttribute.name.trim()) {
            toast.error('Naziv atributa je obavezan');
            return;
        }

        try {
            await agent.Admin.createAttribute(newAttribute);
            toast.success('Atribut uspešno kreiran');
            fetchAttributes();
            setShowCreateModal(false);
            setNewAttribute({ name: '', type: 'text' });
        } catch (error) {
            console.error('Neuspešno kreiranje atributa:', error);
            toast.error('Neuspešno kreiranje atributa');
        }
    };

    const handleAddValue = async (attributeId: number) => {
        if (!newValue.trim()) {
            toast.error('Vrednost je obavezna');
            return;
        }

        try {
            await agent.Admin.addAttributeValue(attributeId, { value: newValue });
            toast.success('Vrednost uspešno dodata');
            fetchAttributes();
            setNewValue('');
            setAddingValueToId(null);
        } catch (error) {
            console.error('Neuspešno dodavanje vrednosti:', error);
            toast.error('Neuspešno dodavanje vrednosti');
        }
    };

    const handleDeleteAttribute = async (attributeId: number) => {
        try {
            await (agent.Admin as any).deleteAttribute(attributeId);
            toast.success('Atribut uspešno obrisan');
            fetchAttributes();
        } catch (error) {
            console.error('Neuspešno brisanje atributa:', error);
            toast.error('Neuspešno brisanje atributa');
        }
    };

    const handleDeleteValue = async (attributeId: number, valueId: number) => {
        try {
            await (agent.Admin as any).deleteAttributeValue(attributeId, valueId);
            toast.success('Vrednost uspešno obrisana');
            fetchAttributes();
        } catch (error) {
            console.error('Neuspešno brisanje vrednosti:', error);
            toast.error('Neuspešno brisanje vrednosti');
        }
    };

    const handleUpdateAttribute = async () => {
        if (!editingAttribute || !editingAttribute.name.trim()) {
            toast.error('Naziv atributa je obavezan');
            return;
        }

        try {
            await (agent.Admin as any).updateAttribute(editingAttribute.id, {
                name: editingAttribute.name,
                type: editingAttribute.type
            });
            toast.success('Atribut uspešno ažuriran');
            fetchAttributes();
            setEditingAttribute(null);
        } catch (error) {
            console.error('Neuspešno ažuriranje atributa:', error);
            toast.error('Neuspešno ažuriranje atributa');
        }
    };

    const filteredAttributes = attributes.filter(attr =>
        attr.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getAttributeTypeColor = (type: string) => {
        switch (type) {
            case 'color': return 'bg-purple-100 text-purple-800';
            case 'size': return 'bg-blue-100 text-blue-800';
            case 'material': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AdminLayout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Upravljanje atributima</h1>
                        <p className="text-gray-600 mt-1">Upravljaj atributima proizvoda i njihovim vrednostima</p>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center px-4 py-2 bg-brown text-white rounded-lg hover:bg-dark-grey transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Dodaj atribut
                    </button>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Pretraži atribute..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-grey focus:border-transparent"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dark-grey"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAttributes.map((attribute) => (
                            <div key={attribute.id} className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{attribute.name}</h3>
                                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getAttributeTypeColor(attribute.type)}`}>
                                            {attribute.type}
                                        </span>
                                    </div>
                                    <div className="flex space-x-1">
                                        <button
                                            onClick={() => setEditingAttribute(attribute)}
                                            className="p-1 text-gray-400 hover:text-dark-grey"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('Da li ste sigurni da želite da izbrišete ovaj atribut?')) {
                                                    handleDeleteAttribute(attribute.id);
                                                }
                                            }}
                                            className="p-1 text-gray-400 hover:text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Vrednosti</h4>
                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                        {attribute.values?.map((value) => (
                                            <div key={value.id} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded">
                                                <span className="text-sm text-gray-700">{value.value}</span>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Da li ste sigurni da želite da obrišete ovu vrednost?')) {
                                                            handleDeleteValue(attribute.id, value.id);
                                                        }
                                                    }}
                                                    className="text-gray-400 hover:text-red-600"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t pt-3">
                                    {addingValueToId === attribute.id ? (
                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                value={newValue}
                                                onChange={(e) => setNewValue(e.target.value)}
                                                placeholder="Upiši vrednost"
                                                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-light-grey"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleAddValue(attribute.id);
                                                    }
                                                }}
                                            />
                                            <button
                                                onClick={() => handleAddValue(attribute.id)}
                                                className="px-2 py-1 bg-brown text-white text-sm rounded hover:bg-dark-grey"
                                            >
                                                <Save className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setAddingValueToId(null);
                                                    setNewValue('');
                                                }}
                                                className="px-2 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setAddingValueToId(attribute.id)}
                                            className="w-full flex items-center justify-center px-3 py-1 text-sm text-brown border border-beige rounded hover:bg-light-grey-50"
                                        >
                                            <Plus className="w-3 h-3 mr-1" />
                                            Dodaj vrednost
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Create Attribute Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Create New Attribute</h3>
                                    <button
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            setNewAttribute({ name: '', type: 'text' });
                                        }}
                                        className="p-1 text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Naziv atributa *
                                        </label>
                                        <input
                                            type="text"
                                            value={newAttribute.name}
                                            onChange={(e) => setNewAttribute(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-grey focus:border-transparent"
                                            placeholder="e.g., Size, Color, Material"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tip
                                        </label>
                                        <select
                                            value={newAttribute.type}
                                            onChange={(e) => setNewAttribute(prev => ({ ...prev, type: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-grey focus:border-transparent"
                                        >
                                            <option value="text">Text</option>
                                            <option value="color">Color</option>
                                            <option value="size">Size</option>
                                            <option value="material">Material</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            setNewAttribute({ name: '', type: 'text' });
                                        }}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreateAttribute}
                                        className="inline-flex items-center px-4 py-2 bg-brown text-white rounded-lg hover:bg-dark-grey"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        Kreiraj atribut
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Attribute Modal */}
                {editingAttribute && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Uredi atribut</h3>
                                    <button
                                        onClick={() => setEditingAttribute(null)}
                                        className="p-1 text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Naziv atributa *
                                        </label>
                                        <input
                                            type="text"
                                            value={editingAttribute.name}
                                            onChange={(e) => setEditingAttribute({
                                                ...editingAttribute,
                                                name: e.target.value
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-grey focus:border-transparent"
                                            placeholder="e.g., Size, Color, Material"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tip
                                        </label>
                                        <select
                                            value={editingAttribute.type}
                                            onChange={(e) => setEditingAttribute({
                                                ...editingAttribute,
                                                type: e.target.value
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-grey focus:border-transparent"
                                        >
                                            <option value="text">Text</option>
                                            <option value="color">Color</option>
                                            <option value="size">Size</option>
                                            <option value="material">Material</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        onClick={() => setEditingAttribute(null)}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdateAttribute}
                                        className="inline-flex items-center px-4 py-2 bg-brown text-white rounded-lg hover:bg-dark-grey"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        Ažuriraj atribut
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}