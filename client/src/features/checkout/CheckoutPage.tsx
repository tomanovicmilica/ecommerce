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
import { ProductType } from "../../app/models/product";

const getSteps = (isDigitalOnly: boolean) => {
    if (isDigitalOnly) {
        return ['Pregledaj porudžbinu', 'Detalji plaćanja'];
    }
    return ['Adresa za dostavu', 'Pregledaj porudžbinu', 'Detalji plaćanja'];
};

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

    // Check if basket contains only digital products
    const isDigitalOnly = basket?.items?.every(item => item.productType === ProductType.Digital) ?? false;
    const steps = getSteps(isDigitalOnly);

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
        // For digital-only orders, skip the address form
        if (isDigitalOnly) {
            switch (step) {
                case 0:
                    return <Review />;
                case 1:
                    return <PaymentForm cardState={cardState} onCardInputChange={onCardInputChange} />;
                default:
                    throw new Error('Unknown step');
            }
        }

        // For orders with physical products
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

    // For digital-only orders, use minimal validation (no address required)
    const getValidationSchema = () => {
        if (isDigitalOnly) {
            // For digital orders: step 0 = review (no validation), step 1 = payment
            return activeStep === 0 ? validationSchemas[1] : validationSchemas[2];
        }
        // For physical orders: normal flow
        return validationSchemas[activeStep] || validationSchemas[0];
    };

    const methods = useForm({
        mode: 'all',
        resolver: zodResolver(getValidationSchema())
    })

    useEffect(() => {
        // Skip address loading for digital-only orders
        if (isDigitalOnly) return;

        // Fetch the default address from the addresses collection
        agent.Account.getAddresses()
            .then(addresses => {
                if (addresses && addresses.length > 0) {
                    // Find the default address or use the first one
                    const defaultAddress = addresses.find((a: { isDefault: any; }) => a.isDefault) || addresses[0];

                    // Transform the API response to match form field names
                    const formData = {
                        fullName: `${defaultAddress.firstName || ''} ${defaultAddress.lastName || ''}`.trim(),
                        address1: defaultAddress.addressLine1 || '',
                        address2: defaultAddress.addressLine2 || '',
                        address3: defaultAddress.state || '',
                        city: defaultAddress.city || '',
                        zip: defaultAddress.postalCode || '',
                        country: defaultAddress.country || '',
                        phoneNumber: defaultAddress.phoneNumber || '',
                        saveAddress: false
                    };
                    methods.reset(formData as any);
                }
            })
            .catch(error => {
                console.log('No saved address found:', error);
            });
    }, [methods, isDigitalOnly]);

    async function submitOrder(data: FieldValues) {
        setLoading(true);
        const { nameOnCard, saveAddress, ...address } = data;
        console.log('[Checkout] Form data:', data);
        console.log('[Checkout] saveAddress value:', saveAddress);
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
            if (paymentResult.paymentIntent?.status === 'succeeded') {
                // Split fullName into firstName and lastName
                const nameParts = address.fullName?.split(' ') || ['', ''];
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';

                // Save address if checkbox is checked (only for physical orders)
                if (saveAddress && !isDigitalOnly) {
                    console.log('[Checkout] Attempting to save address...');
                    try {
                        // Fetch existing addresses to check for duplicates
                        const existingAddresses = await agent.Account.getAddresses();
                        console.log('[Checkout] Existing addresses:', existingAddresses.length);

                        // Check if this exact address already exists
                        const addressExists = existingAddresses.some((existing: any) =>
                            existing.firstName === firstName &&
                            existing.lastName === lastName &&
                            existing.addressLine1 === address.address1 &&
                            (existing.addressLine2 || '') === (address.address2 || '') &&
                            existing.city === address.city &&
                            existing.state === (address.address3 || '') &&
                            existing.postalCode === address.zip &&
                            existing.country === address.country
                        );

                        if (!addressExists) {
                            console.log('[Checkout] Address does not exist, creating new...');
                            // Only add if it doesn't exist
                            const newAddress = await agent.Account.addAddress({
                                firstName,
                                lastName,
                                addressLine1: address.address1,
                                addressLine2: address.address2 || null,
                                city: address.city,
                                state: address.address3 || '',
                                postalCode: address.zip,
                                country: address.country,
                                phoneNumber: address.phoneNumber || null,
                                isDefault: true
                            });
                            console.log('[Checkout] Address saved successfully:', newAddress);
                        } else {
                            console.log('[Checkout] Address already exists, setting as default...');
                            const matchingAddress = existingAddresses.find((existing: any) =>
                                existing.firstName === firstName &&
                                existing.lastName === lastName &&
                                existing.addressLine1 === address.address1 &&
                                (existing.addressLine2 || '') === (address.address2 || '') &&
                                existing.city === address.city &&
                                existing.state === (address.address3 || '') &&
                                existing.postalCode === address.zip &&
                                existing.country === address.country
                            );
                            if (matchingAddress && !matchingAddress.isDefault) {
                                await agent.Account.setDefaultAddress(matchingAddress.userAddressId);
                                console.log('[Checkout] Address set as default');
                            } else {
                                console.log('[Checkout] Address already is default');
                            }
                        }
                    } catch (error) {
                        console.error('[Checkout] Failed to save address:', error);
                        // Continue with order even if address save fails
                    }
                } else {
                    console.log('[Checkout] saveAddress is false, not saving address');
                }

                // For digital-only orders, use minimal address data
                let shippingAddress;
                if (isDigitalOnly) {
                    shippingAddress = {
                        firstName: 'Digital',
                        lastName: 'Order',
                        addressLine1: 'N/A',
                        addressLine2: null,
                        city: 'N/A',
                        state: 'N/A',
                        postalCode: '00000',
                        country: 'Digital',
                        phoneNumber: null
                    };
                } else {
                    shippingAddress = {
                        firstName,
                        lastName,
                        addressLine1: address.address1,
                        addressLine2: address.address2 || null,
                        city: address.city,
                        state: address.address3 || '', // Using address3 as state for now
                        postalCode: address.zip,
                        country: address.country,
                        phoneNumber: address.phoneNumber || null
                    };
                }

                const orderData = {
                    basketId: basket!.basketId,
                    shippingAddress
                };
                const response = await agent.Orders.create(orderData);
                setOrderNumber(response.orderId);
                setPaymentSucceeded(true);
                setPaymentMessage('Hvala vam - primili smo vašu uplatu!');
                setActiveStep(activeStep + 1);
                dispatch(clearBasket());
                setLoading(false);
            } else {
                // Check if error is due to invalid payment intent state
                if (paymentResult.error?.code === 'payment_intent_unexpected_state') {
                    setPaymentMessage('Payment session expired. Please refresh the page and try again.');
                } else {
                    setPaymentMessage(paymentResult.error?.message || 'Payment failed. Please try again.');
                }
                setPaymentSucceeded(false);
                setLoading(false);
                setActiveStep(activeStep + 1);
            }
        } catch (error) {
            console.log(error);
            setPaymentMessage('An error occurred. Please try again.');
            setPaymentSucceeded(false);
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
                    Poručivanje
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
                                    Vaš broj porudžbine je #{orderNumber}.
                                </p>
                                <DigitalDownloadSuccess orderNumber={orderNumber} />
                            </div>
                        ) : (
                            <button
                                onClick={handleBack}
                                className="px-6 py-2 bg-brown text-white rounded-lg hover:bg-dark-grey transition-colors"
                            >
                                Idi nazad i probaj opet
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
                                className="px-6 py-2 bg-brown text-white rounded-lg hover:bg-dark-grey disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Procesiranje...
                                    </span>
                                ) : (
                                    activeStep === steps.length - 1 ? 'Poruči' : 'Dalje'
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </FormProvider>
    );
}