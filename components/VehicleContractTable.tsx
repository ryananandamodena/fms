
import React from 'react';
import { VehicleContractRecord } from '../types';
import { ChevronsUpDown, Eye, Pencil, Trash2, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { Pagination, usePagination } from './Pagination';

interface Props {
  data: VehicleContractRecord[];
  onEdit?: (item: VehicleContractRecord) => void;
  onView?: (item: VehicleContractRecord) => void;
  onDelete?: (id: string) => void;
  onAction?: (item: VehicleContractRecord, action: 'Approve' | 'Reject' | 'Revise') => void;
}

export const VehicleContractTable: React.FC<Props> = ({ data, onEdit, onView, onDelete, onAction }) => {
  const pagination = usePagination(data, 10);
  
  const getStatusBadge = (status: string) => {
      const s = (status || '').toLowerCase();
      if(s.includes('pending')) return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-orange-50 text-orange-600 border border-orange-200">Pending</span>;
      if(s.includes('rejected')) return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-red-50 text-red-600 border border-red-200">Rejected</span>;
      if(s.includes('revised')) return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-blue-50 text-blue-600 border border-blue-200">Revised</span>;
      return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-green-100 text-green-700 border border-green-200">Active</span>;
  };

  const renderWorkflowActions = (item: VehicleContractRecord) => {
      const s = (item.approvalStatus || 'Approved').toLowerCase();
      if (s.includes('pending') && onAction) {
          return (
              <div className="flex items-center justify-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); onAction(item, 'Approve'); }} className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-md transition-all active:scale-95" title="Approve"><CheckCircle size={16} strokeWidth={2.5} /></button>
                  <button onClick={(e) => { e.stopPropagation(); onAction(item, 'Revise'); }} className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-md transition-all active:scale-95" title="Revise"><RotateCcw size={16} strokeWidth={2.5} /></button>
                  <button onClick={(e) => { e.stopPropagation(); onAction(item, 'Reject'); }} className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-md transition-all active:scale-95" title="Reject"><XCircle size={16} strokeWidth={2.5} /></button>
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1300px] text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              <th className="p-4 group cursor-pointer hover:bg-gray-200 transition-colors">
                <div className="flex items-center justify-between">
                  No Kontrak
                  <ChevronsUpDown size={14} className="text-gray-500 group-hover:text-gray-700"/>
                </div>
              </th>
              <th className="p-4 group cursor-pointer hover:bg-gray-200 transition-colors">
                <div className="flex items-center justify-between">
                  No Polisi / Unit
                  <ChevronsUpDown size={14} className="text-gray-500 group-hover:text-gray-700"/>
                </div>
              </th>
              <th className="p-4 group cursor-pointer hover:bg-gray-200 transition-colors">
                <div className="flex items-center justify-between">
                  Vendor / Lessor
                  <ChevronsUpDown size={14} className="text-gray-500 group-hover:text-gray-700"/>
                </div>
              </th>
              <th className="p-4 group cursor-pointer hover:bg-gray-200 transition-colors">
                <div className="flex items-center justify-between">
                  Masa Berlaku
                  <ChevronsUpDown size={14} className="text-gray-500 group-hover:text-gray-700"/>
                </div>
              </th>
              <th className="p-4 group cursor-pointer hover:bg-gray-200 transition-colors">
                <div className="flex items-center justify-between">
                  Biaya
                  <ChevronsUpDown size={14} className="text-gray-500 group-hover:text-gray-700"/>
                </div>
              </th>
              <th className="p-4 w-32 text-center">Status</th>
              <th className="p-4 w-44 text-center">Workflow Action</th>
              <th className="p-4 w-32 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
            {pagination.paginatedData.length > 0 ? (
                pagination.paginatedData.map((item) => (
                    <tr key={item.id} className="bg-white hover:bg-gray-50 transition-colors cursor-pointer group">
                        <td className="p-4 font-bold text-gray-900">{item.noKontrak}</td>
                        <td className="p-4">
                            <div className="font-bold text-gray-900">{item.noPolisi}</div>
                            <div className="text-xs text-gray-500 font-medium">{item.aset}</div>
                        </td>
                        <td className="p-4 text-gray-600 font-medium">{item.vendor}</td>
                        <td className="p-4">
                            <div className="text-xs font-bold text-gray-800">{item.tglMulai} s/d</div>
                            <div className="text-xs font-bold text-blue-600">{item.tglBerakhir}</div>
                        </td>
                        <td className="p-4 font-black text-gray-900">
                            Rp {parseInt(item.biayaSewa || '0').toLocaleString('id-ID')}
                        </td>
                        <td className="p-4 text-center">
                            {getStatusBadge(item.approvalStatus || 'Approved')}
                        </td>
                        <td className="p-4 text-center">
                            {renderWorkflowActions(item)}
                        </td>
                        <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                                <button onClick={(e) => { e.stopPropagation(); onView?.(item); }} className="text-gray-400 hover:text-black transition-colors"><Eye size={18} /></button>
                                <button onClick={(e) => { e.stopPropagation(); onEdit?.(item); }} className="text-gray-400 hover:text-blue-600 transition-colors"><Pencil size={18} /></button>
                            </div>
                        </td>
                    </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={8} className="p-12 text-center text-gray-400 italic">Belum ada kontrak terdaftar</td>
                </tr>
            )}
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
