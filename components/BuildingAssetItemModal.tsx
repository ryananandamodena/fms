
import React, { useState, useEffect, useRef } from 'react';
import { 
    X, Save, Box, MapPin, Tag, Activity, FileText, 
    GitBranch, Users, Plus, UploadCloud, Download, 
    Trash2, CheckCircle2, Clock, AlertCircle, Calendar,
    DollarSign, FileCheck, QrCode, Building, Edit3, Briefcase, TrendingUp,
    Image as ImageIcon, Paperclip, User
} from 'lucide-react';
import { BuildingAssetRecord, MaintenanceProposal, BuildingRecord, GeneralMasterItem, VendorRecord } from '../types';
import { SearchableSelect, SelectOption } from './SearchableSelect';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<BuildingAssetRecord>) => void;
  initialData?: BuildingAssetRecord | null;
  mode?: 'create' | 'edit' | 'view';
  buildingList?: BuildingRecord[];
  assetTypeList?: GeneralMasterItem[];
  vendorList?: VendorRecord[];
}

// Extend MaintenanceProposal locally to include the new file fields if not in global types yet
interface ExtendedProposal extends MaintenanceProposal {
    unitPhoto?: string;
    proposalDoc?: string;
}

export const BuildingAssetItemModal: React.FC<Props> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    initialData, 
    mode = 'create',
    buildingList = [],
    assetTypeList = [],
    vendorList = []
}) => {
  const [activeTab, setActiveTab] = useState('GENERAL INFO');
  const [form, setForm] = useState<Partial<BuildingAssetRecord>>({
    assetCode: '[AUTO]',
    status: 'Good',
    approvalStatus: 'Approved',
    maintenanceFrequency: 'Quarterly',
    ownership: 'Own',
    buildingName: '',
    proposals: [],
    pic: '',
    purchasePrice: '',
    purchaseDate: ''
  });

  // Document States (Global Tab)
  const photoInputRef = useRef<HTMLInputElement>(null);
  const proposalInputRef = useRef<HTMLInputElement>(null);
  const [docPreviews, setDocPreviews] = useState<{ photo: string | null, proposal: string | null }>({
      photo: null,
      proposal: null
  });

  // State for Proposal CRUD
  const [isEditingProposal, setIsEditingProposal] = useState(false);
  const [currentProposal, setCurrentProposal] = useState<Partial<ExtendedProposal>>({
      vendorName: '',
      proposalName: '',
      estimatedCost: '',
      status: 'Pending',
      submissionDate: new Date().toISOString().split('T')[0],
      unitPhoto: '',
      proposalDoc: ''
  });

  // Refs for Proposal Specific Uploads
  const propUnitPhotoRef = useRef<HTMLInputElement>(null);
  const propDocRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm(initialData);
        // Mocking document data from initialData if available (mapping attachmentUrl)
        setDocPreviews({
            photo: initialData.attachmentUrl || null, 
            proposal: null // In real app, this would map to a specific field
        });
      } else {
        setForm({
            assetCode: '[AUTO]',
            status: 'Good',
            approvalStatus: 'Approved',
            maintenanceFrequency: 'Quarterly',
            ownership: 'Own',
            buildingName: '',
            proposals: [],
            pic: '',
            purchasePrice: '',
            purchaseDate: ''
        });
        setDocPreviews({ photo: null, proposal: null });
      }
      setIsEditingProposal(false);
      setActiveTab('GENERAL INFO');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const isView = mode === 'view';
  const tabs = ['GENERAL INFO', 'PROPOSAL & VENDOR', 'WORKFLOW', 'DOKUMEN'];

  // --- File Handlers (Global Tab) ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'proposal') => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              setDocPreviews(prev => ({ ...prev, [type]: ev.target?.result as string }));
          };
          reader.readAsDataURL(file);
      }
      e.target.value = '';
  };

  const handleRemoveFile = (e: React.MouseEvent, type: 'photo' | 'proposal') => {
      e.stopPropagation();
      setDocPreviews(prev => ({ ...prev, [type]: null }));
  };

  // --- Proposal CRUD Handlers ---
  const handleAddProposal = () => {
      setCurrentProposal({
          id: '',
          vendorName: '',
          proposalName: '',
          estimatedCost: '',
          status: 'Pending',
          submissionDate: new Date().toISOString().split('T')[0],
          unitPhoto: '',
          proposalDoc: ''
      });
      setIsEditingProposal(true);
  };

  const handleEditProposal = (proposal: MaintenanceProposal) => {
      setCurrentProposal(proposal as ExtendedProposal);
      setIsEditingProposal(true);
  };

  const handleDeleteProposal = (id: string) => {
      if(window.confirm('Are you sure you want to remove this proposal?')) {
          setForm(prev => ({
              ...prev,
              proposals: prev.proposals?.filter(p => p.id !== id)
          }));
      }
  };

  const handleProposalUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'unitPhoto' | 'proposalDoc') => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              setCurrentProposal(prev => ({ ...prev, [field]: ev.target?.result as string }));
          };
          reader.readAsDataURL(file);
      }
      e.target.value = '';
  };

  const removeProposalFile = (e: React.MouseEvent, field: 'unitPhoto' | 'proposalDoc') => {
      e.stopPropagation();
      setCurrentProposal(prev => ({ ...prev, [field]: '' }));
  };

  const handleSaveProposalEntry = () => {
      if (!currentProposal.vendorName || !currentProposal.estimatedCost) {
          alert('Please fill in Vendor Name and Estimated Cost');
          return;
      }

      const newProposal: MaintenanceProposal = {
          ...currentProposal as MaintenanceProposal,
          id: currentProposal.id || `PROP-${Date.now()}`
      };

      const existingProposals = form.proposals || [];
      const index = existingProposals.findIndex(p => p.id === newProposal.id);
      
      let updatedProposals;
      if (index >= 0) {
          updatedProposals = [...existingProposals];
          updatedProposals[index] = newProposal;
      } else {
          updatedProposals = [...existingProposals, newProposal];
      }

      setForm(prev => ({ ...prev, proposals: updatedProposals }));
      setIsEditingProposal(false);
  };

  const Label = ({ children, required }: { children?: React.ReactNode, required?: boolean }) => (
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2.5">
      {children} {required && <span className="text-red-500 font-black ml-0.5">*</span>}
    </label>
  );

  const InputField = ({ label, value, field, type = "text", disabled = false, placeholder = "", icon: Icon }: any) => (
    <div className="relative">
      <Label>{label}</Label>
      <div className="relative">
        <input 
            type={type} 
            disabled={isView || disabled}
            className={`w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 ${Icon ? 'pl-12' : ''} text-[13px] font-black text-black focus:border-black outline-none disabled:bg-gray-50 disabled:text-gray-400 transition-all placeholder:text-gray-300 shadow-sm`}
            value={value || ''}
            placeholder={placeholder}
            onChange={(e) => setForm({...form, [field]: e.target.value})}
        />
        {Icon && <Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />}
      </div>
    </div>
  );

  // Helper to calculate average cost
  const calculateAverageCost = () => {
      if (!form.proposals || form.proposals.length === 0) return 0;
      const total = form.proposals.reduce((acc, curr) => {
          const val = parseInt(curr.estimatedCost.replace(/[^0-9]/g, '') || '0');
          return acc + val;
      }, 0);
      return total / form.proposals.length;
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FBFBFB] w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col transform transition-all scale-100 max-h-[95vh]">
        
        {/* Header */}
        <div className="px-12 py-8 bg-white flex items-center justify-between shrink-0 border-b border-gray-100">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-black rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-black/20">
                <Box size={28} strokeWidth={2.5} />
            </div>
            <div>
                <h2 className="text-[20px] font-black text-black uppercase tracking-tight leading-none">
                    {mode === 'create' ? 'Register Aset Baru' : mode === 'edit' ? 'Edit Aset Gedung' : 'Detail Aset Gedung'}
                </h2>
                <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-[0.3em]">Facility Equipment Management</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-black transition-all p-3 rounded-full hover:bg-gray-50">
            <X size={32} />
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-100 flex px-12 shrink-0 overflow-x-auto no-scrollbar gap-10">
            {tabs.map(tab => (
                <button 
                    key={tab}
                    onClick={() => { setActiveTab(tab); setIsEditingProposal(false); }}
                    className={`py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-[4px] relative
                        ${activeTab === tab ? 'border-black text-black' : 'border-transparent text-gray-300 hover:text-gray-500'}`}
                >
                    {tab}
                </button>
            ))}
        </div>

        {/* Content */}
        <div className="p-12 bg-[#FBFBFB] flex-1 overflow-y-auto custom-scrollbar">
            
            {/* TAB: GENERAL INFO */}
            {activeTab === 'GENERAL INFO' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Identity & QR Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Info */}
                        <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-2 bg-gray-50 rounded-xl"><Tag size={18} className="text-black"/></div>
                                <h3 className="text-[12px] font-black text-black uppercase tracking-[0.2em]">Identitas Aset</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InputField label="Nama Aset" value={form.assetName} field="assetName" placeholder="Contoh: AC Split Daikin 1PK" />
                                <InputField label="Kode Aset" value={form.assetCode} field="assetCode" disabled={true} />
                                
                                <div>
                                    <Label>Tipe Aset</Label>
                                    <select 
                                        disabled={isView}
                                        className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-[13px] font-black text-black focus:border-black outline-none disabled:bg-gray-50 shadow-sm cursor-pointer appearance-none uppercase"
                                        value={form.assetType || ''}
                                        onChange={(e) => setForm({...form, assetType: e.target.value})}
                                    >
                                        <option value="">Pilih Tipe</option>
                                        {assetTypeList.map(t => (
                                            <option key={t.id} value={t.name}>{t.name}</option>
                                        ))}
                                        {!assetTypeList.length && (
                                            <>
                                                <option value="AC">AC</option>
                                                <option value="APAR">APAR</option>
                                                <option value="CCTV">CCTV</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                                
                                <InputField label="Merek / Brand" value={form.brand} field="brand" placeholder="Daikin, Toto, dll" />
                                
                                {/* New Fields: Price & Date */}
                                <div className="relative">
                                    <Label>Harga Pembelian (IDR)</Label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">Rp</span>
                                        <input 
                                            type="number"
                                            disabled={isView}
                                            className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-5 py-4 text-[13px] font-black text-black focus:border-black outline-none disabled:bg-gray-50 transition-all placeholder:text-gray-300 shadow-sm"
                                            value={form.purchasePrice}
                                            onChange={(e) => setForm({...form, purchasePrice: e.target.value})}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <InputField label="Tanggal Pembelian" value={form.purchaseDate} field="purchaseDate" type="date" />

                                {/* New PIC Field */}
                                <div className="md:col-span-2">
                                    <InputField 
                                        label="PIC / Pengguna (Person In Charge)" 
                                        value={form.pic} 
                                        field="pic" 
                                        placeholder="Nama Penanggung Jawab / User" 
                                        icon={User}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Feature 1: QR Code Section */}
                        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                            <div className="w-32 h-32 bg-gray-900 rounded-2xl flex items-center justify-center text-white mb-6 shadow-2xl shadow-black/20 relative group overflow-hidden">
                                <QrCode size={64} />
                                <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Print</span>
                                </div>
                            </div>
                            <h3 className="text-[14px] font-black text-black uppercase tracking-tight">Digital Asset Tag</h3>
                            <p className="text-[10px] text-gray-400 mt-2 font-medium px-4">
                                Scan QR ini untuk akses history maintenance & lapor kerusakan.
                            </p>
                            <button className="mt-6 px-6 py-3 bg-gray-50 hover:bg-black hover:text-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl transition-all w-full flex items-center justify-center gap-2">
                                <Download size={14} /> Download QR
                            </button>
                        </div>
                    </div>

                    {/* Location & Status Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-2 bg-gray-50 rounded-xl"><MapPin size={18} className="text-black"/></div>
                                <h3 className="text-[12px] font-black text-black uppercase tracking-[0.2em]">Lokasi</h3>
                            </div>
                            <div className="space-y-6">
                                {/* Linked Data Dropdown */}
                                <div>
                                    <Label required>Lokasi Gedung / Cabang</Label>
                                    <SearchableSelect
                                        options={buildingList.length > 0 
                                            ? buildingList.map(building => ({
                                                value: building.name,
                                                label: building.name,
                                                subLabel: building.address
                                            }))
                                            : form.buildingName 
                                                ? [{ value: form.buildingName, label: form.buildingName }]
                                                : []
                                        }
                                        value={form.buildingName || ''}
                                        onChange={(val) => setForm({...form, buildingName: val})}
                                        placeholder="-- Pilih Lokasi Gedung --"
                                        disabled={isView}
                                        icon={Building}
                                        emptyMessage="Tidak ada data gedung"
                                    />
                                    <p className="text-[9px] text-gray-400 mt-2 font-medium ml-1">
                                        *Data gedung diambil dari modul Branch Improvement / Master Gedung
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <InputField label="Lantai" value={form.floor} field="floor" placeholder="Lantai 1" />
                                    <InputField label="Ruangan" value={form.roomName} field="roomName" placeholder="Lobby" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-2 bg-gray-50 rounded-xl"><Activity size={18} className="text-black"/></div>
                                <h3 className="text-[12px] font-black text-black uppercase tracking-[0.2em]">Kondisi</h3>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <Label>Kondisi Fisik</Label>
                                    <select 
                                        disabled={isView}
                                        className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-[13px] font-black text-black focus:border-black outline-none disabled:bg-gray-50 shadow-sm cursor-pointer appearance-none"
                                        value={form.status || ''}
                                        onChange={(e) => setForm({...form, status: e.target.value as any})}
                                    >
                                        <option value="Good">Good (Baik)</option>
                                        <option value="Fair">Fair (Cukup)</option>
                                        <option value="Critical">Critical (Rusak)</option>
                                        <option value="Maintenance">Under Maintenance</option>
                                    </select>
                                </div>
                                <div>
                                    <Label>Frekuensi Maintenance</Label>
                                    <select 
                                        disabled={isView}
                                        className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-[13px] font-black text-black focus:border-black outline-none disabled:bg-gray-50 shadow-sm cursor-pointer appearance-none"
                                        value={form.maintenanceFrequency || ''}
                                        onChange={(e) => setForm({...form, maintenanceFrequency: e.target.value as any})}
                                    >
                                        <option value="Monthly">Monthly (Bulanan)</option>
                                        <option value="Quarterly">Quarterly (3 Bulanan)</option>
                                        <option value="Yearly">Yearly (Tahunan)</option>
                                        <option value="None">None</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ... Other Tabs (PROPOSAL, WORKFLOW, DOKUMEN) remain the same ... */}
            {activeTab === 'PROPOSAL & VENDOR' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* ... (Previous content for Proposal tab) ... */}
                    {/* PERSISTENT ASSET CONTEXT BANNER */}
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-[#F8F9FA] rounded-2xl flex items-center justify-center border border-gray-100 text-black">
                                <Box size={28} strokeWidth={2} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-mono font-bold border border-blue-100">
                                        {form.assetCode || 'NO CODE'}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                        <MapPin size={10} /> {form.buildingName || 'Location Not Set'}
                                    </span>
                                </div>
                                <h3 className="text-[18px] font-black text-black uppercase tracking-tight leading-none">
                                    {form.assetName || 'Nama Aset Belum Diisi'}
                                </h3>
                                <p className="text-[11px] font-medium text-gray-500 mt-1">
                                    Kelola vendor dan proposal maintenance untuk aset ini.
                                </p>
                            </div>
                        </div>
                        
                        {/* Stats Summary */}
                        <div className="flex items-center gap-8 border-l border-gray-100 pl-8">
                             <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Total Vendor</p>
                                <div className="flex items-baseline gap-1">
                                    <Users size={14} className="text-black" />
                                    <p className="text-[20px] font-black text-black leading-none">{form.proposals?.length || 0}</p>
                                </div>
                             </div>
                             <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Avg. Cost Estimate</p>
                                <div className="flex items-baseline gap-1">
                                    <TrendingUp size={14} className="text-green-600" />
                                    <p className="text-[20px] font-black text-black leading-none font-mono">
                                        Rp {calculateAverageCost().toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                                    </p>
                                </div>
                             </div>
                        </div>
                    </div>

                    {!isEditingProposal ? (
                        <>
                            <div className="flex items-center justify-between mb-2 px-2">
                                <div>
                                    <h3 className="text-[14px] font-black text-black uppercase tracking-widest">Daftar Proposal Masuk</h3>
                                    <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-wider">Bandingkan harga dan layanan antar vendor</p>
                                </div>
                                {!isView && (
                                    <button 
                                        onClick={handleAddProposal}
                                        className="bg-black text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-all shadow-xl shadow-black/20"
                                    >
                                        <Plus size={14} strokeWidth={3} /> Tambah Vendor
                                    </button>
                                )}
                            </div>

                            {form.proposals && form.proposals.length > 0 ? (
                                <div className="grid grid-cols-1 gap-6">
                                    {form.proposals.map((prop, idx) => (
                                        <div key={prop.id || idx} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                            <div className="flex justify-between items-start">
                                                <div className="flex gap-6">
                                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-all">
                                                        <Users size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[14px] font-black text-black uppercase tracking-tight">{prop.vendorName}</h4>
                                                        <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wide">{prop.proposalName}</p>
                                                        <div className="flex items-center gap-4 mt-3">
                                                            <span className="text-[10px] font-mono font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded"><Calendar size={10} className="inline mr-1 mb-0.5"/> {prop.submissionDate}</span>
                                                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                                                                prop.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-orange-50 text-orange-600'
                                                            }`}>
                                                                {prop.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Estimasi Biaya</p>
                                                    <p className="text-[18px] font-black text-black font-mono">Rp {parseInt(prop.estimatedCost.replace(/[^0-9]/g, '') || '0').toLocaleString('id-ID')}</p>
                                                    <div className="flex gap-2 mt-4 justify-end">
                                                        <button 
                                                            onClick={() => handleEditProposal(prop)} 
                                                            className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-black transition-all" 
                                                            title="Edit"
                                                        >
                                                            <Edit3 size={16} />
                                                        </button>
                                                        {!isView && (
                                                            <button 
                                                                onClick={() => handleDeleteProposal(prop.id)} 
                                                                className="p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-500 transition-all" 
                                                                title="Remove"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white border-2 border-dashed border-gray-200 rounded-[2.5rem] p-16 flex flex-col items-center justify-center opacity-50">
                                    <Users size={48} className="text-gray-300 mb-4" />
                                    <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">Belum ada proposal vendor terdaftar</p>
                                </div>
                            )}
                        </>
                    ) : (
                        // --- EDIT FORM MODE ---
                        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
                                <Briefcase size={18} className="text-black"/>
                                <h3 className="text-[12px] font-black text-black uppercase tracking-widest">
                                    {currentProposal.id ? 'Edit Proposal Vendor' : 'Tambah Proposal Baru'}
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div>
                                    <Label required>Nama Vendor</Label>
                                    <div className="relative">
                                        <input 
                                            list="vendor-options"
                                            className="w-full bg-[#F8F9FA] border-none rounded-2xl px-5 py-4 text-[13px] font-black text-black outline-none focus:ring-2 focus:ring-black/5"
                                            value={currentProposal.vendorName}
                                            onChange={(e) => setCurrentProposal({...currentProposal, vendorName: e.target.value})}
                                            placeholder="Pilih atau ketik nama vendor..."
                                        />
                                        <datalist id="vendor-options">
                                            {vendorList.map(v => <option key={v.id} value={v.vendorName} />)}
                                        </datalist>
                                        <Users size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div>
                                    <Label required>Judul Pekerjaan / Proposal</Label>
                                    <input 
                                        type="text"
                                        className="w-full bg-[#F8F9FA] border-none rounded-2xl px-5 py-4 text-[13px] font-black text-black outline-none focus:ring-2 focus:ring-black/5"
                                        value={currentProposal.proposalName}
                                        onChange={(e) => setCurrentProposal({...currentProposal, proposalName: e.target.value})}
                                        placeholder="Contoh: Service AC Rutin"
                                    />
                                </div>

                                <div>
                                    <Label required>Estimasi Biaya (IDR)</Label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">Rp</span>
                                        <input 
                                            type="number"
                                            className="w-full bg-[#F8F9FA] border-none rounded-2xl pl-10 pr-5 py-4 text-[13px] font-black text-black outline-none focus:ring-2 focus:ring-black/5"
                                            value={currentProposal.estimatedCost}
                                            onChange={(e) => setCurrentProposal({...currentProposal, estimatedCost: e.target.value})}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>Tanggal Pengajuan</Label>
                                    <input 
                                        type="date"
                                        className="w-full bg-[#F8F9FA] border-none rounded-2xl px-5 py-4 text-[13px] font-black text-black outline-none focus:ring-2 focus:ring-black/5"
                                        value={currentProposal.submissionDate}
                                        onChange={(e) => setCurrentProposal({...currentProposal, submissionDate: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <Label>Status Proposal</Label>
                                    <select 
                                        className="w-full bg-[#F8F9FA] border-none rounded-2xl px-5 py-4 text-[13px] font-black text-black outline-none focus:ring-2 focus:ring-black/5 cursor-pointer appearance-none"
                                        value={currentProposal.status}
                                        onChange={(e) => setCurrentProposal({...currentProposal, status: e.target.value as any})}
                                    >
                                        <option value="Pending">Pending Review</option>
                                        <option value="Reviewing">Under Review</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>

                            {/* UPLOAD SECTION FOR PROPOSAL */}
                            <div className="pt-6 border-t border-gray-100 mb-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <FileText size={16} className="text-black"/>
                                    <h3 className="text-[12px] font-black text-black uppercase tracking-widest">DOKUMEN PENDUKUNG</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Unit Photo Upload */}
                                    <div>
                                        <Label>FOTO UNIT / ITEM</Label>
                                        <div 
                                            onClick={() => !isView && propUnitPhotoRef.current?.click()}
                                            className={`relative h-40 border-2 border-dashed rounded-[1.5rem] flex flex-col items-center justify-center overflow-hidden transition-all group
                                                ${currentProposal.unitPhoto ? 'border-gray-200' : 'border-gray-200 hover:border-black hover:bg-gray-50'}
                                                ${!isView ? 'cursor-pointer' : 'cursor-default'}
                                            `}
                                        >
                                            <input type="file" ref={propUnitPhotoRef} className="hidden" accept="image/*" onChange={(e) => handleProposalUpload(e, 'unitPhoto')} />
                                            {currentProposal.unitPhoto ? (
                                                <div className="relative w-full h-full">
                                                    <img src={currentProposal.unitPhoto} alt="Unit" className="w-full h-full object-cover" />
                                                    {!isView && (
                                                        <button 
                                                            onClick={(e) => removeProposalFile(e, 'unitPhoto')}
                                                            className="absolute top-3 right-3 bg-white/90 p-1.5 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-md backdrop-blur-sm"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center p-4">
                                                    <ImageIcon size={20} className="text-gray-300 mb-2 group-hover:text-black transition-colors" />
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase">Upload Foto</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Proposal Doc Upload */}
                                    <div>
                                        <Label>SURAT PENAWARAN (PDF/DOC)</Label>
                                        <div 
                                            onClick={() => !isView && propDocRef.current?.click()}
                                            className={`relative h-40 border-2 border-dashed rounded-[1.5rem] flex flex-col items-center justify-center overflow-hidden transition-all group
                                                ${currentProposal.proposalDoc ? 'border-green-100 bg-green-50/20' : 'border-gray-200 hover:border-black hover:bg-gray-50'}
                                                ${!isView ? 'cursor-pointer' : 'cursor-default'}
                                            `}
                                        >
                                            <input type="file" ref={propDocRef} className="hidden" accept=".pdf,.doc,.docx,.jpg,.png" onChange={(e) => handleProposalUpload(e, 'proposalDoc')} />
                                            {currentProposal.proposalDoc ? (
                                                <div className="relative w-full h-full flex flex-col items-center justify-center">
                                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mb-2 text-green-600 border border-green-100">
                                                        <FileText size={20} />
                                                    </div>
                                                    <p className="text-[9px] font-black text-green-700 uppercase tracking-widest">File Uploaded</p>
                                                    {!isView && (
                                                        <button 
                                                            onClick={(e) => removeProposalFile(e, 'proposalDoc')}
                                                            className="absolute top-3 right-3 bg-white p-1.5 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-md border border-gray-100"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center p-4">
                                                    <Paperclip size={20} className="text-gray-300 mb-2 group-hover:text-black transition-colors" />
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase">Upload Dokumen</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button 
                                    onClick={() => setIsEditingProposal(false)}
                                    className="px-8 py-3 rounded-xl bg-white border border-gray-200 text-[11px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
                                >
                                    Batal
                                </button>
                                <button 
                                    onClick={handleSaveProposalEntry}
                                    className="px-10 py-3 rounded-xl bg-black text-white text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg"
                                >
                                    Simpan Proposal
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB: WORKFLOW - Same as before */}
            {activeTab === 'WORKFLOW' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                        {/* Timeline Connector Line */}
                        <div className="absolute left-[63px] top-12 bottom-12 w-[2px] bg-gray-100"></div>

                        <div className="space-y-10 relative z-10">
                            {/* Step 1: Created */}
                            <div className="flex gap-8">
                                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shadow-lg shadow-black/20 shrink-0">
                                    <Plus size={20} strokeWidth={3} />
                                </div>
                                <div className="pt-2">
                                    <h4 className="text-[13px] font-black text-black uppercase tracking-tight">Asset Registered</h4>
                                    <p className="text-[11px] text-gray-400 mt-1">Created by Ibnu Faisal on 12 Jan 2024</p>
                                </div>
                            </div>

                            {/* Step 2: Approval Status */}
                            <div className="flex gap-8">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-lg ${
                                    form.approvalStatus === 'Approved' ? 'bg-green-500 text-white shadow-green-200' :
                                    form.approvalStatus === 'Rejected' ? 'bg-red-500 text-white shadow-red-200' :
                                    'bg-orange-500 text-white shadow-orange-200'
                                }`}>
                                    {form.approvalStatus === 'Approved' ? <CheckCircle2 size={20} /> : 
                                     form.approvalStatus === 'Rejected' ? <AlertCircle size={20} /> : <Clock size={20} />}
                                </div>
                                <div className="pt-2">
                                    <h4 className="text-[13px] font-black text-black uppercase tracking-tight">Status: {form.approvalStatus}</h4>
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        {form.approvalStatus === 'Approved' ? 'Approved by Manager on 13 Jan 2024' : 
                                         form.approvalStatus === 'Rejected' ? 'Rejected by Manager' : 'Currently pending review'}
                                    </p>
                                </div>
                            </div>

                            {/* Step 3: Latest Activity */}
                            <div className="flex gap-8">
                                <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center shrink-0 border-4 border-white">
                                    <GitBranch size={20} />
                                </div>
                                <div className="pt-2">
                                    <h4 className="text-[13px] font-black text-gray-400 uppercase tracking-tight">Maintenance Scheduled</h4>
                                    <p className="text-[11px] text-gray-300 mt-1">Next schedule: 20 Mar 2024</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Workflow Action Buttons */}
                    {(form.approvalStatus === 'Pending Approval' || form.approvalStatus === 'Draft') && (
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                            <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6">Workflow Action</h4>
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => setForm({...form, approvalStatus: 'Approved'})}
                                    className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-green-500/20"
                                >
                                    <CheckCircle2 size={18} strokeWidth={3} />
                                    Approve
                                </button>
                                <button 
                                    onClick={() => setForm({...form, approvalStatus: 'Rejected'})}
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

            {/* TAB: DOKUMEN - Same as before */}
            {activeTab === 'DOKUMEN' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <input type="file" ref={photoInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'photo')} />
                    <input type="file" ref={proposalInputRef} className="hidden" accept=".pdf,.doc,.docx,.jpg,.png" onChange={(e) => handleFileChange(e, 'proposal')} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Section 1: FOTO UNIT */}
                        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100">
                                <ImageIcon size={18} className="text-black"/>
                                <h3 className="text-[12px] font-black text-black uppercase tracking-widest">FOTO UNIT</h3>
                            </div>
                            
                            <div 
                                onClick={() => !isView && photoInputRef.current?.click()}
                                className={`flex-1 relative min-h-[250px] border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center overflow-hidden transition-all group
                                    ${docPreviews.photo ? 'border-gray-200' : 'border-gray-200 hover:border-black hover:bg-gray-50'}
                                    ${!isView ? 'cursor-pointer' : 'cursor-default'}
                                `}
                            >
                                {docPreviews.photo ? (
                                    <div className="relative w-full h-full">
                                        <img src={docPreviews.photo} alt="Foto Unit" className="w-full h-full object-cover" />
                                        {!isView && (
                                            <button 
                                                onClick={(e) => handleRemoveFile(e, 'photo')}
                                                className="absolute top-4 right-4 bg-white/90 p-2 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-md backdrop-blur-sm"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                                            Asset Preview
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center p-6 text-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-black group-hover:text-white transition-all duration-300">
                                            <ImageIcon size={24} />
                                        </div>
                                        <p className="text-[11px] font-black text-black uppercase tracking-widest mb-1">Belum ada Foto</p>
                                        {!isView && <p className="text-[9px] font-bold text-gray-400">Klik untuk upload foto unit</p>}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section 2: SURAT PENAWARAN */}
                        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100">
                                <FileText size={18} className="text-black"/>
                                <h3 className="text-[12px] font-black text-black uppercase tracking-widest">SURAT PENAWARAN</h3>
                            </div>

                            <div 
                                onClick={() => !isView && proposalInputRef.current?.click()}
                                className={`flex-1 relative min-h-[250px] border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center overflow-hidden transition-all group
                                    ${docPreviews.proposal ? 'border-green-100 bg-green-50/30' : 'border-gray-200 hover:border-black hover:bg-gray-50'}
                                    ${!isView ? 'cursor-pointer' : 'cursor-default'}
                                `}
                            >
                                {docPreviews.proposal ? (
                                    <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center">
                                        <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4 text-green-600 border border-green-100">
                                            <FileText size={40} />
                                        </div>
                                        <h4 className="text-[13px] font-black text-black uppercase tracking-tight line-clamp-1">Proposal_Document.pdf</h4>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Uploaded Successfully</p>
                                        
                                        {!isView && (
                                            <button 
                                                onClick={(e) => handleRemoveFile(e, 'proposal')}
                                                className="absolute top-4 right-4 bg-white p-2 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-md border border-gray-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center p-6 text-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-black group-hover:text-white transition-all duration-300">
                                            <Paperclip size={24} />
                                        </div>
                                        <p className="text-[11px] font-black text-black uppercase tracking-widest mb-1">Belum ada Dokumen</p>
                                        {!isView && <p className="text-[9px] font-bold text-gray-400">Upload PDF / Doc Penawaran</p>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>

        {/* Footer */}
        <div className="px-12 py-8 bg-white border-t border-gray-100 flex justify-end gap-4 shrink-0">
          <button onClick={onClose} className="px-12 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-gray-100 hover:text-black transition-all">Cancel</button>
          {!isView && (
            <button 
                onClick={() => onSave({ ...form, attachmentUrl: docPreviews.photo || undefined })} 
                className="px-16 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white bg-black rounded-2xl hover:bg-gray-900 shadow-xl shadow-black/20 transition-all active:scale-95 flex items-center gap-3"
            >
                <Save size={18} strokeWidth={2.5} /> Simpan Aset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
