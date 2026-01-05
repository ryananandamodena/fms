import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Login
const Login = React.lazy(() => import('./pages/Login'));

// Lazy load pages for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

// Gedung
const DaftarGedung = React.lazy(() => import('./pages/gedung/DaftarGedung'));
const UtilityMonitoring = React.lazy(() => import('./pages/gedung/UtilityMonitoring'));
const BranchImprovement = React.lazy(() => import('./pages/gedung/BranchImprovement'));
const AsuransiGedung = React.lazy(() => import('./pages/gedung/AsuransiGedung'));
const ComplianceLegal = React.lazy(() => import('./pages/gedung/ComplianceLegal'));

// Kendaraan
const DaftarAset = React.lazy(() => import('./pages/kendaraan/DaftarAset'));
const KontrakKendaraan = React.lazy(() => import('./pages/kendaraan/KontrakKendaraan'));
const Servis = React.lazy(() => import('./pages/kendaraan/Servis'));
const PajakKir = React.lazy(() => import('./pages/kendaraan/PajakKir'));
const ReminderPajakKir = React.lazy(() => import('./pages/kendaraan/ReminderPajakKir'));
const AsuransiKendaraan = React.lazy(() => import('./pages/kendaraan/AsuransiKendaraan'));
const MutasiKendaraan = React.lazy(() => import('./pages/kendaraan/Mutasi'));
const PenjualanKendaraan = React.lazy(() => import('./pages/kendaraan/Penjualan'));

// General Asset
const AssetHC = React.lazy(() => import('./pages/general-asset/AssetHC'));
const AssetIT = React.lazy(() => import('./pages/general-asset/AssetIT'));
const CustomerService = React.lazy(() => import('./pages/general-asset/CustomerService'));
const PemeliharaanAsset = React.lazy(() => import('./pages/general-asset/PemeliharaanAsset'));
const ReminderPemeliharaan = React.lazy(() => import('./pages/general-asset/ReminderPemeliharaan'));
const MutasiAset = React.lazy(() => import('./pages/general-asset/MutasiAset'));
const PenjualanAset = React.lazy(() => import('./pages/general-asset/PenjualanAset'));

// ATK
const RequestATK = React.lazy(() => import('./pages/atk/RequestATK'));
const StationeryRequestApproval = React.lazy(() => import('./pages/atk/StationeryRequestApproval'));
const MasterATK = React.lazy(() => import('./pages/atk/MasterATK'));

// ARK
const DaftarARK = React.lazy(() => import('./pages/ark/DaftarARK'));
const HouseholdRequestApproval = React.lazy(() => import('./pages/ark/HouseholdRequestApproval'));
const MasterARK = React.lazy(() => import('./pages/ark/MasterARK'));

// Daily Operations
const Timesheet = React.lazy(() => import('./pages/Timesheet'));
const LogBook = React.lazy(() => import('./pages/LogBook'));
const Absensi = React.lazy(() => import('./pages/Absensi'));

// Modena POD
const PermintaanPOD = React.lazy(() => import('./pages/pod/PermintaanPOD'));
const PenghuniPOD = React.lazy(() => import('./pages/pod/PenghuniPOD'));

// Loker
const DaftarLoker = React.lazy(() => import('./pages/loker/DaftarLoker'));
const PermintaanLoker = React.lazy(() => import('./pages/loker/PermintaanLoker'));

// Stock Opname
const StockOpname = React.lazy(() => import('./pages/StockOpname'));

// Administration
const Vendor = React.lazy(() => import('./pages/Vendor'));
const ManajemenUser = React.lazy(() => import('./pages/ManajemenUser'));
const Notifikasi = React.lazy(() => import('./pages/Notifikasi'));

