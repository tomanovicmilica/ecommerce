import { useState } from "react";
import { Edit, User as UserIcon } from "lucide-react";
import { useAppSelector } from "../../app/store/configureStore";
import type { User } from "../../app/models/user";
import Profile from "./Profile";

export default function ProfilePage() {
    const { user } = useAppSelector(state => state.account);
    const [editMode, setEditMode] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User>();

    function handleSelectUser(user: User) {
        setSelectedUser(user);
        setEditMode(true);
    }

    function cancelEdit() {
        setEditMode(false);
    }

    if (editMode) return <Profile user={selectedUser!} cancelEdit={cancelEdit} />

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-light-grey p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-serif-bold text-dark-grey mb-2">Lični podaci</h1>
                <p className="text-gray-600">Pregledajte i uredite svoje osnovne podatke</p>
            </div>

            <div className="max-w-2xl mx-auto">
                <div className="bg-gradient-to-r from-brown/5 to-light-brown/5 rounded-xl p-6 mb-8">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-brown">Ime</label>
                                <div className="p-3 bg-white rounded-lg border border-light-grey">
                                    <p className="text-dark-grey">{user?.name || 'Nije uneto'}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-brown">Prezime</label>
                                <div className="p-3 bg-white rounded-lg border border-light-grey">
                                    <p className="text-dark-grey">{user?.lastName || 'Nije uneto'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-brown">Email adresa</label>
                            <div className="p-3 bg-white rounded-lg border border-light-grey">
                                <p className="text-dark-grey">{user?.email || 'Nije uneto'}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-brown">Broj telefona</label>
                            <div className="p-3 bg-white rounded-lg border border-light-grey">
                                <p className="text-dark-grey">{user?.phoneNumber || 'Nije uneto'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <button
                        onClick={() => handleSelectUser(user!)}
                        className="inline-flex items-center space-x-2 px-8 py-4 bg-brown text-white rounded-xl font-medium hover:bg-dark-grey focus:outline-none focus:ring-2 focus:ring-brown focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <Edit className="w-5 h-5" />
                        <span>Uredi profil</span>
                    </button>
                </div>
            </div>
        </div>
    );
}