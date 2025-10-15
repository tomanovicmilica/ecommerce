import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { toast } from 'react-toastify';

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

export class SignalRService {
    private connection: HubConnection | null = null;
    private isConnected = false;
    private connectionAttempted = false;

    private async checkServerAvailability(): Promise<boolean> {
        try {
            // Try a simple request to any API endpoint to see if server is responding
            const response = await fetch('http://localhost:5089/api/products?pageSize=1', {
                method: 'GET',
                signal: AbortSignal.timeout(3000)
            });
            // Server is available if we get any response (even 401, 404, etc.)
            return true;
        } catch (error: any) {
            // Only return false if it's a network error (server not running)
            if (error.name === 'AbortError' || error.message?.includes('fetch')) {
                return false;
            }
            // For other errors, assume server is available
            return true;
        }
    }

    public async startConnection(token: string): Promise<void> {
        if (this.connection || this.connectionAttempted) {
            return;
        }

        this.connectionAttempted = true;

        // Check if token is expired before attempting connection
        if (isTokenExpired(token)) {
            console.warn('Token is expired, skipping SignalR connection');
            toast.warning('Session expired. Please login again to receive real-time notifications.');
            return;
        }

        // Check if server is available before attempting SignalR connection
        const serverAvailable = await this.checkServerAvailability();
        if (!serverAvailable) {
            console.warn('Server not available, skipping SignalR connection');
            return;
        }

        this.connection = new HubConnectionBuilder()
            .withUrl(`http://localhost:5089/notificationHub?access_token=${token}`, {
                skipNegotiation: false,
                transport: 1 // WebSockets
            })
            .withAutomaticReconnect([0, 2000, 10000, 30000])
            .configureLogging(LogLevel.Warning)
            .build();

        this.setupEventHandlers();

        try {
            await this.connection.start();
            this.isConnected = true;
            console.log('SignalR Connected');
        } catch (error: any) {
            console.warn('SignalR Connection failed - this is normal if the server doesn\'t support SignalR yet:', error.message);
            this.isConnected = false;

            // Handle specific authentication errors
            if (error.message?.includes('Unauthorized') || error.message?.includes('401')) {
                console.warn('SignalR authentication failed - token may be expired');
                toast.warning('Authentication failed for real-time notifications. Please refresh your login.');
            }

            // Clean up connection on failure
            if (this.connection) {
                await this.connection.stop().catch(() => {});
                this.connection = null;
            }
        }
    }

    private setupEventHandlers(): void {
        if (!this.connection) return;

        // Order status updates for customers
        this.connection.on('OrderStatusUpdated', (notification) => {
            toast.success(`🎉 ${notification.Message}`, {
                position: 'top-right',
                autoClose: 5000,
            });
        });

        // New order alerts for admins
        this.connection.on('NewOrderReceived', (notification) => {
            toast.info(`📦 ${notification.Message} - $${notification.Total}`, {
                position: 'top-right',
                autoClose: 8000,
            });
        });

        // Low stock alerts for admins
        this.connection.on('LowStockAlert', (notification) => {
            toast.warning(`⚠️ ${notification.Message}`, {
                position: 'top-right',
                autoClose: 10000,
            });
        });

        // Order status changes for admin tracking
        this.connection.on('OrderStatusChanged', (notification) => {
            toast.info(`📋 Order #${notification.OrderId} → ${notification.Status}`, {
                position: 'top-right',
                autoClose: 4000,
            });
        });

        // Connection events
        this.connection.on('JoinedUserGroup', (message) => {
            console.log('Joined user group:', message);
        });

        this.connection.on('JoinedAdminGroup', (message) => {
            console.log('Joined admin group:', message);
        });

        // Handle reconnection
        this.connection.onreconnected(() => {
            console.log('SignalR Reconnected');
            this.isConnected = true;
            toast.success('🔗 Connection restored', {
                position: 'bottom-right',
                autoClose: 2000,
            });
        });

        this.connection.onreconnecting(() => {
            console.log('SignalR Reconnecting...');
            this.isConnected = false;
        });

        this.connection.onclose(() => {
            console.log('SignalR Connection Closed');
            this.isConnected = false;
        });
    }

    public async stopConnection(): Promise<void> {
        if (this.connection) {
            await this.connection.stop().catch(() => {});
            this.connection = null;
            this.isConnected = false;
            console.log('SignalR Disconnected');
        }
        this.connectionAttempted = false; // Reset for future connection attempts
    }

    public getConnectionState(): string {
        return this.connection?.state || 'Disconnected';
    }

    public isConnectionActive(): boolean {
        return this.isConnected && this.connection?.state === 'Connected';
    }
}

export const signalRService = new SignalRService();