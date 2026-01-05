
import React, { useState, useEffect, useRef } from 'react';
import { X, FileText, Save, Calendar, ShieldCheck, DollarSign, Building, CheckCircle2, Clock, UploadCloud, Trash2, ChevronDown, MapPin, Briefcase, Info, Car } from 'lucide-react';
import { TaxKirRecord, VehicleRecord, GeneralMasterItem } from '../types';
import { SearchableSelect } from './SearchableSelect';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<TaxKirRecord>) => void;
  initialData?: TaxKirRecord;
  mode?: 'create' | 'edit' | 'view';
  vehicleList?: VehicleRecord[];
  channelList?: GeneralMasterItem[];
  branchList?: GeneralMasterItem[];
}

export const TaxKirModal: React.FC<Props> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    initialData, 
    mode = 'create', 
    vehicleList = [],
    channelList = [],
    branchList = []
}) => {
  const [activeTab, setActiveTab] = useState('DETAILS');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<Partial<TaxKirRecord>>({
    jenis: 'Pajak STNK',
    status: 'Proses',
    statusApproval: 'Pending',
    tglRequest: new Date().toISOString().split('T')[0],
    jenisPembayaran: 'Kasbon'
  });

  useEffect(() => {
    if (isOpen && initialData) {
      setForm(initialData);
    } else if (isOpen) {
      setForm({
        jenis: 'Pajak STNK',
        status: 'Proses',
        statusApproval: 'Pending',
        tglRequest: new Date().toISOString().split('T')[0],
        jenisPembayaran: 'Kasbon',
        channel: '',
        cabang: ''
      });
    }
    setActiveTab('DETAILS');
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const isView = mode === 'view';
  const selectedVehicle = vehicleList.find(v => v.noPolisi === form.noPolisi);

  const handleVehicleChange = (selectedNoPol: string) => {
      const v = vehicleList.find(x => x.noPolisi === selectedNoPol);
      
      if (v) {
          // Auto-fill channel, branch, and due date based on current request type
          const defaultDueDate = form.jenis === 'Pajak STNK' ? v.masaBerlaku1 : v.masaBerlakuKir;
          
          setForm({
              ...form, 
              aset: v.nama, 
              noPolisi: v.noPolisi, 
              channel: v.channel, 
              cabang: v.cabang,
              jatuhTempo: defaultDueDate
          });
      } else {
          setForm({...form, aset: '', noPolisi: selectedNoPol, channel: '', cabang: '', jatuhTempo: ''});
      }
  };

  const handleTypeChange = (type: string) => {
      // Switch due date automatically when type changes
      let newDueDate = form.jatuhTempo;
      if (selectedVehicle) {
          newDueDate = type === 'Pajak STNK' ? selectedVehicle.masaBerlaku1 : selectedVehicle.masaBerlakuKir;
      }
      setForm({ ...form, jenis: type, jatuhTempo: newDueDate });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              setForm(prev => ({ ...prev, attachmentUrl: ev.target?.result as string }));
          };
          reader.readAsDataURL(file);
      }
      e.target.value = ''; // Reset input
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      setForm(prev => ({ ...prev, attachmentUrl: undefined }));
  };

  const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
      <Icon size={16} className="text-black" />
      <h3 className="text-xs font-black text-black uppercase tracking-widest">{title}</h3>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-8 py-5 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <ShieldCheck size={18} className="text-black" />
            </div>
            <h2 className="text-base font-black tracking-tight text-black uppercase">
              {mode === 'create' ? 'Permintaan Pajak & KIR' : mode === 'edit' ? 'Edit Request Pajak/KIR' : 'Detail Pajak & KIR'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black p-2 rounded-full bg-gray-50 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="bg-white border-b border-gray-100 flex px-8 shrink-0 gap-6">
            {['DETAILS', 'DOKUMEN', 'WORKFLOW'].map(tab => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)} 
                    className={`py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === tab ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    {tab}
                </button>
            ))}
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30 custom-scrollbar">
          {activeTab === 'DETAILS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Identitas Unit */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
              <SectionHeader icon={Building} title="Informasi Kendaraan" />
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Pilih Unit</label>
                  <SearchableSelect
                      options={vehicleList.map(v => ({
                          value: v.noPolisi,
                          label: `${v.noPolisi} - ${v.nama}`,
                          subLabel: `${v.merek} ${v.model} (${v.tahunPembuatan})`
                      }))}
                      value={form.noPolisi || ''}
                      onChange={handleVehicleChange}
                      disabled={isView}
                      placeholder="(Pilih Unit)"
                      icon={Car}
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Jenis Pengurusan</label>
                  <div className="flex gap-3">
                    {['Pajak STNK', 'KIR'].map(type => (
                        <button
                            key={type}
                            disabled={isView}
                            onClick={() => handleTypeChange(type)}
                            className={`flex-1 py-3 text-xs font-black rounded-xl border transition-all ${
                                form.jenis === type ? 'bg-black text-white border-black shadow-md' : 'bg-white text-gray-400 border-gray-200 hover:border-black hover:text-black'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Channel</label>
                        <div className="relative">
                            <select 
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-black focus:border-black outline-none disabled:bg-gray-50 transition-all appearance-none cursor-pointer uppercase"
                                value={form.channel || ''}
                                onChange={(e) => setForm({...form, channel: e.target.value})}
                                disabled={isView}
                            >
                                <option value="">(Pilih Channel)</option>
                                {channelList.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                <option value="HCO">HCO</option>
                                <option value="Management">Management</option>
                            </select>
                            <Briefcase size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Cabang</label>
                        <div className="relative">
                            <select 
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-black focus:border-black outline-none disabled:bg-gray-50 transition-all appearance-none cursor-pointer uppercase"
                                value={form.cabang || ''}
                                onChange={(e) => setForm({...form, cabang: e.target.value})}
                                disabled={isView}
                            >
                                <option value="">(Pilih Cabang)</option>
                                {branchList.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                            </select>
                            <MapPin size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
                
                {/* Conditional Due Dates Section - Now an Input Date */}
                <div className="pt-4 border-t border-dashed border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                     <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">
                        {form.jenis === 'Pajak STNK' ? 'Jatuh Tempo Pajak (STNK)' : 'Jatuh Tempo KIR'}
                     </label>
                     <div className="relative">
                        <input 
                            type="date"
                            className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-black text-black focus:border-black outline-none transition-all shadow-sm ${
                                form.jenis === 'Pajak STNK' ? 'focus:ring-2 focus:ring-blue-100' : 'focus:ring-2 focus:ring-purple-100'
                            }`}
                            value={form.jatuhTempo || ''}
                            onChange={(e) => setForm({...form, jatuhTempo: e.target.value})}
                            disabled={isView}
                        />
                        <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                     </div>
                     {selectedVehicle && (
                         <p className="text-[10px] text-gray-400 mt-2 italic flex items-center gap-1">
                             <Info size={12} />
                             Tanggal diambil otomatis dari master kendaraan, dapat disesuaikan.
                         </p>
                     )}
                </div>
              </div>
            </div>

            {/* Administrasi & Biaya */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
              <SectionHeader icon={DollarSign} title="Administrasi & Biaya" />
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Tgl Request</label>
                        <input 
                            type="date" 
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-black focus:border-black focus:ring-2 focus:ring-gray-100 outline-none disabled:bg-gray-50 transition-all"
                            value={form.tglRequest || ''}
                            onChange={(e) => setForm({...form, tglRequest: e.target.value})}
                            disabled={isView}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Target Selesai</label>
                        <input 
                            type="date" 
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-black focus:border-black focus:ring-2 focus:ring-gray-100 outline-none disabled:bg-gray-50 transition-all"
                            value={form.targetSelesai || ''}
                            onChange={(e) => setForm({...form, targetSelesai: e.target.value})}
                            disabled={isView}
                        />
                    </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Estimasi Biaya (Rp)</label>
                  <input 
                    type="number" 
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-black text-black focus:border-black focus:ring-2 focus:ring-gray-100 outline-none disabled:bg-gray-50 transition-all placeholder:text-gray-300"
                    value={form.estimasiBiaya || ''}
                    onChange={(e) => setForm({...form, estimasiBiaya: e.target.value})}
                    disabled={isView}
                    placeholder="0"
                  />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Metode Pembayaran</label>
                    <div className="relative">
                        <select 
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-black focus:border-black focus:ring-2 focus:ring-gray-100 outline-none disabled:bg-gray-50 transition-all appearance-none cursor-pointer"
                            value={form.jenisPembayaran || ''}
                            onChange={(e) => setForm({...form, jenisPembayaran: e.target.value})}
                            disabled={isView}
                        >
                            <option value="Kasbon">Kasbon</option>
                            <option value="Langsung">Langsung (Reimbursement)</option>
                            <option value="Corporate Card">Corporate Card</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>
              </div>
            </div>
          </div>
          )}

          {activeTab === 'DOKUMEN' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white p-10 rounded-[2rem] border border-gray-200 shadow-sm">
                      <SectionHeader icon={FileText} title={`Legal Document - ${form.jenis || 'Attachment'}`} />
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
                      
                      <div className="mt-6">
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                              {form.jenis === 'Pajak STNK' ? 'DOKUMEN STNK (Scan/Foto)' : 'DOKUMEN KIR (Scan/Foto)'}
                          </label>
                          <div 
                              onClick={() => !isView && fileInputRef.current?.click()}
                              className={`relative w-full border-2 border-dashed rounded-[1.5rem] flex flex-col items-center justify-center transition-all overflow-hidden bg-white min-h-[250px]
                                ${form.attachmentUrl ? 'border-gray-200' : 'border-gray-100 hover:border-black hover:bg-gray-50/50'}
                                ${!isView ? 'cursor-pointer' : 'cursor-default'}
                              `}
                          >
                              {form.attachmentUrl ? (
                                <div className="relative w-full h-full group flex items-center justify-center">
                                    <img src={form.attachmentUrl} alt="Document" className="max-w-full max-h-[250px] object-contain p-4" />
                                    {!isView && (
                                        <button 
                                            onClick={handleRemoveImage}
                                            className="absolute top-4 right-4 bg-black text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                              ) : (
                                <div className="flex flex-col items-center p-6 text-center">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm border border-gray-100 transition-all mb-4 bg-white`}>
                                        <UploadCloud size={20} className="text-gray-300" />
                                    </div>
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-relaxed">
                                        {isView ? 'No Document Attached' : 'Click to Upload Document'}
                                    </p>
                                </div>
                              )}
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'WORKFLOW' && (
              <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="absolute left-[51px] top-12 bottom-12 w-[2px] bg-gray-100"></div>
                        <div className="space-y-10 relative z-10">
                            <div className="flex gap-8">
                                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shadow-lg shadow-black/20 shrink-0">
                                    <FileText size={20} strokeWidth={3} />
                                </div>
                                <div className="pt-2">
                                    <h4 className="text-[13px] font-black text-black uppercase tracking-tight">Request Created</h4>
                                    <p className="text-[11px] text-gray-400 mt-1">Submitted on {form.tglRequest}</p>
                                </div>
                            </div>
                            <div className="flex gap-8">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-lg ${
                                    form.statusApproval === 'Approved' ? 'bg-green-500 text-white shadow-green-200' :
                                    form.statusApproval === 'Rejected' ? 'bg-red-500 text-white shadow-red-200' :
                                    'bg-orange-500 text-white shadow-orange-200'
                                }`}>
                                    {form.statusApproval === 'Approved' ? <CheckCircle2 size={20} /> : 
                                     form.statusApproval === 'Rejected' ? <X size={20} /> : <Clock size={20} />}
                                </div>
                                <div className="pt-2">
                                    <h4 className="text-[13px] font-black text-black uppercase tracking-tight">Status: {form.statusApproval}</h4>
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        {form.statusApproval === 'Approved' ? 'Request Approved' : 'Waiting for approval'}
                                    </p>
                                </div>
                            </div>
                        </div>
                  </div>

                  {/* Workflow Action Buttons */}
                  {(form.statusApproval === 'Pending' || form.statusApproval === 'Pending Approval') && (
                      <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                          <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6">Workflow Action</h4>
                          <div className="flex items-center gap-4">
                              <button 
                                  onClick={() => setForm({...form, statusApproval: 'Approved'})}
                                  className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-green-500/20"
                              >
                                  <CheckCircle2 size={18} strokeWidth={3} />
                                  Approve
                              </button>
                              <button 
                                  onClick={() => setForm({...form, statusApproval: 'Rejected'})}
                                  className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-red-500/20"
                              >
                                  <X size={18} strokeWidth={3} />
                                  Reject
                              </button>
                          </div>
                      </div>
                  )}
              </div>
          )}
        </div>

        <div className="px-8 py-6 bg-white border-t border-gray-100 flex gap-4">
          {!isView && (
            <>
                <button onClick={onClose} className="flex-1 py-4 text-[11px] font-black text-gray-400 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-black transition-all uppercase tracking-widest">Batal</button>
                <button 
                    onClick={() => onSave(form)} 
                    className="flex-[2] py-4 text-[11px] font-black text-white bg-black rounded-xl shadow-xl shadow-black/10 hover:bg-gray-900 transition-all flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95"
                >
                    <Save size={16} /> {mode === 'create' ? 'Ajukan Permintaan' : 'Simpan Perubahan'}
                </button>
            </>
          )}
          {isView && <button onClick={onClose} className="w-full py-4 text-[11px] font-black text-black uppercase tracking-widest bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">Tutup</button>}
        </div>
      </div>
    </div>
  );
};
