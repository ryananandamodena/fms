import React, { useState, useEffect } from 'react';
import { FilterBar } from '../../components/FilterBar';
import { MaintenanceReminderTable } from '../../components/MaintenanceReminderTable';
import { assetMaintenanceService } from '../../services';

const PemeliharaanAsset: React.FC = () => {
  const [maintenanceData, setMaintenanceData] = useState<any[]>([]);
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
      const data = await assetMaintenanceService.getAll();
      setMaintenanceData(data || []);
    } catch (error) {
      console.error('Failed to fetch maintenance:', error);
      setMaintenanceData([]);
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
        const newItem = await assetMaintenanceService.create(data);
        setMaintenanceData(prev => [...prev, newItem]);
      } else {
        const updated = await assetMaintenanceService.update(selectedItem.id, data);
        setMaintenanceData(prev => prev.map(d => d.id === selectedItem.id ? updated : d));
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
      await assetMaintenanceService.delete(id);
      setMaintenanceData(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Gagal menghapus data');
    }
  };

  const filteredData = activeTab === 'SEMUA' 
    ? maintenanceData 
    : maintenanceData.filter(item => (item.status || 'Safe').toUpperCase() === activeTab);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <>
      <FilterBar
        tabs={['SEMUA', 'SAFE', 'WARNING', 'OVERDUE']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddClick={() => openModal('create')}
        customAddLabel="Tambah Jadwal"
      />
      <MaintenanceReminderTable data={filteredData} />
    </>
  );
};

export default PemeliharaanAsset;
