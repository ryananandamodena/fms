
import React from 'react';
import { VehicleRecord } from '../types';
import { ChevronsUpDown, Eye, Pencil, Trash2, Car, Settings, Key, ShieldCheck, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { Pagination, usePagination } from './Pagination';

interface Props {
  data: VehicleRecord[];
  onEdit?: (item: VehicleRecord) => void;
  onView?: (item: VehicleRecord) => void;
  onDelete?: (id: number) => void;
  onAction?: (item: VehicleRecord, action: 'Approve' | 'Reject' | 'Revise') => void;
}

export const VehicleTable: React.FC<Props> = ({ data, onEdit, onView, onDelete, onAction }) => {
  const pagination = usePagination(data, 10);

  const getApprovalBadge = (status: string) => {
      const s = (status || 'Approved').toLowerCase();
      if(s.includes('pending')) return <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] bg-orange-50 text-orange-600 border border-orange-200">Pending Approval</span>;
      if(s.includes('rejected')) return <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] bg-red-50 text-red-600 border border-red-200">Rejected</span>;
      if(s.includes('revised')) return <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] bg-blue-50 text-blue-600 border border-blue-200">Revised</span>;
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] bg-[#E8FDF5] text-[#059669] border border-[#10B981]/20">Approved</span>;
  }

  const renderWorkflowActions = (item: VehicleRecord) => {
      const s = (item.approvalStatus || 'Approved').toLowerCase();
      if (s.includes('pending') && onAction) {
          return (
              <div className="flex items-center justify-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); onAction(item, 'Approve'); }} className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-md transition-all active:scale-95 hover:shadow-lg" title="Approve"><CheckCircle size={16} strokeWidth={2.5} /></button>
                  <button onClick={(e) => { e.stopPropagation(); onAction(item, 'Revise'); }} className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-md transition-all active:scale-95 hover:shadow-lg" title="Revise"><RotateCcw size={16} strokeWidth={2.5} /></button>
                  <button onClick={(e) => { e.stopPropagation(); onAction(item, 'Reject'); }} className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-md transition-all active:scale-95 hover:shadow-lg" title="Reject"><XCircle size={16} strokeWidth={2.5} /></button>
              </div>
          );
      }
      return (
          <div className="text-center">
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">
                  WORKFLOW COMPLETED
              </span>
          </div>
      );
  };

  return (
    <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden transition-all duration-500">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[1600px] text-left border-collapse">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-gray-200">
              <th className="p-6 pl-8 w-16 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">#</th>
              <th className="p-6 w-40 group cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">No. Registrasi</span>
                  <ChevronsUpDown size={12} className="text-gray-300 group-hover:text-black transition-colors"/>
                </div>
              </th>
              <th className="p-6 w-56 group cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-black uppercase tracking-[0.15em]">Vehicle Info</span>
                  <ChevronsUpDown size={12} className="text-gray-300 group-hover:text-black transition-colors"/>
                </div>
              </th>
              <th className="p-6 w-40 group cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-black uppercase tracking-[0.15em]">Ownership</span>
                  <ChevronsUpDown size={12} className="text-gray-300 group-hover:text-black transition-colors"/>
                </div>
              </th>
              <th className="p-6 w-40 group cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-black uppercase tracking-[0.15em]">License Plate</span>
                  <ChevronsUpDown size={12} className="text-gray-300 group-hover:text-black transition-colors"/>
                </div>
              </th>
              <th className="p-6 w-36 group cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-black uppercase tracking-[0.15em]">Branch</span>
                  <ChevronsUpDown size={12} className="text-gray-300 group-hover:text-black transition-colors"/>
                </div>
              </th>
              <th className="p-6 w-36 text-center text-[10px] font-black text-black uppercase tracking-[0.15em]">Status</th>
              <th className="p-6 w-44 text-center text-[10px] font-black text-black uppercase tracking-[0.15em]">Workflow Action</th>
              <th className="p-6 w-32 text-center text-[10px] font-black text-black uppercase tracking-[0.15em]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pagination.paginatedData.map((item, index) => (
              <tr 
                key={item.id} 
                className="bg-white hover:bg-[#FDFDFD] transition-all group cursor-pointer"
                onClick={() => onView?.(item)}
              >
                <td className="p-6 text-center font-bold text-gray-300 text-[11px] pl-8">{(pagination.currentPage - 1) * pagination.itemsPerPage + index + 1}</td>
                <td className="p-6">
                    <span className={`font-mono font-black text-[10px] px-2.5 py-1.5 rounded-lg border ${
                        item.ownership === 'Milik Modena' 
                        ? 'bg-slate-50 text-slate-600 border-slate-200' // Style for Asset
                        : 'bg-orange-50 text-orange-600 border-orange-200' // Style for Rental
                    }`}>
                        {item.noRegistrasi}
                    </span>
                </td>
                <td className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-black border border-gray-100 shadow-sm">
                            <Car size={18} />
                        </div>
                        <div>
                            <p className="font-black text-black text-[13px] uppercase tracking-tight leading-tight">{item.nama}</p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1">{item.merek || '-'} • {item.tahunPembuatan || '-'}</p>
                        </div>
                    </div>
                </td>
                <td className="p-6">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg w-fit border ${
                        item.ownership === 'Milik Modena' 
                        ? 'bg-blue-50 border-blue-100 text-blue-700' 
                        : 'bg-purple-50 border-purple-100 text-purple-700'
                    }`}>
                        {item.ownership === 'Milik Modena' ? <ShieldCheck size={12} /> : <Key size={12} />}
                        <span className="text-[10px] font-black uppercase tracking-tight">
                            {item.ownership === 'Milik Modena' ? 'MILIK SENDIRI' : 'SEWA (RENTAL)'}
                        </span>
                    </div>
                </td>
                <td className="p-6">
                    <div className="inline-block px-3 py-1.5 bg-black text-white rounded-lg text-[12px] font-black font-mono border border-gray-800 shadow-lg shadow-black/20">
                        {item.noPolisi}
                    </div>
                </td>
                <td className="p-6">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        <span className="text-[12px] font-black text-black uppercase">{item.cabang}</span>
                    </div>
                </td>
                <td className="p-6 text-center">
                    {getApprovalBadge(item.approvalStatus || 'Approved')}
                </td>
                <td className="p-6 text-center">
                    {renderWorkflowActions(item)}
                </td>
                <td className="p-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); onView?.(item); }} className="p-2 text-gray-300 hover:text-black bg-white hover:bg-gray-100 rounded-xl transition-all border border-transparent hover:border-gray-200"><Eye size={16} /></button>
                        <button onClick={(e) => { e.stopPropagation(); onEdit?.(item); }} className="p-2 text-gray-300 hover:text-blue-600 bg-white hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100"><Pencil size={16} /></button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        itemsPerPage={pagination.itemsPerPage}
        onPageChange={pagination.onPageChange}
        onItemsPerPageChange={pagination.onItemsPerPageChange}
      />
    </div>
  );
};
