import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { toast } from "react-toastify";
import agent from "../../app/api/agent";

const registerSchema = z.object({
    username: z.string().min(1, "Korisničko ime je obavezno"),
    email: z.string()
        .min(1, "Email je obavezan")
        .email("Neispravna email adresa."),
    password: z.string()
        .min(6, "Lozinka mora sadržati bar 6 karaktera.")
        .max(20, "Lozinka može imati najviše 20 karaktera.")
        .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/, "Password must contain at least one uppercase letter, one lowercase letter, and one number")
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting, isValid }
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        mode: "onTouched"
    });

    const handleApiErrors = (error: any) => {
        console.log(error);
        if (error?.data) {
            const errorMessages: string[] = [];
            error.data.forEach((err: string) => {
                if (err.includes('Password')) {
                    setError('password', { message: err });
                    errorMessages.push(err);
                } else if (err.includes('Email')) {
                    setError('email', { message: err });
                    errorMessages.push(err);
                } else if (err.includes('Username')) {
                    setError('username', { message: err });
                    errorMessages.push(err);
                } else {
                    errorMessages.push(err);
                }
            });

            if (errorMessages.length > 0) {
                toast.error(errorMessages.join('. '));
            }
        } else {
            toast.error('Registration failed. Please try again.');
        }
    };

    const onSubmit = async (data: RegisterFormData) => {
        try {
            await agent.Account.register(data);
            toast.success('Registration successful - you can now login');
            navigate('/login');
        } catch (error) {
            handleApiErrors(error);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-12 p-8 rounded-2xl shadow-lg border border-light-grey" style={{
            backgroundImage: 'url(/images/backgrounds/login.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }}>
            <div className="bg-white opacity-85 p-6 rounded-xl backdrop-blur-sm">
            <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-brown rounded-full flex items-center justify-center mb-6">
                    <Lock className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-3xl font-serif-bold text-dark-grey mb-2">Registracija</h1>
                <p className="text-gray-600 text-center">Napravite novi nalog</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-brown mb-2">
                        Korisničko ime *
                    </label>
                    <input
                        id="username"
                        type="text"
                        autoFocus
                        {...register("username")}
                        className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brown focus:border-brown transition-colors ${
                            errors.username ? 'border-red-500' : 'border-light-grey'
                        }`}
                        placeholder="Unesite korisničko ime"
                    />
                    {errors.username && (
                        <p className="mt-2 text-sm text-red-600">{errors.username.message}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-brown mb-2">
                        Email adresa *
                    </label>
                    <input
                        id="email"
                        type="email"
                        {...register("email")}
                        className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brown focus:border-brown transition-colors ${
                            errors.email ? 'border-red-500' : 'border-light-grey'
                        }`}
                        placeholder="Unesite email adresu"
                    />
                    {errors.email && (
                        <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-brown mb-2">
                        Lozinka *
                    </label>
                    <input
                        id="password"
                        type="password"
                        {...register("password")}
                        className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brown focus:border-brown transition-colors ${
                            errors.password ? 'border-red-500' : 'border-light-grey'
                        }`}
                        placeholder="Unesite lozinku"
                    />
                    {errors.password && (
                        <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                        Lozinka mora imati 6-20 karaktera sa bar jednim velikim slovom, malim slovom i brojem
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    className="w-full bg-brown text-white py-4 px-6 rounded-xl font-medium hover:bg-dark-grey focus:outline-none focus:ring-2 focus:ring-brown focus:ring-offset-2 disabled:bg-light-grey disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-8"
                >
                    {isSubmitting ? 'Registracija...' : 'Registruj se'}
                </button>

                <div className="text-center mt-6">
                    <Link
                        to="/login"
                        className="text-brown hover:text-dark-grey text-sm font-medium transition-colors"
                    >
                        Već imaš nalog? Prijavi se
                    </Link>
                </div>
            </form>
            </div>
        </div>
    );
}