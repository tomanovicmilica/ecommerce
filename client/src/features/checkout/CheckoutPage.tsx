import { useState, useEffect } from "react";
import { useForm, FormProvider, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useStripe, useElements, CardNumberElement } from "@stripe/react-stripe-js";
import type { StripeElementType } from "@stripe/stripe-js";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import { clearBasket } from "../basket/basketSlice";
import { validationSchemas } from "./checkoutValidation";
import agent from "../../app/api/agent";
import AddressForm from "./AddressForm";
import Review from "./Review";
import PaymentForm from "./PaymentForm";
import DigitalDownloadSuccess from "./DigitalDownloadSuccess";

const steps = ['Shipping address', 'Review your order', 'Payment details'];

export default function CheckoutPage() {
    const [activeStep, setActiveStep] = useState(0);
    const [orderNumber, setOrderNumber] = useState(0);
    const [loading, setLoading] = useState(false);
    const dispatch = useAppDispatch();
    const [cardState, setCardState] = useState<{ elementError: { [key in StripeElementType]?: string } }>({ elementError: {} });
    const [cardComplete, setCardComplete] = useState<any>({ cardNumber: false, cardExpiry: false, cardCvc: false });
    const [paymentMessage, setPaymentMessage] = useState("");
    const [paymentSucceeded, setPaymentSucceeded] = useState(false);
    const { basket } = useAppSelector(state => state.basket);
    const stripe = useStripe();
    const elements = useElements();

    function onCardInputChange(event: any) {
        setCardState({
            ...cardState,
            elementError: {
                ...cardState.elementError,
                [event.elementType]: event.error?.message
            }
        })
        setCardComplete({ ...cardComplete, [event.elementType]: event.complete })
    }

    function getStepContent(step: number) {
        switch (step) {
            case 0:
                return <AddressForm />;
            case 1:
                return <Review />;
            case 2:
                return <PaymentForm cardState={cardState} onCardInputChange={onCardInputChange} />;
            default:
                throw new Error('Unknown step');
        }
    }

    const currentValidationSchema = validationSchemas[activeStep];

    const methods = useForm({
        mode: 'all',
        resolver: zodResolver(currentValidationSchema)
    })

    useEffect(() => {
        agent.Account.fetchAddress()
            .then(response => {
                if (response) {
                    methods.reset({ ...methods.getValues(), ...response, saveAddress: false })
                }
            })
    }, [methods]);

    async function submitOrder(data: FieldValues) {
        setLoading(true);
        const { nameOnCard, saveAddress, ...address } = data;
        if (!stripe || !elements) return; // stripe not ready
        try {
            const cardElement = elements.getElement(CardNumberElement);
            const paymentResult = await stripe.confirmCardPayment(basket?.clientSecret!, {
                payment_method: {
                    card: cardElement!,
                    billing_details: {
                        name: nameOnCard
                    }
                }
            });
            console.log(paymentResult);
            if (paymentResult.paymentIntent?.status === 'succeeded') {
                const orderNumber = await agent.Orders.create({ saveAddress, shippingAddress: address });
                setOrderNumber(orderNumber);
                setPaymentSucceeded(true);
                setPaymentMessage('Thank you - we have received your payment');
                setActiveStep(activeStep + 1);
                dispatch(clearBasket());
                setLoading(false);
            } else {
                setPaymentMessage(paymentResult.error?.message!);
                setPaymentSucceeded(false);
                setLoading(false);
                setActiveStep(activeStep + 1);
            }
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    }

    const handleNext = async (data: FieldValues) => {
        if (activeStep === steps.length - 1) {
            await submitOrder(data);
        } else {
            setActiveStep(activeStep + 1);
        }
    };

    const handleBack = () => {
        setActiveStep(activeStep - 1);
    };

    function submitDisabled(): boolean {
        if (activeStep === steps.length - 1) {
            return !cardComplete.cardCvc
                || !cardComplete.cardExpiry
                || !cardComplete.cardNumber
                || !methods.formState.isValid
        } else {
            return !methods.formState.isValid
        }
    }

    return (
        <FormProvider {...methods}>
            <div className="max-w-4xl mx-auto my-8 p-6 bg-white rounded-lg shadow-md border">
                <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
                    Checkout
                </h1>

                {/* Custom Stepper */}
                <div className="flex items-center justify-between mb-8 px-4">
                    {steps.map((label, index) => (
                        <div key={label} className="flex items-center">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                                index <= activeStep
                                    ? 'bg-brown border-brown text-white'
                                    : 'border-gray-300 text-gray-400'
                            }`}>
                                {index + 1}
                            </div>
                            <span className={`ml-2 text-sm font-medium ${
                                index <= activeStep ? 'text-brown' : 'text-gray-400'
                            }`}>
                                {label}
                            </span>
                            {index < steps.length - 1 && (
                                <div className={`w-20 h-0.5 mx-4 ${
                                    index < activeStep ? 'bg-brown' : 'bg-gray-300'
                                }`} />
                            )}
                        </div>
                    ))}
                </div>

                {activeStep === steps.length ? (
                    <div className="text-center py-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            {paymentMessage}
                        </h2>
                        {paymentSucceeded ? (
                            <div>
                                <p className="text-lg text-gray-600 mb-4">
                                    Your order number is #{orderNumber}.
                                </p>
                                <DigitalDownloadSuccess orderNumber={orderNumber} />
                            </div>
                        ) : (
                            <button
                                onClick={handleBack}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Go back and try again
                            </button>
                        )}
                    </div>
                ) : (
                    <form onSubmit={methods.handleSubmit(handleNext)} className="space-y-6">
                        {getStepContent(activeStep)}

                        <div className="flex justify-end space-x-3 pt-6">
                            {activeStep !== 0 && (
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Back
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={submitDisabled() || loading}
                                className="px-6 py-2 bg-brown text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    activeStep === steps.length - 1 ? 'Place order' : 'Next'
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </FormProvider>
    );
}