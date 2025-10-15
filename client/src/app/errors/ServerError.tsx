import { useLocation } from 'react-router-dom';

export default function ServerError() {
    const {state} = useLocation();

    return (
        <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
            {state?.error ? (
                <>
                    <h1 className="text-3xl font-bold text-red-600 mb-4">
                        {state.error.title}
                    </h1>
                    <hr className="border-gray-300 mb-4" />
                    <p className="text-gray-700">{state.error.detail || 'Internal server error'}</p>
                </>
            ) : (
                <h2 className="text-xl font-semibold text-gray-800">Server error</h2>
            )}
        </div>
    )
}