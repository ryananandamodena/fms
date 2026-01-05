
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Save, Car, Shield, FileText, Briefcase, MapPin, DollarSign, UploadCloud, Trash2, Calendar, User, Info, CheckCircle2, Clock, GitBranch, Image as ImageIcon, Calculator, TrendingDown, TrendingUp } from 'lucide-react';
import { VehicleRecord, GeneralMasterItem } from '../types';
import { sendApprovalNotification, processApprovalNotification, getApproversForModule } from '../services/notificationService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<VehicleRecord>) => void;
  initialData?: VehicleRecord;
  mode?: 'create' | 'edit' | 'view';
  brandList?: GeneralMasterItem[];
  colorList?: GeneralMasterItem[];
  channelList?: GeneralMasterItem[];
  branchList?: GeneralMasterItem[];
}

type DocKeys = 'stnk' | 'kir' | 'front' | 'rear' | 'right' | 'left';

export const VehicleModal: React.FC<Props> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    initialData, 
    mode = 'create',
    brandList = [],
    colorList = [],
    channelList = [],
    branchList = []
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadKey, setActiveUploadKey] = useState<DocKeys | null>(null);
  
  const [docPreviews, setDocPreviews] = useState<{ [key in DocKeys]: string | null }>({
      stnk: null,
      kir: null,
      front: null,
      rear: null,
      right: null,
      left: null
  });

  const [activeTab, setActiveTab] = useState('INFORMASI');
  const [form, setForm] = useState<Partial<VehicleRecord>>({
    status: 'Aktif',
    ownership: 'Milik Modena',
    channel: '',
    cabang: '',
    approvalStatus: 'Pending',
    depreciationMethod: 'Garis Lurus (Straight Line)',
    usefulLife: 4, // Default 4 years
    residualValue: '0'
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm(initialData);
        setDocPreviews({
            stnk: initialData.stnkUrl || null,
            kir: initialData.kirUrl || null,
            front: initialData.photoFront || null,
            rear: initialData.photoRear || null,
            right: initialData.photoRight || null,
            left: initialData.photoLeft || null
        });
      } else {
        setForm({ 
            status: 'Aktif', 
            ownership: 'Milik Modena', 
            channel: '', 
            cabang: '',
            approvalStatus: 'Pending',
            depreciationMethod: 'Garis Lurus (Straight Line)',
            usefulLife: 4,
            residualValue: '0'
        });
        setDocPreviews({ stnk: null, kir: null, front: null, rear: null, right: null, left: null });
      }
      setActiveTab('INFORMASI');
    }
  }, [isOpen, initialData]);

  // Calculate Depreciation Logic
  const depreciationData = useMemo(() => {
      const price = parseInt(form.hargaBeli || '0') || 0;
      const residual = parseInt(form.residualValue || '0') || 0;
      const years = form.usefulLife || 4;
      
      const depreciableAmount = Math.max(0, price - residual);
      const yearlyDep = depreciableAmount / years;
      const monthlyDep = yearlyDep / 12;

      let accumulatedDep = 0;
      let monthsPassed = 0;

      if (form.tglBeli) {
          const start = new Date(form.tglBeli);
          const now = new Date();
          const diffTime = Math.abs(now.getTime() - start.getTime());
          monthsPassed = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30)); 
          
          // Cap months passed at useful life * 12
          const maxMonths = years * 12;
          const effectiveMonths = Math.min(monthsPassed, maxMonths);
          
          accumulatedDep = effectiveMonths * monthlyDep;
      }

      const netBookValue = Math.max(price - accumulatedDep, residual);

      return {
          yearlyDep,
          monthlyDep,
          accumulatedDep,
          netBookValue,
          monthsPassed: Math.floor(monthsPassed/12) + " Thn " + (monthsPassed % 12) + " Bln"
      };
  }, [form.hargaBeli, form.residualValue, form.usefulLife, form.tglBeli]);

  if (!isOpen) return null;

  const isView = mode === 'view';

  const handleUploadClick = (key: DocKeys) => {
      if (!isView) {
          setActiveUploadKey(key);
          setTimeout(() => fileInputRef.current?.click(), 0);
      }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && activeUploadKey) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              setDocPreviews(prev => ({ ...prev, [activeUploadKey]: ev.target?.result as string }));
          };
          reader.readAsDataURL(file);
      }
      // Reset input to allow re-uploading same file if needed
      e.target.value = ''; 
  }

  const handleRemoveImage = (e: React.MouseEvent, key: DocKeys) => {
      e.stopPropagation();
      setDocPreviews(prev => ({ ...prev, [key]: null }));
  }

  const handleSave = async () => {
      const updatedData: Partial<VehicleRecord> = {
          ...form,
          stnkUrl: docPreviews.stnk || undefined,
          kirUrl: docPreviews.kir || undefined,
          photoFront: docPreviews.front || undefined,
          photoRear: docPreviews.rear || undefined,
          photoRight: docPreviews.right || undefined,
          photoLeft: docPreviews.left || undefined,
      };
      
      // Send approval notification if creating new or status is pending
      if (mode === 'create' || form.approvalStatus === 'Pending' || form.approvalStatus === 'Pending Approval') {
          try {
              const approvers = await getApproversForModule('VEHICLE', form.cabang);
              if (approvers.length > 0) {
                  await sendApprovalNotification({
                      module: 'VEHICLE',
                      requestId: form.id?.toString() || `NEW-${Date.now()}`,
                      requestNo: form.noPolisi || 'NEW',
                      requestTitle: `${form.nama || 'Kendaraan Baru'} - ${form.noPolisi || ''}`,
                      requestType: mode === 'create' ? 'NEW' : 'UPDATE',
                      requester: {
                          id: 1, // Current user ID - get from auth context
                          name: 'Ibnu Faisal', // Current user name
                          email: 'ibnu.faisal@modena.com',
                          department: 'Facility Management',
                          branch: form.cabang,
                      },
                      approvers,
                      details: {
                          'No Polisi': form.noPolisi || '-',
                          'Merek': form.merek || '-',
                          'Tipe': form.tipeKendaraan || '-',
                          'Channel': form.channel || '-',
                          'Cabang': form.cabang || '-',
                      },
                  });
              }
          } catch (error) {
              console.error('Failed to send notification:', error);
          }
      }
      
      onSave(updatedData);
  }

  const SectionHeader = ({ title, sub, icon: Icon }: { title: string, sub?: string, icon?: any }) => (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="w-1.5 h-6 bg-black rounded-full shadow-sm"></div>
        <div>
            <h3 className="text-[12px] font-black text-black uppercase tracking-[0.2em] leading-none">{title}</h3>
            {sub && <p className="text-[9px] font-bold text-gray-400 uppercase mt-1.5 tracking-widest">{sub}</p>}
        </div>
      </div>
      {Icon && <div className="bg-black text-white p-2 rounded-xl shadow-lg"><Icon size={16} /></div>}
    </div>
  );

  const Label = ({ children, required }: { children?: React.ReactNode, required?: boolean }) => (
    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2.5">
      {children} {required && <span className="text-red-500 font-black ml-0.5">*</span>}
    </label>
  );

  const InputField = ({ label, value, field, type = "text", disabled = false, placeholder = "", className = "", required = false }: any) => (
    <div className={className}>
      <Label required={required}>{label}</Label>
      <input 
        type={type} 
        disabled={isView || disabled}
        className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-[12px] font-black text-black focus:border-black outline-none disabled:bg-gray-50 disabled:text-gray-400 transition-all placeholder:text-gray-200 shadow-sm"
        value={value || ''}
        placeholder={placeholder}
        onChange={(e) => setForm({...form, [field]: e.target.value})}
      />
    </div>
  );

  // New Select using Master Data
  const MasterSelectField = ({ label, value, field, dataList, required = false }: any) => (
    <div>
        <Label required={required}>{label}</Label>
        <div className="relative">
            <select
                disabled={isView}
                className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-[12px] font-black text-black focus:border-black outline-none disabled:bg-gray-50 appearance-none shadow-sm transition-all cursor-pointer uppercase"
                value={value || ''}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            >
                <option value="">(PILIH {label})</option>
                {dataList.map((item: GeneralMasterItem) => (
                    <option key={item.id} value={item.name}>{item.name}</option>
                ))}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
            </div>
        </div>
    </div>
  );

  const UploadBox = ({ label, uploadKey, icon: Icon = UploadCloud }: { label: string, uploadKey: DocKeys, icon?: any }) => {
      const preview = docPreviews[uploadKey];
      return (
        <div className="flex flex-col h-full">
            <Label>{label}</Label>
            <div 
                onClick={() => handleUploadClick(uploadKey)}
                className={`relative flex-1 border-2 border-dashed rounded-[1.5rem] flex flex-col items-center justify-center transition-all overflow-hidden bg-white min-h-[160px]
                  ${preview ? 'border-gray-200' : 'border-gray-100 hover:border-black hover:bg-gray-50/50'}
                  ${!isView ? 'cursor-pointer' : 'cursor-default'}
                `}
            >
                {preview ? (
                  <div className="relative w-full h-full group flex items-center justify-center">
                      <img src={preview} alt={label} className="w-full h-full object-contain p-2" />
                      {!isView && (
                          <button 
                              onClick={(e) => handleRemoveImage(e, uploadKey)}
                              className="absolute top-3 right-3 bg-black text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                              <Trash2 size={14} />
                          </button>
                      )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center p-4 text-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm border border-gray-100 transition-all mb-3 bg-white`}>
                          <Icon size={18} className="text-gray-300" />
                      </div>
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-relaxed">
                          {isView ? 'No Image' : 'Upload'}
                      </p>
                  </div>
                )}
            </div>
        </div>
      );
  };

  const tabs = ['INFORMASI', 'DOKUMEN', 'WORKFLOW'];

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm p-4 overflow-hidden">
      <div className="bg-[#FBFBFB] w-full max-w-[1300px] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden max-h-[95vh] animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-10 py-8 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-5">
            <div className="p-3.5 bg-black rounded-2xl shadow-xl shadow-black/20 text-white">
                <Car size={22} strokeWidth={2.5} />
            </div>
            <div>
                <h2 className="text-[18px] font-black text-black uppercase tracking-tight leading-none">
                   {mode === 'edit' ? 'Perbarui Data Aset' : mode === 'view' ? 'Rincian Aset Kendaraan' : 'Input Data Aset Kendaraan'}
                </h2>
                <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-[0.3em]">Vehicle Asset & Database Management</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-black transition-all p-2 rounded-full hover:bg-gray-50">
            <X size={28} strokeWidth={2.5} />
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-100 flex px-10 shrink-0 gap-8">
            {tabs.map(tab => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-[3px] 
                        ${activeTab === tab ? 'border-black text-black' : 'border-transparent text-gray-300 hover:text-gray-500'}`}
                >
                    {tab}
                </button>
            ))}
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-[#FBFBFB]">
          
          {activeTab === 'INFORMASI' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Column */}
                <div className="space-y-12">
                {/* Card 1: ASSET SETUP */}
                <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-black opacity-5"></div>
                    <SectionHeader title="ASSET SETUP" sub="General Asset Information" />
                    <div className="grid grid-cols-1 gap-8">
                    <div>
                        <Label required>Flagging Kepemilikan</Label>
                        <div className="flex gap-4">
                            {['Milik Modena', 'Sewa'].map(type => {
                                const isSelected = form.ownership === type;
                                return (
                                    <button
                                        key={type}
                                        onClick={() => !isView && setForm({...form, ownership: type as any})}
                                        disabled={isView}
                                        className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl border transition-all 
                                            ${isSelected 
                                                ? 'bg-black text-white border-black shadow-lg scale-[1.02]' 
                                                : 'bg-white text-gray-400 border-gray-200 hover:border-black hover:text-black'}`}
                                    >
                                        {type}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <InputField label="No. Polisi" value={form.noPolisi} field="noPolisi" required placeholder="B 1234 ABC" />
                    <InputField label="Deskripsi Unit" value={form.nama} field="nama" placeholder="Toyota Avanza 1.3 CVT..." required />
                    </div>
                </div>

                {/* Card 2: VEHICLE SPECIFICATION */}
                <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm">
                    <SectionHeader title="VEHICLE SPECIFICATION" sub="Core Unit Details" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <MasterSelectField label="Merek" value={form.merek} field="merek" dataList={brandList} />
                    <InputField label="Tipe Kendaraan" value={form.tipeKendaraan} field="tipeKendaraan" placeholder="AVANZA" />
                    
                    <InputField label="Model" value={form.model} field="model" placeholder="A/T" />
                    <InputField label="Tahun Pembuatan" value={form.tahunPembuatan} field="tahunPembuatan" placeholder="2022" />
                    
                    <MasterSelectField label="Warna" value={form.warna} field="warna" dataList={colorList} />
                    <InputField label="Isi Silinder" value={form.isiSilinder} field="isiSilinder" placeholder="1329 CC" />
                    
                    <InputField label="No. Rangka" value={form.noRangka} field="noRangka" placeholder="Input nomor rangka..." />
                    <InputField label="No. Mesin" value={form.noMesin} field="noMesin" placeholder="Input nomor mesin..." />
                    </div>
                </div>

                {/* Card 3: ALLOCATION & USAGE */}
                <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm">
                    <SectionHeader title="ALLOCATION & USAGE" sub="Assigned Dept & User" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <Label>Channel</Label>
                        <select 
                            className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-[12px] font-black outline-none disabled:bg-gray-50 uppercase cursor-pointer"
                            disabled={isView} 
                            value={form.channel || ''} 
                            onChange={e => setForm({...form, channel: e.target.value})}
                        >
                            <option value="">(PILIH CHANNEL)</option>
                            {channelList.map((c) => (
                                <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label>Dept / Cabang</Label>
                        <select 
                            className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-[12px] font-black outline-none disabled:bg-gray-50 uppercase cursor-pointer"
                            disabled={isView} 
                            value={form.cabang || ''} 
                            onChange={e => setForm({...form, cabang: e.target.value})}
                        >
                            <option value="">(PILIH CABANG)</option>
                            {branchList.map((b) => (
                                <option key={b.id} value={b.name}>{b.name}</option>
                            ))}
                        </select>
                    </div>
                    <InputField label="Pengguna Utama" value={form.pengguna} field="pengguna" placeholder="Full Name" className="md:col-span-2" />
                    </div>
                </div>
                </div>

                {/* Right Column */}
                <div className="space-y-12">
                
                {/* Card 4: LEGAL DOCUMENTS */}
                <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm">
                    <SectionHeader title="LEGAL DOCUMENTS" sub="Validity & Numbers" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InputField label="No. BPKB" value={form.noBpkb} field="noBpkb" placeholder="S-03714594" className="md:col-span-2" />
                    <InputField label="BPKB Remarks" value={form.keteranganBpkb} field="keteranganBpkb" className="md:col-span-2" placeholder="Masukan catatan BPKB..." />
                    
                    <InputField label="Masa Berlaku STNK (1Y)" value={form.masaBerlaku1} field="masaBerlaku1" type="date" />
                    <InputField label="Masa Berlaku STNK (5Y)" value={form.masaBerlaku5} field="masaBerlaku5" type="date" />
                    <InputField label="Masa Berlaku KIR" value={form.masaBerlakuKir} field="masaBerlakuKir" type="date" className="md:col-span-2" />
                    </div>
                </div>

                {/* Card 5: PURCHASE & INSURANCE */}
                <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm">
                    <SectionHeader title="PURCHASE & INSURANCE" sub="Financial Tracking" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InputField label="Tgl Beli / Serah Terima" value={form.tglBeli} field="tglBeli" type="date" />
                    <div className="relative">
                        <Label>Harga Beli (IDR)</Label>
                        <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300">RP</span>
                        <input 
                            type="number" 
                            className="w-full bg-white border border-gray-100 rounded-2xl pl-10 pr-6 py-4 text-[13px] font-black text-black focus:border-black outline-none shadow-sm transition-all"
                            value={form.hargaBeli || ''}
                            onChange={(e) => setForm({...form, hargaBeli: e.target.value})}
                            disabled={isView}
                            placeholder="0"
                        />
                        </div>
                    </div>
                    <InputField label="No Polis Asuransi" value={form.noPolisAsuransi} field="noPolisAsuransi" className="md:col-span-2" placeholder="Input nomor polis..." />
                    <InputField label="Jangka Pertanggungan" value={form.jangkaPertanggungan} field="jangkaPertanggungan" type="date" className="md:col-span-2" />
                    </div>
                </div>

                {/* Card 6: DEPRECIATION & VALUE (NEW) */}
                <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
                    <SectionHeader title="DEPRECIATION & VALUE" sub="Accounting & Asset Management" icon={Calculator} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <Label>Metode Penyusutan</Label>
                            <select 
                                disabled={isView}
                                className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-[13px] font-black outline-none"
                                value={form.depreciationMethod}
                                onChange={(e) => setForm({...form, depreciationMethod: e.target.value})}
                            >
                                <option value="Garis Lurus (Straight Line)">Garis Lurus (Straight Line)</option>
                                <option value="Saldo Menurun (Declining)">Saldo Menurun (Declining)</option>
                            </select>
                        </div>
                        <div>
                            <Label>Masa Manfaat (Tahun)</Label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-[13px] font-black outline-none"
                                    value={form.usefulLife}
                                    onChange={(e) => setForm({...form, usefulLife: parseInt(e.target.value) || 0})}
                                    disabled={isView}
                                />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300 uppercase">Years</span>
                            </div>
                        </div>
                        
                        <div>
                            <Label>Nilai Residu (IDR)</Label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300">RP</span>
                                <input 
                                    type="number" 
                                    className="w-full bg-white border border-gray-100 rounded-2xl pl-10 pr-6 py-4 text-[13px] font-black outline-none"
                                    value={form.residualValue}
                                    onChange={(e) => setForm({...form, residualValue: e.target.value})}
                                    disabled={isView}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col justify-center">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Monthly Dep.</span>
                                <span className="text-[13px] font-black text-black">Rp {Math.round(depreciationData.monthlyDep).toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Yearly Dep.</span>
                                <span className="text-[13px] font-black text-black">Rp {Math.round(depreciationData.yearlyDep).toLocaleString('id-ID')}</span>
                            </div>
                        </div>

                        {/* Results Highlight */}
                        <div className="md:col-span-2 bg-gray-50 rounded-[1.5rem] p-8 flex items-center justify-between border border-gray-100">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Akumulasi Penyusutan</p>
                                <h4 className="text-[18px] font-black text-red-500 font-mono">- Rp {Math.round(depreciationData.accumulatedDep).toLocaleString('id-ID')}</h4>
                                <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 font-medium">
                                    <Clock size={12} /> Masa Pakai: {depreciationData.monthsPassed}
                                </div>
                            </div>
                            <div className="h-12 w-[1px] bg-gray-200 mx-6"></div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">Nilai Buku Saat Ini (Net Book Value)</p>
                                <h4 className="text-[24px] font-black text-black font-mono">Rp {Math.round(depreciationData.netBookValue).toLocaleString('id-ID')}</h4>
                            </div>
                        </div>

                        {/* Schedule Table Preview (Simple) */}
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText size={14} className="text-black"/>
                                <span className="text-[10px] font-black text-black uppercase tracking-widest">Schedule Penyusutan (Preview)</span>
                            </div>
                            <div className="overflow-hidden rounded-xl border border-gray-100">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                        <tr>
                                            <th className="p-3">Periode</th>
                                            <th className="p-3 text-right">Beban Penyusutan</th>
                                            <th className="p-3 text-right">Akumulasi</th>
                                            <th className="p-3 text-right">Nilai Buku</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-[10px] font-medium text-gray-600">
                                        {form.hargaBeli && form.tglBeli ? (
                                            <>
                                                <tr className="border-b border-gray-50">
                                                    <td className="p-3">Year 1</td>
                                                    <td className="p-3 text-right">{Math.round(depreciationData.yearlyDep).toLocaleString('id-ID')}</td>
                                                    <td className="p-3 text-right">{Math.round(depreciationData.yearlyDep).toLocaleString('id-ID')}</td>
                                                    <td className="p-3 text-right">{Math.round(parseInt(form.hargaBeli) - depreciationData.yearlyDep).toLocaleString('id-ID')}</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-3">Year 2</td>
                                                    <td className="p-3 text-right">{Math.round(depreciationData.yearlyDep).toLocaleString('id-ID')}</td>
                                                    <td className="p-3 text-right">{Math.round(depreciationData.yearlyDep * 2).toLocaleString('id-ID')}</td>
                                                    <td className="p-3 text-right">{Math.round(parseInt(form.hargaBeli) - (depreciationData.yearlyDep * 2)).toLocaleString('id-ID')}</td>
                                                </tr>
                                            </>
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="p-4 text-center text-gray-300 italic">Lengkapi data harga beli & masa manfaat untuk melihat jadwal</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                </div>
            </div>
          )}

          {activeTab === 'DOKUMEN' && (
              <div className="space-y-12">
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  
                  {/* Section 1: Legal Documents */}
                  <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm">
                      <SectionHeader title="LEGAL DOCUMENTS" sub="STNK & KIR Attachments" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <UploadBox label="STNK Document" uploadKey="stnk" icon={FileText} />
                          <UploadBox label="KIR Document" uploadKey="kir" icon={FileText} />
                      </div>
                  </div>

                  {/* Section 2: Vehicle Physical Check */}
                  <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm">
                      <SectionHeader title="VEHICLE PHYSICAL CHECK" sub="4-Side Body Photos" />
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <UploadBox label="Tampak Depan" uploadKey="front" icon={ImageIcon} />
                          <UploadBox label="Tampak Belakang" uploadKey="rear" icon={ImageIcon} />
                          <UploadBox label="Samping Kanan" uploadKey="right" icon={ImageIcon} />
                          <UploadBox label="Samping Kiri" uploadKey="left" icon={ImageIcon} />
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'WORKFLOW' && (
              <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="absolute left-[63px] top-12 bottom-12 w-[2px] bg-gray-100"></div>
                        <div className="space-y-10 relative z-10">
                            {/* Step 1: Created */}
                            <div className="flex gap-8">
                                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shadow-lg shadow-black/20 shrink-0">
                                    <FileText size={20} strokeWidth={3} />
                                </div>
                                <div className="pt-2">
                                    <h4 className="text-[13px] font-black text-black uppercase tracking-tight">Request Created</h4>
                                    <p className="text-[11px] text-gray-400 mt-1">Submitted by User on {new Date().toLocaleDateString()}</p>
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
                                     form.approvalStatus === 'Rejected' ? <X size={20} /> : <Clock size={20} />}
                                </div>
                                <div className="pt-2 flex-1">
                                    <h4 className="text-[13px] font-black text-black uppercase tracking-tight">Status: {form.approvalStatus}</h4>
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        {form.approvalStatus === 'Approved' ? 'Approved by Manager' : 
                                         form.approvalStatus === 'Rejected' ? 'Rejected by Manager' : 'Currently pending review'}
                                    </p>
                                </div>
                            </div>
                        </div>
                  </div>

                  {/* Workflow Action Buttons */}
                  {form.approvalStatus === 'Pending Approval' && (
                      <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                          <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6">Workflow Action</h4>
                          <div className="flex items-center gap-4">
                              <button 
                                  onClick={async () => {
                                      setForm({...form, approvalStatus: 'Approved'});
                                      // Send notification to requester
                                      await processApprovalNotification({
                                          module: 'VEHICLE',
                                          requestId: form.id?.toString() || '',
                                          requestNo: form.noPolisi,
                                          requestTitle: `${form.nama} - ${form.noPolisi}`,
                                          action: 'Approved',
                                          approver: {
                                              id: 1, // Current user ID
                                              name: 'Ibnu Faisal',
                                              email: 'ibnu.faisal@modena.com',
                                              role: 'Facility Manager',
                                          },
                                          requester: {
                                              id: 1, // Original requester ID
                                              name: 'Requester Name',
                                              email: 'requester@modena.com',
                                          },
                                      });
                                  }}
                                  className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-green-500/20"
                              >
                                  <CheckCircle2 size={18} strokeWidth={3} />
                                  Approve
                              </button>
                              <button 
                                  onClick={async () => {
                                      setForm({...form, approvalStatus: 'Rejected'});
                                      // Send notification to requester
                                      await processApprovalNotification({
                                          module: 'VEHICLE',
                                          requestId: form.id?.toString() || '',
                                          requestNo: form.noPolisi,
                                          requestTitle: `${form.nama} - ${form.noPolisi}`,
                                          action: 'Rejected',
                                          comment: 'Ditolak oleh approver',
                                          approver: {
                                              id: 1,
                                              name: 'Ibnu Faisal',
                                              email: 'ibnu.faisal@modena.com',
                                              role: 'Facility Manager',
                                          },
                                          requester: {
                                              id: 1,
                                              name: 'Requester Name',
                                              email: 'requester@modena.com',
                                          },
                                      });
                                  }}
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

        {/* Global Footer */}
        <div className="px-10 py-8 bg-white border-t border-gray-100 flex justify-between items-center shrink-0">
          <button onClick={onClose} className="px-12 py-4 text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 hover:text-black transition-all bg-gray-50 rounded-2xl active:scale-95">Batal</button>
          {!isView && (
            <button onClick={handleSave} className="bg-black text-white px-20 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] hover:bg-gray-800 transition-all active:scale-95 shadow-2xl shadow-black/20 flex items-center gap-4">
              <Save size={18} strokeWidth={2.5} /> {mode === 'create' ? 'Ajukan Data Aset' : 'Simpan Perubahan'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
