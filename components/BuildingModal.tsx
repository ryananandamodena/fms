
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Building, MapPin, Phone, FileText, CheckCircle2, Clock, AlertCircle, Trash2, Plus, ChevronDown, User, Home, DollarSign, Ruler, Zap, Key, UploadCloud, MousePointer2, TrendingUp, PieChart, ShieldCheck, ChevronLeft, Edit3, Flag } from 'lucide-react';
import { BuildingRecord, GeneralMasterItem, BuildingProposal, WorkflowStep } from '../types';
import { SearchableSelect, SelectOption } from './SearchableSelect';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<BuildingRecord>) => void;
  initialData?: BuildingRecord;
  mode?: 'create' | 'edit' | 'view';
  buildingTypeList?: GeneralMasterItem[];
  existingBuildings?: BuildingRecord[];
}

export const BuildingModal: React.FC<Props> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    initialData, 
    mode = 'create',
    buildingTypeList = [],
    existingBuildings = []
}) => {
  const [activeTab, setActiveTab] = useState('INFORMASI UMUM');
  const [proposalTab, setProposalTab] = useState('INFO UTAMA'); // For Proposal Tab
  const [generalInfoTab, setGeneralInfoTab] = useState('INFO UTAMA'); // For General Info Tab
  const [form, setForm] = useState<Partial<BuildingRecord>>({
    status: 'Pending',
    ownership: 'Rent',
    workflow: [],
    rentCost: '0',
    totalMaintenanceCost: '0',
    utilityCost: '0',
    securityFeatures: [],
    documentsAvailable: [],
    proposals: [],
    structureChecklist: { tiang: [], atap: [], dinding: [], lantai: [], pintu: [], jendela: [], others: [] },
    renovationDetailsObj: { costSharing: '', gracePeriod: '', items: { partition: false, paint: false, roof: '', lights: false, other: '' } },
    locationContext: { right: '', left: '', front: '', back: '', nearIndustry: false, operationalHours: '' },
    businessNotes: { deliveryTime: '', dealersCount: '', staffComposition: '', margin: '', competitorPareto: '' },
  });

  const [isManualInput, setIsManualInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Proposal Management State
  const [isEditingProposal, setIsEditingProposal] = useState(false);
  const [currentProposal, setCurrentProposal] = useState<Partial<BuildingProposal>>({
      name: '',
      address: { jl: '', kota: '', kabupaten: '', propinsi: '' },
      floors: { ground: '', f1: '', f2: '', f3: '', f4: '' },
      owner: { name: '', address: '', phone: '' },
      surveySummary: { pros: '', cons: '' },
      securityFeatures: [],
      structureChecklist: { tiang: [], atap: [], dinding: [], lantai: [], pintu: [], jendela: [], others: [] },
      renovationDetailsObj: { costSharing: '', gracePeriod: '', items: { partition: false, paint: false, roof: '', lights: false, other: '' } },
      locationContext: { right: '', left: '', front: '', back: '', nearIndustry: false, operationalHours: '' },
      businessNotes: { deliveryTime: '', dealersCount: '', staffComposition: '', margin: '', competitorPareto: '' },
      documents: [],
      environmentConditions: []
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm(initialData);
        setIsManualInput(true); // Edit mode defaults to manual input view (readonly if needed)
      } else {
        setForm({
            status: 'Pending',
            ownership: 'Rent',
            assetNo: 'REQ-BI-NEW-01',
            name: '',
            type: 'MHC',
            location: '',
            address: '',
            rentCost: '250000000',
            totalMaintenanceCost: '45000000',
            utilityCost: '12000000',
            securityFeatures: [],
            documentsAvailable: [],
            proposals: [],
            workflow: [
                { role: 'BM', status: 'Pending' },
                { role: 'Regional Branches', status: 'Pending' },
                { role: 'AVP Dealership', status: 'Pending' },
                { role: 'Owner', status: 'Pending' }
            ],
            structureChecklist: { tiang: [], atap: [], dinding: [], lantai: [], pintu: [], jendela: [], others: [] },
            renovationDetailsObj: { costSharing: '', gracePeriod: '', items: { partition: false, paint: false, roof: '', lights: false, other: '' } },
            locationContext: { right: '', left: '', front: '', back: '', nearIndustry: false, operationalHours: '' },
            businessNotes: { deliveryTime: '', dealersCount: '', staffComposition: '', margin: '', competitorPareto: '' },
        });
        // If there are existing buildings, default to select mode for convenience
        setIsManualInput(existingBuildings.length === 0);
      }
      setActiveTab('INFORMASI UMUM');
      setIsEditingProposal(false);
    }
  }, [isOpen, initialData, existingBuildings]);

  if (!isOpen) return null;

  const isView = mode === 'view';

  const handleSave = () => {
      onSave(form);
  };

  const handleBuildingSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedName = e.target.value;
      if (selectedName === 'NEW_ENTRY') {
          setIsManualInput(true);
          setForm(prev => ({...prev, name: ''}));
      } else {
          const selectedBuilding = existingBuildings.find(b => b.name === selectedName);
          if (selectedBuilding) {
              setForm(prev => ({
                  ...prev,
                  name: selectedBuilding.name,
                  assetNo: selectedBuilding.assetNo,
                  type: selectedBuilding.type,
                  location: selectedBuilding.location,
                  address: selectedBuilding.address,
                  city: selectedBuilding.city,
                  district: selectedBuilding.district,
                  province: selectedBuilding.province,
                  // Keep workflow/proposals specific to this new request, don't overwrite if not needed
                  // or if this is an "Improvement" request on existing asset, we might want some data.
                  // For now, we copy basic info.
              }));
          }
      }
  };

  const handleSaveProposal = () => {
      const newProposal = { 
          ...currentProposal, 
          id: currentProposal.id || `PROP-${Date.now()}` 
      } as BuildingProposal;

      const existingProposals = form.proposals || [];
      const index = existingProposals.findIndex(p => p.id === newProposal.id);
      
      let updatedProposals;
      if (index >= 0) {
          updatedProposals = [...existingProposals];
          updatedProposals[index] = newProposal;
      } else {
          updatedProposals = [...existingProposals, newProposal];
      }

      setForm({ ...form, proposals: updatedProposals });
      setIsEditingProposal(false);
  };

  const handleEditProposal = (proposal: BuildingProposal) => {
      setCurrentProposal({
          ...proposal,
          telephoneDetails: proposal.telephoneDetails || { canAdd: false, costPerLine: '', borneBy: '' },
          structureChecklist: proposal.structureChecklist || { tiang: [], atap: [], dinding: [], lantai: [], pintu: [], jendela: [], others: [] },
          renovationDetailsObj: proposal.renovationDetailsObj || { costSharing: '', gracePeriod: '', items: { partition: false, paint: false, roof: '', lights: false, other: '' } },
          locationContext: proposal.locationContext || { right: '', left: '', front: '', back: '', nearIndustry: false, operationalHours: '' },
          businessNotes: proposal.businessNotes || { deliveryTime: '', dealersCount: '', staffComposition: '', margin: '', competitorPareto: '' }
      });
      setIsEditingProposal(true);
      setProposalTab('INFO UTAMA');
  };

  const handleAddProposal = () => {
      setCurrentProposal({
          name: `Kandidat ${ (form.proposals?.length || 0) + 1}`,
          address: { jl: '', kota: '', kabupaten: '', propinsi: '' },
          floors: { ground: '', f1: '', f2: '', f3: '', f4: '' },
          owner: { name: '', address: '', phone: '' },
          surveySummary: { pros: '', cons: '' },
          securityFeatures: [],
          structureChecklist: { tiang: [], atap: [], dinding: [], lantai: [], pintu: [], jendela: [], others: [] },
          renovationDetailsObj: { costSharing: '', gracePeriod: '', items: { partition: false, paint: false, roof: '', lights: false, other: '' } },
          locationContext: { right: '', left: '', front: '', back: '', nearIndustry: false, operationalHours: '' },
          businessNotes: { deliveryTime: '', dealersCount: '', staffComposition: '', margin: '', competitorPareto: '' },
          documents: [],
          environmentConditions: []
      });
      setIsEditingProposal(true);
      setProposalTab('INFO UTAMA');
  };

  const handleDeleteProposal = (id: string) => {
      setForm({ ...form, proposals: form.proposals?.filter(p => p.id !== id) });
  };

  const handleFloorPlanUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              setForm(prev => ({ ...prev, floorPlanImage: ev.target?.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  // Toggle helpers for MAIN FORM
  const toggleCheckbox = (listName: 'securityFeatures' | 'documentsAvailable', value: string) => {
      if (isView) return;
      const list = form[listName] || [];
      if (list.includes(value)) {
          setForm({ ...form, [listName]: list.filter(item => item !== value) });
      } else {
          setForm({ ...form, [listName]: [...list, value] });
      }
  };

  const toggleStructureCheckboxForm = (category: 'tiang' | 'atap' | 'dinding' | 'lantai' | 'pintu' | 'jendela' | 'others', value: string) => {
      if(isView) return;
      const list = form.structureChecklist?.[category] || [];
      const updatedList = list.includes(value) ? list.filter(i => i !== value) : [...list, value];
      setForm({ 
          ...form, 
          structureChecklist: { ...form.structureChecklist!, [category]: updatedList } 
      });
  };

  const toggleProposalCheckbox = (field: 'securityFeatures' | 'documents' | 'environmentConditions', value: string) => {
      const list = currentProposal[field] || [];
      const updatedList = list.includes(value) ? list.filter(i => i !== value) : [...list, value];
      setCurrentProposal({ ...currentProposal, [field]: updatedList });
  };

  const toggleStructureCheckboxProposal = (category: keyof typeof currentProposal.structureChecklist, value: string) => {
      const list = currentProposal.structureChecklist?.[category] || [];
      const updatedList = list.includes(value) ? list.filter(i => i !== value) : [...list, value];
      setCurrentProposal({ 
          ...currentProposal, 
          structureChecklist: { ...currentProposal.structureChecklist!, [category]: updatedList } 
      });
  };

  const SectionHeader = ({ num, title, sub }: { num?: string, title: string, sub?: string }) => (
    <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100">
      {num && <div className="w-1.5 h-6 bg-black rounded-full"></div>}
      <div>
        <h3 className="text-[12px] font-black text-black uppercase tracking-[0.2em]">{title}</h3>
        {sub && <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{sub}</p>}
      </div>
    </div>
  );

  const Label = ({ children }: { children?: React.ReactNode }) => (
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
      {children}
    </label>
  );

  const Input = (props: React.InputHTMLAttributes<HTMLInputElement> & { label?: string, icon?: any }) => (
    <div className="mb-4">
      {props.label && <Label>{props.label}</Label>}
      <div className="relative">
        <input 
            {...props}
            className={`w-full bg-[#F8F9FA] border-none rounded-2xl px-5 py-4 text-[13px] font-black text-black outline-none transition-all placeholder:text-gray-300 shadow-sm focus:ring-2 focus:ring-black/5 disabled:text-gray-400 ${props.className} ${props.icon ? 'pl-12' : ''}`}
            disabled={isView || props.disabled}
        />
        {props.icon && <props.icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />}
      </div>
    </div>
  );

  const CheckboxGroup = ({ title, items, selected, onChange }: { title: string, items: string[], selected: string[], onChange: (val: string) => void }) => (
      <div className="mb-4">
          <Label>{title}</Label>
          <div className="grid grid-cols-2 gap-2">
              {items.map(item => (
                  <label key={item} className="flex items-center gap-2 p-2 bg-[#F8F9FA] rounded-lg cursor-pointer hover:bg-gray-100 transition-all">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${selected.includes(item) ? 'bg-black border-black' : 'bg-white border-gray-300'}`}>
                          {selected.includes(item) && <CheckCircle2 size={10} className="text-white" />}
                      </div>
                      <input type="checkbox" className="hidden" checked={selected.includes(item)} onChange={() => onChange(item)} disabled={isView} />
                      <span className="text-[10px] font-bold text-gray-600">{item}</span>
                  </label>
              ))}
          </div>
      </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-6xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col transform transition-all scale-100 max-h-[95vh]">
        
        {/* Header */}
        <div className="px-10 py-8 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl shadow-black/20">
                <Building size={24} strokeWidth={2.5} />
            </div>
            <div>
                <h2 className="text-[20px] font-black text-black uppercase tracking-tight leading-none">
                    {form.name || 'NEW BRANCH REQUEST'}
                </h2>
                <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-[0.2em]">
                    {form.assetNo} • {form.type || 'BRANCH'}
                </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
              <span className="px-4 py-2 bg-[#FFF7ED] text-[#EA580C] text-[10px] font-black uppercase tracking-widest rounded-xl border border-[#FDBA74]/50">
                  {form.status || 'PENDING'}
              </span>
              <button onClick={onClose} className="text-gray-300 hover:text-black transition-all p-2 rounded-full hover:bg-gray-50">
                <X size={28} strokeWidth={2} />
              </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-100 flex px-10 shrink-0 gap-8 overflow-x-auto no-scrollbar">
            {['INFORMASI UMUM', 'PROPOSAL & PERBANDINGAN', 'WORKFLOW', 'FLOOR PLAN', 'FINANCIAL SUMMARY', 'DOKUMEN'].map(tab => {
                // Hide Proposal Tab if Ownership is Own
                if (tab === 'PROPOSAL & PERBANDINGAN' && form.ownership === 'Own') return null;
                return (
                    <button 
                        key={tab}
                        onClick={() => { setActiveTab(tab); setIsEditingProposal(false); }}
                        className={`py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-[4px] whitespace-nowrap
                            ${activeTab === tab ? 'border-black text-black' : 'border-transparent text-gray-300 hover:text-gray-500'}`}
                    >
                        {tab}
                    </button>
                )
            })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-[#FBFBFB]">
            {activeTab === 'INFORMASI UMUM' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {['Rent', 'Own'].map(type => (
                            <button
                                key={type}
                                onClick={() => !isView && setForm({...form, ownership: type as any})}
                                disabled={isView}
                                className={`h-40 rounded-[2rem] flex flex-col items-center justify-center gap-4 transition-all duration-300 group border-2
                                    ${form.ownership === type 
                                    ? 'bg-black text-white border-black shadow-2xl shadow-black/20 scale-[1.02]' 
                                    : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}
                            >
                                <div className={`p-4 rounded-full ${form.ownership === type ? 'bg-white/20' : 'bg-gray-50'}`}>
                                    {type === 'Rent' ? <Key size={24} /> : <Home size={24} />}
                                </div>
                                <div className="text-center">
                                    <span className="text-[14px] font-black uppercase tracking-widest block">{type === 'Rent' ? 'SEWA (LEASE)' : 'MILIK SENDIRI (OWN)'}</span>
                                    <span className={`text-[9px] font-bold uppercase tracking-wider mt-1 block ${form.ownership === type ? 'text-white/60' : 'text-gray-300'}`}>
                                        {type === 'Rent' ? 'SEWA TAHUNAN / KONTRAK' : 'ASET PERUSAHAAN / BELI PUTUS'}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <SectionHeader num="2" title="2. IDENTITAS ASET" sub="ASSET CLASSIFICATION & NUMBERING" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="md:col-span-2">
                                <div className="flex justify-between items-center mb-2">
                                    <Label>NAMA PROPERTI / GEDUNG <span className="text-red-500">*</span></Label>
                                    {!isView && (
                                        <button 
                                            onClick={() => setIsManualInput(!isManualInput)} 
                                            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 underline uppercase tracking-wider"
                                        >
                                            {isManualInput ? "Pilih dari Daftar Gedung" : "Input Nama Gedung Baru"}
                                        </button>
                                    )}
                                </div>
                                
                                {isManualInput ? (
                                    <input 
                                        type="text"
                                        className="w-full bg-[#F8F9FA] border-none rounded-2xl px-6 py-5 text-[14px] font-black text-black outline-none transition-all placeholder:text-gray-300 focus:ring-2 focus:ring-black/5"
                                        value={form.name || ''} 
                                        onChange={e => setForm({...form, name: e.target.value})} 
                                        placeholder="Contoh: MODENA Home Center Bintaro"
                                        disabled={isView}
                                    />
                                ) : (
                                    <SearchableSelect
                                        options={[
                                            ...existingBuildings.map(b => ({
                                                value: b.name,
                                                label: b.name,
                                                subLabel: b.address
                                            })),
                                            { value: 'NEW_ENTRY', label: '-- Input Gedung Baru --' }
                                        ]}
                                        value={existingBuildings.find(b => b.name === form.name) ? form.name || '' : ''}
                                        onChange={(val) => {
                                            if (val === 'NEW_ENTRY') {
                                                setIsManualInput(true);
                                                setForm(prev => ({...prev, name: ''}));
                                            } else {
                                                const selectedBuilding = existingBuildings.find(b => b.name === val);
                                                if (selectedBuilding) {
                                                    setForm(prev => ({
                                                        ...prev,
                                                        name: selectedBuilding.name,
                                                        assetNo: selectedBuilding.assetNo,
                                                        type: selectedBuilding.type,
                                                        location: selectedBuilding.location,
                                                        address: selectedBuilding.address,
                                                        city: selectedBuilding.city,
                                                        district: selectedBuilding.district,
                                                        province: selectedBuilding.province,
                                                    }));
                                                }
                                            }
                                        }}
                                        placeholder="-- Pilih Gedung untuk Perbaikan --"
                                        disabled={isView}
                                        icon={Building}
                                        emptyMessage="Tidak ada data gedung"
                                    />
                                )}
                            </div>
                            
                            <div>
                                <Label>ASSET NUMBER</Label>
                                <div className="w-full bg-[#F8F9FA] rounded-2xl px-6 py-5 text-[14px] font-black text-gray-400 cursor-not-allowed">
                                    {form.assetNo}
                                </div>
                            </div>

                            <div>
                                <Label>TIPE GEDUNG <span className="text-red-500">*</span></Label>
                                <SearchableSelect
                                    options={buildingTypeList.map(t => ({
                                        value: t.name,
                                        label: t.name
                                    }))}
                                    value={form.type || ''}
                                    onChange={(val) => setForm({...form, type: val})}
                                    placeholder="(PILIH TIPE)"
                                    disabled={isView}
                                    emptyMessage="Tidak ada data tipe gedung"
                                />
                            </div>
                        </div>

                        {/* Internal Tabs for Information - UPDATED STYLE */}
                        <div className="flex flex-wrap gap-2 bg-gray-50 p-1.5 rounded-2xl mb-8 w-full md:w-fit">
                            {['INFO UTAMA', 'SPESIFIKASI FISIK', 'RENOVASI & LINGKUNGAN', 'BIAYA & LEGAL'].map(tab => (
                                <button 
                                    key={tab}
                                    onClick={() => setGeneralInfoTab(tab)}
                                    className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap flex-1 md:flex-none ${
                                        generalInfoTab === tab 
                                        ? 'bg-black text-white shadow-lg shadow-black/20 scale-105' 
                                        : 'text-gray-400 hover:text-gray-600 hover:bg-white'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* 1. INFO UTAMA (Lokasi & Utilitas) */}
                        {generalInfoTab === 'INFO UTAMA' && (
                            <>
                                <div>
                                    <SectionHeader num="1" title="ALAMAT LOKASI" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <Input label="JALAN / ALAMAT LENGKAP" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} placeholder="Input alamat lengkap..." />
                                        </div>
                                        <Input label="KOTA" value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} />
                                        <Input label="KABUPATEN" value={form.district} onChange={(e) => setForm({...form, district: e.target.value})} />
                                        <Input label="PROPINSI" value={form.province} onChange={(e) => setForm({...form, province: e.target.value})} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6 mt-4">
                                        <Input label="JARAK KE DEALER (KM)" value={form.distanceToDealer} onChange={(e) => setForm({...form, distanceToDealer: e.target.value})} />
                                        <Input label="KONDISI JALAN / AKSES" value={form.roadCondition} onChange={(e) => setForm({...form, roadCondition: e.target.value})} />
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <SectionHeader num="2" title="UTILITAS" />
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <Input label="LISTRIK (WATT/AMPERE)" value={form.electricityPower} onChange={(e) => setForm({...form, electricityPower: e.target.value})} icon={Zap} />
                                        <Input label="SUMBER AIR" value={form.waterSource} onChange={(e) => setForm({...form, waterSource: e.target.value})} />
                                        <Input label="LINE TELEPON (QTY)" value={form.phoneLineCount} onChange={(e) => setForm({...form, phoneLineCount: e.target.value})} icon={Phone} />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* 2. SPESIFIKASI FISIK */}
                        {generalInfoTab === 'SPESIFIKASI FISIK' && (
                            <>
                                <div>
                                    <SectionHeader num="3" title="DIMENSI & FISIK" />
                                    <div className="grid grid-cols-3 gap-6">
                                        <Input label="LUAS TANAH (M2)" type="number" value={form.landArea} onChange={(e) => setForm({...form, landArea: e.target.value})} />
                                        <Input label="LUAS BANGUNAN (M2)" type="number" value={form.buildingArea} onChange={(e) => setForm({...form, buildingArea: e.target.value})} />
                                        <Input label="HALAMAN DEPAN (M2)" type="number" value={form.frontYardArea} onChange={(e) => setForm({...form, frontYardArea: e.target.value})} />
                                        <Input label="JUMLAH TINGKAT" value={form.totalFloors} onChange={(e) => setForm({...form, totalFloors: e.target.value})} />
                                        <Input label="KAPASITAS PARKIR" value={form.parkingCapacity} onChange={(e) => setForm({...form, parkingCapacity: e.target.value})} />
                                        <Input label="USIA BANGUNAN (THN)" value={form.buildingAge} onChange={(e) => setForm({...form, buildingAge: e.target.value})} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6 mt-4">
                                        <Input label="KONDISI PAGAR" value={form.fenceCondition} onChange={(e) => setForm({...form, fenceCondition: e.target.value})} />
                                        <Input label="KONDISI PINTU PAGAR" value={form.gateCondition} onChange={(e) => setForm({...form, gateCondition: e.target.value})} />
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <SectionHeader num="4" title="MATERIAL & STRUKTUR" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <CheckboxGroup title="TIANG / STRUKTUR" items={['Baja', 'Kayu', 'Beton']} selected={form.structureChecklist?.tiang || []} onChange={(v) => toggleStructureCheckboxForm('tiang', v)} />
                                        <CheckboxGroup title="ATAP" items={['Alumunium', 'Tanah Liat', 'Beton Cor', 'Genting Beton']} selected={form.structureChecklist?.atap || []} onChange={(v) => toggleStructureCheckboxForm('atap', v)} />
                                        <CheckboxGroup title="DINDING" items={['Batako', 'Bata Merah', 'Seng', 'Triplek']} selected={form.structureChecklist?.dinding || []} onChange={(v) => toggleStructureCheckboxForm('dinding', v)} />
                                        <CheckboxGroup title="LANTAI" items={['Keramik', 'Tanpa Keramik']} selected={form.structureChecklist?.lantai || []} onChange={(v) => toggleStructureCheckboxForm('lantai', v)} />
                                        <CheckboxGroup title="PINTU" items={['Kayu', 'Triplek', 'Baja', 'Alumunium', 'Seng']} selected={form.structureChecklist?.pintu || []} onChange={(v) => toggleStructureCheckboxForm('pintu', v)} />
                                        <CheckboxGroup title="JENDELA" items={['Kayu', 'Alumunium', 'Besi']} selected={form.structureChecklist?.jendela || []} onChange={(v) => toggleStructureCheckboxForm('jendela', v)} />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* 3. RENOVASI & LINGKUNGAN */}
                        {generalInfoTab === 'RENOVASI & LINGKUNGAN' && (
                            <>
                                <div>
                                    <SectionHeader num="5" title="KONDISI LINGKUNGAN" />
                                    <div className="grid grid-cols-1 gap-6 mb-6">
                                        <Label>BATAS LOKASI / POSISI</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input label="DEPAN" value={form.locationContext?.front} onChange={(e) => setForm({...form, locationContext: {...form.locationContext!, front: e.target.value}})} placeholder="Ada apa di depan?" />
                                            <Input label="BELAKANG" value={form.locationContext?.back} onChange={(e) => setForm({...form, locationContext: {...form.locationContext!, back: e.target.value}})} placeholder="Ada apa di belakang?" />
                                            <Input label="KANAN" value={form.locationContext?.right} onChange={(e) => setForm({...form, locationContext: {...form.locationContext!, right: e.target.value}})} placeholder="Ada apa di kanan?" />
                                            <Input label="KIRI" value={form.locationContext?.left} onChange={(e) => setForm({...form, locationContext: {...form.locationContext!, left: e.target.value}})} placeholder="Ada apa di kiri?" />
                                        </div>
                                    </div>
                                    <CheckboxGroup title="TIPE LINGKUNGAN" items={['Cluster', 'Padat Penduduk', 'Pergudangan', 'Perkantoran', 'Dekat Lapangan']} selected={form.environmentConditions || []} onChange={(v) => toggleCheckbox('environmentConditions' as any, v)} />
                                </div>

                                <div className="mt-8">
                                    <SectionHeader num="6" title="KEBUTUHAN RENOVASI" />
                                    <div className="flex gap-4 mb-4">
                                        <label className="flex items-center gap-2"><input type="radio" checked={form.renovationNeeded} onChange={() => setForm({...form, renovationNeeded: true})} /> <span className="text-[11px] font-bold">Perlu Renovasi</span></label>
                                        <label className="flex items-center gap-2"><input type="radio" checked={!form.renovationNeeded} onChange={() => setForm({...form, renovationNeeded: false})} /> <span className="text-[11px] font-bold">Tidak Perlu</span></label>
                                    </div>
                                    {form.renovationNeeded && (
                                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input label="ESTIMASI BIAYA (+/- RP)" value={form.renovationCostEstimate} onChange={(e) => setForm({...form, renovationCostEstimate: e.target.value})} />
                                            <Input label="ESTIMASI WAKTU (HARI)" value={form.renovationTimeEstimate} onChange={(e) => setForm({...form, renovationTimeEstimate: e.target.value})} />
                                            <Input label="DITANGGUNG OLEH (%)" value={form.renovationDetailsObj?.costSharing} onChange={(e) => setForm({...form, renovationDetailsObj: {...form.renovationDetailsObj!, costSharing: e.target.value}})} placeholder="Contoh: Pemilik 50%, Penyewa 50%" />
                                            <Input label="TENGGANG WAKTU (GRACE PERIOD)" value={form.renovationDetailsObj?.gracePeriod} onChange={(e) => setForm({...form, renovationDetailsObj: {...form.renovationDetailsObj!, gracePeriod: e.target.value}})} placeholder="Hari" />
                                            
                                            <div className="md:col-span-2">
                                                <Label>ITEM RENOVASI</Label>
                                                <div className="grid grid-cols-2 gap-4 mt-2">
                                                    <label className="flex items-center gap-2"><input type="checkbox" checked={form.renovationDetailsObj?.items.partition} onChange={(e) => setForm({...form, renovationDetailsObj: {...form.renovationDetailsObj!, items: {...form.renovationDetailsObj!.items, partition: e.target.checked}}})} /> <span className="text-[10px] font-bold">Sekat Ruangan</span></label>
                                                    <label className="flex items-center gap-2"><input type="checkbox" checked={form.renovationDetailsObj?.items.paint} onChange={(e) => setForm({...form, renovationDetailsObj: {...form.renovationDetailsObj!, items: {...form.renovationDetailsObj!.items, paint: e.target.checked}}})} /> <span className="text-[10px] font-bold">Pengecatan</span></label>
                                                    <label className="flex items-center gap-2"><input type="checkbox" checked={form.renovationDetailsObj?.items.lights} onChange={(e) => setForm({...form, renovationDetailsObj: {...form.renovationDetailsObj!, items: {...form.renovationDetailsObj!.items, lights: e.target.checked}}})} /> <span className="text-[10px] font-bold">Lampu-Lampu</span></label>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* 4. BIAYA & LEGAL */}
                        {generalInfoTab === 'BIAYA & LEGAL' && (
                            <>
                                <div>
                                    <SectionHeader num="7" title="FINANSIAL" />
                                    {form.ownership === 'Rent' ? (
                                        <div className="grid grid-cols-2 gap-6">
                                            <Input label="HARGA SEWA / TAHUN (RP)" type="number" value={form.rentCost} onChange={(e) => setForm({...form, rentCost: e.target.value})} />
                                            <Input label="PERIODE SEWA (THN)" value={form.startDate} onChange={(e) => setForm({...form, startDate: e.target.value})} placeholder="Min - Max Tahun" />
                                            <Input label="PAJAK PPH DITANGGUNG" value={form.taxPPH} onChange={(e) => setForm({...form, taxPPH: e.target.value})} placeholder="Pemilik / Penyewa" />
                                            <Input label="BIAYA NOTARIS" value={form.notaryFee} onChange={(e) => setForm({...form, notaryFee: e.target.value})} placeholder="Pemilik % / Penyewa %" />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-6">
                                            <Input label="HARGA BELI (RP)" type="number" value={form.purchasePrice} onChange={(e) => setForm({...form, purchasePrice: e.target.value})} />
                                            <Input label="TANGGAL BELI" type="date" value={form.startDate} onChange={(e) => setForm({...form, startDate: e.target.value})} />
                                            <Input label="BIAYA NOTARIS & PAJAK" value={form.notaryFee} onChange={(e) => setForm({...form, notaryFee: e.target.value})} placeholder="Total Biaya Legal" />
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8">
                                    <SectionHeader num="8" title="LEGALITAS & PEMILIK" />
                                    <div className="grid grid-cols-2 gap-6 mb-6">
                                        <Input label="NAMA PEMILIK" value={form.ownerName} onChange={(e) => setForm({...form, ownerName: e.target.value})} icon={User} />
                                        <Input label="NO TELP PEMILIK" value={form.ownerPhone} onChange={(e) => setForm({...form, ownerPhone: e.target.value})} icon={Phone} />
                                        <Input label="ALAMAT PEMILIK" value={form.ownerAddress} onChange={(e) => setForm({...form, ownerAddress: e.target.value})} />
                                    </div>
                                    <CheckboxGroup title="DOKUMEN TERSEDIA" items={['SHM', 'SHGB', 'IMB']} selected={form.documentsAvailable || []} onChange={(v) => toggleCheckbox('documentsAvailable', v)} />
                                </div>

                                <div className="bg-blue-50 p-6 rounded-[2.5rem] border border-blue-100 mt-8">
                                    <SectionHeader num="9" title="ANALISA BISNIS (BM NOTES)" />
                                    <div className="grid grid-cols-2 gap-6">
                                        <Input label="ESTIMASI OMZET/TAHUN" value={form.businessNotes?.margin} onChange={(e) => setForm({...form, businessNotes: {...form.businessNotes!, margin: e.target.value}})} />
                                        <Input label="WAKTU PENGIRIMAN (HARI)" value={form.businessNotes?.deliveryTime} onChange={(e) => setForm({...form, businessNotes: {...form.businessNotes!, deliveryTime: e.target.value}})} />
                                        <Input label="JUMLAH DEALER PARETO" value={form.businessNotes?.dealersCount} onChange={(e) => setForm({...form, businessNotes: {...form.businessNotes!, dealersCount: e.target.value}})} />
                                        <Input label="KOMPOSISI STAFF" value={form.businessNotes?.staffComposition} onChange={(e) => setForm({...form, businessNotes: {...form.businessNotes!, staffComposition: e.target.value}})} />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'PROPOSAL & PERBANDINGAN' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {!isEditingProposal ? (
                        <>
                            {form.proposals && form.proposals.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {form.proposals.map((proposal) => (
                                        <div key={proposal.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-lg transition-all group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-3 bg-black text-white rounded-xl">
                                                    <Building size={20} />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleEditProposal(proposal)} className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"><Edit3 size={16} /></button>
                                                    <button onClick={() => handleDeleteProposal(proposal.id)} className="p-2 bg-red-50 rounded-lg hover:bg-red-100 text-red-500 transition-all"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                            <h3 className="text-[14px] font-black text-black uppercase tracking-tight">{proposal.name}</h3>
                                            <p className="text-[11px] text-gray-500 font-medium mt-1 truncate">{proposal.address.jl}, {proposal.address.kota}</p>
                                            <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                                                <div>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">HARGA SEWA</p>
                                                    <p className="text-[13px] font-mono font-black text-black">Rp {parseInt(proposal.rentPrice || '0').toLocaleString('id-ID')}</p>
                                                </div>
                                                <span className="bg-gray-50 px-3 py-1 rounded-lg text-[9px] font-bold uppercase text-gray-600 border border-gray-100">{proposal.leaseNature}</span>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {!isView && (
                                        <button onClick={handleAddProposal} className="bg-[#F8F9FA] rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 hover:border-black transition-all group min-h-[250px]">
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:bg-black group-hover:text-white transition-all">
                                                <Plus size={24} />
                                            </div>
                                            <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-widest group-hover:text-black">Tambah Kandidat</h3>
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-[#F8F9FA] rounded-[2.5rem] p-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200">
                                    <div className="mb-6">
                                        <h3 className="text-[16px] font-black text-black uppercase tracking-tight">PERBANDINGAN KANDIDAT</h3>
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-2">BELUM ADA OPSI PROPERTI</p>
                                    </div>
                                    {!isView && (
                                        <button onClick={handleAddProposal} className="bg-black text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-gray-900 shadow-xl transition-all flex items-center gap-3">
                                            <Plus size={16} /> Tambah Kandidat
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex items-center gap-4 mb-4">
                                <button onClick={() => setIsEditingProposal(false)} className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-all"><ChevronLeft size={20} /></button>
                                <div>
                                    <h3 className="text-[16px] font-black text-black uppercase tracking-tight">INPUT DATA KANDIDAT</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">PROPOSAL LENGKAP</p>
                                </div>
                            </div>

                            {/* Internal Tabs for Proposal - UPDATED STYLE */}
                            <div className="flex flex-wrap gap-2 bg-gray-50 p-1.5 rounded-2xl mb-8 w-full md:w-fit">
                                {['INFO UTAMA', 'SPESIFIKASI FISIK', 'RENOVASI & LINGKUNGAN', 'BIAYA & LEGAL'].map(tab => (
                                    <button 
                                        key={tab}
                                        onClick={() => setProposalTab(tab)}
                                        className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap flex-1 md:flex-none ${
                                            proposalTab === tab 
                                            ? 'bg-black text-white shadow-lg shadow-black/20 scale-105' 
                                            : 'text-gray-400 hover:text-gray-600 hover:bg-white'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-10">
                                
                                {/* 1. INFO UTAMA (Lokasi & Utilitas) */}
                                {proposalTab === 'INFO UTAMA' && (
                                    <>
                                        <div>
                                            <SectionHeader num="1" title="ALAMAT LOKASI" />
                                            <Input label="NAMA KANDIDAT" value={currentProposal.name} onChange={(e) => setCurrentProposal({...currentProposal, name: e.target.value})} placeholder="Contoh: Ruko Blok A No. 1" />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <Input label="JALAN" value={currentProposal.address?.jl} onChange={(e) => setCurrentProposal({...currentProposal, address: {...currentProposal.address!, jl: e.target.value}})} />
                                                <Input label="KOTA" value={currentProposal.address?.kota} onChange={(e) => setCurrentProposal({...currentProposal, address: {...currentProposal.address!, kota: e.target.value}})} />
                                                <Input label="KABUPATEN" value={currentProposal.address?.kabupaten} onChange={(e) => setCurrentProposal({...currentProposal, address: {...currentProposal.address!, kabupaten: e.target.value}})} />
                                                <Input label="PROPINSI" value={currentProposal.address?.propinsi} onChange={(e) => setCurrentProposal({...currentProposal, address: {...currentProposal.address!, propinsi: e.target.value}})} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <Input label="JARAK KE DEALER (KM)" value={currentProposal.distanceToDealer} onChange={(e) => setCurrentProposal({...currentProposal, distanceToDealer: e.target.value})} />
                                                <Input label="KONDISI JALAN / AKSES" value={currentProposal.roadCondition} onChange={(e) => setCurrentProposal({...currentProposal, roadCondition: e.target.value})} />
                                            </div>
                                        </div>

                                        <div>
                                            <SectionHeader num="2" title="UTILITAS" />
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <Input label="LISTRIK (WATT/AMPERE)" value={currentProposal.electricity} onChange={(e) => setCurrentProposal({...currentProposal, electricity: e.target.value})} icon={Zap} />
                                                <Input label="SUMBER AIR" value={currentProposal.water} onChange={(e) => setCurrentProposal({...currentProposal, water: e.target.value})} />
                                                <Input label="LINE TELEPON (QTY)" value={currentProposal.phoneLines} onChange={(e) => setCurrentProposal({...currentProposal, phoneLines: e.target.value})} icon={Phone} />
                                            </div>
                                            {/* Detail Line Telepon */}
                                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                <Label>PENAMBAHAN LINE TELEPON</Label>
                                                <div className="grid grid-cols-2 gap-4 mt-2">
                                                    <div className="flex items-center gap-4">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input type="radio" name="canAddPhone" checked={currentProposal.telephoneDetails?.canAdd} onChange={() => setCurrentProposal({...currentProposal, telephoneDetails: {...currentProposal.telephoneDetails!, canAdd: true}})} /> <span className="text-[10px] font-bold">Bisa Tambah</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input type="radio" name="canAddPhone" checked={!currentProposal.telephoneDetails?.canAdd} onChange={() => setCurrentProposal({...currentProposal, telephoneDetails: {...currentProposal.telephoneDetails!, canAdd: false}})} /> <span className="text-[10px] font-bold">Tidak</span>
                                                        </label>
                                                    </div>
                                                    {currentProposal.telephoneDetails?.canAdd && (
                                                        <>
                                                            <Input label="BIAYA PER LINE (RP)" value={currentProposal.telephoneDetails?.costPerLine} onChange={(e) => setCurrentProposal({...currentProposal, telephoneDetails: {...currentProposal.telephoneDetails!, costPerLine: e.target.value}})} />
                                                            <Input label="DITANGGUNG OLEH" value={currentProposal.telephoneDetails?.borneBy} onChange={(e) => setCurrentProposal({...currentProposal, telephoneDetails: {...currentProposal.telephoneDetails!, borneBy: e.target.value}})} />
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* 2. SPESIFIKASI FISIK */}
                                {proposalTab === 'SPESIFIKASI FISIK' && (
                                    <>
                                        <div>
                                            <SectionHeader num="3" title="DIMENSI & FISIK" />
                                            <div className="grid grid-cols-3 gap-6">
                                                <Input label="LUAS TANAH (M2)" type="number" value={currentProposal.landArea} onChange={(e) => setCurrentProposal({...currentProposal, landArea: e.target.value})} />
                                                <Input label="LUAS BANGUNAN (M2)" type="number" value={currentProposal.buildingArea} onChange={(e) => setCurrentProposal({...currentProposal, buildingArea: e.target.value})} />
                                                <Input label="HALAMAN DEPAN (M2)" type="number" value={currentProposal.frontYardArea} onChange={(e) => setCurrentProposal({...currentProposal, frontYardArea: e.target.value})} />
                                                <Input label="JUMLAH TINGKAT" value={currentProposal.totalFloors} onChange={(e) => setCurrentProposal({...currentProposal, totalFloors: e.target.value})} />
                                                <Input label="KAPASITAS PARKIR" value={currentProposal.parkingCapacity} onChange={(e) => setCurrentProposal({...currentProposal, parkingCapacity: e.target.value})} />
                                                <Input label="USIA BANGUNAN (THN)" value={currentProposal.buildingAge} onChange={(e) => setCurrentProposal({...currentProposal, buildingAge: e.target.value})} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-6 mt-4">
                                                <Input label="KONDISI PAGAR" value={currentProposal.fenceCondition} onChange={(e) => setCurrentProposal({...currentProposal, fenceCondition: e.target.value})} />
                                                <Input label="KONDISI PINTU PAGAR" value={currentProposal.gateCondition} onChange={(e) => setCurrentProposal({...currentProposal, gateCondition: e.target.value})} />
                                            </div>
                                        </div>

                                        <div>
                                            <SectionHeader num="4" title="MATERIAL & STRUKTUR" />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <CheckboxGroup title="TIANG / STRUKTUR" items={['Baja', 'Kayu', 'Beton']} selected={currentProposal.structureChecklist?.tiang || []} onChange={(v) => toggleStructureCheckboxProposal('tiang', v)} />
                                                <CheckboxGroup title="ATAP" items={['Alumunium', 'Tanah Liat', 'Beton Cor', 'Genting Beton']} selected={currentProposal.structureChecklist?.atap || []} onChange={(v) => toggleStructureCheckboxProposal('atap', v)} />
                                                <CheckboxGroup title="DINDING" items={['Batako', 'Bata Merah', 'Seng', 'Triplek']} selected={currentProposal.structureChecklist?.dinding || []} onChange={(v) => toggleStructureCheckboxProposal('dinding', v)} />
                                                <CheckboxGroup title="LANTAI" items={['Keramik', 'Tanpa Keramik']} selected={currentProposal.structureChecklist?.lantai || []} onChange={(v) => toggleStructureCheckboxProposal('lantai', v)} />
                                                <CheckboxGroup title="PINTU" items={['Kayu', 'Triplek', 'Baja', 'Alumunium', 'Seng']} selected={currentProposal.structureChecklist?.pintu || []} onChange={(v) => toggleStructureCheckboxProposal('pintu', v)} />
                                                <CheckboxGroup title="JENDELA" items={['Kayu', 'Alumunium', 'Besi']} selected={currentProposal.structureChecklist?.jendela || []} onChange={(v) => toggleStructureCheckboxProposal('jendela', v)} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* 3. RENOVASI & LINGKUNGAN */}
                                {proposalTab === 'RENOVASI & LINGKUNGAN' && (
                                    <>
                                        <div>
                                            <SectionHeader num="5" title="KONDISI LINGKUNGAN" />
                                            <div className="grid grid-cols-1 gap-6 mb-6">
                                                <Label>BATAS LOKASI / POSISI</Label>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Input label="DEPAN" value={currentProposal.locationContext?.front} onChange={(e) => setCurrentProposal({...currentProposal, locationContext: {...currentProposal.locationContext!, front: e.target.value}})} placeholder="Ada apa di depan?" />
                                                    <Input label="BELAKANG" value={currentProposal.locationContext?.back} onChange={(e) => setCurrentProposal({...currentProposal, locationContext: {...currentProposal.locationContext!, back: e.target.value}})} placeholder="Ada apa di belakang?" />
                                                    <Input label="KANAN" value={currentProposal.locationContext?.right} onChange={(e) => setCurrentProposal({...currentProposal, locationContext: {...currentProposal.locationContext!, right: e.target.value}})} placeholder="Ada apa di kanan?" />
                                                    <Input label="KIRI" value={currentProposal.locationContext?.left} onChange={(e) => setCurrentProposal({...currentProposal, locationContext: {...currentProposal.locationContext!, left: e.target.value}})} placeholder="Ada apa di kiri?" />
                                                </div>
                                            </div>
                                            <CheckboxGroup title="TIPE LINGKUNGAN" items={['Cluster', 'Padat Penduduk', 'Pergudangan', 'Perkantoran', 'Dekat Lapangan']} selected={currentProposal.environmentConditions || []} onChange={(v) => toggleProposalCheckbox('environmentConditions', v)} />
                                        </div>

                                        <div>
                                            <SectionHeader num="6" title="KEBUTUHAN RENOVASI" />
                                            <div className="flex gap-4 mb-4">
                                                <label className="flex items-center gap-2"><input type="radio" checked={currentProposal.renovationNeeded} onChange={() => setCurrentProposal({...currentProposal, renovationNeeded: true})} /> <span className="text-[11px] font-bold">Perlu Renovasi</span></label>
                                                <label className="flex items-center gap-2"><input type="radio" checked={!currentProposal.renovationNeeded} onChange={() => setCurrentProposal({...currentProposal, renovationNeeded: false})} /> <span className="text-[11px] font-bold">Tidak Perlu</span></label>
                                            </div>
                                            {currentProposal.renovationNeeded && (
                                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <Input label="ESTIMASI BIAYA (+/- RP)" value={currentProposal.renovationCostEstimate} onChange={(e) => setCurrentProposal({...currentProposal, renovationCostEstimate: e.target.value})} />
                                                    <Input label="ESTIMASI WAKTU (HARI)" value={currentProposal.renovationTimeEstimate} onChange={(e) => setCurrentProposal({...currentProposal, renovationTimeEstimate: e.target.value})} />
                                                    <Input label="DITANGGUNG OLEH (%)" value={currentProposal.renovationDetailsObj?.costSharing} onChange={(e) => setCurrentProposal({...currentProposal, renovationDetailsObj: {...currentProposal.renovationDetailsObj!, costSharing: e.target.value}})} placeholder="Contoh: Pemilik 50%, Penyewa 50%" />
                                                    <Input label="TENGGANG WAKTU (GRACE PERIOD)" value={currentProposal.renovationDetailsObj?.gracePeriod} onChange={(e) => setCurrentProposal({...currentProposal, renovationDetailsObj: {...currentProposal.renovationDetailsObj!, gracePeriod: e.target.value}})} placeholder="Hari" />
                                                    
                                                    <div className="md:col-span-2">
                                                        <Label>ITEM RENOVASI</Label>
                                                        <div className="grid grid-cols-2 gap-4 mt-2">
                                                            <label className="flex items-center gap-2"><input type="checkbox" checked={currentProposal.renovationDetailsObj?.items.partition} onChange={(e) => setCurrentProposal({...currentProposal, renovationDetailsObj: {...currentProposal.renovationDetailsObj!, items: {...currentProposal.renovationDetailsObj!.items, partition: e.target.checked}}})} /> <span className="text-[10px] font-bold">Sekat Ruangan</span></label>
                                                            <label className="flex items-center gap-2"><input type="checkbox" checked={currentProposal.renovationDetailsObj?.items.paint} onChange={(e) => setCurrentProposal({...currentProposal, renovationDetailsObj: {...currentProposal.renovationDetailsObj!, items: {...currentProposal.renovationDetailsObj!.items, paint: e.target.checked}}})} /> <span className="text-[10px] font-bold">Pengecatan</span></label>
                                                            <label className="flex items-center gap-2"><input type="checkbox" checked={currentProposal.renovationDetailsObj?.items.lights} onChange={(e) => setCurrentProposal({...currentProposal, renovationDetailsObj: {...currentProposal.renovationDetailsObj!, items: {...currentProposal.renovationDetailsObj!.items, lights: e.target.checked}}})} /> <span className="text-[10px] font-bold">Lampu-Lampu</span></label>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                {/* 4. BIAYA & LEGAL */}
                                {proposalTab === 'BIAYA & LEGAL' && (
                                    <>
                                        <div>
                                            <SectionHeader num="7" title="FINANSIAL" />
                                            <div className="grid grid-cols-2 gap-6">
                                                <Input label="HARGA SEWA / TAHUN (RP)" type="number" value={currentProposal.rentPrice} onChange={(e) => setCurrentProposal({...currentProposal, rentPrice: e.target.value})} />
                                                <Input label="PERIODE SEWA (THN)" value={currentProposal.leasePeriod} onChange={(e) => setCurrentProposal({...currentProposal, leasePeriod: e.target.value})} placeholder="Min - Max Tahun" />
                                                <Input label="PAJAK PPH DITANGGUNG" value={currentProposal.taxPPH} onChange={(e) => setCurrentProposal({...currentProposal, taxPPH: e.target.value})} placeholder="Pemilik / Penyewa" />
                                                <Input label="BIAYA NOTARIS" value={currentProposal.notaryFee} onChange={(e) => setCurrentProposal({...currentProposal, notaryFee: e.target.value})} placeholder="Pemilik % / Penyewa %" />
                                                <Input label="BIAYA SEWA SEBELUMNYA" value={currentProposal.previousRentPrice} onChange={(e) => setCurrentProposal({...currentProposal, previousRentPrice: e.target.value})} placeholder="(Jika Perpanjangan)" />
                                            </div>
                                        </div>

                                        <div>
                                            <SectionHeader num="8" title="LEGALITAS & PEMILIK" />
                                            <div className="grid grid-cols-2 gap-6 mb-6">
                                                <Input label="NAMA PEMILIK" value={currentProposal.owner?.name} onChange={(e) => setCurrentProposal({...currentProposal, owner: {...currentProposal.owner!, name: e.target.value}})} icon={User} />
                                                <Input label="NO TELP PEMILIK" value={currentProposal.owner?.phone} onChange={(e) => setCurrentProposal({...currentProposal, owner: {...currentProposal.owner!, phone: e.target.value}})} icon={Phone} />
                                                <Input label="ALAMAT PEMILIK" value={currentProposal.owner?.address} onChange={(e) => setCurrentProposal({...currentProposal, owner: {...currentProposal.owner!, address: e.target.value}})} />
                                            </div>
                                            <CheckboxGroup title="DOKUMEN TERSEDIA" items={['SHM', 'SHGB', 'IMB']} selected={currentProposal.documents || []} onChange={(v) => toggleProposalCheckbox('documents', v)} />
                                        </div>

                                        <div className="bg-blue-50 p-6 rounded-[2.5rem] border border-blue-100">
                                            <SectionHeader num="9" title="ANALISA BISNIS (BM NOTES)" />
                                            <div className="grid grid-cols-2 gap-6">
                                                <Input label="ESTIMASI OMZET/TAHUN" value={currentProposal.businessNotes?.margin} onChange={(e) => setCurrentProposal({...currentProposal, businessNotes: {...currentProposal.businessNotes!, margin: e.target.value}})} />
                                                <Input label="WAKTU PENGIRIMAN (HARI)" value={currentProposal.businessNotes?.deliveryTime} onChange={(e) => setCurrentProposal({...currentProposal, businessNotes: {...currentProposal.businessNotes!, deliveryTime: e.target.value}})} />
                                                <Input label="JUMLAH DEALER PARETO" value={currentProposal.businessNotes?.dealersCount} onChange={(e) => setCurrentProposal({...currentProposal, businessNotes: {...currentProposal.businessNotes!, dealersCount: e.target.value}})} />
                                                <Input label="KOMPOSISI STAFF" value={currentProposal.businessNotes?.staffComposition} onChange={(e) => setCurrentProposal({...currentProposal, businessNotes: {...currentProposal.businessNotes!, staffComposition: e.target.value}})} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                                    <button onClick={() => setIsEditingProposal(false)} className="px-8 py-3 rounded-xl bg-white border border-gray-200 text-[11px] font-black uppercase tracking-widest hover:bg-gray-50">Cancel</button>
                                    <button onClick={handleSaveProposal} className="px-10 py-3 rounded-xl bg-black text-white text-[11px] font-black uppercase tracking-widest hover:bg-gray-900 shadow-xl">Simpan Kandidat</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ... Other Tabs remain same ... */}
            {activeTab === 'FLOOR PLAN' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <SectionHeader title="VISUAL FLOOR PLAN" sub="INTERACTIVE ASSET MAPPING" />
                        
                        <div className="relative min-h-[400px] bg-[#F8F9FA] rounded-[2rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden group">
                            {form.floorPlanImage ? (
                                <>
                                    <img src={form.floorPlanImage} alt="Floor Plan" className="w-full h-full object-contain" />
                                    {!isView && (
                                        <button 
                                            onClick={() => setForm(prev => ({ ...prev, floorPlanImage: undefined }))}
                                            className="absolute top-4 right-4 bg-white/80 p-2 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500 transition-all backdrop-blur-sm"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div className="text-center p-8">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md text-gray-300 group-hover:text-black transition-colors">
                                        <UploadCloud size={24} />
                                    </div>
                                    <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-6">Upload Denah Lantai (JPG/PNG)</p>
                                    
                                    {!isView && (
                                        <div className="flex gap-4 justify-center">
                                            <button 
                                                onClick={() => fileInputRef.current?.click()}
                                                className="bg-gray-100 hover:bg-black hover:text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                                            >
                                                <UploadCloud size={14} /> Upload Map Image
                                            </button>
                                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFloorPlanUpload} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {form.floorPlanImage && (
                            <div className="mt-6 flex justify-end">
                                <button className="bg-blue-50 text-blue-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all flex items-center gap-2">
                                    <MousePointer2 size={14} /> Click Map to Add Pin
                                </button>
                            </div>
                        )}
                        
                        <div className="mt-8 border-t border-gray-100 pt-6">
                             <p className="text-[10px] font-mono text-gray-300 text-center uppercase tracking-widest">----------------------------------------------------------------------------------------</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'FINANCIAL SUMMARY' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Dark Card Summary */}
                    <div className="bg-black text-white p-12 rounded-[3rem] shadow-2xl shadow-black/30 relative overflow-hidden">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">TOTAL COST OF OWNERSHIP (TCO)</p>
                                <h2 className="text-[42px] font-black tracking-tighter leading-none mb-2">Rp 1.307.000.000</h2>
                                <p className="text-[10px] text-gray-500 font-medium">Estimated over 5 years</p>
                            </div>
                            <div className="flex flex-col justify-center md:items-start">
                                <div className="flex items-center justify-between w-full mb-3">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">AVG. MONTHLY BURN RATE</p>
                                </div>
                                <h3 className="text-[28px] font-black tracking-tight leading-none mb-1">Rp 21.833.333,333</h3>
                            </div>
                        </div>

                        <div className="absolute right-12 top-1/2 -translate-y-1/2 bg-white/10 p-4 rounded-full backdrop-blur-md hidden md:block">
                            <TrendingUp size={32} className="text-green-400" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Cost Breakdown */}
                        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <SectionHeader num="1" title="1. COST BREAKDOWN" sub="ANNUAL EXPENSE ANALYSIS" />
                            
                            <div className="space-y-6 mt-8">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-[11px] font-black text-black">Rent / Lease</span>
                                        <span className="text-[11px] font-mono font-bold text-black">Rp {parseInt(form.rentCost || '0').toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[80%] rounded-full"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-[11px] font-black text-black">Maintenance</span>
                                        <span className="text-[11px] font-mono font-bold text-black">Rp {parseInt(form.totalMaintenanceCost || '0').toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-orange-400 w-[20%] rounded-full"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-[11px] font-black text-black">Utilities (Electric/Water)</span>
                                        <span className="text-[11px] font-mono font-bold text-black">Rp {parseInt(form.utilityCost || '0').toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 w-[15%] rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Financial Health */}
                        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <SectionHeader num="2" title="2. FINANCIAL HEALTH" sub="ASSET PERFORMANCE" />
                            
                            <div className="grid grid-cols-2 gap-6 mt-8">
                                <div className="bg-green-50 p-6 rounded-3xl border border-green-100">
                                    <p className="text-[9px] font-black text-green-800 uppercase tracking-widest mb-2">EFFICIENCY SCORE</p>
                                    <h3 className="text-[32px] font-black text-black">A+</h3>
                                </div>
                                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                                    <p className="text-[9px] font-black text-blue-800 uppercase tracking-widest mb-2">BUDGET USAGE</p>
                                    <h3 className="text-[32px] font-black text-black">82%</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'WORKFLOW' && (
              <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="absolute left-[63px] top-12 bottom-12 w-[2px] bg-gray-100"></div>
                        <div className="space-y-10 relative z-10">
                            {/* Header Step: Created */}
                            <div className="flex gap-8">
                                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shadow-lg shadow-black/20 shrink-0">
                                    <FileText size={20} strokeWidth={3} />
                                </div>
                                <div className="pt-2">
                                    <h4 className="text-[13px] font-black text-black uppercase tracking-tight">Request Created</h4>
                                    <p className="text-[11px] text-gray-400 mt-1">Proposal Initiated on {form.startDate || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Workflow Steps */}
                            {form.workflow?.map((step: WorkflowStep, index: number) => (
                                <div key={index} className="flex gap-8">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-lg transition-all ${
                                        step.status === 'Approved' ? 'bg-green-500 text-white shadow-green-200' :
                                        step.status === 'Rejected' ? 'bg-red-500 text-white shadow-red-200' :
                                        'bg-gray-100 text-gray-400'
                                    }`}>
                                        {step.status === 'Approved' ? <CheckCircle2 size={20} /> : 
                                         step.status === 'Rejected' ? <X size={20} /> : <Clock size={20} />}
                                    </div>
                                    <div className="pt-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{step.role}</span>
                                            {step.date && <span className="text-[9px] font-mono font-bold text-gray-300 bg-gray-50 px-2 py-0.5 rounded">{step.date}</span>}
                                        </div>
                                        <h4 className="text-[13px] font-black text-black uppercase tracking-tight">
                                            {step.status === 'Pending' ? 'Waiting for Approval' : `Status: ${step.status}`}
                                        </h4>
                                        {step.approver && (
                                            <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1.5">
                                                <User size={12} /> {step.approver}
                                            </p>
                                        )}
                                        {step.comment && (
                                            <div className="mt-2 p-3 bg-gray-50 rounded-xl text-[11px] text-gray-600 italic border border-gray-100">
                                                "{step.comment}"
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                  </div>

                  {/* Workflow Action Buttons */}
                  {form.workflow?.some((step: WorkflowStep) => step.status === 'Pending') && (
                      <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                          <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6">Workflow Action</h4>
                          <div className="flex items-center gap-4">
                              <button 
                                  onClick={() => {
                                      const updatedWorkflow = form.workflow?.map((step: WorkflowStep) => 
                                          step.status === 'Pending' ? {...step, status: 'Approved' as const, date: new Date().toLocaleDateString()} : step
                                      );
                                      setForm({...form, workflow: updatedWorkflow});
                                  }}
                                  className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-green-500/20"
                              >
                                  <CheckCircle2 size={18} strokeWidth={3} />
                                  Approve
                              </button>
                              <button 
                                  onClick={() => {
                                      const updatedWorkflow = form.workflow?.map((step: WorkflowStep) => 
                                          step.status === 'Pending' ? {...step, status: 'Rejected' as const, date: new Date().toLocaleDateString()} : step
                                      );
                                      setForm({...form, workflow: updatedWorkflow});
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

            {activeTab === 'DOKUMEN' && (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                    <FileText size={64} className="text-gray-300 mb-6" />
                    <h3 className="text-[14px] font-black text-gray-400 uppercase tracking-widest">Dokumen belum tersedia</h3>
                    <p className="text-[10px] font-bold text-gray-300 mt-2">Silakan simpan data gedung terlebih dahulu untuk upload dokumen.</p>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="px-10 py-8 bg-white border-t border-gray-100 flex justify-end gap-4 shrink-0">
          <button onClick={onClose} className="px-16 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 bg-[#F8F9FA] rounded-[1.2rem] hover:bg-gray-100 hover:text-black transition-all">
            BATAL
          </button>
          {!isView && (
            <button 
                onClick={handleSave} 
                className="px-16 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white bg-black rounded-[1.2rem] hover:bg-gray-900 shadow-2xl shadow-black/20 transition-all active:scale-95 flex items-center gap-3"
            >
                <Save size={18} strokeWidth={2.5} /> SIMPAN DATA KONTRAK
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
