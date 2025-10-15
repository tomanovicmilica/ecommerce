import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useSignalR } from '../../hooks/useSignalR';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './toastCustom.css';
import { useEffect } from 'react';
import { useAppDispatch } from '../store/configureStore';
import { fetchCurrentUser } from '../../features/account/accountSlice';
import { fetchBasketAsync } from '../../features/basket/basketSlice';

function App() {
  const { isConnected } = useSignalR();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize user authentication state and basket on app startup
    dispatch(fetchCurrentUser());
    dispatch(fetchBasketAsync());
  }, [dispatch]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-4 mb-16">
        <Outlet />
      </main>
      <Footer />


      {/* Toast Container - Customized */}
      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        hideProgressBar={true}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        theme="colored"
        toastStyle={{
          backgroundColor: '#2d3748',
          color: '#f7fafc',
          border: '1px solid #4a5568',
          borderRadius: '8px',
          fontSize: '14px',
          fontFamily: 'inherit'
        }}
        limit={3}
      />
    </div>
  )
}

export default App;
