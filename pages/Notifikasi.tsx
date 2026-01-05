import React, { useState, useEffect } from 'react';
import { 
  Bell, Check, CheckCheck, Trash2, Filter, Search, 
  Car, Building, FileText, Package, Users, Wrench,
  DollarSign, Shield, Clock, Mail, ExternalLink, RefreshCw
} from 'lucide-react';
import { useNotifications, Notification, MODULE_LABELS } from '../hooks/useNotifications';
import { useNavigate } from 'react-router-dom';

const getModuleIcon = (module: string) => {
  const icons: Record<string, React.ReactNode> = {
    VEHICLE: <Car size={18} />,
    BUILDING: <Building size={18} />,
    TAX_KIR: <FileText size={18} />,
    SERVICE: <Wrench size={18} />,
    MUTATION: <Package size={18} />,
    SALES: <DollarSign size={18} />,
    CONTRACT: <FileText size={18} />,
    POD: <Users size={18} />,
    LOKER: <Users size={18} />,
    ATK: <Package size={18} />,
    MAINTENANCE: <Wrench size={18} />,
    INSURANCE: <Shield size={18} />,
    BUILDING_ASSET: <Building size={18} />,
  };
  return icons[module] || <Bell size={18} />;
};

const getModuleColor = (module: string) => {
  const colors: Record<string, string> = {
    VEHICLE: 'bg-blue-500',
    BUILDING: 'bg-emerald-500',
    TAX_KIR: 'bg-orange-500',
    SERVICE: 'bg-purple-500',
    MUTATION: 'bg-cyan-500',
    SALES: 'bg-green-500',
    CONTRACT: 'bg-indigo-500',
    POD: 'bg-pink-500',
    LOKER: 'bg-rose-500',
    ATK: 'bg-amber-500',
    MAINTENANCE: 'bg-violet-500',
    INSURANCE: 'bg-teal-500',
    BUILDING_ASSET: 'bg-lime-500',
  };
  return colors[module] || 'bg-gray-500';
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const Notifikasi: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(1); // Mock user ID

  useEffect(() => {
    fetchNotifications({ limit: 100 });
  }, []);

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread' && n.status !== 'Unread') return false;
    if (filter === 'read' && n.status === 'Unread') return false;
    if (moduleFilter && n.module !== moduleFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query) ||
        n.requestNo?.toLowerCase().includes(query) ||
        n.requesterName?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.status === 'Unread') {
      await markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      const path = notification.actionUrl.startsWith('http') 
        ? new URL(notification.actionUrl).pathname + new URL(notification.actionUrl).search 
        : notification.actionUrl;
      navigate(path);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map(n => n.id));
    }
  };

  const handleDeleteSelected = async () => {
    for (const id of selectedIds) {
      await deleteNotification(id);
    }
    setSelectedIds([]);
  };

  const handleMarkSelectedAsRead = async () => {
    for (const id of selectedIds) {
      await markAsRead(id);
    }
    setSelectedIds([]);
  };

  const modules = [...new Set(notifications.map(n => n.module))];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl">
            <Bell size={24} />
          </div>
          <div>
            <h1 className="text-[24px] font-black text-black uppercase tracking-tight">Notifikasi</h1>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              {unreadCount} notifikasi belum dibaca
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchNotifications({ limit: 100 })}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
            title="Refresh"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-3 bg-black text-white rounded-xl text-[11px] font-bold uppercase tracking-wider hover:bg-gray-800 transition-all flex items-center gap-2"
            >
              <CheckCheck size={16} />
              Tandai Semua Dibaca
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari notifikasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-[12px] font-medium outline-none focus:ring-2 focus:ring-black/5"
          />
        </div>

        {/* Status Filter */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          {(['all', 'unread', 'read'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                filter === f ? 'bg-black text-white' : 'text-gray-500 hover:text-black'
              }`}
            >
              {f === 'all' ? 'Semua' : f === 'unread' ? 'Belum Dibaca' : 'Sudah Dibaca'}
            </button>
          ))}
        </div>

        {/* Module Filter */}
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="pl-9 pr-8 py-3 bg-gray-50 rounded-xl text-[11px] font-bold outline-none appearance-none cursor-pointer"
          >
            <option value="">Semua Modul</option>
            {modules.map(m => (
              <option key={m} value={m}>{MODULE_LABELS[m] || m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <span className="text-[12px] font-bold text-blue-700">
            {selectedIds.length} notifikasi dipilih
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkSelectedAsRead}
              className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1"
            >
              <Check size={14} />
              Tandai Dibaca
            </button>
            <button
              onClick={handleDeleteSelected}
              className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1"
            >
              <Trash2 size={14} />
              Hapus
            </button>
          </div>
        </div>
      )}

      {/* Notification List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Select All Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedIds.length === filteredNotifications.length && filteredNotifications.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-[11px] font-bold text-gray-500 uppercase">Pilih Semua</span>
          </label>
          <span className="text-[11px] text-gray-400">
            {filteredNotifications.length} notifikasi
          </span>
        </div>

        {/* List */}
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-2 border-gray-200 border-t-black rounded-full animate-spin mx-auto"></div>
            <p className="text-[12px] text-gray-400 mt-4 font-medium">Memuat notifikasi...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={32} className="text-gray-300" />
            </div>
            <p className="text-[14px] font-bold text-gray-400">Tidak ada notifikasi</p>
            <p className="text-[11px] text-gray-300 mt-1">
              {filter !== 'all' || moduleFilter || searchQuery 
                ? 'Coba ubah filter pencarian' 
                : 'Belum ada notifikasi masuk'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 hover:bg-gray-50 transition-all ${
                  notification.status === 'Unread' ? 'bg-blue-50/30' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(notification.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      setSelectedIds(prev => 
                        prev.includes(notification.id)
                          ? prev.filter(id => id !== notification.id)
                          : [...prev, notification.id]
                      );
                    }}
                    className="w-4 h-4 rounded border-gray-300 mt-1"
                  />

                  {/* Icon */}
                  <div 
                    className={`w-12 h-12 ${getModuleColor(notification.module)} rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg cursor-pointer`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {getModuleIcon(notification.module)}
                  </div>

                  {/* Content */}
                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {MODULE_LABELS[notification.module] || notification.module}
                      </span>
                      {notification.status === 'Unread' && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                      {notification.priority !== 'Normal' && (
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                          notification.priority === 'Urgent' ? 'bg-red-100 text-red-700' :
                          notification.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {notification.priority}
                        </span>
                      )}
                    </div>
                    
                    <h4 className="text-[13px] font-bold text-gray-900 mb-1">
                      {notification.title}
                    </h4>
                    <p className="text-[12px] text-gray-500 line-clamp-2">
                      {notification.message}
                    </p>

                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Clock size={12} />
                        {formatDate(notification.createdAt)}
                      </span>
                      {notification.emailSent && (
                        <span className="text-[10px] text-green-600 flex items-center gap-1">
                          <Mail size={12} />
                          Email terkirim
                        </span>
                      )}
                      {notification.requestNo && (
                        <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {notification.requestNo}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {notification.status === 'Unread' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-all"
                        title="Tandai sudah dibaca"
                      >
                        <Check size={16} className="text-gray-500" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNotificationClick(notification);
                      }}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-all"
                      title="Lihat detail"
                    >
                      <ExternalLink size={16} className="text-gray-500" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="p-2 hover:bg-red-100 rounded-lg transition-all"
                      title="Hapus"
                    >
                      <Trash2 size={16} className="text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifikasi;
