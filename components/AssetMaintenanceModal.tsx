import React, { useState, useEffect } from 'react';
import { X, Wrench, FileText, Clock, CheckCircle, XCircle, Save } from 'lucide-react';
import { SearchableSelect } from './SearchableSelect';

interface AssetMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  mode: 'create' | 'edit' | 'view';
  initialData?: any;
  assetList?: any[];
  vendorList?: any[];
}

export const AssetMaintenanceModal: React.FC<AssetMaintenanceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  mode,
  initialData,
  assetList = [],
  vendorList = []
}) => {
  const [formData, setFormData] = useState({
    assetId: '',
    assetNumber: '',
    assetName: '',
    location: '',
    category: 'Preventive',
    frequency: 'Monthly',
    requestDate: new Date().toISOString().split('T')[0],
    completionDate: '',
    vendorId: '',
    vendor: '',
    technician: '',
    description: '',
    cost: 0,
    status: 'Scheduled',
    approvalStatus: 'Draft',
    evidenceBefore: '',
    evidenceAfter: '',
    notes: ''
  });

  const [workflow, setWorkflow] = useState([
    { date: new Date().toISOString(), action: 'Request Created', user: 'System', role: 'System', status: 'DRAFT' }
  ]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        assetId: initialData.assetId || '',
        assetNumber: initialData.assetNumber || '',
        assetName: initialData.assetName || '',
        location: initialData.location || '',
        category: initialData.category || 'Preventive',
        frequency: initialData.frequency || 'Monthly',
        requestDate: initialData.requestDate || new Date().toISOString().split('T')[0],
        completionDate: initialData.completionDate || '',
        vendorId: initialData.vendorId || '',
        vendor: initialData.vendor || '',
        technician: initialData.technician || '',
        description: initialData.description || '',
        cost: initialData.cost || 0,
        status: initialData.status || 'Scheduled',
        approvalStatus: initialData.approvalStatus || 'Draft',
        evidenceBefore: initialData.evidenceBefore || '',
        evidenceAfter: initialData.evidenceAfter || '',
        notes: initialData.notes || ''
      });
      if (initialData.workflow) {
        try {
          setWorkflow(JSON.parse(initialData.workflow));
        } catch { }
      }
    } else {
      setFormData({
        assetId: '',
        assetNumber: '',
        assetName: '',
        location: '',
        category: 'Preventive',
        frequency: 'Monthly',
        requestDate: new Date().toISOString().split('T')[0],
        completionDate: '',
        vendorId: '',
        vendor: '',
        technician: '',
        description: '',
        cost: 0,
        status: 'Scheduled',
        approvalStatus: 'Draft',
        evidenceBefore: '',
        evidenceAfter: '',
        notes: ''
      });
    }
  }, [initialData, isOpen]);

  const handleAssetChange = (assetId: string) => {
    const asset = assetList.find(a => String(a.id) === assetId);
    if (asset) {
      setFormData(prev => ({
        ...prev,
        assetId: assetId,
        assetNumber: asset.assetNumber || '',
        assetName: asset.assetName || asset.type || '',
        location: asset.assetLocation || asset.location || ''
      }));
    }
  };

  const handleVendorChange = (vendorId: string) => {
    const vendor = vendorList.find(v => String(v.id) === vendorId);
    if (vendor) {
      setFormData(prev => ({
        ...prev,
        vendorId: vendorId,
        vendor: vendor.vendorName || vendor.name || ''
      }));
    }
  };

  const handleSubmit = () => {
    onSave({
      ...formData,
      workflow: JSON.stringify(workflow)
    });
  };

  const isReadOnly = mode === 'view';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Wrench className="text-emerald-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {mode === 'create' ? 'INPUT PEMELIHARAAN' : mode === 'edit' ? 'EDIT PEMELIHARAAN' : 'DETAIL PEMELIHARAAN'}
              </h2>
              <p className="text-sm text-gray-500">GENERAL ASSET MAINTENANCE</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {initialData?.approvalStatus === 'Pending Approval' && (
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm flex items-center gap-1">
                <Clock size={12} /> ON TRACK
              </span>
            )}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Asset Info */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700 flex items-center gap-2">
                <FileText size={16} /> INFORMASI ASET
              </h3>
              
              <div>
                <label className="block text-xs text-gray-500 mb-1">PILIH ASET GENERAL *</label>
                <SearchableSelect
                  options={assetList.map(a => ({ value: String(a.id), label: `${a.assetNumber} - ${a.assetName || a.type}` }))}
                  value={formData.assetId}
                  onChange={handleAssetChange}
                  placeholder="-- Pilih Aset --"
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">LOKASI PENEMPATAN</label>
                <input
                  type="text"
                  value={formData.location}
                  readOnly
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-500"
                  placeholder="Lokasi otomatis terisi..."
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">KATEGORI MAINTENANCE</label>
                <div className="flex gap-2">
                  {['Preventive', 'Corrective', 'Emergency'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => !isReadOnly && setFormData(prev => ({ ...prev, category: cat }))}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        formData.category === cat
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      disabled={isReadOnly}
                    >
                      {cat.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">FREKUENSI</label>
                <select
                  value={formData.frequency}
                  onChange={e => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={isReadOnly}
                >
                  <option value="Monthly">Bulanan</option>
                  <option value="Quarterly">Per 3 Bulan</option>
                  <option value="Yearly">Tahunan</option>
                </select>
              </div>
            </div>

            {/* Middle Column - Detail */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700 flex items-center gap-2">
                <Wrench size={16} /> DETAIL PENGERJAAN
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">TANGGAL REQUEST</label>
                  <input
                    type="date"
                    value={formData.requestDate}
                    onChange={e => setFormData(prev => ({ ...prev, requestDate: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">TANGGAL SELESAI</label>
                  <input
                    type="date"
                    value={formData.completionDate}
                    onChange={e => setFormData(prev => ({ ...prev, completionDate: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                    disabled={isReadOnly}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">VENDOR PELAKSANA</label>
                  <SearchableSelect
                    options={vendorList.map(v => ({ value: String(v.id), label: v.vendorName || v.name }))}
                    value={formData.vendorId}
                    onChange={handleVendorChange}
                    placeholder="Pilih Vendor"
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">NAMA TEKNISI</label>
                  <input
                    type="text"
                    value={formData.technician}
                    onChange={e => setFormData(prev => ({ ...prev, technician: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Opsional"
                    disabled={isReadOnly}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">DESKRIPSI PEKERJAAN</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg h-24 resize-none"
                  placeholder="Jelaskan detail perbaikan atau perawatan..."
                  disabled={isReadOnly}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">BIAYA (IDR)</label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={e => setFormData(prev => ({ ...prev, cost: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-lg"
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">STATUS PROGRESS</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                    disabled={isReadOnly}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">APPROVAL STATUS</label>
                <input
                  type="text"
                  value={formData.approvalStatus}
                  readOnly
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                />
              </div>
            </div>

            {/* Right Column - Workflow */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700 flex items-center gap-2">
                <Clock size={16} /> LOG HISTORY
              </h3>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {workflow.map((log, idx) => (
                  <div key={idx} className="border-l-2 border-gray-200 pl-4 py-2">
                    <p className="text-xs text-gray-400">{new Date(log.date).toLocaleString('id-ID')}</p>
                    <p className="font-medium text-sm">{log.action}</p>
                    <p className="text-xs text-gray-500">{log.user} • {log.role}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${
                      log.status === 'PENDING APPROVAL' ? 'bg-amber-100 text-amber-700' :
                      log.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                      log.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>

              {mode === 'view' && initialData?.approvalStatus === 'Pending Approval' && (
                <div className="space-y-2 pt-4 border-t">
                  <h4 className="font-medium text-sm">WORKFLOW ACTION</h4>
                  <button className="w-full py-2 bg-emerald-500 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-emerald-600">
                    <CheckCircle size={16} /> APPROVE
                  </button>
                  <button className="w-full py-2 border-2 border-red-500 text-red-500 rounded-lg flex items-center justify-center gap-2 hover:bg-red-50">
                    <XCircle size={16} /> REJECT
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Evidence Section */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-medium text-gray-700 flex items-center gap-2 mb-4">
              <FileText size={16} /> EVIDENCE BASED MAINTENANCE
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs text-gray-500 mb-2">BEFORE MAINTENANCE</label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center text-gray-400">
                  {formData.evidenceBefore ? (
                    <img src={formData.evidenceBefore} alt="Before" className="max-h-32 mx-auto" />
                  ) : (
                    <p>Upload foto sebelum maintenance</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2">AFTER MAINTENANCE</label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center text-gray-400">
                  {formData.evidenceAfter ? (
                    <img src={formData.evidenceAfter} alt="After" className="max-h-32 mx-auto" />
                  ) : (
                    <p>Upload foto setelah maintenance</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 border rounded-lg hover:bg-gray-100"
          >
            CANCEL
          </button>
          {!isReadOnly && (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
            >
              <Save size={16} /> SIMPAN DATA
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
