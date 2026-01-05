import React, { useState, useEffect } from 'react';
import { FilterBar } from '../../components/FilterBar';
import { ComplianceModal } from '../../components/ComplianceModal';
import { complianceService } from '../../services';

const ComplianceLegal: React.FC = () => {
  const [complianceData, setComplianceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('SEMUA');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await complianceService.getAll();
      setComplianceData(data || []);
    } catch (error) {
      console.error('Failed to fetch compliance:', error);
      setComplianceData([]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (mode: 'create' | 'edit' | 'view', item: any = null) => {
    setModalMode(mode);
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async (data: any) => {
    try {
      if (modalMode === 'create') {
        const newItem = await complianceService.create(data);
        setComplianceData(prev => [...prev, newItem]);
      } else {
        const updated = await complianceService.update(selectedItem.id, data);
        setComplianceData(prev => prev.map(d => d.id === selectedItem.id ? updated : d));
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Gagal menyimpan data');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return;
    try {
      await complianceService.delete(id);
      setComplianceData(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Gagal menghapus data');
    }
  };

  const filteredData = activeTab === 'SEMUA' 
    ? complianceData 
    : complianceData.filter(item => (item.status || 'Active').toUpperCase() === activeTab);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <>
      <FilterBar
        tabs={['SEMUA', 'ACTIVE', 'EXPIRING', 'EXPIRED']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddClick={() => openModal('create')}
        customAddLabel="Tambah Dokumen"
      />
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gedung</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dokumen</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Terbit</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Expired</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((item, index) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-sm">{index + 1}</td>
                <td className="px-4 py-3 text-sm">{item.buildingName}</td>
                <td className="px-4 py-3 text-sm">{item.documentName}</td>
                <td className="px-4 py-3 text-sm">{item.category}</td>
                <td className="px-4 py-3 text-sm">{item.issueDate}</td>
                <td className="px-4 py-3 text-sm">{item.expiryDate}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.status === 'Active' ? 'bg-green-100 text-green-800' :
                    item.status === 'Expiring' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <button onClick={() => openModal('view', item)} className="text-blue-600 hover:text-blue-800 mr-2">View</button>
                  <button onClick={() => openModal('edit', item)} className="text-yellow-600 hover:text-yellow-800 mr-2">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <ComplianceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          mode={modalMode}
          initialData={selectedItem}
        />
      )}
    </>
  );
};

export default ComplianceLegal;
