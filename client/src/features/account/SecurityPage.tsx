import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import agent from "../../app/api/agent";

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Trenutna lozinka je obavezna"),
    newPassword: z.string()
        .min(6, "Lozinka mora imati najmanje 6 karaktera")
        .regex(/[A-Z]/, "Lozinka mora sadržati najmanje jedno veliko slovo")
        .regex(/[a-z]/, "Lozinka mora sadržati najmanje jedno malo slovo")
        .regex(/[0-9]/, "Lozinka mora sadržati najmanje jedan broj"),
    confirmPassword: z.string().min(1, "Potvrdite novu lozinku")
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Lozinke se ne poklapaju",
    path: ["confirmPassword"]
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SecurityPage() {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
        mode: "onTouched"
    });

    const onSubmit = async (data: PasswordFormData) => {
        try {
            await agent.Account.changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            });

            toast.success('Lozinka je uspešno promenjena!');
            reset();
        } catch (error: any) {
            const errorMessage = error?.data?.title || 'Greška pri promeni lozinke. Proverite trenutnu lozinku i pokušajte ponovo.';
            toast.error(errorMessage);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-light-grey p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-serif-bold text-dark-grey mb-2">Bezbednost naloga</h1>
                <p className="text-gray-600">Promenite lozinku i upravljajte bezbednosnim podešavanjima</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-8">
                {/* Password Strength Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-brown mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                            <h3 className="text-sm font-medium text-dark-grey mb-1">Zahtevi za lozinku</h3>
                            <ul className="text-sm text-dark-grey space-y-1">
                                <li>• Najmanje 6 karaktera</li>
                                <li>• Najmanje jedno veliko slovo</li>
                                <li>• Najmanje jedno malo slovo</li>
                                <li>• Najmanje jedan broj</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Password Change Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-brown mb-2">
                            Trenutna lozinka *
                        </label>
                        <div className="relative">
                            <input
                                id="currentPassword"
                                type={showCurrentPassword ? "text" : "password"}
                                {...register("currentPassword")}
                                className={`w-full px-4 py-3 pr-12 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brown focus:border-brown transition-colors ${
                                    errors.currentPassword ? 'border-red-500' : 'border-light-grey'
                                }`}
                                placeholder="Unesite trenutnu lozinku"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.currentPassword && (
                            <p className="mt-2 text-sm text-red-600">{errors.currentPassword.message}</p>
                        )}
                    </div>

                    <div className="border-t border-light-grey pt-6">
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-brown mb-2">
                                    Nova lozinka *
                                </label>
                                <div className="relative">
                                    <input
                                        id="newPassword"
                                        type={showNewPassword ? "text" : "password"}
                                        {...register("newPassword")}
                                        className={`w-full px-4 py-3 pr-12 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brown focus:border-brown transition-colors ${
                                            errors.newPassword ? 'border-red-500' : 'border-light-grey'
                                        }`}
                                        placeholder="Unesite novu lozinku"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.newPassword && (
                                    <p className="mt-2 text-sm text-red-600">{errors.newPassword.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-brown mb-2">
                                    Potvrdite novu lozinku *
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        {...register("confirmPassword")}
                                        className={`w-full px-4 py-3 pr-12 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brown focus:border-brown transition-colors ${
                                            errors.confirmPassword ? 'border-red-500' : 'border-light-grey'
                                        }`}
                                        placeholder="Potvrdite novu lozinku"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button
                            type="button"
                            onClick={() => reset()}
                            className="flex-1 px-6 py-3 border border-light-grey text-dark-grey rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Otkaži
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 inline-flex items-center justify-center space-x-2 px-6 py-3 bg-brown text-white rounded-xl hover:bg-dark-grey disabled:bg-light-grey disabled:cursor-not-allowed transition-colors"
                        >
                            <Lock className="w-5 h-5" />
                            <span>{isSubmitting ? 'Čuvanje...' : 'Promeni lozinku'}</span>
                        </button>
                    </div>
                </form>

                {/* Additional Security Options */}
                <div className="border-t border-light-grey pt-8">
                    <h3 className="text-lg font-bold text-dark-grey mb-4">Dodatna bezbednost</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div>
                                <h4 className="font-medium text-dark-grey">Aktivne sesije</h4>
                                <p className="text-sm text-gray-600">Pregledajte uređaje na kojima ste prijavljeni</p>
                            </div>
                            <button className="px-4 py-2 text-sm text-brown hover:bg-brown/10 rounded-lg transition-colors">
                                Pogledaj
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div>
                                <h4 className="font-medium text-dark-grey">Dvofaktorska autentifikacija</h4>
                                <p className="text-sm text-gray-600">Dodajte dodatni sloj zaštite vašem nalogu</p>
                            </div>
                            <button className="px-4 py-2 text-sm bg-brown text-white hover:bg-dark-grey rounded-lg transition-colors">
                                Omogući
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
