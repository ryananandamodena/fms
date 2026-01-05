import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  Users, 
  Home, 
  BookOpen, 
  ChevronLeft,
  ChevronRight,
  Car,
  Database,
  Wrench,
  Send,
  DollarSign,
  ChevronDown,
  X,
  Building,
  Briefcase,
  Bell,
  Box,
  House,
  Settings,
  UserCog,
  Zap,
  ShieldCheck,
  Package,
  List,
  Monitor,
  Tag,
  MapPin,
  Scale,
  CreditCard,
  Layers,
  Palette,
  Landmark,
  Component,
  Percent,
  Stamp,
  CheckCircle2,
  Headset,
  Shield,
  Grid3X3,
  Lock,
  ClipboardList,
  Globe
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  activeItem: string;
  onNavigate: (item: string) => void;
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  subItems?: MenuItem[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export const Sidebar: React.FC<Props> = ({ 
  activeItem, 
  onNavigate, 
  isCollapsed, 
  onToggle, 
  isMobileOpen, 
  onCloseMobile 
}) => {
  const { t } = useLanguage();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const menuSections: MenuSection[] = [
    {
      title: '',
      items: [
        { label: 'Dashboard', icon: <Grid3X3 size={20} /> },
      ]
    },
    {
      title: 'MANAJEMEN ASET',
      items: [
        { 
          label: 'Gedung', 
          icon: <Building size={20} />,
          subItems: [
            { label: 'Daftar Gedung', icon: <List size={16} /> }, 
            { label: 'Utility Monitoring', icon: <Zap size={16} /> },
            { label: 'Branch Improvement', icon: <FileText size={16} /> },
            { label: 'Asuransi Gedung', icon: <Shield size={16} /> },
            { label: 'Compliance & Legal', icon: <ShieldCheck size={16} /> },
          ]
        },
        { 
          label: 'Kendaraan', 
          icon: <Car size={20} />,
          subItems: [
            { label: 'Daftar Aset', icon: <Database size={16} /> },
            { label: 'Kontrak Kendaraan', icon: <Briefcase size={16} /> },
            { label: 'Servis', icon: <Wrench size={16} /> },
            { label: 'Pajak & KIR', icon: <FileText size={16} /> },
            { label: 'Reminder Pajak & KIR', icon: <Bell size={16} /> },
            { label: 'Asuransi Kendaraan', icon: <Shield size={16} /> },
            { label: 'Mutasi', icon: <Send size={16} /> },
            { label: 'Penjualan', icon: <DollarSign size={16} /> },
          ]
        },
        { 
          label: 'Aset Umum', 
          icon: <Globe size={20} />,
          subItems: [
            { label: 'Asset HC', icon: <Database size={16} /> },
            { label: 'Asset IT', icon: <Monitor size={16} /> },
            { label: 'Customer Service', icon: <Headset size={16} /> },
            { label: 'Pemeliharaan Asset', icon: <Wrench size={16} /> },
            { label: 'Reminder Pemeliharaan', icon: <Bell size={16} /> },
            { label: 'Mutasi Aset', icon: <Send size={16} /> },
            { label: 'Penjualan Aset', icon: <DollarSign size={16} /> }, 
          ]
        },
      ]
    },
    {
      title: 'LAYANAN FASILITAS',
      items: [
        { 
          label: 'Modena POD', 
          icon: <Grid3X3 size={20} />,
          subItems: [
            { label: 'Permintaan POD', icon: <FileText size={16} /> },
            { label: 'Penghuni POD', icon: <Users size={16} /> },
          ]
        },
        { 
          label: 'Loker', 
          icon: <Lock size={20} />,
          subItems: [
            { label: 'Daftar Loker', icon: <List size={16} /> },
            { label: 'Permintaan Loker', icon: <FileText size={16} /> },
          ]
        },
        { label: 'Stock Opname', icon: <ClipboardList size={20} /> },
      ]
    },
    {
      title: 'BARANG PAKAI HABIS',
      items: [
        { 
          label: 'ATK', 
          icon: <Box size={20} />,
          subItems: [
            { label: 'Request ATK', icon: <Database size={16} /> },
            { label: 'Stationery Request Approval', icon: <FileText size={16} /> },
            { label: 'Master ATK', icon: <Settings size={16} /> },
          ]
        },
        { 
          label: 'ARK', 
          icon: <House size={20} />,
          subItems: [
            { label: 'Daftar ARK', icon: <Database size={16} /> },
            { label: 'Household Request Approval', icon: <FileText size={16} /> },
            { label: 'Master ARK', icon: <Settings size={16} /> },
          ]
        },
      ]
    },
    {
      title: 'OPERASIONAL HARIAN',
      items: [
        { label: 'Log Book', icon: <BookOpen size={20} /> },
        { label: 'Absensi', icon: <Clock size={20} /> },
      ]
    },
    {
      title: 'ADMINISTRASI',
      items: [
        { label: 'Vendor', icon: <Users size={20} /> },
        { label: 'Manajemen User', icon: <UserCog size={20} /> },
        { 
          label: 'Data Master', 
          icon: <Home size={20} />,
          subItems: [
            { label: 'Master Approval', icon: <CheckCircle2 size={16} /> },
            { label: 'Master Vendor', icon: <Users size={16} /> },
            { label: 'Master PPN', icon: <Percent size={16} /> },
            { label: 'Master Tipe Brand', icon: <Tag size={16} /> },
            { label: 'Master Brand', icon: <Tag size={16} /> },
            { label: 'Master Model Kendaraan', icon: <Car size={16} /> },
            { label: 'Master Komponen Bangunan', icon: <Component size={16} /> },
            { label: 'Master Tipe Dokumen', icon: <FileText size={16} /> },
            { label: 'Master Tipe Utilitas', icon: <Zap size={16} /> },
            { label: 'Master Operator', icon: <UserCog size={16} /> },
            { label: 'Master Tipe Aset', icon: <Package size={16} /> },
            { label: 'Master Departemen', icon: <Layers size={16} /> },
            { label: 'Master Lokasi', icon: <MapPin size={16} /> },
            { label: 'Master Satuan', icon: <Scale size={16} /> },
            { label: 'Master Warna', icon: <Palette size={16} /> },
            { label: 'Master Tipe Gedung', icon: <Landmark size={16} /> },
            { label: 'Master Cost Center', icon: <CreditCard size={16} /> },
            { label: 'Kategori Aset', icon: <Box size={16} /> },
            { label: 'Jenis Pajak', icon: <Stamp size={16} /> },
            { label: 'Jenis Pembayaran', icon: <DollarSign size={16} /> },
            { label: 'Jenis Servis', icon: <Wrench size={16} /> },
          ]
        },
      ]
    },
  ];

  // Auto-expand menu based on activeItem
  useEffect(() => {
    menuSections.forEach(section => {
      section.items.forEach(item => {
        if (item.subItems && item.subItems.some(sub => sub.label === activeItem)) {
          setExpandedMenus(prev => prev.includes(item.label) ? prev : [...prev, item.label]);
        }
      });
    });
  }, [activeItem]);

  const toggleMenu = (label: string) => {
    if (isCollapsed) {
      onToggle();
      if (!expandedMenus.includes(label)) {
        setExpandedMenus(prev => [...prev, label]);
      }
    } else {
      setExpandedMenus(prev => 
        prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
      );
    }
  };

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-40 bg-[#0A0A0A] text-gray-400 flex flex-col transition-all duration-300 border-r border-gray-900
    ${isMobileOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full lg:translate-x-0'}
    ${isCollapsed && !isMobileOpen ? 'lg:w-[90px]' : 'lg:w-[280px]'}
  `;

  const renderMenuItem = (item: MenuItem, index: number) => {
    const hasSub = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedMenus.includes(item.label);
    const isParentActive = activeItem === item.label || (item.subItems && item.subItems.some(sub => sub.label === activeItem));

    if (hasSub) {
      return (
        <div key={index} className="space-y-1">
          <button
            onClick={() => toggleMenu(item.label)}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-xl transition-all duration-200 group relative
            ${isParentActive ? 'text-white bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <div className="flex items-center gap-3">
              <span className={`${isParentActive ? 'text-white' : 'text-gray-500 group-hover:text-white'} transition-colors`}>{item.icon}</span>
              {!isCollapsed && <span className="text-[11px] font-semibold uppercase tracking-wide">{t(item.label)}</span>}
            </div>
            {!isCollapsed && (
              <ChevronDown 
                size={14} 
                className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-white' : 'text-gray-600'}`} 
              />
            )}
          </button>

          {/* Submenu */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded && !isCollapsed ? 'max-h-[1500px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="pt-1 pb-2 pl-4 space-y-0.5">
              {item.subItems!.map((sub, subIndex) => {
                const isSubActive = activeItem === sub.label;
                return (
                  <button
                    key={subIndex}
                    onClick={() => onNavigate(sub.label)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200
                      ${isSubActive
                        ? 'text-white bg-white/10' 
                        : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                  >
                    <span className={`${isSubActive ? 'text-white' : 'text-gray-600'} transition-colors shrink-0`}>{sub.icon}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider">{t(sub.label)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    return (
      <button
        key={index}
        onClick={() => onNavigate(item.label)}
        className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start gap-3'} px-4 py-3 rounded-xl transition-all duration-200 group relative
          ${isParentActive 
            ? 'bg-white text-black shadow-[0_4px_20px_rgba(255,255,255,0.15)]' 
            : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
      >
        <span className={`${isParentActive ? 'text-black' : 'text-gray-500 group-hover:text-white'} transition-colors`}>{item.icon}</span>
        {!isCollapsed && <span className="text-[11px] font-semibold uppercase tracking-wide">{t(item.label)}</span>}
      </button>
    );
  };

  return (
    <div className={sidebarClasses}>
      {/* Logo Section */}
      <div className={`h-16 flex items-center px-6 border-b border-white/5 ${isCollapsed ? 'justify-center px-0' : 'justify-between'}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white text-black rounded-xl flex items-center justify-center font-black text-lg shadow-[0_0_15px_rgba(255,255,255,0.1)]">M</div>
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex flex-col">
              <h1 className="font-black text-white text-[14px] tracking-tight leading-none">MODENA</h1>
              <p className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.15em] mt-0.5">Asset Manager</p>
            </div>
          )}
        </div>
        {isMobileOpen && (
          <button onClick={onCloseMobile} className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Menu Section */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 space-y-1">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-2">
            {section.title && !isCollapsed && (
              <div className="px-4 py-2 mt-2">
                <span className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.15em]">{section.title}</span>
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item, index) => renderMenuItem(item, index))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Toggle */}
      <div className="p-4 border-t border-white/5 hidden lg:block">
        <button 
          onClick={onToggle}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} p-3 rounded-xl hover:bg-white/5 text-gray-500 hover:text-white transition-all`}
        >
          <div className="bg-white/10 p-1.5 rounded-lg">
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </div>
          {!isCollapsed && <span className="text-[9px] font-black uppercase tracking-[0.12em]">Collapse Menu</span>}
        </button>
      </div>
    </div>
  );
};