// Master Data
const MasterApproval = React.lazy(() => import('./pages/master/MasterApproval'));
const MasterVendor = React.lazy(() => import('./pages/master/MasterVendor'));
const MasterPPN = React.lazy(() => import('./pages/master/MasterPPN'));
const MasterBrandType = React.lazy(() => import('./pages/master/MasterBrandType'));
const MasterBrand = React.lazy(() => import('./pages/master/MasterBrand'));
const MasterVehicleModel = React.lazy(() => import('./pages/master/MasterVehicleModel'));
const MasterBuildingComponent = React.lazy(() => import('./pages/master/MasterBuildingComponent'));
const MasterDocumentType = React.lazy(() => import('./pages/master/MasterDocumentType'));
const MasterUtilityType = React.lazy(() => import('./pages/master/MasterUtilityType'));
const MasterOperator = React.lazy(() => import('./pages/master/MasterOperator'));
const MasterAssetType = React.lazy(() => import('./pages/master/MasterAssetType'));
const MasterDepartment = React.lazy(() => import('./pages/master/MasterDepartment'));
const MasterLocation = React.lazy(() => import('./pages/master/MasterLocation'));
const MasterUOM = React.lazy(() => import('./pages/master/MasterUOM'));
const MasterColor = React.lazy(() => import('./pages/master/MasterColor'));
const MasterBuildingType = React.lazy(() => import('./pages/master/MasterBuildingType'));
const MasterCostCenter = React.lazy(() => import('./pages/master/MasterCostCenter'));
const MasterAssetCategory = React.lazy(() => import('./pages/master/MasterAssetCategory'));
const MasterTaxType = React.lazy(() => import('./pages/master/MasterTaxType'));
const MasterPaymentType = React.lazy(() => import('./pages/master/MasterPaymentType'));
const MasterServiceCategory = React.lazy(() => import('./pages/master/MasterServiceCategory'));

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      
      // Gedung
      { path: 'gedung/daftar', element: <DaftarGedung /> },
      { path: 'gedung/utility', element: <UtilityMonitoring /> },
      { path: 'gedung/branch-improvement', element: <BranchImprovement /> },
      { path: 'gedung/asuransi', element: <AsuransiGedung /> },
      { path: 'gedung/compliance', element: <ComplianceLegal /> },
      
      // Kendaraan
      { path: 'kendaraan/daftar', element: <DaftarAset /> },
      { path: 'kendaraan/kontrak', element: <KontrakKendaraan /> },
      { path: 'kendaraan/servis', element: <Servis /> },
      { path: 'kendaraan/pajak-kir', element: <PajakKir /> },
      { path: 'kendaraan/reminder', element: <ReminderPajakKir /> },
      { path: 'kendaraan/asuransi', element: <AsuransiKendaraan /> },
      { path: 'kendaraan/mutasi', element: <MutasiKendaraan /> },
      { path: 'kendaraan/penjualan', element: <PenjualanKendaraan /> },
      
      // General Asset
      { path: 'general-asset/hc', element: <AssetHC /> },
      { path: 'general-asset/it', element: <AssetIT /> },
      { path: 'general-asset/customer-service', element: <CustomerService /> },
      { path: 'general-asset/pemeliharaan', element: <PemeliharaanAsset /> },
      { path: 'general-asset/reminder', element: <ReminderPemeliharaan /> },
      { path: 'general-asset/mutasi', element: <MutasiAset /> },
      { path: 'general-asset/penjualan', element: <PenjualanAset /> },
      
      // Modena POD
      { path: 'pod/permintaan', element: <PermintaanPOD /> },
      { path: 'pod/penghuni', element: <PenghuniPOD /> },
      
      // Loker
      { path: 'loker/daftar', element: <DaftarLoker /> },
      { path: 'loker/permintaan', element: <PermintaanLoker /> },
      
      // Stock Opname
      { path: 'stock-opname', element: <StockOpname /> },
      
      // ATK
      { path: 'atk/request', element: <RequestATK /> },
      { path: 'atk/approval', element: <StationeryRequestApproval /> },
      { path: 'atk/master', element: <MasterATK /> },
      
      // ARK
      { path: 'ark/daftar', element: <DaftarARK /> },
      { path: 'ark/approval', element: <HouseholdRequestApproval /> },
      { path: 'ark/master', element: <MasterARK /> },
      
      // Daily Operations
      { path: 'timesheet', element: <Timesheet /> },
      { path: 'logbook', element: <LogBook /> },
      { path: 'absensi', element: <Absensi /> },
      
      // Administration
      { path: 'vendor', element: <Vendor /> },
      { path: 'user-management', element: <ManajemenUser /> },
      { path: 'notifikasi', element: <Notifikasi /> },
      
      // Master Data
      { path: 'master/approval', element: <MasterApproval /> },
      { path: 'master/vendor', element: <MasterVendor /> },
      { path: 'master/ppn', element: <MasterPPN /> },
      { path: 'master/tipe-brand', element: <MasterBrandType /> },
      { path: 'master/brand', element: <MasterBrand /> },
      { path: 'master/model-kendaraan', element: <MasterVehicleModel /> },
      { path: 'master/komponen-bangunan', element: <MasterBuildingComponent /> },
      { path: 'master/tipe-dokumen', element: <MasterDocumentType /> },
      { path: 'master/tipe-utilitas', element: <MasterUtilityType /> },
      { path: 'master/operator', element: <MasterOperator /> },
      { path: 'master/tipe-aset', element: <MasterAssetType /> },
      { path: 'master/departemen', element: <MasterDepartment /> },
      { path: 'master/lokasi', element: <MasterLocation /> },
      { path: 'master/satuan', element: <MasterUOM /> },
      { path: 'master/warna', element: <MasterColor /> },
      { path: 'master/tipe-gedung', element: <MasterBuildingType /> },
      { path: 'master/cost-center', element: <MasterCostCenter /> },
      { path: 'master/kategori-aset', element: <MasterAssetCategory /> },
      { path: 'master/jenis-pajak', element: <MasterTaxType /> },
      { path: 'master/jenis-pembayaran', element: <MasterPaymentType /> },
      { path: 'master/jenis-servis', element: <MasterServiceCategory /> },
    ],
  },
]);

// Route mapping untuk Sidebar navigation
export { routeMap } from './routeMap';
