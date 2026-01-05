
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MapPin, Building, Info, AlertTriangle, User, Package, Car, Tag, Filter, DollarSign, UploadCloud, Trash2, Image as ImageIcon, FileText, CheckSquare, CheckCircle2, Clock } from 'lucide-react';
import { MutationRecord, VehicleRecord, GeneralAssetRecord, BuildingAssetRecord } from '../types';
import { SearchableSelect, SelectOption } from './SearchableSelect';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<MutationRecord>) => void;
  initialData?: MutationRecord | null;
  mode?: 'create' | 'edit' | 'view';
  vehicleList?: VehicleRecord[];
  generalAssetList?: any[]; // Supports both GeneralAssetRecord and BuildingAssetRecord with sourceCategory
  assetType?: 'VEHICLE' | 'GENERAL_ASSET';
}

type DocKeys = 'front' | 'rear' | 'right' | 'left' | 'interior' | 'stnk';

export const MutationModal: React.FC<Props> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    initialData, 
    mode = 'create',
    vehicleList = [],
    generalAssetList = [],
    assetType = 'VEHICLE'
}) => {
  const [activeTab, setActiveTab] = useState('DETAILS');
  const [categoryFilter, setCategoryFilter] = useState('ALL'); // New State for Filter
  
  // Document Upload States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadKey, setActiveUploadKey] = useState<DocKeys | null>(null);
  const [docPreviews, setDocPreviews] = useState<{ [key in DocKeys]: string | null }>({
      front: null,
      rear: null,
      right: null,
      left: null,
      interior: null,
      stnk: null
  });

  const [form, setForm] = useState<Partial<MutationRecord>>({
    status: 'Draft',
    statusApproval: 'Pending',
    tglPermintaan: new Date().toISOString().split('T')[0],
    tipeMutasi: 'Permanent',
    picBefore: '',
    picAfter: '',
    assetType: assetType,
    biayaMutasi: '',
    checklistCondition: []
  });

  // Helper to find selected asset regardless of type
  const selectedVehicle = assetType === 'VEHICLE' ? vehicleList.find(v => v.noPolisi === form.noPolisi) : null;
  const selectedGeneralAsset = assetType === 'GENERAL_ASSET' 
    ? generalAssetList.find(a => (a.assetNumber === form.assetNumber) || (a.assetCode === form.assetNumber)) 
    : null;

  // Filter Logic
  const filteredGeneralAssets = generalAssetList.filter(asset => {
      if (categoryFilter === 'ALL') return true;
      return asset.sourceCategory === categoryFilter;
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm(initialData);
        // Load existing photos if available
        setDocPreviews({
            front: initialData.photoFront || null,
            rear: initialData.photoRear || null,
            right: initialData.photoRight || null,
            left: initialData.photoLeft || null,
            interior: initialData.photoInterior || null,
            stnk: initialData.documentStnk || null
        });
      } else {
        setForm({
            status: 'Draft',
            statusApproval: 'Pending',
            tglPermintaan: new Date().toISOString().split('T')[0],
            tipeMutasi: 'Permanent',
            noPolisi: '',
            assetNumber: '',
            assetName: '',
            lokasiAsal: '',
            lokasiTujuan: '',
            picBefore: '',
            picAfter: '',
            assetType: assetType,
            biayaMutasi: '',
            checklistCondition: []
        });
        setDocPreviews({ front: null, rear: null, right: null, left: null, interior: null, stnk: null });
        setCategoryFilter('ALL'); // Reset filter on open
      }
      setActiveTab('DETAILS');
    }
  }, [isOpen, initialData, assetType]);

  if (!isOpen) return null;

  const isView = mode === 'view';

  const handleVehicleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedNoPol = e.target.value;
      const vehicle = vehicleList.find(v => v.noPolisi === selectedNoPol);
      
      if (vehicle) {
          setForm(prev => ({
              ...prev,
              noPolisi: vehicle.noPolisi,
              cabangAset: vehicle.cabang,
              lokasiAsal: vehicle.cabang, // Auto-set origin to current branch
              picBefore: vehicle.pengguna || '' // Auto-set previous PIC if available
          }));
      } else {
          setForm(prev => ({ ...prev, noPolisi: selectedNoPol, cabangAset: '', lokasiAsal: '', picBefore: '' }));
      }
  };

  const handleGeneralAssetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedId = e.target.value;
      // Search by ID first (BuildingAssetRecord uses 'id'), then by Asset Number/Code
      const asset = generalAssetList.find(a => a.id === selectedId || a.assetNumber === selectedId || a.assetCode === selectedId);
      
      if (asset) {
          // Normalize data from different asset types (GeneralAssetRecord vs BuildingAssetRecord)
          const assetNumber = asset.assetNumber || asset.assetCode;
          const assetName = asset.assetName || asset.type; // BuildingAsset has assetName
          const location = asset.assetLocation || asset.buildingName; // BuildingAsset has buildingName
          const pic = asset.pic || '';

          setForm(prev => ({
              ...prev,
              assetNumber: assetNumber,
              assetName: assetName,
              cabangAset: location,
              lokasiAsal: asset.floor ? `${location} - ${asset.floor} (${asset.roomName})` : location, // Detailed location for Building Assets
              picBefore: pic
          }));
      } else {
          setForm(prev => ({ ...prev, assetNumber: selectedId, assetName: '', cabangAset: '', lokasiAsal: '', picBefore: '' }));
      }
  };

  // --- Upload Handlers ---
  const handleUploadClick = (key: DocKeys) => {
      if (!isView) {
          setActiveUploadKey(key);
          setTimeout(() => fileInputRef.current?.click(), 0);
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && activeUploadKey) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              setDocPreviews(prev => ({ ...prev, [activeUploadKey]: ev.target?.result as string }));
          };
          reader.readAsDataURL(file);
      }
      e.target.value = ''; // Reset input
  };

  const handleRemoveImage = (e: React.MouseEvent, key: DocKeys) => {
      e.stopPropagation();
      setDocPreviews(prev => ({ ...prev, [key]: null }));
  };

  const toggleChecklist = (item: string) => {
      if (isView) return;
      const current = form.checklistCondition || [];
      if (current.includes(item)) {
          setForm({ ...form, checklistCondition: current.filter(i => i !== item) });
      } else {
          setForm({ ...form, checklistCondition: [...current, item] });
      }
  };

  const handleSave = () => {
      // Map previews to form fields before saving
      const updatedData: Partial<MutationRecord> = {
          ...form,
          photoFront: docPreviews.front || undefined,
          photoRear: docPreviews.rear || undefined,
          photoRight: docPreviews.right || undefined,
          photoLeft: docPreviews.left || undefined,
          photoInterior: docPreviews.interior || undefined,
          documentStnk: docPreviews.stnk || undefined
      };
      onSave(updatedData);
  };

  const Label = ({ children, required }: { children?: React.ReactNode, required?: boolean }) => (
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2.5">
      {children} {required && <span className="text-red-500 font-black ml-0.5">*</span>}
    </label>
  );

  const DetailItem = ({ label, value, icon: Icon }: { label: string, value?: string, icon?: any }) => (
    <div className="flex flex-col">
        <div className="flex items-center gap-1.5 mb-1">
            {Icon && <Icon size={10} className="text-gray-400" />}
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
        </div>
        <span className="text-[11px] font-black text-black truncate" title={value}>{value || '-'}</span>
    </div>
  );

  const UploadBox = ({ label, uploadKey, icon: Icon = UploadCloud }: { label: string, uploadKey: DocKeys, icon?: any }) => {
      const preview = docPreviews[uploadKey];
      return (
        <div className="flex flex-col h-full">
            <Label>{label}</Label>
            <div 
                onClick={() => handleUploadClick(uploadKey)}
                className={`relative flex-1 border-2 border-dashed rounded-[1.5rem] flex flex-col items-center justify-center transition-all overflow-hidden bg-white min-h-[140px]
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
                              className="absolute top-2 right-2 bg-black text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                              <Trash2 size={12} />
                          </button>
                      )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center p-4 text-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm border border-gray-100 transition-all mb-2 bg-white`}>
                          <Icon size={16} className="text-gray-300" />
                      </div>
                      <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest leading-relaxed">
                          {isView ? 'No Image' : 'Upload'}
                      </p>
                  </div>
                )}
            </div>
        </div>
      );
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-[#FBFBFB] w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col transform transition-all scale-100 max-h-[90vh]">
        
        {/* Header */}
        <div className="px-10 py-8 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl shadow-black/20">
                <Send size={20} strokeWidth={2.5} />
            </div>
            <div>
                <h2 className="text-[18px] font-black text-black uppercase tracking-tight leading-none">
                    {mode === 'create' ? 'Form Mutasi Aset' : 'Detail Mutasi'}
                </h2>
                <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-[0.3em]">{assetType === 'VEHICLE' ? 'Vehicle Transfer Request' : 'General Asset Transfer'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-black transition-all p-2 rounded-full hover:bg-gray-50">
            <X size={28} />
          </button>
        </div>

        <div className="bg-white border-b border-gray-100 flex px-10 shrink-0 gap-8">
            {['DETAILS', 'CHECKLIST', 'WORKFLOW'].map(tab => {
                if (tab === 'CHECKLIST' && assetType !== 'VEHICLE') return null;
                return (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)} 
                        className={`py-3 text-[10px] font-black uppercase tracking-widest border-b-2 ${activeTab === tab ? 'border-black text-black' : 'border-transparent text-gray-400'}`}
                    >
                        {tab}
                    </button>
                )
            })}
        </div>

        {/* Content */}
        <div className="p-10 overflow-y-auto custom-scrollbar bg-[#FBFBFB]">
            {activeTab === 'DETAILS' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2">
                {/* Asset Selection */}
                <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        {assetType === 'VEHICLE' ? <Car size={16} className="text-black"/> : <Package size={16} className="text-black"/>}
                        <h3 className="text-[11px] font-black text-black uppercase tracking-widest">Identitas Aset</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <div className="flex justify-between items-center mb-2.5">
                                <Label required>{assetType === 'VEHICLE' ? 'Pilih Unit Kendaraan' : 'Pilih Aset'}</Label>
                                {assetType === 'GENERAL_ASSET' && !isView && (
                                    <div className="flex gap-1">
                                        {['ALL', 'Asset HC', 'Asset IT', 'Customer Service'].map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => setCategoryFilter(cat)}
                                                className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-wider border transition-all ${
                                                    categoryFilter === cat 
                                                    ? 'bg-black text-white border-black' 
                                                    : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                {cat === 'ALL' ? 'Semua' : cat.replace('Asset ', '')}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {assetType === 'VEHICLE' ? (
                                <SearchableSelect
                                    options={vehicleList.map(v => ({
                                        value: v.noPolisi,
                                        label: `${v.noPolisi} - ${v.nama}`,
                                        subLabel: `${v.merek} ${v.model} • ${v.cabang}`
                                    }))}
                                    value={form.noPolisi || ''}
                                    onChange={(val) => {
                                        const vehicle = vehicleList.find(v => v.noPolisi === val);
                                        if (vehicle) {
                                            setForm(prev => ({
                                                ...prev,
                                                noPolisi: vehicle.noPolisi,
                                                cabangAset: vehicle.cabang,
                                                lokasiAsal: vehicle.cabang,
                                                picBefore: vehicle.pengguna || ''
                                            }));
                                        } else {
                                            setForm(prev => ({ ...prev, noPolisi: val, cabangAset: '', lokasiAsal: '', picBefore: '' }));
                                        }
                                    }}
                                    placeholder="-- Pilih Kendaraan --"
                                    disabled={isView || mode === 'edit'}
                                    icon={Car}
                                    emptyMessage="Tidak ada data kendaraan"
                                />
                            ) : (
                                <SearchableSelect
                                    options={filteredGeneralAssets.map(a => {
                                        const code = a.assetNumber || a.assetCode;
                                        const name = a.assetName || a.type;
                                        const loc = a.assetLocation || a.buildingName;
                                        const val = a.id || code;
                                        return {
                                            value: val,
                                            label: `${code} - ${name}`,
                                            subLabel: `${loc} ${categoryFilter === 'ALL' && a.sourceCategory ? `[${a.sourceCategory}]` : ''}`
                                        };
                                    })}
                                    value={form.assetNumber || ''}
                                    onChange={(val) => {
                                        const asset = generalAssetList.find(a => a.id === val || a.assetNumber === val || a.assetCode === val);
                                        if (asset) {
                                            const assetNumber = asset.assetNumber || asset.assetCode;
                                            const assetName = asset.assetName || asset.type;
                                            const location = asset.assetLocation || asset.buildingName;
                                            const pic = asset.pic || '';
                                            setForm(prev => ({
                                                ...prev,
                                                assetNumber: assetNumber,
                                                assetName: assetName,
                                                cabangAset: location,
                                                lokasiAsal: asset.floor ? `${location} - ${asset.floor} (${asset.roomName})` : location,
                                                picBefore: pic
                                            }));
                                        } else {
                                            setForm(prev => ({ ...prev, assetNumber: val, assetName: '', cabangAset: '', lokasiAsal: '', picBefore: '' }));
                                        }
                                    }}
                                    placeholder={`-- Pilih Aset ${categoryFilter !== 'ALL' ? `(${categoryFilter})` : ''} --`}
                                    disabled={isView || mode === 'edit'}
                                    icon={Package}
                                    emptyMessage="Tidak ada data aset"
                                />
                            )}
                        </div>

                        {/* General Asset Detail Preview */}
                        {assetType === 'GENERAL_ASSET' && selectedGeneralAsset && (
                            <div className="md:col-span-2 bg-gray-50 rounded-2xl p-6 border border-gray-100 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200/50">
                                    <Info size={14} className="text-black" />
                                    <span className="text-[10px] font-black text-black uppercase tracking-widest">Detail Aset</span>
                                </div>
                                <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                                    <DetailItem label="Kategori" value={selectedGeneralAsset.assetCategory || selectedGeneralAsset.assetType} />
                                    <DetailItem label="Nama / Tipe" value={selectedGeneralAsset.assetName || selectedGeneralAsset.type} />
                                    <DetailItem label="Lokasi Gedung" value={selectedGeneralAsset.assetLocation || selectedGeneralAsset.buildingName} />
                                    <DetailItem label="Detail Lokasi" value={selectedGeneralAsset.subLocation || `${selectedGeneralAsset.floor || ''} ${selectedGeneralAsset.roomName || ''}`} />
                                    
                                    {(selectedGeneralAsset.brand || selectedGeneralAsset.modelNumber) && (
                                        <DetailItem label="Merek / Model" value={`${selectedGeneralAsset.brand || ''} ${selectedGeneralAsset.modelNumber || ''}`} icon={Tag} />
                                    )}
                                    
                                    <div className="col-span-2">
                                        <DetailItem label="Departemen" value={selectedGeneralAsset.department || '-'} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <Label>Tanggal Permintaan</Label>
                            <input 
                                type="date"
                                disabled={isView}
                                className="w-full bg-[#F8F9FA] border-none rounded-2xl px-5 py-4 text-[12px] font-black text-black outline-none shadow-sm focus:ring-2 focus:ring-black/5 disabled:text-gray-400"
                                value={form.tglPermintaan}
                                onChange={(e) => setForm({...form, tglPermintaan: e.target.value})}
                            />
                        </div>
                        <div>
                            <Label required>Tipe Mutasi</Label>
                            <div className="flex gap-2">
                                {['Permanent', 'Temporary'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => !isView && setForm({...form, tipeMutasi: type})}
                                        disabled={isView}
                                        className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl border transition-all ${
                                            form.tipeMutasi === type 
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
                </div>

                {/* Transfer Details */}
                <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <MapPin size={16} className="text-black"/>
                        <h3 className="text-[11px] font-black text-black uppercase tracking-widest">Detail Perpindahan</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Origin Group */}
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="md:col-span-2 border-b border-gray-200 pb-2 mb-2">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ASAL (ORIGIN)</span>
                            </div>
                            <div>
                                <Label>Lokasi Asal (Current)</Label>
                                <div className="flex items-center gap-3 bg-white px-5 py-4 rounded-2xl border border-gray-200 shadow-sm">
                                    <Building size={16} className="text-gray-400" />
                                    <span className="text-[12px] font-black text-gray-600 uppercase truncate" title={form.lokasiAsal}>
                                        {form.lokasiAsal || form.cabangAset || '-'}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <Label>PIC Asal / Sebelumnya</Label>
                                <div className="relative">
                                    <input 
                                        type="text"
                                        disabled={isView}
                                        className="w-full bg-white border-none rounded-2xl px-5 py-4 pl-12 text-[12px] font-black text-black outline-none shadow-sm focus:ring-2 focus:ring-black/5 disabled:text-gray-400"
                                        placeholder="Nama PIC Lama"
                                        value={form.picBefore || ''}
                                        onChange={(e) => setForm({...form, picBefore: e.target.value})}
                                    />
                                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Destination Group */}
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="md:col-span-2 border-b border-gray-200 pb-2 mb-2">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">TUJUAN (DESTINATION)</span>
                            </div>
                            <div>
                                <Label required>Lokasi Tujuan</Label>
                                <div className="relative">
                                    <select 
                                        disabled={isView}
                                        className="w-full bg-white border-none rounded-2xl px-5 py-4 pl-12 text-[12px] font-black text-black outline-none shadow-sm focus:ring-2 focus:ring-black/5 disabled:text-gray-400 appearance-none cursor-pointer"
                                        value={form.lokasiTujuan || ''}
                                        onChange={(e) => setForm({...form, lokasiTujuan: e.target.value})}
                                    >
                                        <option value="">-- Pilih Tujuan --</option>
                                        <option value="Jakarta Head Office">Jakarta Head Office</option>
                                        <option value="Surabaya Branch">Surabaya Branch</option>
                                        <option value="Medan Branch">Medan Branch</option>
                                        <option value="Makassar Warehouse">Makassar Warehouse</option>
                                        <option value="Bandung Branch">Bandung Branch</option>
                                    </select>
                                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <Label required>PIC Tujuan / Penerima</Label>
                                <div className="relative">
                                    <input 
                                        type="text"
                                        disabled={isView}
                                        className="w-full bg-white border-none rounded-2xl px-5 py-4 pl-12 text-[12px] font-black text-black outline-none shadow-sm focus:ring-2 focus:ring-black/5 disabled:text-gray-400"
                                        placeholder="Nama PIC Baru"
                                        value={form.picAfter || ''}
                                        onChange={(e) => setForm({...form, picAfter: e.target.value})}
                                    />
                                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Cost Field for Vehicle Mutation */}
                        {assetType === 'VEHICLE' && (
                            <div className="md:col-span-2">
                                <Label>Estimasi Biaya Mutasi (IDR)</Label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[12px] font-black text-gray-400">Rp</span>
                                    <input 
                                        type="number"
                                        disabled={isView}
                                        className="w-full bg-white border-none rounded-2xl pl-12 pr-5 py-4 text-[12px] font-black text-black outline-none shadow-sm focus:ring-2 focus:ring-black/5 disabled:text-gray-400 placeholder:text-gray-300"
                                        placeholder="0"
                                        value={form.biayaMutasi || ''}
                                        onChange={(e) => setForm({...form, biayaMutasi: e.target.value})}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="md:col-span-2">
                            <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
                                <AlertTriangle size={16} className="text-orange-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] font-bold text-orange-700 uppercase leading-relaxed">
                                    Mutasi antar cabang memerlukan persetujuan dari Branch Manager kedua lokasi (Asal & Tujuan).
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            )}

            {activeTab === 'CHECKLIST' && assetType === 'VEHICLE' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
                    
                    {/* Checklist Section */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <CheckSquare size={18} className="text-black"/>
                            <h3 className="text-[11px] font-black text-black uppercase tracking-widest">Physical Condition Checklist</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {['Body / Exterior', 'Interior / Cabin', 'Engine / Mesin', 'Tires / Ban', 'Lights / Lampu', 'Tools / Kunci', 'Spare Tire', 'Ac / Pendingin'].map((item) => (
                                <label key={item} className="flex items-center gap-3 p-4 border border-gray-100 rounded-2xl cursor-pointer hover:bg-gray-50 transition-all">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 rounded text-black focus:ring-black border-gray-300"
                                        checked={form.checklistCondition?.includes(item)}
                                        onChange={() => toggleChecklist(item)}
                                        disabled={isView}
                                    />
                                    <span className="text-[10px] font-bold text-gray-600 uppercase">{item}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Photos Section */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <ImageIcon size={18} className="text-black"/>
                            <h3 className="text-[11px] font-black text-black uppercase tracking-widest">Foto Fisik Unit (Wajib)</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <UploadBox label="Tampak Depan" uploadKey="front" icon={ImageIcon} />
                            <UploadBox label="Tampak Belakang" uploadKey="rear" icon={ImageIcon} />
                            <UploadBox label="Samping Kanan" uploadKey="right" icon={ImageIcon} />
                            <UploadBox label="Samping Kiri" uploadKey="left" icon={ImageIcon} />
                            <UploadBox label="Interior / Dash" uploadKey="interior" icon={ImageIcon} />
                        </div>
                    </div>

                    {/* Document Section */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <FileText size={18} className="text-black"/>
                            <h3 className="text-[11px] font-black text-black uppercase tracking-widest">Dokumen Kelengkapan</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <UploadBox label="Scan STNK (Asli/Copy)" uploadKey="stnk" icon={FileText} />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'WORKFLOW' && (
                <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="absolute left-[63px] top-12 bottom-12 w-[2px] bg-gray-100"></div>
                        <div className="space-y-10 relative z-10">
                            <div className="flex gap-8">
                                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shadow-lg shadow-black/20 shrink-0">
                                    <FileText size={20} strokeWidth={3} />
                                </div>
                                <div className="pt-2">
                                    <h4 className="text-[13px] font-black text-black uppercase tracking-tight">Mutation Request Created</h4>
                                    <p className="text-[11px] text-gray-400 mt-1">Submitted on {form.tglPermintaan || new Date().toLocaleDateString()}</p>
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
                                        {form.statusApproval === 'Approved' ? 'Mutation Approved' : 
                                         form.statusApproval === 'Rejected' ? 'Mutation Rejected' : 'Waiting for approval'}
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

        {/* Footer */}
        <div className="px-10 py-8 bg-white border-t border-gray-100 flex justify-end gap-4 shrink-0">
          <button onClick={onClose} className="px-12 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-gray-100 hover:text-black transition-all">Batal</button>
          {!isView && (
            <button 
                onClick={() => onSave(form)} 
                className="px-16 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white bg-black rounded-2xl hover:bg-gray-900 shadow-xl shadow-black/20 transition-all active:scale-95 flex items-center gap-3"
            >
                <Send size={18} strokeWidth={2.5} /> Ajukan Mutasi
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
