
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Save, Wrench, Plus, Trash2, Calendar, Clock, User, CheckCircle2, AlertCircle, FileText, PlayCircle, Info, Hash, MapPin, Tag, ShieldCheck, Camera, Image as ImageIcon, Car } from 'lucide-react';
import { ServiceRecord, VehicleRecord, SparePart, GeneralMasterItem, VendorRecord } from '../types';
import { SearchableSelect, SelectOption } from './SearchableSelect';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<ServiceRecord>) => void;
  initialData?: ServiceRecord | null;
  mode?: 'create' | 'edit' | 'view';
  vehicleList: VehicleRecord[];
  serviceTypeList?: GeneralMasterItem[];
  vendorList?: VendorRecord[];
}

export const ServiceModal: React.FC<Props> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    initialData, 
    mode = 'create',
    vehicleList,
    serviceTypeList = [],
    vendorList = []
}) => {
  const [form, setForm] = useState<Partial<ServiceRecord>>({
    noPolisi: '',
    aset: '',
    tglRequest: new Date().toISOString().split('T')[0],
    vendor: '',
    kmKendaraan: '',
    masalah: '',
    jenisServis: 'Servis Rutin',
    statusApproval: 'Pending',
    status: 'Scheduled',
    spareParts: []
  });

  const [parts, setParts] = useState<SparePart[]>([]);
  
  // Logic for Image Upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePartIndex, setActivePartIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm(initialData);
        setParts(initialData.spareParts || []);
      } else {
        setForm({
          noPolisi: '',
          aset: '',
          tglRequest: new Date().toISOString().split('T')[0],
          vendor: '',
          kmKendaraan: '',
          masalah: '',
          jenisServis: 'Servis Rutin',
          statusApproval: 'Pending',
          status: 'Scheduled',
          spareParts: []
        });
        setParts([]);
      }
    }
  }, [isOpen, initialData]);

  const isView = mode === 'view';
  const isNonRoutine = form.jenisServis === 'Non-Rutin' || form.jenisServis === 'Ganti Ban'; // Example condition

  // Get Selected Vehicle Details
  const selectedVehicle = useMemo(() => {
      return vehicleList.find(v => v.noPolisi === form.noPolisi);
  }, [form.noPolisi, vehicleList]);

  const addPart = () => {
    setParts([...parts, { name: '', qty: 1, price: '0', imageUrl: '' }]);
  };

  const removePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const updatePart = (index: number, field: keyof SparePart, value: any) => {
    const newParts = [...parts];
    newParts[index] = { ...newParts[index], [field]: value };
    setParts(newParts);
  };

  // Image Upload Handlers
  const handlePartImageUpload = (index: number) => {
      if (!isView) {
          setActivePartIndex(index);
          fileInputRef.current?.click();
      }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && activePartIndex !== null) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              updatePart(activePartIndex, 'imageUrl', ev.target?.result as string);
          };
          reader.readAsDataURL(file);
      }
      e.target.value = ''; // Reset
  };

  const removePartImage = (e: React.MouseEvent, index: number) => {
      e.stopPropagation();
      updatePart(index, 'imageUrl', undefined);
  };

  const totalBiaya = useMemo(() => {
    return parts.reduce((acc, curr) => {
      const priceStr = curr.price.toString().replace(/[^0-9]/g, '');
      const price = parseInt(priceStr) || 0;
      return acc + (curr.qty * price);
    }, 0);
  }, [parts]);

  const handleSave = () => {
    onSave({ ...form, spareParts: parts, estimasiBiaya: totalBiaya.toString() });
    onClose();
  };

  const getLogs = () => {
      const logs = [
          { id: 1, date: form.tglRequest, user: 'System', role: 'System', action: 'Request Created', status: 'Draft', icon: FileText, color: 'text-gray-400', bg: 'bg-gray-100' },
      ];

      // Mocking logs based on current status for display purposes
      if (form.statusApproval === 'Pending' || form.statusApproval === 'Pending Approval') {
           logs.push({ id: 2, date: form.tglRequest, user: 'Ibnu Faisal', role: 'Facility Staff', action: 'Submitted for Approval', status: 'Pending', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-100' });
      }

      if (form.statusApproval === 'Approved') {
          logs.push({ id: 2, date: form.tglRequest, user: 'Ibnu Faisal', role: 'Facility Staff', action: 'Submitted', status: 'Pending', icon: Clock, color: 'text-gray-400', bg: 'bg-gray-50' });
          logs.push({ id: 3, date: 'Next Day', user: 'Budi Santoso', role: 'Manager', action: 'Approved Request', status: 'Approved', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100' });
      } else if (form.statusApproval === 'Rejected') {
          logs.push({ id: 3, date: 'Next Day', user: 'Budi Santoso', role: 'Manager', action: 'Rejected Request', status: 'Rejected', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-100' });
      }

      if (form.status === 'In Progress' || form.status === 'On Progress') {
           logs.push({ id: 4, date: 'Processing', user: form.vendor || 'Vendor', role: 'Mechanic', action: 'Service Started', status: 'In Progress', icon: PlayCircle, color: 'text-blue-600', bg: 'bg-blue-50' });
      }
      
      if (form.status === 'Completed' || form.status === 'Selesai') {
           if (!logs.find(l => l.status === 'In Progress')) {
                logs.push({ id: 4, date: 'Processing', user: form.vendor || 'Vendor', role: 'Mechanic', action: 'Service Started', status: 'In Progress', icon: PlayCircle, color: 'text-gray-400', bg: 'bg-gray-50' });
           }
           logs.push({ id: 5, date: 'Finished', user: form.vendor || 'Vendor', role: 'Mechanic', action: 'Service Completed', status: 'Completed', icon: CheckCircle2, color: 'text-green-700', bg: 'bg-green-100' });
      }

      return logs.reverse();
  };

  if (!isOpen) return null;

  const Label = ({ children }: { children?: React.ReactNode }) => (
    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
      {children}
    </label>
  );

  const DetailItem = ({ label, value, icon: Icon, isDate = false }: { label: string, value?: string, icon?: any, isDate?: boolean }) => (
      <div className="flex flex-col">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
              {Icon && <Icon size={10} />} {label}
          </span>
          <span className={`text-[11px] font-black text-black leading-tight ${isDate ? 'font-mono' : ''} truncate`} title={value}>
              {value || '-'}
          </span>
      </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-[1200px] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl shadow-black/20">
                <Wrench size={20} strokeWidth={2.5} />
            </div>
            <div>
                <h2 className="text-[18px] font-black text-black uppercase tracking-tight leading-none">
                    {mode === 'create' ? 'Input Catatan Pemeliharaan' : 'Detail Pemeliharaan'}
                </h2>
                <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-[0.3em]">Vehicle Maintenance Log</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-black transition-colors p-2 rounded-full hover:bg-gray-50">
            <X size={28} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content Body - Split View */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row bg-[#FBFBFB]">
          
          {/* Left Column: Form Details */}
          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-8">
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-6 bg-black rounded-full"></div>
                <h3 className="text-[12px] font-black text-black uppercase tracking-[0.2em]">Data Unit Kendaraan</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <Label>Pilih Unit</Label>
                        <SearchableSelect
                            options={vehicleList.map(v => ({
                                value: v.noPolisi,
                                label: `${v.noPolisi} - ${v.nama}`,
                                subLabel: `${v.merek} ${v.model} (${v.tahunPembuatan})`
                            }))}
                            value={form.noPolisi || ''}
                            onChange={(val) => {
                                const v = vehicleList.find(x => x.noPolisi === val);
                                setForm({...form, noPolisi: val, aset: v?.nama});
                            }}
                            disabled={isView}
                            placeholder="(Pilih Unit)"
                            icon={Car}
                        />

                        {/* Display Detailed Vehicle Info if Selected */}
                        {selectedVehicle && (
                            <div className="mt-6 bg-gray-50 rounded-[1.5rem] p-6 border border-gray-100 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200/60">
                                    <div className="bg-black text-white p-1 rounded">
                                        <Info size={12} />
                                    </div>
                                    <span className="text-[10px] font-black text-black uppercase tracking-widest">Spesifikasi Aset</span>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-y-6 gap-x-4">
                                    <DetailItem label="Merek / Brand" value={selectedVehicle.merek} icon={Tag} />
                                    <DetailItem label="Tipe Kendaraan" value={selectedVehicle.tipeKendaraan} />
                                    <DetailItem label="Model" value={selectedVehicle.model} />
                                    
                                    <DetailItem label="Tahun" value={selectedVehicle.tahunPembuatan} icon={Calendar} />
                                    <DetailItem label="Warna" value={selectedVehicle.warna} />
                                    <DetailItem label="Silinder (CC)" value={selectedVehicle.isiSilinder} />

                                    <div className="col-span-3 h-px bg-gray-200/60"></div>

                                    <div className="col-span-1">
                                        <DetailItem label="No. Rangka" value={selectedVehicle.noRangka} icon={Hash} />
                                    </div>
                                    <div className="col-span-2">
                                        <DetailItem label="No. Mesin" value={selectedVehicle.noMesin} icon={Hash} />
                                    </div>

                                    <div className="col-span-3 h-px bg-gray-200/60"></div>

                                    <DetailItem label="STNK 1 Tahun" value={selectedVehicle.masaBerlaku1} isDate icon={ShieldCheck} />
                                    <DetailItem label="STNK 5 Tahun" value={selectedVehicle.masaBerlaku5} isDate />
                                    <DetailItem label="KIR" value={selectedVehicle.masaBerlakuKir} isDate />

                                    <div className="col-span-3 bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                <User size={14} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase">Pengguna</p>
                                                <p className="text-[11px] font-black text-black">{selectedVehicle.pengguna || '-'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1 justify-end"><MapPin size={10}/> Lokasi</p>
                                            <p className="text-[11px] font-black text-black">{selectedVehicle.cabang} - {selectedVehicle.channel}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        <Label>Kategori Pemeliharaan</Label>
                        <div className="relative">
                            <select
                                className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-[13px] font-black bg-white focus:border-black outline-none appearance-none shadow-sm cursor-pointer uppercase"
                                disabled={isView}
                                value={form.jenisServis || ''}
                                onChange={(e) => setForm({...form, jenisServis: e.target.value})}
                            >
                                <option value="">(Pilih Kategori)</option>
                                {serviceTypeList.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                                {/* Fallback/Default Options */}
                                {!serviceTypeList.length && (
                                    <>
                                        <option value="Servis Rutin">Servis Rutin</option>
                                        <option value="Non-Rutin">Non-Rutin</option>
                                        <option value="Ganti Ban">Ganti Ban</option>
                                    </>
                                )}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <Label>Odometer (KM)</Label>
                    <input 
                      type="text"
                      className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-[13px] font-black placeholder:text-gray-300 focus:border-black outline-none shadow-sm"
                      value={form.kmKendaraan}
                      onChange={(e) => setForm({...form, kmKendaraan: e.target.value})}
                      disabled={isView}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Bengkel / Rekanan</Label>
                    <div className="relative">
                        <input 
                            list="vendor-list"
                            type="text"
                            className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-[13px] font-black placeholder:text-gray-300 focus:border-black outline-none shadow-sm"
                            value={form.vendor}
                            onChange={(e) => setForm({...form, vendor: e.target.value})}
                            disabled={isView}
                            placeholder="Nama Bengkel"
                        />
                        <datalist id="vendor-list">
                            {vendorList.filter(v => v.type === 'Service' || v.type === 'Both').map(v => (
                                <option key={v.id} value={v.vendorName}>{v.vendorName}</option>
                            ))}
                        </datalist>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Deskripsi Masalah</Label>
                  <textarea 
                    className="w-full border border-gray-200 rounded-3xl px-6 py-5 text-[13px] font-medium min-h-[120px] focus:border-black outline-none transition-all placeholder:text-gray-300 shadow-sm resize-none bg-gray-50/50"
                    value={form.masalah}
                    onChange={(e) => setForm({...form, masalah: e.target.value})}
                    disabled={isView}
                    placeholder="Deskripsikan keluhan atau detail servis..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-black rounded-full"></div>
                  <h3 className="text-[12px] font-black text-black uppercase tracking-[0.2em]">Rincian Suku Cadang</h3>
                </div>
                {!isView && (
                  <button 
                    onClick={addPart}
                    className="bg-black text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-black/10"
                  >
                    <Plus size={14} strokeWidth={3} /> Tambah Item
                  </button>
                )}
              </div>

              {/* Hidden File Input for Parts */}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onFileChange} />

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                      <th className="pb-4 px-2">ITEM DESCRIPTION</th>
                      <th className="pb-4 px-2 text-center w-24">QTY</th>
                      <th className="pb-4 px-2 text-right w-40">PRICE (IDR)</th>
                      <th className="pb-4 px-2 text-right w-40">SUBTOTAL</th>
                      {isNonRoutine && <th className="pb-4 px-2 text-center w-20">BUKTI / FOTO</th>}
                      {!isView && <th className="pb-4 w-12"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {parts.map((part, idx) => {
                      const priceStr = part.price.toString().replace(/[^0-9]/g, '');
                      const price = parseInt(priceStr) || 0;
                      const subtotal = part.qty * price;
                      return (
                        <tr key={idx} className="group">
                          <td className="py-4 px-2">
                            <input 
                              type="text"
                              className="w-full border-none p-0 text-[13px] font-bold text-black focus:ring-0 placeholder:text-gray-300 bg-transparent"
                              value={part.name}
                              onChange={(e) => updatePart(idx, 'name', e.target.value)}
                              disabled={isView}
                              placeholder="Part Name"
                            />
                          </td>
                          <td className="py-4 px-2">
                            <input 
                              type="number"
                              className="w-full border-none p-0 text-[13px] font-black text-center focus:ring-0 bg-transparent"
                              value={part.qty}
                              onChange={(e) => updatePart(idx, 'qty', parseInt(e.target.value) || 0)}
                              disabled={isView}
                            />
                          </td>
                          <td className="py-4 px-2 text-right">
                            <input 
                              type="text"
                              className="w-full border-none p-0 text-[13px] font-black text-right focus:ring-0 bg-transparent"
                              value={part.price}
                              onChange={(e) => updatePart(idx, 'price', e.target.value)}
                              disabled={isView}
                              placeholder="0"
                            />
                          </td>
                          <td className="py-4 px-2 text-right font-black text-[13px] text-black">
                            {subtotal.toLocaleString('id-ID')}
                          </td>
                          
                          {/* Image Upload Column for Non-Routine */}
                          {isNonRoutine && (
                              <td className="py-4 px-2 text-center">
                                  {part.imageUrl ? (
                                      <div className="relative w-10 h-10 mx-auto group/img">
                                          <img src={part.imageUrl} alt="Part" className="w-full h-full object-cover rounded-lg border border-gray-200" />
                                          {!isView && (
                                              <button 
                                                  onClick={(e) => removePartImage(e, idx)}
                                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/img:opacity-100 transition-opacity"
                                              >
                                                  <X size={10} />
                                              </button>
                                          )}
                                      </div>
                                  ) : (
                                      !isView && (
                                          <button 
                                              onClick={() => handlePartImageUpload(idx)}
                                              className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-100 transition-all mx-auto"
                                              title="Upload Evidence"
                                          >
                                              <Camera size={14} />
                                          </button>
                                      )
                                  )}
                              </td>
                          )}

                          {!isView && (
                            <td className="py-4 px-2 text-right">
                              <button onClick={() => removePart(idx)} className="text-gray-200 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="pt-8 pb-2 text-right">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ESTIMATED TOTAL COST</span>
                      </td>
                      <td className="pt-8 pb-2 text-right">
                        <span className="text-[18px] font-black text-black">Rp {totalBiaya.toLocaleString('id-ID')}</span>
                      </td>
                      {isNonRoutine && <td className="pt-8"></td>}
                      {!isView && <td className="pt-8"></td>}
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: History Log / Sidebar */}
          <div className="w-full lg:w-[350px] bg-white border-l border-gray-100 p-10 overflow-y-auto custom-scrollbar shrink-0">
             <div className="flex items-center gap-3 mb-10">
                <Clock size={18} className="text-black"/>
                <h3 className="text-[12px] font-black text-black uppercase tracking-[0.2em]">Activity Log</h3>
             </div>

             <div className="space-y-10 relative">
                <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-gray-100"></div>
                
                {getLogs().map((log, index) => (
                    <div key={index} className="relative pl-12 group">
                        <div className={`absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 ${log.bg} group-hover:scale-110 transition-transform`}>
                            <log.icon size={16} className={log.color} />
                        </div>
                        <div>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">{log.date}</span>
                            <h4 className="text-[12px] font-black text-black leading-tight mb-0.5">{log.action}</h4>
                            <div className="text-[10px] text-gray-500 font-medium flex items-center gap-1.5 mt-1">
                                <User size={10} /> 
                                <span className="font-bold">{log.user}</span> 
                                <span className="text-gray-300">•</span>
                                <span>{log.role}</span>
                            </div>
                            <div className={`inline-block mt-3 px-3 py-1 rounded text-[9px] font-black uppercase tracking-wider ${log.bg} ${log.color}`}>
                                {log.status}
                            </div>
                        </div>
                    </div>
                ))}
             </div>

             {/* Workflow Action Buttons */}
             {(form.statusApproval === 'Pending' || form.statusApproval === 'Pending Approval') && (
                 <div className="mt-8 pt-8 border-t border-gray-100">
                     <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Workflow Action</h4>
                     <div className="flex flex-col gap-3">
                         <button 
                             onClick={() => setForm({...form, statusApproval: 'Approved'})}
                             className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-green-500/20"
                         >
                             <CheckCircle2 size={16} strokeWidth={3} />
                             Approve
                         </button>
                         <button 
                             onClick={() => setForm({...form, statusApproval: 'Rejected'})}
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
        <div className="px-10 py-8 border-t border-gray-100 flex justify-end gap-4 bg-white shrink-0">
          <button onClick={onClose} className="px-12 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-all bg-gray-50 hover:bg-gray-100 rounded-2xl active:scale-95">Cancel</button>
          {!isView && (
            <button 
                onClick={handleSave} 
                className="bg-black text-white px-16 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-gray-800 transition-all active:scale-95 shadow-2xl shadow-black/20 flex items-center gap-3"
            >
                <Save size={18} strokeWidth={2.5} /> Save Report
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
