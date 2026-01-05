import React, { useState, useMemo } from 'react';
import { FilterBar } from '../../components/FilterBar';
import { Eye, Edit2, Trash2, CheckCircle, XCircle, X, Shield, User } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useApprovalWorkflow, APPROVAL_MODULES } from '../../hooks/useApprovalWorkflow';

interface PermintaanLokerItem {
  id: number;
  noRequest: string;
  tanggalRequest: string;
  namaPemohon: string;
  nip: string;
  departemen: string;
  lokasiDiinginkan: string;
  ukuranDiinginkan: string;
  alasan: string;
  status: string;
  currentApprovalLevel: number;
  approvalHistory: { level: number; approver: string; status: string; date: string; notes: string }[];
  approvedBy: string;
  tanggalApproval: string;
  lokerDiberikan: string;
  keterangan: string;
}

const PermintaanLoker: React.FC = () => {
  const { masterApprovalData } = useAppContext();
  const { workflow: approvalWorkflow, getApproverName, isLastTier, getTotalTiers } = useApprovalWorkflow(APPROVAL_MODULES.LOKER_REQUEST);

  const [data, setData] = useState<PermintaanLokerItem[]>([
    { id: 1, noRequest: 'REQ-L-001', tanggalRequest: '2026-01-02', namaPemohon: 'John Doe', nip: 'EMP001', departemen: 'IT', lokasiDiinginkan: 'Gedung A', ukuranDiinginkan: 'Sedang', alasan: 'Butuh tempat penyimpanan', status: 'Pending', currentApprovalLevel: 1, approvalHistory: [], approvedBy: '', tanggalApproval: '', lokerDiberikan: '', keterangan: '' },
    { id: 2, noRequest: 'REQ-L-002', tanggalRequest: '2026-01-01', namaPemohon: 'Jane Smith', nip: 'EMP002', departemen: 'HR', lokasiDiinginkan: 'Gedung B', ukuranDiinginkan: 'Kecil', alasan: 'Penyimpanan dokumen', status: 'Approved', currentApprovalLevel: 0, approvalHistory: [{ level: 1, approver: 'Admin GA', status: 'Approved', date: '2026-01-02', notes: '' }], approvedBy: 'Admin GA', tanggalApproval: '2026-01-02', lokerDiberikan: 'L-005', keterangan: '' },
    { id: 3, noRequest: 'REQ-L-003', tanggalRequest: '2025-12-28', namaPemohon: 'Bob Wilson', nip: 'EMP003', departemen: 'Finance', lokasiDiinginkan: 'Gedung A', ukuranDiinginkan: 'Besar', alasan: 'Penyimpanan arsip', status: 'Rejected', currentApprovalLevel: 0, approvalHistory: [{ level: 1, approver: 'Admin GA', status: 'Rejected', date: '2025-12-30', notes: 'Loker tidak tersedia' }], approvedBy: 'Admin GA', tanggalApproval: '2025-12-30', lokerDiberikan: '', keterangan: 'Loker tidak tersedia' },
  ]);
  const [activeTab, setActiveTab] = useState('SEMUA');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [selectedItem, setSelectedItem] = useState<PermintaanLokerItem | null>(null);
  const [form, setForm] = useState<Partial<PermintaanLokerItem>>({});
  const [approvalForm, setApprovalForm] = useState({ lokerDiberikan: '', keterangan: '' });

  const openModal = (mode: 'create' | 'edit' | 'view', item?: PermintaanLokerItem) => {
    setModalMode(mode);
    setSelectedItem(item || null);
    setForm(item || { 
      noRequest: `REQ-L-${Date.now()}`, 
      tanggalRequest: new Date().toISOString().split('T')[0], 
      namaPemohon: '', nip: '', departemen: '', lokasiDiinginkan: '', 
      ukuranDiinginkan: 'Kecil', alasan: '', status: 'Pending',
      currentApprovalLevel: 1, approvalHistory: []
    });
    setIsModalOpen(true);
  };

  const openApprovalModal = (item: PermintaanLokerItem, action: 'approve' | 'reject') => {
    setSelectedItem(item);
    setApprovalAction(action);
    setApprovalForm({ lokerDiberikan: '', keterangan: '' });
    setIsApprovalModalOpen(true);
  };

  const handleSave = () => {
    if (modalMode === 'create') {
      setData([...data, { ...form, id: Date.now() } as PermintaanLokerItem]);
    } else {
      setData(data.map(d => d.id === selectedItem?.id ? { ...d, ...form } : d));
    }
    setIsModalOpen(false);
  };

  const handleApproval = (action: 'approve' | 'reject') => {
    if (!selectedItem) return;
    
    if (action === 'approve' && !approvalForm.lokerDiberikan) {
      alert('Silakan isi nomor loker yang diberikan');
      return;
    }
    if (action === 'reject' && !approvalForm.keterangan) {
      alert('Silakan isi alasan penolakan');
      return;
    }

    const approverName = getApproverName(selectedItem.currentApprovalLevel);
    const isLast = isLastTier(selectedItem.currentApprovalLevel);

    const newHistory = [...(selectedItem.approvalHistory || []), {
      level: selectedItem.currentApprovalLevel,
      approver: approverName,
      status: action === 'approve' ? 'Approved' : 'Rejected',
      date: new Date().toISOString().split('T')[0],
      notes: approvalForm.keterangan
    }];

    if (action === 'reject') {
      setData(data.map(d => d.id === selectedItem.id ? { 
        ...d, 
        status: 'Rejected',
        currentApprovalLevel: 0,
        approvalHistory: newHistory,
        approvedBy: approverName,
        tanggalApproval: new Date().toISOString().split('T')[0],
        keterangan: approvalForm.keterangan
      } : d));
    } else if (isLast) {
      // Final approval
      setData(data.map(d => d.id === selectedItem.id ? { 
        ...d, 
        status: 'Approved',
        currentApprovalLevel: 0,
        approvalHistory: newHistory,
        approvedBy: approverName,
        tanggalApproval: new Date().toISOString().split('T')[0],
        lokerDiberikan: approvalForm.lokerDiberikan,
        keterangan: approvalForm.keterangan
      } : d));
    } else {
      // Move to next tier
      setData(data.map(d => d.id === selectedItem.id ? { 
        ...d, 
        currentApprovalLevel: selectedItem.currentApprovalLevel + 1,
        approvalHistory: newHistory
      } : d));
    }
    setIsApprovalModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Yakin ingin menghapus?')) setData(data.filter(d => d.id !== id));
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected': return 'bg-red-50 text-red-700 border-red-200';
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const filteredData = activeTab === 'SEMUA' ? data : data.filter(item => item.status.toUpperCase() === activeTab);

  return (
    <>
      <FilterBar
        tabs={['SEMUA', 'PENDING', 'APPROVED', 'REJECTED']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddClick={() => openModal('create')}
        customAddLabel="Buat Permintaan"
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-wider">No. Request</th>
                <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-wider">Tanggal</th>
                <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-wider">Pemohon</th>
                <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-wider">NIP</th>
                <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-wider">Departemen</th>
                <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-wider">Lokasi</th>
                <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-center py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-wider">Workflow Action</th>
                <th className="text-right py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr><td colSpan={9} className="py-12 text-center text-gray-400 text-sm">Tidak ada data</td></tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={item.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="py-4 px-6 text-sm font-bold text-gray-900">{item.noRequest}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{item.tanggalRequest}</td>
                    <td className="py-4 px-6 text-sm text-gray-900">{item.namaPemohon}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{item.nip}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{item.departemen}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{item.lokasiDiinginkan}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getStatusStyle(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {item.status === 'Pending' && (
                        <div className="flex justify-center gap-1">
                          <button onClick={() => openApprovalModal(item, 'approve')} className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors" title="Approve"><CheckCircle size={14} /></button>
                          <button onClick={() => openApprovalModal(item, 'reject')} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors" title="Reject"><XCircle size={14} /></button>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openModal('view', item)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><Eye size={16} /></button>
                        {item.status === 'Pending' && (
                          <button onClick={() => openModal('edit', item)} className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                        )}
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-black text-gray-900">{modalMode === 'create' ? 'Buat' : modalMode === 'edit' ? 'Edit' : 'Detail'} Permintaan Loker</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">Nama Pemohon</label>
                  <input type="text" value={form.namaPemohon || ''} onChange={e => setForm({...form, namaPemohon: e.target.value})} disabled={modalMode === 'view'}
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:border-black focus:ring-0 outline-none transition-colors disabled:bg-gray-50" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">NIP</label>
                  <input type="text" value={form.nip || ''} onChange={e => setForm({...form, nip: e.target.value})} disabled={modalMode === 'view'}
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:border-black focus:ring-0 outline-none transition-colors disabled:bg-gray-50" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">Departemen</label>
                <input type="text" value={form.departemen || ''} onChange={e => setForm({...form, departemen: e.target.value})} disabled={modalMode === 'view'}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:border-black focus:ring-0 outline-none transition-colors disabled:bg-gray-50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">Lokasi Diinginkan</label>
                  <input type="text" value={form.lokasiDiinginkan || ''} onChange={e => setForm({...form, lokasiDiinginkan: e.target.value})} disabled={modalMode === 'view'}
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:border-black focus:ring-0 outline-none transition-colors disabled:bg-gray-50" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">Ukuran</label>
                  <select value={form.ukuranDiinginkan || ''} onChange={e => setForm({...form, ukuranDiinginkan: e.target.value})} disabled={modalMode === 'view'}
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:border-black focus:ring-0 outline-none transition-colors disabled:bg-gray-50">
                    <option value="Kecil">Kecil</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Besar">Besar</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">Alasan</label>
                <textarea value={form.alasan || ''} onChange={e => setForm({...form, alasan: e.target.value})} disabled={modalMode === 'view'} rows={3}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:border-black focus:ring-0 outline-none transition-colors disabled:bg-gray-50 resize-none" />
              </div>
              {modalMode === 'view' && form.status !== 'Pending' && (
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <p className={`text-[10px] font-black uppercase tracking-wider mb-3 ${form.status === 'Approved' ? 'text-emerald-600' : 'text-red-600'}`}>Info {form.status === 'Approved' ? 'Approval' : 'Penolakan'}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {form.status === 'Approved' && <div><span className="text-gray-400">Loker Diberikan:</span> <span className="font-medium">{form.lokerDiberikan}</span></div>}
                    <div><span className="text-gray-400">Approved By:</span> <span className="font-medium">{form.approvedBy}</span></div>
                    <div><span className="text-gray-400">Tanggal:</span> <span className="font-medium">{form.tanggalApproval}</span></div>
                    {form.keterangan && <div className="col-span-2"><span className="text-gray-400">Keterangan:</span> <span className="font-medium">{form.keterangan}</span></div>}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Tutup</button>
              {modalMode !== 'view' && <button onClick={handleSave} className="px-6 py-3 text-sm font-bold text-white bg-black rounded-xl hover:bg-gray-900 transition-colors">Simpan</button>}
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {isApprovalModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-black text-gray-900">{approvalAction === 'approve' ? 'Approve' : 'Reject'} Permintaan</h2>
              <button onClick={() => setIsApprovalModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm"><span className="text-gray-500">No Request:</span> <span className="font-bold">{selectedItem.noRequest}</span></p>
                <p className="text-sm"><span className="text-gray-500">Pemohon:</span> <span className="font-medium">{selectedItem.namaPemohon}</span></p>
                <p className="text-sm"><span className="text-gray-500">Lokasi:</span> <span className="font-medium">{selectedItem.lokasiDiinginkan}</span></p>
                <p className="text-sm"><span className="text-gray-500">Ukuran:</span> <span className="font-medium">{selectedItem.ukuranDiinginkan}</span></p>
              </div>

              {/* Approval Workflow Info */}
              {approvalWorkflow && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider mb-2">Workflow Approval</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {approvalWorkflow.tiers.sort((a, b) => a.level - b.level).map((tier, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${
                          tier.level < selectedItem.currentApprovalLevel ? 'bg-emerald-100 text-emerald-700' :
                          tier.level === selectedItem.currentApprovalLevel ? 'bg-blue-500 text-white' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {tier.type === 'User' ? <User size={10} /> : <Shield size={10} />}
                          <span>{tier.value}</span>
                        </div>
                        {idx < approvalWorkflow.tiers.length - 1 && <span className="text-gray-300">→</span>}
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-blue-500 mt-2">
                    Level {selectedItem.currentApprovalLevel} dari {approvalWorkflow.tiers.length}
                  </p>
                </div>
              )}

              {/* Approval History */}
              {selectedItem.approvalHistory && selectedItem.approvalHistory.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">Riwayat Approval</p>
                  {selectedItem.approvalHistory.map((h, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs py-1">
                      <span className={`w-2 h-2 rounded-full ${h.status === 'Approved' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                      <span className="font-medium">{h.approver}</span>
                      <span className="text-gray-400">-</span>
                      <span className={h.status === 'Approved' ? 'text-emerald-600' : 'text-red-600'}>{h.status}</span>
                      <span className="text-gray-400 text-[10px]">({h.date})</span>
                    </div>
                  ))}
                </div>
              )}

              {approvalAction === 'approve' ? (
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">Loker yang Diberikan *</label>
                  <input type="text" value={approvalForm.lokerDiberikan} onChange={e => setApprovalForm({...approvalForm, lokerDiberikan: e.target.value})}
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:border-black focus:ring-0 outline-none transition-colors" placeholder="L-001" />
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">Alasan Penolakan *</label>
                  <textarea value={approvalForm.keterangan} onChange={e => setApprovalForm({...approvalForm, keterangan: e.target.value})} rows={3}
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:border-black focus:ring-0 outline-none transition-colors resize-none" placeholder="Jelaskan alasan penolakan..." />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setIsApprovalModalOpen(false)} className="px-6 py-3 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Batal</button>
              {approvalAction === 'approve' ? (
                <button onClick={() => handleApproval('approve')} className="px-6 py-3 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors">Approve</button>
              ) : (
                <button onClick={() => handleApproval('reject')} className="px-6 py-3 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors">Reject</button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PermintaanLoker;
