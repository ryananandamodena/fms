
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Wrench, Calendar, DollarSign, FileText, Building, User, UploadCloud, Trash2, Clock, CheckCircle2, AlertCircle, PlayCircle, Star, Image as ImageIcon } from 'lucide-react';
import { BuildingMaintenanceRecord, BuildingAssetRecord } from '../types';
import { SearchableSelect, SelectOption } from './SearchableSelect';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<BuildingMaintenanceRecord>) => void;
  initialData?: BuildingMaintenanceRecord | null;
  assetList: BuildingAssetRecord[];
  mode?: 'create' | 'edit' | 'view';
}

export const BuildingMaintenanceModal: React.FC<Props> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    initialData, 
    assetList,
    mode = 'create'
}) => {
  const [form, setForm] = useState<Partial<BuildingMaintenanceRecord>>({
    requestDate: new Date().toISOString().split('T')[0],
    maintenanceType: 'Preventive',
    status: 'Scheduled',
    approvalStatus: 'Pending Approval',
    cost: '0',
    rating: 0
  });

  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm(initialData);
      } else {
        setForm({
            requestDate: new Date().toISOString().split('T')[0],
            maintenanceType: 'Preventive',
            status: 'Scheduled',
            approvalStatus: 'Pending Approval',
            cost: '0',
            rating: 0
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const isView = mode === 'view';

  // Feature 3: SLA Logic
  const getSLABadge = () => {
      if (!form.requestDate) return null;
      
      const start = new Date(form.requestDate);
      const end = form.completionDate ? new Date(form.completionDate) : new Date();
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      let status = 'On Track';
      let color = 'bg-green-100 text-green-700';

      if (diffDays > 7) {
          status = 'Overdue (>7 Days)';
          color = 'bg-red-100 text-red-700';
      } else if (diffDays > 3) {
          status = 'Warning (>3 Days)';
          color = 'bg-orange-100 text-orange-700';
      }

      return (
          <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${color} flex items-center gap-2`}>
              <Clock size={12} /> {status} ({diffDays} Days)
          </div>
      );
  };

  const handleAssetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedAssetId = e.target.value;
      const asset = assetList.find(a => a.id === selectedAssetId);
      if (asset) {
          setForm({
              ...form,
              assetId: asset.id,
              assetName: asset.assetName,
              buildingLocation: `${asset.buildingName} - ${asset.floor} (${asset.roomName})`
          });
      } else {
          setForm({
              ...form,
              assetId: '',
              assetName: '',
              buildingLocation: ''
          });
      }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              if (type === 'before') setForm(prev => ({...prev, evidenceBefore: ev.target?.result as string}));
              else setForm(prev => ({...prev, evidenceAfter: ev.target?.result as string}));
          };
          reader.readAsDataURL(file);
      }
  };

  const getLogs = () => {
      const logs = [
          { id: 1, date: '24/12/2025 09:00', user: 'System', role: 'System', action: 'Request Created', status: 'Draft', icon: FileText, color: 'text-gray-400', bg: 'bg-gray-100' },
          { id: 2, date: '24/12/2025 09:15', user: 'Ibnu Faisal', role: 'Facility Manager', action: 'Submitted for Approval', status: 'Pending Approval', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-100' },
      ];

      if (form.approvalStatus === 'Approved') {
          logs.push({ id: 3, date: '25/12/2025 10:30', user: 'Budi Santoso', role: 'Building Manager', action: 'Approved Request', status: 'Approved', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100' });
      } else if (form.approvalStatus === 'Rejected') {
          logs.push({ id: 3, date: '25/12/2025 10:30', user: 'Budi Santoso', role: 'Building Manager', action: 'Rejected Request', status: 'Rejected', icon: X, color: 'text-red-500', bg: 'bg-red-100' });
      } else if (form.approvalStatus === 'Revised') {
          logs.push({ id: 3, date: '25/12/2025 10:30', user: 'Budi Santoso', role: 'Building Manager', action: 'Requested Revision', status: 'Revised', icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-100' });
      }

      if (form.status === 'In Progress' && form.approvalStatus === 'Approved') {
           logs.push({ id: 4, date: '26/12/2025 08:00', user: form.vendor || 'Vendor', role: 'Technician', action: 'Work Started', status: 'In Progress', icon: PlayCircle, color: 'text-blue-600', bg: 'bg-blue-50' });
      }
      
      if (form.status === 'Completed' && form.approvalStatus === 'Approved') {
           if (!logs.find(l => l.status === 'In Progress')) {
                logs.push({ id: 4, date: '26/12/2025 08:00', user: form.vendor || 'Vendor', role: 'Technician', action: 'Work Started', status: 'In Progress', icon: PlayCircle, color: 'text-blue-600', bg: 'bg-blue-50' });
           }
           logs.push({ id: 5, date: '27/12/2025 16:00', user: form.vendor || 'Vendor', role: 'Technician', action: 'Work Completed', status: 'Completed', icon: CheckCircle2, color: 'text-green-700', bg: 'bg-green-100' });
      }

      return logs.reverse(); // Newest first
  };

  const Label = ({ children, required }: { children?: React.ReactNode, required?: boolean }) => (
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2.5">
      {children} {required && <span className="text-red-500 font-black ml-0.5">*</span>}
    </label>
  );

  const InputField = ({ label, value, field, type = "text", disabled = false, placeholder = "", className = "" }: any) => (
    <div className={className}>
      <Label>{label}</Label>
      <input 
        type={type} 
        disabled={isView || disabled}
        className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-[13px] font-black text-black focus:border-black outline-none disabled:bg-gray-50 disabled:text-gray-400 transition-all placeholder:text-gray-300 shadow-sm"
        value={value || ''}
        placeholder={placeholder}
        onChange={(e) => setForm({...form, [field]: e.target.value})}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FBFBFB] w-full max-w-6xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col transform transition-all scale-100 max-h-[95vh]">
        
        {/* Header */}
        <div className="px-12 py-8 bg-white flex items-center justify-between shrink-0 border-b border-gray-100">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-black rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-black/20">
                <Wrench size={28} strokeWidth={2.5} />
            </div>
            <div>
                <h2 className="text-[20px] font-black text-black uppercase tracking-tight leading-none">
                    {mode === 'create' ? 'Input Pemeliharaan' : mode === 'edit' ? 'Update Pemeliharaan' : 'Detail Pemeliharaan'}
                </h2>
                <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-[0.3em]">Building Asset Maintenance</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
              {getSLABadge()}
              <button onClick={onClose} className="text-gray-300 hover:text-black transition-all p-3 rounded-full hover:bg-gray-50">
                <X size={32} />
              </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row bg-[#FBFBFB]">
            
            {/* Left Column: Form */}
            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                    {/* Asset Info Section */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 mb-2">
                            <Building size={16} className="text-black"/>
                            <h3 className="text-[11px] font-black text-black uppercase tracking-widest">Informasi Aset</h3>
                        </div>
                        
                        <div>
                            <Label required>Pilih Aset Gedung</Label>
                            <SearchableSelect
                                options={assetList.map(asset => ({
                                    value: asset.id,
                                    label: `${asset.assetName} (${asset.assetCode})`,
                                    subLabel: `${asset.buildingName} - ${asset.floor} (${asset.roomName})`
                                }))}
                                value={form.assetId || ''}
                                onChange={(val) => {
                                    const asset = assetList.find(a => a.id === val);
                                    if (asset) {
                                        setForm({
                                            ...form,
                                            assetId: asset.id,
                                            assetName: asset.assetName,
                                            buildingLocation: `${asset.buildingName} - ${asset.floor} (${asset.roomName})`
                                        });
                                    } else {
                                        setForm({
                                            ...form,
                                            assetId: '',
                                            assetName: '',
                                            buildingLocation: ''
                                        });
                                    }
                                }}
                                placeholder="-- Pilih Aset --"
                                disabled={isView || mode === 'edit'}
                                emptyMessage="Tidak ada data aset"
                            />
                        </div>

                        <InputField 
                            label="Lokasi Penempatan" 
                            value={form.buildingLocation} 
                            field="buildingLocation" 
                            disabled={true} 
                            placeholder="Lokasi otomatis terisi..." 
                        />

                        <div>
                            <Label>Kategori Maintenance</Label>
                            <div className="flex gap-3">
                                {['Preventive', 'Corrective', 'Emergency'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => !isView && setForm({...form, maintenanceType: type as any})}
                                        disabled={isView}
                                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all ${
                                            form.maintenanceType === type 
                                            ? 'bg-black text-white border-black shadow-lg' 
                                            : 'bg-white text-gray-400 border-gray-200 hover:border-black hover:text-black'
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Service Details Section */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 mb-2">
                            <FileText size={16} className="text-black"/>
                            <h3 className="text-[11px] font-black text-black uppercase tracking-widest">Detail Pengerjaan</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <InputField label="Tanggal Request" value={form.requestDate} field="requestDate" type="date" />
                            <InputField label="Tanggal Selesai" value={form.completionDate} field="completionDate" type="date" />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <InputField label="Vendor Pelaksana" value={form.vendor} field="vendor" placeholder="Nama Vendor" />
                            <InputField label="Nama Teknisi" value={form.technician} field="technician" placeholder="Opsional" />
                        </div>

                        <div>
                            <Label>Deskripsi Pekerjaan</Label>
                            <textarea 
                                disabled={isView}
                                className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-[13px] font-bold text-black focus:border-black outline-none disabled:bg-gray-50 transition-all placeholder:text-gray-300 shadow-sm min-h-[100px]"
                                placeholder="Jelaskan detail perbaikan atau perawatan..."
                                value={form.description || ''}
                                onChange={(e) => setForm({...form, description: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="relative">
                                <Label>Biaya (IDR)</Label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">Rp</span>
                                    <input 
                                        type="number"
                                        disabled={isView}
                                        className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-5 py-4 text-[13px] font-black text-black focus:border-black outline-none disabled:bg-gray-50 transition-all placeholder:text-gray-300 shadow-sm"
                                        value={form.cost}
                                        onChange={(e) => setForm({...form, cost: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Status Progress</Label>
                                <select 
                                    disabled={isView}
                                    className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-[13px] font-black text-black focus:border-black outline-none disabled:bg-gray-50 shadow-sm cursor-pointer appearance-none"
                                    value={form.status || ''}
                                    onChange={(e) => setForm({...form, status: e.target.value as any})}
                                >
                                    <option value="Scheduled">Scheduled</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Pending">Pending</option>
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <Label>Approval Status</Label>
                            <select 
                                disabled={isView}
                                className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-[13px] font-black text-black focus:border-black outline-none disabled:bg-gray-50 shadow-sm cursor-pointer appearance-none"
                                value={form.approvalStatus || 'Pending Approval'}
                                onChange={(e) => setForm({...form, approvalStatus: e.target.value as any})}
                            >
                                <option value="Draft">Draft</option>
                                <option value="Pending Approval">Pending Approval</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Revised">Revised</option>
                            </select>
                        </div>
                    </div>

                    {/* Feature 2: Evidence Based Maintenance */}
                    <div className="md:col-span-2 space-y-8 pt-8 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <ImageIcon size={16} className="text-black"/>
                                <h3 className="text-[11px] font-black text-black uppercase tracking-widest">Evidence Based Maintenance</h3>
                            </div>
                            {/* Feature 3: Vendor Rating (Only show if completed) */}
                            {form.status === 'Completed' && (
                                <div className="flex items-center gap-3 bg-yellow-50 px-4 py-2 rounded-xl border border-yellow-100">
                                    <span className="text-[10px] font-black text-yellow-700 uppercase tracking-widest">Vendor Rating</span>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button 
                                                key={star}
                                                type="button"
                                                onClick={() => !isView && setForm({...form, rating: star})}
                                                disabled={isView}
                                                className={`${(form.rating || 0) >= star ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} transition-colors`}
                                            >
                                                <Star size={16} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            {/* Before Photo */}
                            <div>
                                <Label>Before Maintenance</Label>
                                <div 
                                    onClick={() => !isView && beforeInputRef.current?.click()}
                                    className={`relative h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center bg-gray-50 overflow-hidden transition-all
                                        ${!isView ? 'cursor-pointer hover:border-black hover:bg-gray-100' : ''}
                                        ${form.evidenceBefore ? 'border-green-200' : 'border-gray-200'}
                                    `}
                                >
                                    {form.evidenceBefore ? (
                                        <img src={form.evidenceBefore} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-400">
                                            <UploadCloud size={24} className="mb-2" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Upload Photo</span>
                                        </div>
                                    )}
                                    <input type="file" ref={beforeInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'before')} />
                                </div>
                            </div>

                            {/* After Photo */}
                            <div>
                                <Label>After Maintenance</Label>
                                <div 
                                    onClick={() => !isView && afterInputRef.current?.click()}
                                    className={`relative h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center bg-gray-50 overflow-hidden transition-all
                                        ${!isView ? 'cursor-pointer hover:border-black hover:bg-gray-100' : ''}
                                        ${form.evidenceAfter ? 'border-green-200' : 'border-gray-200'}
                                    `}
                                >
                                    {form.evidenceAfter ? (
                                        <img src={form.evidenceAfter} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-400">
                                            <UploadCloud size={24} className="mb-2" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Upload Photo</span>
                                        </div>
                                    )}
                                    <input type="file" ref={afterInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'after')} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Log History Sidebar */}
            <div className="w-full lg:w-[350px] bg-white border-l border-gray-100 p-8 overflow-y-auto custom-scrollbar shrink-0">
                <div className="flex items-center gap-3 mb-8">
                    <Clock size={18} className="text-black"/>
                    <h3 className="text-[12px] font-black text-black uppercase tracking-widest">Log History</h3>
                </div>

                <div className="space-y-8 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-gray-100"></div>

                    {getLogs().map((log, index) => (
                        <div key={index} className="relative pl-12">
                            {/* Icon */}
                            <div className={`absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 ${log.bg}`}>
                                <log.icon size={16} className={log.color} />
                            </div>
                            
                            {/* Content */}
                            <div>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">{log.date}</span>
                                <h4 className="text-[12px] font-black text-black leading-tight mb-0.5">{log.action}</h4>
                                <div className="text-[10px] text-gray-500 font-medium flex items-center gap-1.5">
                                    <User size={10} /> 
                                    <span className="font-bold">{log.user}</span> 
                                    <span className="text-gray-300">•</span>
                                    <span>{log.role}</span>
                                </div>
                                <div className={`inline-block mt-2 px-2 py-0.5 rounded text-[9px] font-black uppercase ${log.bg} ${log.color}`}>
                                    {log.status}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Workflow Action Buttons */}
                {form.approvalStatus === 'Pending Approval' && (
                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Workflow Action</h4>
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={() => setForm({...form, approvalStatus: 'Approved'})}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-green-500/20"
                            >
                                <CheckCircle2 size={16} strokeWidth={3} />
                                Approve
                            </button>
                            <button 
                                onClick={() => setForm({...form, approvalStatus: 'Rejected'})}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-red-500/20"
                            >
                                <X size={16} strokeWidth={3} />
                                Reject
                            </button>
                        </div>
                    </div>
                )}
            </div>

        </div>

        {/* Footer */}
        <div className="px-12 py-8 bg-white border-t border-gray-100 flex justify-end gap-4 shrink-0">
          <button onClick={onClose} className="px-12 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-gray-100 hover:text-black transition-all">Cancel</button>
          {!isView && (
            <button 
                onClick={() => onSave(form)} 
                className="px-16 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white bg-black rounded-2xl hover:bg-gray-900 shadow-xl shadow-black/20 transition-all active:scale-95 flex items-center gap-3"
            >
                <Save size={18} strokeWidth={2.5} /> Simpan Data
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
