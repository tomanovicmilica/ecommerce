import { useEffect, useState } from 'react';
import { signalRService } from '../services/signalrService';

// Utility function to check if JWT token is expired
const isTokenExpired = (token: string): boolean => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp < currentTime;
    } catch (error) {
        console.error('Error parsing token:', error);
        return true; // Assume expired if can't parse
    }
};

export const useSignalR = () => {
    const [connectionState, setConnectionState] = useState('Disconnected');
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Get user token from localStorage
        const user = localStorage.getItem('user');
        let token = null;
        let userRoles = [];

        if (user) {
            try {
                const userData = JSON.parse(user);
                token = userData.token;
                userRoles = userData.roles || [];
            } catch (error) {
                console.error('Error parsing user data from localStorage:', error);
            }
        }

        // Only connect SignalR for authenticated admin users with valid tokens
        if (token && userRoles.includes('Admin') && !isTokenExpired(token)) {
            console.log('Starting SignalR connection for admin user...');

            // Attempt connection with timeout
            const connectionPromise = signalRService.startConnection(token);

            // Set up periodic state updates
            const interval = setInterval(() => {
                const state = signalRService.getConnectionState();
                const connected = signalRService.isConnectionActive();
                setConnectionState(state);
                setIsConnected(connected);
            }, 2000); // Check every 2 seconds instead of 1

            return () => {
                clearInterval(interval);
                signalRService.stopConnection().catch(err =>
                    console.warn('Error stopping SignalR connection:', err)
                );
            };
        } else {
            // No admin user logged in, ensure disconnected
            signalRService.stopConnection().catch(err =>
                console.warn('Error stopping SignalR connection:', err)
            );
            setConnectionState('Disconnected');
            setIsConnected(false);
        }

        // Listen for localStorage changes (login/logout)
        const handleStorageChange = () => {
            window.location.reload(); // Simple approach - reload when auth changes
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return {
        connectionState,
        isConnected
    };
};