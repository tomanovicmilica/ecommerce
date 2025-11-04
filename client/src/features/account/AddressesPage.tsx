import { useState, useEffect } from "react";
import { MapPin, Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import agent from "../../app/api/agent";
import LoadingComponent from "../../app/layout/LoadingComponent";

interface Address {
    userAddressId?: number;
    userId?: number;
    firstName: string;
    lastName: string;
    company?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phoneNumber?: string;
    isDefault: boolean;
    addressType?: string;
}

export default function AddressesPage() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        try {
            const data = await agent.Account.getAddresses();
            setAddresses(data);
        } catch (error) {
            console.log('Error loading addresses:', error);
            // Silently handle - addresses might not be set up yet
        } finally {
            setLoading(false);
        }
    };

    const handleAddNew = () => {
        setEditingAddress(null);
        setShowForm(true);
    };

    const handleEdit = (address: Address) => {
        setEditingAddress(address);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Da li ste sigurni da želite da obrišete ovu adresu?')) {
            try {
                await agent.Account.deleteAddress(id);
                setAddresses(addresses.filter(a => a.userAddressId !== id));
                toast.success('Adresa je uspešno obrisana');
            } catch (error) {
                toast.error('Greška pri brisanju adrese');
            }
        }
    };

    const handleSetDefault = async (id: number) => {
        try {
            await agent.Account.setDefaultAddress(id);
            setAddresses(addresses.map(a => ({
                ...a,
                isDefault: a.userAddressId === id
            })));
            toast.success('Podrazumevana adresa je promenjena');
        } catch (error) {
            toast.error('Greška pri postavljanju podrazumevane adrese');
        }
    };

    const handleSave = async (address: Address) => {
        try {
            if (editingAddress) {
                await agent.Account.updateAddress(editingAddress.userAddressId!, address);
                toast.success('Adresa je uspešno ažurirana');
            } else {
                await agent.Account.addAddress(address);
                toast.success('Adresa je uspešno dodata');
            }
            await loadAddresses();
            setShowForm(false);
        } catch (error) {
            toast.error('Greška pri čuvanju adrese');
        }
    };

    if (loading) return <LoadingComponent />;

    if (showForm) {
        return <AddressForm
            address={editingAddress}
            onCancel={() => setShowForm(false)}
            onSave={handleSave}
        />;
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-light-grey p-8">
            <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                    <h1 className="text-3xl font-serif-bold text-dark-grey">Adrese za dostavu</h1>
                    <button
                        onClick={handleAddNew}
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-brown text-white rounded-xl hover:bg-dark-grey transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Dodaj adresu</span>
                    </button>
                </div>
                <p className="text-gray-600">Upravljajte svojim sačuvanim adresama za dostavu</p>
            </div>

            {addresses.length === 0 ? (
                <div className="text-center py-12">
                    <MapPin className="w-16 h-16 text-brown mx-auto mb-4 opacity-50" />
                    <h2 className="text-xl font-medium text-dark-grey mb-2">Nema sačuvanih adresa</h2>
                    <p className="text-gray-600 mb-6">Dodajte adresu za bržu kupovinu</p>
                    <button
                        onClick={handleAddNew}
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-brown text-white rounded-xl hover:bg-dark-grey transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Dodaj prvu adresu</span>
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                        <div
                            key={address.userAddressId}
                            className={`relative p-6 rounded-xl border-2 transition-all ${
                                address.isDefault
                                    ? 'border-brown bg-brown/5'
                                    : 'border-light-grey hover:border-brown/30'
                            }`}
                        >
                            {address.isDefault && (
                                <div className="absolute top-4 right-4">
                                    <span className="px-3 py-1 bg-brown text-white text-xs font-medium rounded-full">
                                        Podrazumevana
                                    </span>
                                </div>
                            )}

                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-dark-grey mb-2">{address.firstName} {address.lastName}</h3>
                                <div className="text-gray-600 text-sm space-y-1">
                                    <p>{address.addressLine1}</p>
                                    {address.addressLine2 && <p>{address.addressLine2}</p>}
                                    <p>{address.city}, {address.state} {address.postalCode}</p>
                                    <p>{address.country}</p>
                                    {address.phoneNumber && <p>Tel: {address.phoneNumber}</p>}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {!address.isDefault && (
                                    <button
                                        onClick={() => handleSetDefault(address.userAddressId!)}
                                        className="flex-1 px-4 py-2 text-sm border border-brown text-brown rounded-lg hover:bg-brown hover:text-white transition-colors"
                                    >
                                        Postavi kao podrazumevanu
                                    </button>
                                )}
                                <button
                                    onClick={() => handleEdit(address)}
                                    className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(address.userAddressId!)}
                                    className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

interface AddressFormProps {
    address: Address | null;
    onCancel: () => void;
    onSave: (address: Address) => void;
}

function AddressForm({ address, onCancel, onSave }: AddressFormProps) {
    const [formData, setFormData] = useState<Address>(
        address || {
            firstName: '',
            lastName: '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'Srbija',
            phoneNumber: '',
            isDefault: false
        }
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-light-grey p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-serif-bold text-dark-grey mb-2">
                    {address ? 'Izmeni adresu' : 'Nova adresa'}
                </h1>
                <p className="text-gray-600">Popunite detalje adrese za dostavu</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-brown mb-2">
                            Ime *
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            required
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-light-grey rounded-xl focus:ring-2 focus:ring-brown focus:border-brown"
                            placeholder="Ime"
                        />
                    </div>

                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-brown mb-2">
                            Prezime *
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            required
                            value={formData.lastName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-light-grey rounded-xl focus:ring-2 focus:ring-brown focus:border-brown"
                            placeholder="Prezime"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="addressLine1" className="block text-sm font-medium text-brown mb-2">
                        Adresa *
                    </label>
                    <input
                        type="text"
                        id="addressLine1"
                        name="addressLine1"
                        required
                        value={formData.addressLine1}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-light-grey rounded-xl focus:ring-2 focus:ring-brown focus:border-brown"
                        placeholder="Ulica i broj"
                    />
                </div>

                <div>
                    <label htmlFor="addressLine2" className="block text-sm font-medium text-brown mb-2">
                        Dodatak adresi (opcionalno)
                    </label>
                    <input
                        type="text"
                        id="addressLine2"
                        name="addressLine2"
                        value={formData.addressLine2}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-light-grey rounded-xl focus:ring-2 focus:ring-brown focus:border-brown"
                        placeholder="Sprat, apartman, itd."
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-brown mb-2">
                            Grad *
                        </label>
                        <input
                            type="text"
                            id="city"
                            name="city"
                            required
                            value={formData.city}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-light-grey rounded-xl focus:ring-2 focus:ring-brown focus:border-brown"
                            placeholder="Grad"
                        />
                    </div>

                    <div>
                        <label htmlFor="state" className="block text-sm font-medium text-brown mb-2">
                            Opština *
                        </label>
                        <input
                            type="text"
                            id="state"
                            name="state"
                            required
                            value={formData.state}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-light-grey rounded-xl focus:ring-2 focus:ring-brown focus:border-brown"
                            placeholder="Opština"
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="postalCode" className="block text-sm font-medium text-brown mb-2">
                            Poštanski broj *
                        </label>
                        <input
                            type="text"
                            id="postalCode"
                            name="postalCode"
                            required
                            value={formData.postalCode}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-light-grey rounded-xl focus:ring-2 focus:ring-brown focus:border-brown"
                            placeholder="21000"
                        />
                    </div>

                    <div>
                        <label htmlFor="country" className="block text-sm font-medium text-brown mb-2">
                            Država *
                        </label>
                        <select
                            id="country"
                            name="country"
                            required
                            value={formData.country}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-light-grey rounded-xl focus:ring-2 focus:ring-brown focus:border-brown"
                        >
                            <option value="Srbija">Srbija</option>
                            <option value="Bosna i Hercegovina">Bosna i Hercegovina</option>
                            <option value="Hrvatska">Hrvatska</option>
                            <option value="Slovenija">Slovenija</option>
                            <option value="Makedonija">Makedonija</option>
                            <option value="Crna Gora">Crna Gora</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-brown mb-2">
                        Telefon (opcionalno)
                    </label>
                    <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-light-grey rounded-xl focus:ring-2 focus:ring-brown focus:border-brown"
                        placeholder="+381 60 123 4567"
                    />
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="isDefault"
                        name="isDefault"
                        checked={formData.isDefault}
                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                        className="w-4 h-4 text-brown border-light-grey rounded focus:ring-brown"
                    />
                    <label htmlFor="isDefault" className="ml-2 text-sm text-dark-grey">
                        Postavi kao podrazumevanu adresu
                    </label>
                </div>

                <div className="flex gap-4 pt-6">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-6 py-3 border border-light-grey text-dark-grey rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Otkaži
                    </button>
                    <button
                        type="submit"
                        className="flex-1 px-6 py-3 bg-brown text-white rounded-xl hover:bg-dark-grey transition-colors"
                    >
                        Sačuvaj adresu
                    </button>
                </div>
            </form>
        </div>
    );
}
