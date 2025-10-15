import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, X } from "lucide-react";
import { toast } from "react-toastify";
import { useAppDispatch } from "../../app/store/configureStore";
import type { User } from "../../app/models/user";
import agent from "../../app/api/agent";
import { setUser } from "./accountSlice";

const profileSchema = z.object({
    name: z.string().min(1, "Ime je obavezno"),
    lastName: z.string().optional(),
    phoneNumber: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface Props {
    user: User;
    cancelEdit: () => void;
}

export default function Profile({ user, cancelEdit }: Props) {
    const dispatch = useAppDispatch();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isValid }
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user.name || '',
            lastName: user.lastName || '',
            phoneNumber: user.phoneNumber || '',
        },
        mode: "onTouched"
    });

    const onSubmit = async (data: ProfileFormData) => {
        try {
            const response: User = await agent.Account.updateUser(data);
            dispatch(setUser(response));
            toast.success('Profil je uspešno ažuriran!');
            cancelEdit();
        } catch (error) {
            console.log(error);
            toast.error('Greška pri ažuriranju profila. Pokušajte ponovo.');
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-2xl shadow-lg border border-light-grey">
            <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-brown rounded-full flex items-center justify-center mb-6">
                    <Save className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-3xl font-serif-bold text-dark-grey mb-2">Uredi Profil</h1>
                <p className="text-gray-600 text-center">Ažurirajte svoje lične podatke</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-brown mb-2">
                                Ime *
                            </label>
                            <input
                                id="name"
                                type="text"
                                autoFocus
                                {...register("name")}
                                className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brown focus:border-brown transition-colors ${
                                    errors.name ? 'border-red-500' : 'border-light-grey'
                                }`}
                                placeholder="Unesite ime"
                            />
                            {errors.name && (
                                <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-brown mb-2">
                                Prezime
                            </label>
                            <input
                                id="lastName"
                                type="text"
                                {...register("lastName")}
                                className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brown focus:border-brown transition-colors ${
                                    errors.lastName ? 'border-red-500' : 'border-light-grey'
                                }`}
                                placeholder="Unesite prezime"
                            />
                            {errors.lastName && (
                                <p className="mt-2 text-sm text-red-600">{errors.lastName.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-brown mb-2">
                            Broj telefona
                        </label>
                        <input
                            id="phoneNumber"
                            type="tel"
                            {...register("phoneNumber")}
                            className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brown focus:border-brown transition-colors ${
                                errors.phoneNumber ? 'border-red-500' : 'border-light-grey'
                            }`}
                            placeholder="Unesite broj telefona"
                        />
                        {errors.phoneNumber && (
                            <p className="mt-2 text-sm text-red-600">{errors.phoneNumber.message}</p>
                        )}
                    </div>

                    <div className="p-4 bg-light-brown/10 rounded-xl border border-light-brown/20">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-brown">Email adresa</label>
                            <div className="p-3 bg-gray-50 rounded-lg border border-light-grey">
                                <p className="text-gray-600">{user.email}</p>
                                <p className="text-xs text-gray-500 mt-1">Email adresa se ne može menjati</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-6">
                    <button
                        type="button"
                        onClick={cancelEdit}
                        className="flex-1 inline-flex items-center justify-center space-x-2 px-6 py-4 border border-light-grey text-dark-grey rounded-xl font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brown focus:ring-offset-2 transition-all duration-200"
                    >
                        <X className="w-5 h-5" />
                        <span>Otkaži</span>
                    </button>
                    <button
                        type="submit"
                        disabled={!isValid || isSubmitting}
                        className="flex-1 inline-flex items-center justify-center space-x-2 px-6 py-4 bg-brown text-white rounded-xl font-medium hover:bg-dark-grey focus:outline-none focus:ring-2 focus:ring-brown focus:ring-offset-2 disabled:bg-light-grey disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <Save className="w-5 h-5" />
                        <span>{isSubmitting ? 'Čuvanje...' : 'Sačuvaj'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}