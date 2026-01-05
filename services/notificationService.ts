/**
 * Notification Service
 * Service untuk mengirim notifikasi approval ke backend
 */

const API_BASE = 'http://localhost:8080/api';

export interface ApproverInfo {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface SendApprovalNotificationParams {
  module: 'VEHICLE' | 'BUILDING' | 'TAX_KIR' | 'SERVICE' | 'MUTATION' | 'SALES' | 'CONTRACT' | 'POD' | 'LOKER' | 'ATK' | 'MAINTENANCE' | 'INSURANCE' | 'BUILDING_ASSET';
  requestId: string;
  requestNo: string;
  requestTitle?: string;
  requestType?: 'NEW' | 'UPDATE' | 'DELETE';
  requester: {
    id?: number;
    name: string;
    email: string;
    department?: string;
    branch?: string;
  };
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
  approver: {
    id: number;
    name: string;
    email: string;
    role?: string;
  };
  requester: {
    id: number;
    name: string;
    email: string;
  };
}

/**
 * Kirim notifikasi approval ke semua approver
 */
export const sendApprovalNotification = async (params: SendApprovalNotificationParams): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE}/notifications/approval`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        module: params.module,
        requestId: params.requestId,
        requestNo: params.requestNo,
        requestTitle: params.requestTitle,
        requestType: params.requestType || 'NEW',
        requesterId: params.requester.id,
        requesterName: params.requester.name,
        requesterEmail: params.requester.email,
        requesterDept: params.requester.department,
        requesterBranch: params.requester.branch,
        approvers: params.approvers,
        details: params.details,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send notification');
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending approval notification:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Proses approval dan kirim notifikasi ke requester
 */
export const processApprovalNotification = async (params: ProcessApprovalParams): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE}/notifications/process-approval`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        module: params.module,
        requestId: params.requestId,
        requestNo: params.requestNo,
        requestTitle: params.requestTitle,
        action: params.action,
        comment: params.comment,
        approverId: params.approver.id,
        approverName: params.approver.name,
        approverEmail: params.approver.email,
        approverRole: params.approver.role,
        requesterId: params.requester.id,
        requesterName: params.requester.name,
        requesterEmail: params.requester.email,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to process approval');
    }

    return { success: true };
  } catch (error) {
    console.error('Error processing approval:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Helper untuk mendapatkan approvers berdasarkan module dan branch
 * Ini adalah mock data - di production, ambil dari Master Approval
 */
export const getApproversForModule = async (module: string, branch?: string): Promise<ApproverInfo[]> => {
  // Mock approvers - di production, fetch dari API /api/master-approvals
  const mockApprovers: Record<string, ApproverInfo[]> = {
    VEHICLE: [
      { id: 2, name: 'Ahmad Supardi', email: 'ahmad.supardi@modena.com', role: 'Branch Manager' },
      { id: 3, name: 'Budi Santoso', email: 'budi.santoso@modena.com', role: 'Regional Manager' },
    ],
    BUILDING: [
      { id: 2, name: 'Ahmad Supardi', email: 'ahmad.supardi@modena.com', role: 'Branch Manager' },
      { id: 4, name: 'Dewi Lestari', email: 'dewi.lestari@modena.com', role: 'Facility Director' },
    ],
    TAX_KIR: [
      { id: 2, name: 'Ahmad Supardi', email: 'ahmad.supardi@modena.com', role: 'Branch Manager' },
      { id: 5, name: 'Eko Prasetyo', email: 'eko.prasetyo@modena.com', role: 'Finance Manager' },
    ],
    SERVICE: [
      { id: 2, name: 'Ahmad Supardi', email: 'ahmad.supardi@modena.com', role: 'Branch Manager' },
    ],
    MUTATION: [
      { id: 2, name: 'Ahmad Supardi', email: 'ahmad.supardi@modena.com', role: 'Branch Manager' },
      { id: 3, name: 'Budi Santoso', email: 'budi.santoso@modena.com', role: 'Regional Manager' },
    ],
    SALES: [
      { id: 2, name: 'Ahmad Supardi', email: 'ahmad.supardi@modena.com', role: 'Branch Manager' },
      { id: 3, name: 'Budi Santoso', email: 'budi.santoso@modena.com', role: 'Regional Manager' },
      { id: 6, name: 'Faisal Rahman', email: 'faisal.rahman@modena.com', role: 'Director' },
    ],
    CONTRACT: [
      { id: 2, name: 'Ahmad Supardi', email: 'ahmad.supardi@modena.com', role: 'Branch Manager' },
      { id: 5, name: 'Eko Prasetyo', email: 'eko.prasetyo@modena.com', role: 'Finance Manager' },
    ],
    POD: [
      { id: 7, name: 'Gita Permata', email: 'gita.permata@modena.com', role: 'HR Manager' },
    ],
    LOKER: [
      { id: 7, name: 'Gita Permata', email: 'gita.permata@modena.com', role: 'HR Manager' },
    ],
    ATK: [
      { id: 8, name: 'Hendra Wijaya', email: 'hendra.wijaya@modena.com', role: 'GA Manager' },
    ],
    MAINTENANCE: [
      { id: 2, name: 'Ahmad Supardi', email: 'ahmad.supardi@modena.com', role: 'Branch Manager' },
      { id: 4, name: 'Dewi Lestari', email: 'dewi.lestari@modena.com', role: 'Facility Director' },
    ],
    INSURANCE: [
      { id: 5, name: 'Eko Prasetyo', email: 'eko.prasetyo@modena.com', role: 'Finance Manager' },
    ],
    BUILDING_ASSET: [
      { id: 2, name: 'Ahmad Supardi', email: 'ahmad.supardi@modena.com', role: 'Branch Manager' },
    ],
  };

  return mockApprovers[module] || [];
};

/**
 * Module labels untuk display
 */
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

export default {
  sendApprovalNotification,
  processApprovalNotification,
  getApproversForModule,
  MODULE_LABELS,
};
