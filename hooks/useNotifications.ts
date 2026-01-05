import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:8080/api';

export interface Notification {
  id: number;
  recipientId: number;
  recipientEmail: string;
  recipientName: string;
  recipientRole: string;
  module: string;
  requestId: string;
  requestNo: string;
  requestType: string;
  title: string;
  message: string;
  actionUrl: string;
  requesterId: number;
  requesterName: string;
  requesterEmail: string;
  status: 'Unread' | 'Read' | 'Actioned';
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  emailSent: boolean;
  emailSentAt: string | null;
  createdAt: string;
  updatedAt: string;
  readAt: string | null;
}

export interface ApproverInfo {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface CreateApprovalNotificationParams {
  module: string;
  requestId: string;
  requestNo: string;
  requestTitle?: string;
  requestType?: string;
  requesterId?: number;
  requesterName: string;
  requesterEmail: string;
  requesterDept?: string;
  requesterBranch?: string;
  approvers: ApproverInfo[];
  details?: Record<string, string>;
}

export interface ProcessApprovalParams {
  module: string;
  requestId: string;
  requestNo?: string;
  requestTitle?: string;
  action: 'Approved' | 'Rejected' | 'Revised';
  comment?: string;
  approverId: number;
  approverName: string;
  approverEmail: string;
  approverRole?: string;
  requesterId: number;
  requesterName: string;
  requesterEmail: string;
}

// Module labels mapping
export const MODULE_LABELS: Record<string, string> = {
  VEHICLE: 'Kendaraan',
  BUILDING: 'Gedung',
  TAX_KIR: 'Pajak & KIR',
  SERVICE: 'Servis Kendaraan',
  MUTATION: 'Mutasi Aset',
  SALES: 'Penjualan Aset',
  CONTRACT: 'Kontrak Kendaraan',
  POD: 'Permintaan POD',
  LOKER: 'Permintaan Loker',
  ATK: 'Permintaan ATK',
  MAINTENANCE: 'Pemeliharaan',
  INSURANCE: 'Asuransi',
  BUILDING_ASSET: 'Aset Gedung',
};

export const useNotifications = (userId?: number) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async (options?: { status?: string; module?: string; limit?: number }) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (userId) params.append('recipientId', userId.toString());
      if (options?.status) params.append('status', options.status);
      if (options?.module) params.append('module', options.module);
      if (options?.limit) params.append('limit', options.limit.toString());

      const response = await fetch(`${API_BASE}/notifications?${params}`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      
      const data = await response.json();
      setNotifications(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('recipientId', userId.toString());

      const response = await fetch(`${API_BASE}/notifications/unread-count?${params}`);
      if (!response.ok) throw new Error('Failed to fetch unread count');
      
      const data = await response.json();
      setUnreadCount(data.count);
      return data.count;
    } catch (err) {
      console.error('Error fetching unread count:', err);
      return 0;
    }
  }, [userId]);

  // Mark as read
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, status: 'Read' as const } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      return true;
    } catch (err) {
      console.error('Error marking as read:', err);
      return false;
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('recipientId', userId.toString());

      const response = await fetch(`${API_BASE}/notifications/mark-all-read?${params}`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Failed to mark all as read');
      
      setNotifications(prev => prev.map(n => ({ ...n, status: 'Read' as const })));
      setUnreadCount(0);
      return true;
    } catch (err) {
      console.error('Error marking all as read:', err);
      return false;
    }
  }, [userId]);

  // Create approval notification
  const createApprovalNotification = useCallback(async (params: CreateApprovalNotificationParams) => {
    try {
      const response = await fetch(`${API_BASE}/notifications/approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!response.ok) throw new Error('Failed to create notification');
      
      const data = await response.json();
      return { success: true, data };
    } catch (err) {
      console.error('Error creating notification:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, []);

  // Process approval
  const processApproval = useCallback(async (params: ProcessApprovalParams) => {
    try {
      const response = await fetch(`${API_BASE}/notifications/process-approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!response.ok) throw new Error('Failed to process approval');
      
      const data = await response.json();
      await fetchNotifications();
      await fetchUnreadCount();
      return { success: true, data };
    } catch (err) {
      console.error('Error processing approval:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, [fetchNotifications, fetchUnreadCount]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      const response = await fetch(`${API_BASE}/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete notification');
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      return true;
    } catch (err) {
      console.error('Error deleting notification:', err);
      return false;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    createApprovalNotification,
    processApproval,
    deleteNotification,
    MODULE_LABELS,
  };
};

export default useNotifications;
