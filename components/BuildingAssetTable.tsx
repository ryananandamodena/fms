
// @google/genai Coding Guidelines: This file uses icons from lucide-react.

import React from 'react';
import { BuildingAssetRecord } from '../types';
import { ChevronsUpDown, Eye, Pencil, CheckCircle, XCircle, Clock, MapPin, Activity, RotateCcw } from 'lucide-react';

interface Props {
  data: BuildingAssetRecord[];
  onEdit?: (item: BuildingAssetRecord) => void;
  onView?: (item: BuildingAssetRecord) => void;
  onDelete?: (id: string) => void;
  onAction?: (item: BuildingAssetRecord, action: 'Approve' | 'Reject' | 'Revise') => void;
}

export const BuildingAssetTable: React.FC<Props> = ({ data, onEdit, onView, onDelete, onAction }) => {
  
  const getApprovalBadge = (status: BuildingAssetRecord['approvalStatus']) => {
    switch (status) {
      case 'Approved':
        return <span className="bg-[#E8FDF5] text-[#059669] border-[#10B981]/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm">APPROVED</span>;
      case 'Rejected':
        return <span className="bg-red-50 text-red-600 border-red-100 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm">REJECTED</span>;
      case 'Revised':
        return <span className="bg-blue-50 text-blue-600 border-blue-100 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm">REVISED</span>;
      case 'Pending Approval':
        return <span className="bg-orange-50 text-orange-600 border-orange-100 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm">PENDING</span>;
      default:
        return <span className="bg-gray-50 text-gray-500 border-gray-100 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm">DRAFT</span>;
    }
  };

  const getConditionStyle = (status: string) => {
    switch(status) {
        case 'Good': return 'bg-green-500';
        case 'Fair': return 'bg-orange-500';
        case 'Critical': return 'bg-red-500';
        default: return 'bg-blue-500';
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden transition-all duration-500">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[1400px] text-left border-collapse">
          <thead>
            <tr className="bg-[#F2F2F2] border-b border-gray-200">
              <th className="p-6 pl-8 w-24 group cursor-pointer hover:bg-gray-200/50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</span>
                  <ChevronsUpDown size={12} className="text-gray-300" />
                </div>
              </th>
              <th className="p-6 w-64 group cursor-pointer hover:bg-gray-200/50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ASSET NAME / CODE</span>
                  <ChevronsUpDown size={12} className="text-gray-300" />
                </div>
              </th>
              <th className="p-6 w-40 group cursor-pointer hover:bg-gray-200/50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">TYPE</span>
                  <ChevronsUpDown size={12} className="text-gray-300" />
                </div>
              </th>
              <th className="p-6 w-56 group cursor-pointer hover:bg-gray-200/50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">LOCATION</span>
                  <ChevronsUpDown size={12} className="text-gray-300" />
                </div>
              </th>
              <th className="p-6 w-40 group cursor-pointer hover:bg-gray-200/50 transition-colors text-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CONDITION</span>
              </th>
              <th className="p-6 w-36 text-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">STATUS</span>
              </th>
              <th className="p-6 w-44 text-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">WORKFLOW ACTION</span>
              </th>
              <th className="p-6 w-32 text-center pr-8">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ACTION</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((item) => (
              <tr key={item.id} className="bg-white hover:bg-[#FDFDFD] transition-all group">
                <td className="p-6 pl-8 text-[11px] font-mono font-bold text-gray-400">
                    {item.id}
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg shadow-black/10">
                        <Activity size={18} />
                    </div>
                    <div>
                        <div className="font-black text-black text-[13px] uppercase tracking-tight">{item.assetName}</div>
                        <div className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-widest mt-1">{item.assetCode}</div>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                   <div className="inline-flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                       <span className="text-[11px] font-black text-gray-600 uppercase tracking-tight">{item.assetType}</span>
                   </div>
                </td>
                <td className="p-6">
                    <div className="flex items-start gap-2">
                        <MapPin size={12} className="text-gray-300 mt-0.5" />
                        <div>
                            <div className="text-[11px] font-black text-black uppercase tracking-tight">{item.buildingName}</div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.floor} • {item.roomName}</div>
                        </div>
                    </div>
                </td>
                <td className="p-6 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg border border-gray-100">
                        <div className={`w-2 h-2 rounded-full ${getConditionStyle(item.status)}`}></div>
                        <span className="text-[10px] font-black text-black uppercase">{item.status}</span>
                    </div>
                </td>
                <td className="p-6 text-center">
                    {getApprovalBadge(item.approvalStatus)}
                </td>
                <td className="p-6">
                    {item.approvalStatus === 'Pending Approval' ? (
                        <div className="flex items-center justify-center gap-2">
                            <button 
                                onClick={() => onAction?.(item, 'Approve')}
                                className="bg-green-500 hover:bg-green-600 text-white p-2.5 rounded-xl shadow-lg shadow-green-500/20 transition-all active:scale-95"
                                title="Approve"
                            >
                                <CheckCircle size={16} strokeWidth={3} />
                            </button>
                            <button 
                                onClick={() => onAction?.(item, 'Reject')}
                                className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-xl shadow-lg shadow-red-500/20 transition-all active:scale-95"
                                title="Reject"
                            >
                                <XCircle size={16} strokeWidth={3} />
                            </button>
                        </div>
                    ) : (
                        <div className="text-center text-[10px] font-black text-gray-300 uppercase tracking-widest italic">—</div>
                    )}
                </td>
                <td className="p-6 text-center pr-8">
                    <div className="flex items-center justify-center gap-1">
                         <button onClick={() => onView?.(item)} className="p-2 text-gray-300 hover:text-black transition-all">
                            <Eye size={18} />
                         </button>
                         <button onClick={() => onEdit?.(item)} className="p-2 text-gray-300 hover:text-black transition-all">
                            <Pencil size={18} />
                         </button>
                    </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
                <tr>
                    <td colSpan={8} className="p-24 text-center">
                        <div className="flex flex-col items-center opacity-30">
                            <Clock size={48} className="text-gray-400 mb-4" />
                            <p className="text-[11px] font-black uppercase tracking-[0.3em]">Belum ada permintaan aset diajukan</p>
                        </div>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
