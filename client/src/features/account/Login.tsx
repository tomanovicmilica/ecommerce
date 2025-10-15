import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { toast } from "react-toastify";
import { useAppDispatch } from "../../app/store/configureStore";
import { signInUser } from "./accountSlice";

const loginSchema = z.object({
    email: z.string()
        .min(1, "Email je obavezan")
        .email("Neispravna email adresa"),
    password: z.string().min(1, "Lozinka je obavezna"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isValid }
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        mode: "onTouched"
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            await dispatch(signInUser(data)).unwrap();
            // toast.success('Login successful!'); // Removed annoying login toast
            navigate(location.state?.from || '/catalog');
        } catch (error: any) {
            console.log('Login error:', error);
            // Handle login-specific errors
            if (error?.error) {
                // This is from the accountSlice rejectWithValue
                toast.error('Invalid username or password');
            } else {
                toast.error('An error occurred during login. Please try again.');
            }
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
                <h1 className="text-3xl font-serif-bold text-dark-grey mb-2">Dobrodošli</h1>
                <p className="text-gray-600 text-center">Prijavite se na vaš nalog</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-brown mb-2">
                        Email adresa *
                    </label>
                    <input
                        id="email"
                        type="email"
                        autoFocus
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
                </div>

                <button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    className="w-full bg-brown text-white py-4 px-6 rounded-xl font-medium hover:bg-dark-grey focus:outline-none focus:ring-2 focus:ring-brown focus:ring-offset-2 disabled:bg-light-grey disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-8"
                >
                    {isSubmitting ? 'Prijavljivanje...' : 'Prijavite se'}
                </button>

                <div className="text-center mt-6">
                    <Link
                        to="/register"
                        className="text-brown hover:text-dark-grey text-sm font-medium transition-colors"
                    >
                        Nemate nalog? Registrujte se
                    </Link>
                </div>
            </form>
            </div>
        </div>
    );
}