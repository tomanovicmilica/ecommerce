export interface DigitalDownload {
  id: number;
  orderItemId: number;
  userId: number;
  productName: string;
  digitalFileUrl: string;
  createdAt: string;
  downloadedAt?: string;
  expiresAt: string;
  downloadCount: number;
  maxDownloads: number;
  isCompleted: boolean;
  downloadToken?: string;
  isExpired: boolean;
  canDownload: boolean;
  // Additional properties that may be provided by backend
  downloadId?: number;
  orderId?: number;
  productId?: number;
  expiryDate?: string;
  isActive?: boolean;
}

export interface DownloadAttempt {
  downloadAttemptId: number;
  downloadId: number;
  downloadDate: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
}

export interface UserDownloads {
  downloads: DigitalDownload[];
  totalCount: number;
}