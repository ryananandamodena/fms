import React, { useState, useEffect } from 'react';
import { FilterBar } from '../components/FilterBar';
import { TimesheetTable } from '../components/TimesheetTable';
import { TimesheetModal } from '../components/TimesheetModal';
import { timesheetService } from '../services';

const Timesheet: React.FC = () => {
  const [timesheetData, setTimesheetData] = useState<any[]>([]);
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
      const data = await timesheetService.getAll();
      setTimesheetData(data || []);
    } catch (error) {
      console.error('Failed to fetch timesheets:', error);
      setTimesheetData([]);
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
        const newItem = await timesheetService.create(data);
        setTimesheetData(prev => [...prev, newItem]);
      } else {
        const updated = await timesheetService.update(selectedItem.id, data);
        setTimesheetData(prev => prev.map(d => d.id === selectedItem.id ? updated : d));
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
      await timesheetService.delete(id);
      setTimesheetData(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Gagal menghapus data');
    }
  };

  const filteredData = activeTab === 'SEMUA' 
    ? timesheetData 
    : timesheetData.filter(item => (item.status || 'Tepat Waktu').toUpperCase().includes(activeTab));

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <>
      <FilterBar
        tabs={['SEMUA', 'TEPAT WAKTU', 'TERLAMBAT', 'ABSEN']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddClick={() => openModal('create')}
        customAddLabel="Tambah Timesheet"
      />
      <TimesheetTable
        data={filteredData}
        onEdit={(item) => openModal('edit', item)}
        onView={(item) => openModal('view', item)}
        onDelete={handleDelete}
      />
      {isModalOpen && (
        <TimesheetModal
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

export default Timesheet;
