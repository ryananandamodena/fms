import React, { useState, useEffect } from 'react';
import { FilterBar } from '../components/FilterBar';
import { VendorTable } from '../components/VendorTable';
import { VendorModal } from '../components/VendorModal';
import { vendorService } from '../services';

const Vendor: React.FC = () => {
  const [vendorData, setVendorData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('SEMUA');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const data = await vendorService.getAll();
      setVendorData(data || []);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
      setVendorData([]);
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
        const newVendor = await vendorService.create(data);
        setVendorData(prev => [...prev, newVendor]);
      } else {
        const updated = await vendorService.update(selectedItem.id, data);
        setVendorData(prev => prev.map(d => d.id === selectedItem.id ? updated : d));
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save vendor:', error);
      alert('Gagal menyimpan data');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return;
    try {
      await vendorService.delete(id);
      setVendorData(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to delete vendor:', error);
      alert('Gagal menghapus data');
    }
  };

  const filteredData = activeTab === 'SEMUA' 
    ? vendorData 
    : vendorData.filter(item => (item.status || 'Active').toUpperCase() === activeTab);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <>
      <FilterBar
        tabs={['SEMUA', 'ACTIVE', 'INACTIVE']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddClick={() => openModal('create')}
        customAddLabel="New Vendor"
      />
      <VendorTable
        data={filteredData}
        onEdit={(item) => openModal('edit', item)}
        onView={(item) => openModal('view', item)}
        onDelete={handleDelete}
      />
      {isModalOpen && (
        <VendorModal
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

export default Vendor;
