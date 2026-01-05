
import React, { useState, useEffect } from 'react';
import { X, Save, DollarSign, Car, Tag, TrendingUp, User, Clock, AlertCircle, Mail, Link, Copy, Check, ShieldCheck, ChevronRight, Trophy, Users, Phone, CreditCard, Info, Hash, Calendar as CalendarIcon, FileText, Package, Filter, CheckCircle2 } from 'lucide-react';
import { SalesRecord, VehicleRecord, BidRecord, BidderRegistration, GeneralAssetRecord } from '../types';
import { SearchableSelect, SelectOption } from './SearchableSelect';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<SalesRecord>) => void;
  initialData?: SalesRecord | null;
  mode?: 'create' | 'edit' | 'view';
  vehicleList?: VehicleRecord[];
  generalAssetList?: any[]; // Supports both GeneralAssetRecord and BuildingAssetRecord
  assetType?: 'VEHICLE' | 'GENERAL_ASSET';
}

export const SalesModal: React.FC<Props> = ({ 
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
  const [categoryFilter, setCategoryFilter] = useState('ALL'); // New Filter State

  const [form, setForm] = useState<Partial<SalesRecord>>({
    status: 'Open Bidding',
    statusApproval: 'Pending',
    tglRequest: new Date().toISOString().split('T')[0],
    hargaTertinggi: '0',
    hargaPembuka: '0',
    bids: [],
    assetType: assetType
  });

  // State for Bidding Logic
  const [newBidAmount, setNewBidAmount] = useState('');
  const [bidError, setBidError] = useState('');
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  // State for Registration Logic & View State
  const [isRegistered, setIsRegistered] = useState(false);
  const [viewState, setViewState] = useState<'idle' | 'registering' | 'bidding'>('idle');
  const [regForm, setRegForm] = useState<BidderRegistration>({
      name: '',
      ktp: '',
      phone: '',
      email: '',
      agreedToTerms: false
  });

  // State for Bidder Detail Popup
  const [selectedBidder, setSelectedBidder] = useState<BidRecord | null>(null);

  // Get full vehicle/asset details based on selection
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
        if (!initialData.bids) setForm(prev => ({ ...prev, bids: [] }));
      } else {
        setForm({
            status: 'Open Bidding',
            statusApproval: 'Pending',
            tglRequest: new Date().toISOString().split('T')[0],
            hargaTertinggi: '0',
            hargaPembuka: '0',
            noPolisi: '',
            assetNumber: '',
            channel: '',
            cabang: '',
            bids: [],
            assetType: assetType
        });
        setCategoryFilter('ALL'); // Reset filter
      }
      setActiveTab('DETAILS');
      setNewBidAmount('');
      setBidError('');
      setIsLinkCopied(false);
      setIsRegistered(false);
      setViewState('idle');
      setRegForm({ name: '', ktp: '', phone: '', email: '', agreedToTerms: false });
      setSelectedBidder(null);
    }
  }, [isOpen, initialData, assetType]);

  if (!isOpen) return null;

  const isView = mode === 'view';
  const isOpenBidding = form.status === 'Open Bid' || form.status === 'Open Bidding';

  const handleVehicleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedNoPol = e.target.value;
      const vehicle = vehicleList.find(v => v.noPolisi === selectedNoPol);
      if (vehicle) {
          setForm(prev => ({
              ...prev,
              noPolisi: vehicle.noPolisi,
              channel: vehicle.channel,
              cabang: vehicle.cabang
          }));
      } else {
          setForm(prev => ({ ...prev, noPolisi: selectedNoPol, channel: '', cabang: '' }));
      }
  };

  const handleGeneralAssetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedId = e.target.value;
      const asset = generalAssetList.find(a => a.id === selectedId || a.assetNumber === selectedId || a.assetCode === selectedId);
      
      if (asset) {
          const assetNumber = asset.assetNumber || asset.assetCode;
          const assetName = asset.assetName || asset.type;
          // Use buildingName/location logic
          const location = asset.assetLocation || asset.buildingName;
          
          setForm(prev => ({
              ...prev,
              assetNumber: assetNumber,
              assetName: assetName,
              channel: asset.channel || 'Direct',
              cabang: location, 
          }));
      } else {
          setForm(prev => ({ ...prev, assetNumber: selectedId, channel: '', cabang: '' }));
      }
  };

  const handleRegister = () => {
      if (!regForm.name || !regForm.ktp || !regForm.phone || !regForm.email || !regForm.agreedToTerms) {
          setBidError('Harap lengkapi semua data formulir registrasi.');
          return;
      }
      setIsRegistered(true);
      setViewState('bidding');
      setBidError('');
  };

  const handlePlaceBid = () => {
      if (!isRegistered) {
          setViewState('registering');
          return;
      }

      const amount = parseInt(newBidAmount.replace(/[^0-9]/g, '') || '0');
      const currentHighest = parseInt((form.hargaTertinggi || '0').replace(/[^0-9]/g, '') || '0');
      const openingPrice = parseInt((form.hargaPembuka || '0').replace(/[^0-9]/g, '') || '0');

      if (amount <= openingPrice) {
          setBidError('Penawaran harus lebih tinggi dari harga pembuka.');
          return;
      }

      if (amount <= currentHighest) {
          setBidError('Penawaran harus lebih tinggi dari penawaran tertinggi saat ini.');
          return;
      }

      const newBid: BidRecord = {
          id: Date.now().toString(),
          amount: amount.toString(),
          bidderName: regForm.name || 'Current User', 
          bidderRole: regForm.name ? 'External Participant' : 'Internal Staff',
          bidderEmail: regForm.email || 'user@modena.com',
          bidderPhone: regForm.phone || '-',
          bidderKtp: regForm.ktp || '-',
          bidderAvatar: `https://ui-avatars.com/api/?name=${regForm.name || 'User'}&background=random`, 
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      const updatedBids = [newBid, ...(form.bids || [])];
      setForm(prev => ({
          ...prev,
          bids: updatedBids,
          hargaTertinggi: amount.toString()
      }));
      
      setNewBidAmount('');
      setBidError('');
  };

  const handleCopyLink = () => {
      const auctionLink = `https://auction.modena.com/bid/${form.id || Date.now()}`;
      navigator.clipboard.writeText(auctionLink);
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 2000);
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

  const tabs = ['DETAILS', 'LIVE BIDDING', 'WORKFLOW'];

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-[#FBFBFB] w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col transform transition-all scale-100 max-h-[90vh]">
        
        {/* Header */}
        <div className="px-10 py-8 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl shadow-black/20">
                <DollarSign size={20} strokeWidth={2.5} />
            </div>
            <div>
                <h2 className="text-[18px] font-black text-black uppercase tracking-tight leading-none">
                    DETAIL PENJUALAN & LELANG
                </h2>
                <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-[0.3em]">{assetType === 'VEHICLE' ? 'Vehicle Asset Disposal' : 'General Asset Disposal'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-black transition-all p-2 rounded-full hover:bg-gray-50">
            <X size={28} />
          </button>
        </div>

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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-[#FBFBFB] relative">
            
            {/* TAB: DETAILS */}
            {activeTab === 'DETAILS' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="space-y-8">
                        {/* Asset Selection Card */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                {assetType === 'VEHICLE' ? <Car size={16} className="text-black"/> : <Package size={16} className="text-black"/>}
                                <h3 className="text-[11px] font-black text-black uppercase tracking-widest">{assetType === 'VEHICLE' ? 'UNIT YANG DIJUAL' : 'ASET YANG DIJUAL'}</h3>
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-center mb-2.5">
                                        <Label required>{assetType === 'VEHICLE' ? 'PILIH UNIT KENDARAAN' : 'PILIH ASET'}</Label>
                                        
                                        {/* Flagging Filter for General Asset */}
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
                                            options={vehicleList.filter(v => v.ownership === 'Milik Modena').map(v => ({
                                                value: v.noPolisi,
                                                label: `${v.noPolisi} - ${v.nama}`,
                                                subLabel: `${v.merek} ${v.model} (${v.tahunPembuatan})`
                                            }))}
                                            value={form.noPolisi || ''}
                                            onChange={(val) => {
                                                const vehicle = vehicleList.find(v => v.noPolisi === val);
                                                if (vehicle) {
                                                    setForm(prev => ({
                                                        ...prev,
                                                        noPolisi: vehicle.noPolisi,
                                                        channel: vehicle.channel,
                                                        cabang: vehicle.cabang
                                                    }));
                                                } else {
                                                    setForm(prev => ({ ...prev, noPolisi: val, channel: '', cabang: '' }));
                                                }
                                            }}
                                            placeholder="-- Pilih Kendaraan (Hanya Milik Sendiri) --"
                                            disabled={isView || mode === 'edit'}
                                            icon={Car}
                                            emptyMessage="Tidak ada data kendaraan"
                                        />
                                    ) : (
                                        <SearchableSelect
                                            options={filteredGeneralAssets.filter(a => a.ownership === 'Own').map(a => {
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
                                                    setForm(prev => ({
                                                        ...prev,
                                                        assetNumber: assetNumber,
                                                        assetName: assetName,
                                                        channel: asset.channel || 'Direct',
                                                        cabang: location,
                                                    }));
                                                } else {
                                                    setForm(prev => ({ ...prev, assetNumber: val, channel: '', cabang: '' }));
                                                }
                                            }}
                                            placeholder={`-- Pilih Aset ${categoryFilter !== 'ALL' ? `(${categoryFilter})` : ''} --`}
                                            disabled={isView || mode === 'edit'}
                                            icon={Package}
                                            emptyMessage="Tidak ada data aset"
                                        />
                                    )}
                                </div>

                                {/* Detailed Vehicle Info (Read Only) */}
                                {assetType === 'VEHICLE' && selectedVehicle && (
                                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200/50">
                                            <Info size={14} className="text-black" />
                                            <span className="text-[10px] font-black text-black uppercase tracking-widest">Spesifikasi Detail</span>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                                            <DetailItem label="Merek" value={selectedVehicle.merek} />
                                            <DetailItem label="Tipe" value={selectedVehicle.tipeKendaraan} />
                                            <DetailItem label="Model" value={selectedVehicle.model} />
                                            <DetailItem label="Tahun" value={selectedVehicle.tahunPembuatan} icon={CalendarIcon} />
                                            <DetailItem label="Warna" value={selectedVehicle.warna} />
                                            <DetailItem label="Silinder" value={selectedVehicle.isiSilinder} />
                                            
                                            <div className="col-span-2 h-px bg-gray-200/50 my-1"></div>
                                            
                                            <DetailItem label="No. Rangka" value={selectedVehicle.noRangka} icon={Hash} />
                                            <DetailItem label="No. Mesin" value={selectedVehicle.noMesin} icon={Hash} />
                                            <DetailItem label="No. BPKB" value={selectedVehicle.noBpkb} icon={FileText} />
                                            
                                            <div className="col-span-2 mt-1">
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Masa Berlaku STNK</span>
                                                <div className="flex gap-2">
                                                    <span className="text-[10px] font-mono font-bold text-black bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">{selectedVehicle.masaBerlaku1 || '-'} (1Y)</span>
                                                    <span className="text-[10px] font-mono font-bold text-black bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">{selectedVehicle.masaBerlaku5 || '-'} (5Y)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Detailed General Asset Info */}
                                {assetType === 'GENERAL_ASSET' && selectedGeneralAsset && (
                                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200/50">
                                            <Info size={14} className="text-black" />
                                            <span className="text-[10px] font-black text-black uppercase tracking-widest">Detail Aset</span>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                                            <DetailItem label="Kategori" value={selectedGeneralAsset.assetCategory || selectedGeneralAsset.assetType} />
                                            <DetailItem label="Tipe / Nama" value={selectedGeneralAsset.type || selectedGeneralAsset.assetName} />
                                            <DetailItem label="Lokasi" value={selectedGeneralAsset.assetLocation || selectedGeneralAsset.buildingName} />
                                            <DetailItem label="Sub Lokasi" value={selectedGeneralAsset.subLocation || `${selectedGeneralAsset.floor || ''} ${selectedGeneralAsset.roomName || ''}`} />
                                            <DetailItem label="Departemen" value={selectedGeneralAsset.department || '-'} />
                                            <DetailItem label="Tgl Beli" value={selectedGeneralAsset.purchaseDate} icon={CalendarIcon} />
                                            
                                            <div className="col-span-2 h-px bg-gray-200/50 my-1"></div>
                                            
                                            <div className="col-span-2">
                                                <DetailItem label="Harga Perolehan" value={`Rp ${parseInt(selectedGeneralAsset.purchasePrice || '0').toLocaleString('id-ID')}`} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label>LOKASI ASET</Label>
                                        <input 
                                            type="text"
                                            disabled={true}
                                            className="w-full bg-[#F8F9FA] border-none rounded-2xl px-5 py-4 text-[12px] font-black text-gray-500 outline-none"
                                            value={form.cabang || '-'}
                                        />
                                    </div>
                                    <div>
                                        <Label>TANGGAL REQUEST DISPOSAL</Label>
                                        <input 
                                            type="date"
                                            disabled={isView}
                                            className="w-full bg-[#F8F9FA] border-none rounded-2xl px-5 py-4 text-[12px] font-black text-black outline-none shadow-sm focus:ring-2 focus:ring-black/5 disabled:text-gray-400"
                                            value={form.tglRequest}
                                            onChange={(e) => setForm({...form, tglRequest: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sales Details Card */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <Tag size={16} className="text-black"/>
                                <h3 className="text-[11px] font-black text-black uppercase tracking-widest">DETAIL PENAWARAN</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <Label required>METODE PENJUALAN</Label>
                                    <select 
                                        disabled={isView}
                                        className="w-full bg-[#F8F9FA] border-none rounded-2xl px-5 py-4 text-[12px] font-black text-black outline-none shadow-sm focus:ring-2 focus:ring-black/5 disabled:text-gray-400 appearance-none cursor-pointer"
                                        value={form.status}
                                        onChange={(e) => setForm({...form, status: e.target.value})}
                                    >
                                        <option value="Open Bidding">Lelang Terbuka</option>
                                        <option value="Direct Sale">Penjualan Langsung</option>
                                        <option value="Scrap">Scrap / Besi Tua</option>
                                    </select>
                                </div>
                                
                                <div className="relative">
                                    <Label>HARGA PEMBUKA (IDR)</Label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">Rp</span>
                                        <input 
                                            type="number"
                                            disabled={isView}
                                            className="w-full bg-[#F8F9FA] border-none rounded-2xl pl-10 pr-5 py-4 text-[12px] font-black text-black outline-none shadow-sm focus:ring-2 focus:ring-black/5 disabled:text-gray-400"
                                            value={form.hargaPembuka}
                                            onChange={(e) => setForm({...form, hargaPembuka: e.target.value})}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div className="relative">
                                    <Label>HARGA TERTINGGI SAAT INI</Label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">Rp</span>
                                        <input 
                                            type="number"
                                            disabled={true}
                                            className="w-full bg-green-50 border-none rounded-2xl pl-10 pr-5 py-4 text-[12px] font-black text-green-700 outline-none shadow-sm"
                                            value={form.hargaTertinggi}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side of Details Tab: LEADERBOARD SUMMARY */}
                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-full">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <Trophy size={16} className="text-yellow-500" />
                                    <h3 className="text-[11px] font-black text-black uppercase tracking-widest">TOP 4 LEADERBOARD</h3>
                                </div>
                                <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                                    Total: {form.bids?.length || 0}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {form.bids && form.bids.length > 0 ? (
                                    form.bids.slice(0, 4).map((bid, idx) => (
                                        <div 
                                            key={idx} 
                                            onClick={() => setSelectedBidder(bid)}
                                            className={`p-4 rounded-2xl border flex justify-between items-center cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] ${
                                                idx === 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-[#FBFBFB] border-gray-100'
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-black text-white shadow-sm ${
                                                    idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-400' : 'bg-black'
                                                }`}>
                                                    #{idx + 1}
                                                </div>
                                                <div>
                                                    <p className="text-[12px] font-black text-black">{bid.bidderName}</p>
                                                    <p className="text-[10px] text-gray-400">{bid.timestamp.split(' ')[0]}</p>
                                                </div>
                                            </div>
                                            <p className="text-[14px] font-mono font-black text-black">
                                                Rp {parseInt(bid.amount).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-16 opacity-50 flex flex-col items-center border-2 border-dashed border-gray-100 rounded-3xl">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                            <Trophy size={24} className="text-gray-300" />
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Belum ada penawaran masuk</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <p className="text-[10px] text-gray-400 text-center italic">
                                    *Klik pada penawar untuk melihat detail lengkap.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: LIVE BIDDING */}
            {activeTab === 'LIVE BIDDING' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Left Panel: Auction Status & Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-[12px] font-black text-black uppercase tracking-widest flex items-center gap-2">
                                    <TrendingUp size={16} /> Auction Status
                                </h3>
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${isOpenBidding ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                    {isOpenBidding ? 'ACTIVE' : 'CLOSED'}
                                </span>
                            </div>
                            
                            <div className="mb-8">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Current Highest Bid</p>
                                <p className="text-[32px] font-black text-green-600 font-mono tracking-tight leading-none">
                                    Rp {parseInt(form.hargaTertinggi || '0').toLocaleString('id-ID')}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-2xl flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Total Bidders</span>
                                    <span className="text-[14px] font-black text-black flex items-center gap-2">
                                        <Users size={14} /> {form.bids?.length || 0}
                                    </span>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Opening Price</span>
                                    <span className="text-[14px] font-black text-black">
                                        Rp {parseInt(form.hargaPembuka || '0').toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <button 
                                    onClick={handleCopyLink}
                                    className="w-full py-4 bg-black text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-900 transition-all flex items-center justify-center gap-2 relative group shadow-xl shadow-black/20 active:scale-95"
                                >
                                    {isLinkCopied ? <Check size={16} className="text-green-400" /> : <Link size={16} />}
                                    {isLinkCopied ? 'Link Copied!' : 'Copy Auction Link'}
                                </button>
                                <p className="text-[9px] text-gray-400 mt-3 text-center">
                                    Bagikan link ini kepada calon peserta lelang eksternal.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Feed & Input */}
                    <div className="lg:col-span-2 flex flex-col h-[600px] bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden relative">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="text-[12px] font-black text-black uppercase tracking-widest">Live Feed</h3>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                Live Updates
                            </div>
                        </div>

                        {/* VIEW STATE: IDLE - Not Registered */}
                        {viewState === 'idle' && !isRegistered && (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/30">
                                <div className="w-20 h-20 bg-black text-white rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl shadow-black/20">
                                    <ShieldCheck size={32} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-[18px] font-black text-black uppercase tracking-tight mb-2">Restricted Access</h3>
                                <p className="text-[11px] text-gray-500 font-medium max-w-xs leading-relaxed mb-8">
                                    Untuk berpartisipasi dalam lelang dan melihat penawaran secara detail, Anda wajib mengisi formulir pendaftaran.
                                </p>
                                <button 
                                    onClick={() => setViewState('registering')}
                                    className="px-8 py-4 bg-black text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-900 transition-all shadow-xl active:scale-95 flex items-center gap-2"
                                >
                                    Isi Formulir Pendaftaran <ChevronRight size={14} />
                                </button>
                            </div>
                        )}

                        {/* VIEW STATE: REGISTERING - Form */}
                        {viewState === 'registering' && (
                            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-white animate-in slide-in-from-bottom-4">
                                <div className="max-w-md mx-auto">
                                    <div className="flex items-center gap-3 mb-8">
                                        <button onClick={() => setViewState('idle')} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-all"><X size={16}/></button>
                                        <h3 className="text-[14px] font-black text-black uppercase tracking-widest">Formulir Peserta Lelang</h3>
                                    </div>
                                    
                                    <div className="space-y-5">
                                        <div>
                                            <Label required>Nama Lengkap (Sesuai KTP)</Label>
                                            <div className="relative">
                                                <input type="text" className="w-full bg-[#F8F9FA] border-none rounded-xl px-5 py-4 pl-12 text-[12px] font-bold outline-none focus:ring-2 focus:ring-black/5 transition-all" value={regForm.name} onChange={(e) => setRegForm({...regForm, name: e.target.value})} placeholder="Nama Lengkap" />
                                                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            </div>
                                        </div>
                                        <div>
                                            <Label required>NIK / No. KTP</Label>
                                            <div className="relative">
                                                <input type="text" className="w-full bg-[#F8F9FA] border-none rounded-xl px-5 py-4 pl-12 text-[12px] font-bold outline-none focus:ring-2 focus:ring-black/5 transition-all" value={regForm.ktp} onChange={(e) => setRegForm({...regForm, ktp: e.target.value})} placeholder="Nomor Induk Kependudukan" />
                                                <CreditCard size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label required>No. WhatsApp</Label>
                                                <div className="relative">
                                                    <input type="text" className="w-full bg-[#F8F9FA] border-none rounded-xl px-5 py-4 pl-12 text-[12px] font-bold outline-none focus:ring-2 focus:ring-black/5 transition-all" value={regForm.phone} onChange={(e) => setRegForm({...regForm, phone: e.target.value})} placeholder="0812..." />
                                                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                </div>
                                            </div>
                                            <div>
                                                <Label required>Email</Label>
                                                <div className="relative">
                                                    <input type="email" className="w-full bg-[#F8F9FA] border-none rounded-xl px-5 py-4 pl-12 text-[12px] font-bold outline-none focus:ring-2 focus:ring-black/5 transition-all" value={regForm.email} onChange={(e) => setRegForm({...regForm, email: e.target.value})} placeholder="email@domain.com" />
                                                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all mt-2">
                                            <input type="checkbox" className="w-4 h-4 rounded text-black focus:ring-black border-gray-300" checked={regForm.agreedToTerms} onChange={(e) => setRegForm({...regForm, agreedToTerms: e.target.checked})} />
                                            <span className="text-[10px] text-gray-500 font-medium">Saya menyetujui Syarat & Ketentuan Lelang yang berlaku.</span>
                                        </label>

                                        {bidError && (
                                            <div className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
                                                <AlertCircle size={14} />
                                                <span className="text-[10px] font-bold">{bidError}</span>
                                            </div>
                                        )}

                                        <button 
                                            onClick={handleRegister}
                                            className="w-full py-4 bg-black text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-900 transition-all shadow-lg active:scale-95 mt-4"
                                        >
                                            Simpan & Masuk Lelang
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* VIEW STATE: BIDDING - Registered & Active */}
                        {viewState === 'bidding' && isRegistered && (
                            <>
                                {/* Scrollable Bid History */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 bg-[#FAFAFA]">
                                    {form.bids && form.bids.length > 0 ? (
                                        form.bids.map((bid, idx) => (
                                            <div 
                                                key={idx} 
                                                onClick={() => setSelectedBidder(bid)}
                                                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group flex justify-between items-center cursor-pointer hover:border-black/10"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <img 
                                                            src={bid.bidderAvatar || `https://ui-avatars.com/api/?name=${bid.bidderName}&background=random`} 
                                                            alt={bid.bidderName}
                                                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                                        />
                                                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white border-2 border-white ${idx === 0 ? 'bg-green-500' : 'bg-gray-400'}`}>
                                                            #{idx + 1}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[13px] font-black text-black leading-tight group-hover:text-blue-600 transition-colors">{bid.bidderName}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[9px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-bold uppercase">{bid.bidderRole || 'Participant'}</span>
                                                            <span className="text-[9px] text-gray-400 font-medium flex items-center gap-1"><Clock size={8} /> {bid.timestamp.split(' ')[1]}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[16px] font-black text-green-600 font-mono tracking-tight">Rp {parseInt(bid.amount).toLocaleString('id-ID')}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center opacity-40">
                                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                <TrendingUp size={32} className="text-gray-400" />
                                            </div>
                                            <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Waiting for first bid...</p>
                                        </div>
                                    )}
                                </div>

                                {/* Input Area */}
                                {isOpenBidding && (
                                    <div className="p-6 border-t border-gray-100 bg-white z-10 animate-in slide-in-from-bottom-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Masukan Penawaran Anda</label>
                                            <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                                                <Check size={10} /> Terdaftar: {regForm.name || 'User'}
                                            </span>
                                        </div>
                                        <div className="relative mb-4">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[12px] font-black text-gray-400">Rp</span>
                                            <input 
                                                type="number"
                                                className="w-full bg-[#F8F9FA] border-none rounded-2xl pl-12 pr-4 py-4 text-[16px] font-black text-black outline-none focus:ring-2 focus:ring-black/5 transition-all"
                                                value={newBidAmount}
                                                onChange={(e) => {
                                                    setNewBidAmount(e.target.value);
                                                    setBidError('');
                                                }}
                                                placeholder="0"
                                            />
                                        </div>
                                        
                                        {bidError && (
                                            <div className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-3 rounded-xl mb-4">
                                                <AlertCircle size={14} />
                                                <span className="text-[10px] font-bold">{bidError}</span>
                                            </div>
                                        )}

                                        <button 
                                            onClick={handlePlaceBid}
                                            disabled={!newBidAmount}
                                            className="w-full py-4 bg-black text-white rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-gray-900 transition-all active:scale-95 shadow-xl shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Kirim Penawaran
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* TAB: WORKFLOW */}
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
                                    <h4 className="text-[13px] font-black text-black uppercase tracking-tight">Sales Request Created</h4>
                                    <p className="text-[11px] text-gray-400 mt-1">Submitted on {form.tglRequest || new Date().toLocaleDateString()}</p>
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
                                        {form.statusApproval === 'Approved' ? 'Sales Approved' : 
                                         form.statusApproval === 'Rejected' ? 'Sales Rejected' : 'Waiting for approval'}
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

            {/* GLOBAL OVERLAY: Selected Bidder Details */}
            {selectedBidder && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 p-8 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                    <button onClick={() => setSelectedBidder(null)} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-all"><X size={20}/></button>
                    
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl mb-6">
                            <img src={selectedBidder.bidderAvatar} className="w-full h-full object-cover" alt={selectedBidder.bidderName} />
                        </div>
                        <h2 className="text-[20px] font-black text-black uppercase tracking-tight">{selectedBidder.bidderName}</h2>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1 mb-8">{selectedBidder.bidderRole}</p>
                        
                        <div className="w-full max-w-sm space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2"><CreditCard size={14} /> NIK / KTP</span>
                                <span className="text-[12px] font-black text-black">{selectedBidder.bidderKtp || '-'}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2"><Phone size={14} /> Phone</span>
                                <span className="text-[12px] font-black text-black">{selectedBidder.bidderPhone || '-'}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2"><Mail size={14} /> Email</span>
                                <span className="text-[12px] font-black text-black">{selectedBidder.bidderEmail || '-'}</span>
                            </div>
                            
                            <div className="mt-8 pt-8 border-t border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Bid Amount</p>
                                <p className="text-[24px] font-black text-green-600 font-mono tracking-tight">Rp {parseInt(selectedBidder.amount).toLocaleString('id-ID')}</p>
                                <p className="text-[10px] text-gray-400 mt-2 font-medium">Placed on {selectedBidder.timestamp}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="px-10 py-8 bg-white border-t border-gray-100 flex justify-end gap-4 shrink-0">
          <button onClick={onClose} className="px-12 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 bg-[#F8F9FA] border-none rounded-2xl hover:bg-gray-100 hover:text-black transition-all">BATAL</button>
          {!isView && (
            <button 
                onClick={() => onSave(form)} 
                className="px-16 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white bg-black rounded-2xl hover:bg-gray-900 shadow-xl shadow-black/20 transition-all active:scale-95 flex items-center gap-3"
            >
                <Save size={18} strokeWidth={2.5} /> SIMPAN PENJUALAN
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
