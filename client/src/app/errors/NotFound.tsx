import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md h-96 flex flex-col justify-center items-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                Oops - we could not find what you are looking for!
            </h1>
            <hr className="border-gray-300 w-full mb-6" />
            <Link
                to='/catalog'
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-center transition-colors"
            >
                Go back to the shop
            </Link>
        </div>
    )
}