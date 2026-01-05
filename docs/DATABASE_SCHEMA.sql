-- =====================================================
-- FMS (Facility Management System) Database Schema
-- PostgreSQL Database
-- Version: 1.0.0
-- Generated: January 2026
-- =====================================================
-- 
-- DAFTAR ISI:
-- 1. Master Data Tables
-- 2. User & Authentication
-- 3. Vendor & Supplier
-- 4. Vehicle Management (Kendaraan)
-- 5. Building Management (Gedung)
-- 6. General Asset Management (Aset Umum)
-- 7. Stationery Management (ATK/ARK)
-- 8. Daily Operations (Timesheet, Absensi, Stock Opname)
-- 9. POD & Loker Management
-- 10. Notification & Approval System
-- 11. Reminder System
--
-- =====================================================

-- =====================================================
-- 1. MASTER DATA TABLES
-- =====================================================

-- General Master Data (untuk dropdown/lookup)
-- Menyimpan data master seperti: VEHICLE_TYPE, BUILDING_TYPE, LOCATION, DEPARTMENT, dll
CREATE TABLE general_masters (
    id SERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL,          -- Kategori: VEHICLE_TYPE, BUILDING_TYPE, LOCATION, dll
    name VARCHAR(255) NOT NULL,              -- Nama item
    code VARCHAR(100),                       -- Kode unik (opsional)
    value VARCHAR(255),                      -- Nilai tambahan
    description TEXT,                        -- Deskripsi
    sort_order INT DEFAULT 0,                -- Urutan tampilan
    is_active BOOLEAN DEFAULT TRUE,          -- Status aktif
    is_default BOOLEAN DEFAULT FALSE,        -- Default selection
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_general_masters_category ON general_masters(category);
CREATE INDEX idx_general_masters_code ON general_masters(code);

-- Master Categories - Daftar kategori master data
CREATE TABLE master_categories (
    id SERIAL PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,       -- Kode kategori: VEHICLE_TYPE, BUILDING_TYPE
    name VARCHAR(255) NOT NULL,              -- Nama kategori
    description TEXT,                        -- Deskripsi
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. USER & AUTHENTICATION
-- =====================================================

-- Users - Data pengguna sistem
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,   -- Username untuk login
    email VARCHAR(255) UNIQUE NOT NULL,      -- Email untuk login & notifikasi
    password VARCHAR(255) NOT NULL,          -- Password (hashed bcrypt)
    full_name VARCHAR(255) NOT NULL,         -- Nama lengkap
    employee_id VARCHAR(50),                 -- NIK/Employee ID
    phone VARCHAR(50),                       -- Nomor telepon
    avatar TEXT,                             -- URL foto profil
    role VARCHAR(50) DEFAULT 'Staff',        -- Role: Admin, Manager, Staff, Viewer
    department VARCHAR(100),                 -- Departemen
    branch VARCHAR(100),                     -- Cabang/Lokasi
    location VARCHAR(100),                   -- Lokasi kerja
    join_date VARCHAR(20),                   -- Tanggal bergabung
    status VARCHAR(20) DEFAULT 'Active',     -- Status: Active, Inactive
    last_active TIMESTAMP,                   -- Terakhir aktif
    permissions TEXT,                        -- JSON array permissions menu
    refresh_token TEXT,                      -- JWT refresh token
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- =====================================================
-- 3. VENDOR & SUPPLIER
-- =====================================================

-- Vendors - Data vendor/supplier
CREATE TABLE vendors (
    id SERIAL PRIMARY KEY,
    vendor_code VARCHAR(50) UNIQUE NOT NULL, -- Kode vendor unik
    vendor_name VARCHAR(255) NOT NULL,       -- Nama vendor
    type VARCHAR(50),                        -- Tipe: Goods, Service, Both
    category VARCHAR(100),                   -- Kategori: IT, Office Supplies, dll
    email VARCHAR(255),                      -- Email vendor
    phone VARCHAR(50),                       -- Telepon
    address TEXT,                            -- Alamat lengkap
    pic_name VARCHAR(255),                   -- Nama PIC
    bank_name VARCHAR(100),                  -- Nama bank
    bank_account VARCHAR(100),               -- Nomor rekening
    npwp VARCHAR(50),                        -- NPWP
    status VARCHAR(20) DEFAULT 'Active',     -- Status: Active, Inactive, Blacklist
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_vendors_code ON vendors(vendor_code);

-- Insurance - Data asuransi (kendaraan & gedung)
CREATE TABLE insurances (
    id SERIAL PRIMARY KEY,
    policy_number VARCHAR(100) UNIQUE NOT NULL, -- Nomor polis
    asset_id VARCHAR(50),                    -- ID aset (No Polisi / Building ID)
    asset_name VARCHAR(255),                 -- Nama aset
    category VARCHAR(50),                    -- Kategori: Vehicle, Building
    vendor_id INT REFERENCES vendors(id),    -- Vendor asuransi
    provider VARCHAR(255),                   -- Nama perusahaan asuransi
    type VARCHAR(100),                       -- Tipe: All Risk, TLO, Property All Risk
    start_date VARCHAR(20),                  -- Tanggal mulai
    end_date VARCHAR(20),                    -- Tanggal berakhir
    premium DECIMAL(15,2),                   -- Biaya premi
    sum_insured DECIMAL(15,2),               -- Nilai pertanggungan
    deductible DECIMAL(15,2),                -- Biaya resiko sendiri (OR)
    status VARCHAR(20),                      -- Status: Active, Expiring, Expired
    attachment_url TEXT,                     -- URL dokumen polis
    claims TEXT,                             -- JSON array klaim
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insurance Claims - Klaim asuransi
CREATE TABLE insurance_claims (
    id SERIAL PRIMARY KEY,
    insurance_id INT REFERENCES insurances(id),
    incident_date VARCHAR(20),               -- Tanggal kejadian
    description TEXT,                        -- Deskripsi kejadian
    claim_amount DECIMAL(15,2),              -- Estimasi biaya klaim
    covered_amount DECIMAL(15,2),            -- Yang dibayar asuransi
    status VARCHAR(50),                      -- Status: Submitted, Survey, Approved, Paid, Rejected
    evidence_photos TEXT,                    -- JSON array foto bukti
    remarks TEXT,                            -- Catatan
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. VEHICLE MANAGEMENT (KENDARAAN)
-- =====================================================

-- Vehicles - Data kendaraan
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    no_polisi VARCHAR(20) UNIQUE NOT NULL,   -- Nomor polisi
    nama VARCHAR(255),                       -- Deskripsi unit
    merek VARCHAR(100),                      -- Merek: Toyota, Honda, dll
    tipe_kendaraan VARCHAR(100),             -- Tipe: Sedan, SUV, MPV, Truck
    model VARCHAR(100),                      -- Model: Avanza, Brio, dll
    tahun_pembuatan VARCHAR(10),             -- Tahun pembuatan
    warna VARCHAR(50),                       -- Warna
    isi_silinder VARCHAR(50),                -- CC mesin
    no_rangka VARCHAR(100),                  -- Nomor rangka
    no_mesin VARCHAR(100),                   -- Nomor mesin
    no_bpkb VARCHAR(100),                    -- Nomor BPKB
    keterangan_bpkb TEXT,                    -- Keterangan BPKB
    masa_berlaku_1 VARCHAR(20),              -- Masa berlaku STNK 1 tahun
    masa_berlaku_5 VARCHAR(20),              -- Masa berlaku STNK 5 tahun
    masa_berlaku_kir VARCHAR(20),            -- Masa berlaku KIR
    tgl_beli VARCHAR(20),                    -- Tanggal pembelian
    harga_beli DECIMAL(15,2),                -- Harga beli
    no_polis_asuransi VARCHAR(100),          -- Nomor polis asuransi
    jangka_pertanggungan VARCHAR(20),        -- Jangka pertanggungan
    channel VARCHAR(100),                    -- Channel: Direct, Indirect, HCO
    cabang VARCHAR(100),                     -- Cabang penempatan
    pengguna VARCHAR(255),                   -- Nama pengguna
    pengguna_utama VARCHAR(255),             -- Pengguna utama
    address TEXT,                            -- Alamat
    sub_location VARCHAR(255),               -- Sub lokasi
    location VARCHAR(255),                   -- Lokasi
    status VARCHAR(20) DEFAULT 'Aktif',      -- Status: Aktif, Nonaktif, Terjual
    ownership VARCHAR(50) DEFAULT 'Milik Modena', -- Kepemilikan: Milik Modena, Sewa
    approval_status VARCHAR(20) DEFAULT 'Pending', -- Status approval
    -- Depreciation (Penyusutan)
    depreciation_method VARCHAR(100),        -- Metode: Garis Lurus, Saldo Menurun
    useful_life INT,                         -- Masa manfaat (tahun)
    residual_value DECIMAL(15,2),            -- Nilai residu
    -- Photos & Documents
    photo_front TEXT,                        -- Foto depan
    photo_rear TEXT,                         -- Foto belakang
    photo_right TEXT,                        -- Foto kanan
    photo_left TEXT,                         -- Foto kiri
    stnk_url TEXT,                           -- URL dokumen STNK
    kir_url TEXT,                            -- URL dokumen KIR
    workflow TEXT,                           -- JSON workflow approval
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_vehicles_no_polisi ON vehicles(no_polisi);

-- Vehicle Contracts - Kontrak sewa kendaraan
CREATE TABLE vehicle_contracts (
    id SERIAL PRIMARY KEY,
    no_kontrak VARCHAR(50) UNIQUE NOT NULL,  -- Nomor kontrak
    no_polisi VARCHAR(20),                   -- Nomor polisi
    aset VARCHAR(255),                       -- Deskripsi unit
    vendor_id INT REFERENCES vendors(id),    -- Vendor rental
    vendor VARCHAR(255),                     -- Nama vendor
    tgl_mulai VARCHAR(20),                   -- Tanggal mulai kontrak
    tgl_berakhir VARCHAR(20),                -- Tanggal berakhir kontrak
    biaya_sewa DECIMAL(15,2),                -- Biaya sewa per bulan
    channel VARCHAR(100),                    -- Channel
    cabang VARCHAR(100),                     -- Cabang
    pengguna_utama VARCHAR(255),             -- Pengguna utama
    status VARCHAR(20) DEFAULT 'Active',     -- Status: Active, Expired
    approval_status VARCHAR(20) DEFAULT 'Pending',
    -- Vehicle Details
    merek VARCHAR(100),
    tipe_kendaraan VARCHAR(100),
    model VARCHAR(100),
    tahun_pembuatan VARCHAR(10),
    warna VARCHAR(50),
    isi_silinder VARCHAR(50),
    ownership VARCHAR(50),
    -- Documents
    attachment_url TEXT,
    stnk_url TEXT,
    kir_url TEXT,
    photo_front TEXT,
    photo_rear TEXT,
    photo_right TEXT,
    photo_left TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_vehicle_contracts_no_polisi ON vehicle_contracts(no_polisi);

-- Vehicle Services - Servis kendaraan
CREATE TABLE vehicle_services (
    id SERIAL PRIMARY KEY,
    vehicle_id INT REFERENCES vehicles(id),
    no_polisi VARCHAR(20),                   -- Nomor polisi
    aset VARCHAR(255),                       -- Deskripsi unit
    vendor_id INT REFERENCES vendors(id),    -- Vendor bengkel
    vendor VARCHAR(255),                     -- Nama vendor
    tgl_request VARCHAR(20),                 -- Tanggal request
    channel VARCHAR(100),
    cabang VARCHAR(100),
    km_kendaraan VARCHAR(50),                -- KM kendaraan saat servis
    masalah TEXT,                            -- Deskripsi masalah
    jenis_servis VARCHAR(100),               -- Jenis: Rutin, Perbaikan, dll
    estimasi_biaya DECIMAL(15,2),            -- Estimasi biaya
    biaya_aktual DECIMAL(15,2),              -- Biaya aktual
    technician VARCHAR(255),                 -- Nama teknisi
    status VARCHAR(20) DEFAULT 'Pending',    -- Status: Pending, In Progress, Completed
    status_approval VARCHAR(20) DEFAULT 'Pending',
    spare_parts TEXT,                        -- JSON array spare parts
    completion_date VARCHAR(20),             -- Tanggal selesai
    notes TEXT,                              -- Catatan
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_vehicle_services_no_polisi ON vehicle_services(no_polisi);

-- Spare Parts - Detail spare part servis
CREATE TABLE spare_parts (
    id SERIAL PRIMARY KEY,
    service_id INT REFERENCES vehicle_services(id),
    part_name VARCHAR(255),                  -- Nama part
    part_number VARCHAR(100),                -- Nomor part
    qty INT,                                 -- Jumlah
    unit_price DECIMAL(15,2),                -- Harga satuan
    total_price DECIMAL(15,2),               -- Total harga
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tax & KIR - Pajak dan KIR kendaraan
CREATE TABLE tax_kirs (
    id SERIAL PRIMARY KEY,
    vehicle_id INT REFERENCES vehicles(id),
    no_polisi VARCHAR(20),
    aset VARCHAR(255),
    tgl_request VARCHAR(20),                 -- Tanggal request
    jenis VARCHAR(50),                       -- Jenis: Pajak STNK, KIR
    channel VARCHAR(100),
    cabang VARCHAR(100),
    jatuh_tempo VARCHAR(20),                 -- Tanggal jatuh tempo
    estimasi_biaya DECIMAL(15,2),
    biaya_aktual DECIMAL(15,2),
    target_selesai VARCHAR(20),              -- Target tanggal selesai
    jenis_pembayaran VARCHAR(100),           -- Jenis pembayaran
    status VARCHAR(20) DEFAULT 'Pending',    -- Status: Pending, Paid
    status_approval VARCHAR(20) DEFAULT 'Pending',
    attachment_url TEXT,                     -- URL bukti bayar
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_tax_kirs_no_polisi ON tax_kirs(no_polisi);

-- Vehicle Mutations - Mutasi kendaraan
CREATE TABLE vehicle_mutations (
    id SERIAL PRIMARY KEY,
    vehicle_id INT REFERENCES vehicles(id),
    no_polisi VARCHAR(20),
    asset_number VARCHAR(50),
    asset_name VARCHAR(255),
    cabang_aset VARCHAR(100),                -- Cabang aset saat ini
    tipe_mutasi VARCHAR(100),                -- Tipe: Rotasi, Pindah Cabang
    tgl_permintaan VARCHAR(20),              -- Tanggal permintaan
    lokasi_asal VARCHAR(255),                -- Lokasi asal
    lokasi_tujuan VARCHAR(255),              -- Lokasi tujuan
    pic_before VARCHAR(255),                 -- PIC sebelum mutasi
    pic_after VARCHAR(255),                  -- PIC setelah mutasi
    biaya_mutasi DECIMAL(15,2),              -- Biaya mutasi
    checklist_condition TEXT,                -- JSON checklist kondisi
    status VARCHAR(20) DEFAULT 'Pending',
    status_approval VARCHAR(20) DEFAULT 'Pending',
    asset_type VARCHAR(50) DEFAULT 'VEHICLE', -- Tipe: VEHICLE, GENERAL_ASSET
    -- Photos
    photo_front TEXT,
    photo_rear TEXT,
    photo_right TEXT,
    photo_left TEXT,
    photo_interior TEXT,
    document_stnk TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_vehicle_mutations_no_polisi ON vehicle_mutations(no_polisi);

-- Vehicle Sales - Penjualan kendaraan
CREATE TABLE vehicle_sales (
    id SERIAL PRIMARY KEY,
    vehicle_id INT REFERENCES vehicles(id),
    no_polisi VARCHAR(20),
    asset_number VARCHAR(50),
    asset_name VARCHAR(255),
    tgl_request VARCHAR(20),                 -- Tanggal request jual
    channel VARCHAR(100),
    cabang VARCHAR(100),
    harga_pembuka DECIMAL(15,2),             -- Harga pembuka lelang
    harga_tertinggi DECIMAL(15,2),           -- Harga tertinggi saat ini
    status VARCHAR(20) DEFAULT 'Open',       -- Status: Open, Closed, Sold
    status_approval VARCHAR(20) DEFAULT 'Pending',
    asset_type VARCHAR(50) DEFAULT 'VEHICLE',
    winner_bid_id INT,                       -- ID pemenang lelang
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bids - Penawaran lelang
CREATE TABLE bids (
    id SERIAL PRIMARY KEY,
    sale_id INT NOT NULL,                    -- ID penjualan
    amount DECIMAL(15,2),                    -- Jumlah penawaran
    bidder_name VARCHAR(255),                -- Nama penawar
    bidder_role VARCHAR(100),                -- Role penawar
    bidder_email VARCHAR(255),               -- Email penawar
    bidder_phone VARCHAR(50),                -- Telepon penawar
    bidder_ktp VARCHAR(50),                  -- KTP penawar
    bidder_avatar TEXT,                      -- Avatar penawar
    timestamp TIMESTAMP,                     -- Waktu penawaran
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_bids_sale_id ON bids(sale_id);

-- Vehicle Reminders - Reminder kendaraan
CREATE TABLE vehicle_reminders (
    id SERIAL PRIMARY KEY,
    no_polisi VARCHAR(20),
    vehicle_name VARCHAR(255),
    type VARCHAR(100),                       -- Tipe: STNK 1 Tahunan, STNK 5 Tahunan, KIR
    expiry_date VARCHAR(20),                 -- Tanggal expired
    branch VARCHAR(100),
    status VARCHAR(20),                      -- Status: Safe, Warning, Critical, Expired
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_vehicle_reminders_no_polisi ON vehicle_reminders(no_polisi);


-- =====================================================
-- 5. BUILDING MANAGEMENT (GEDUNG)
-- =====================================================

-- Buildings - Data gedung
CREATE TABLE buildings (
    id SERIAL PRIMARY KEY,
    asset_no VARCHAR(50) UNIQUE NOT NULL,    -- Nomor aset gedung
    name VARCHAR(255) NOT NULL,              -- Nama gedung
    type VARCHAR(100),                       -- Tipe: Kantor, Gudang, Showroom, Workshop
    location VARCHAR(255),                   -- Lokasi/Kota
    address TEXT,                            -- Alamat lengkap
    city VARCHAR(100),                       -- Kota
    district VARCHAR(100),                   -- Kabupaten
    province VARCHAR(100),                   -- Provinsi
    -- Location Details
    distance_to_dealer VARCHAR(50),          -- Jarak ke dealer (km)
    road_condition VARCHAR(255),             -- Kondisi jalan/akses
    -- Utilities
    electricity_power VARCHAR(50),           -- Daya listrik (Watt/Ampere)
    water_source VARCHAR(100),               -- Sumber air
    phone_line_count VARCHAR(20),            -- Jumlah line telepon
    -- Physical Specs
    land_area VARCHAR(50),                   -- Luas tanah (m2)
    building_area VARCHAR(50),               -- Luas bangunan (m2)
    front_yard_area VARCHAR(50),             -- Luas halaman depan (m2)
    total_floors VARCHAR(20),                -- Jumlah lantai
    parking_capacity VARCHAR(50),            -- Kapasitas parkir
    building_age VARCHAR(20),                -- Usia bangunan (tahun)
    fence_condition VARCHAR(100),            -- Kondisi pagar
    gate_condition VARCHAR(100),             -- Kondisi gerbang
    -- Checklist & Features (JSON)
    structure_checklist TEXT,                -- JSON checklist struktur
    environment_conditions TEXT,             -- JSON kondisi lingkungan
    security_features TEXT,                  -- JSON fitur keamanan
    documents_available TEXT,                -- JSON dokumen tersedia
    -- Renovation
    renovation_needed BOOLEAN DEFAULT FALSE, -- Perlu renovasi?
    renovation_cost_estimate VARCHAR(50),    -- Estimasi biaya renovasi
    renovation_time_estimate VARCHAR(50),    -- Estimasi waktu renovasi
    renovation_details_obj TEXT,             -- JSON detail renovasi
    location_context TEXT,                   -- JSON konteks lokasi
    -- Cost
    rent_cost VARCHAR(50),                   -- Biaya sewa
    total_maintenance_cost VARCHAR(50),      -- Total biaya maintenance
    utility_cost VARCHAR(50),                -- Biaya utilitas
    purchase_price VARCHAR(50),              -- Harga beli (jika milik)
    -- Lease Details
    start_date VARCHAR(20),                  -- Tanggal mulai sewa
    end_date VARCHAR(20),                    -- Tanggal berakhir sewa
    tax_pph VARCHAR(50),                     -- PPH
    notary_fee VARCHAR(50),                  -- Biaya notaris
    -- Owner
    owner_name VARCHAR(255),                 -- Nama pemilik
    owner_phone VARCHAR(50),                 -- Telepon pemilik
    owner_address TEXT,                      -- Alamat pemilik
    -- Business Notes
    business_notes TEXT,                     -- JSON catatan bisnis
    -- Status
    status VARCHAR(20) DEFAULT 'Pending',    -- Status: Pending, Approved, Rejected
    ownership VARCHAR(20) DEFAULT 'Rent',    -- Kepemilikan: Rent, Own
    -- Proposals & Workflow (JSON)
    proposals TEXT,                          -- JSON array proposal kandidat
    workflow TEXT,                           -- JSON workflow approval
    -- Floor Plan
    floor_plan_image TEXT,                   -- URL gambar denah
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_buildings_asset_no ON buildings(asset_no);

-- Building Assets - Aset di dalam gedung (AC, Genset, Lift, dll)
CREATE TABLE building_assets (
    id SERIAL PRIMARY KEY,
    building_id INT REFERENCES buildings(id),
    asset_code VARCHAR(50) UNIQUE NOT NULL,  -- Kode aset
    asset_name VARCHAR(255) NOT NULL,        -- Nama aset
    asset_type VARCHAR(100),                 -- Tipe: AC, Genset, Lift, CCTV, dll
    building_name VARCHAR(255),              -- Nama gedung
    floor VARCHAR(50),                       -- Lantai
    room_name VARCHAR(100),                  -- Nama ruangan
    brand VARCHAR(100),                      -- Merek
    ownership VARCHAR(50),                   -- Kepemilikan
    purchase_price VARCHAR(50),              -- Harga beli
    purchase_date VARCHAR(20),               -- Tanggal beli
    maintenance_frequency VARCHAR(50),       -- Frekuensi maintenance: Monthly, Quarterly, Yearly
    pic VARCHAR(255),                        -- PIC
    status VARCHAR(20) DEFAULT 'Active',     -- Status: Active, Inactive
    approval_status VARCHAR(20) DEFAULT 'Draft', -- Status approval
    attachment_url TEXT,                     -- URL dokumen
    proposals TEXT,                          -- JSON array proposal maintenance
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_building_assets_building_id ON building_assets(building_id);

-- Building Maintenance - Pemeliharaan gedung
CREATE TABLE building_maintenances (
    id SERIAL PRIMARY KEY,
    asset_id INT REFERENCES building_assets(id),
    asset_name VARCHAR(255),                 -- Nama aset
    building_location VARCHAR(255),          -- Lokasi gedung
    vendor_id INT REFERENCES vendors(id),
    vendor VARCHAR(255),                     -- Nama vendor
    technician VARCHAR(255),                 -- Nama teknisi
    request_date VARCHAR(20),                -- Tanggal request
    completion_date VARCHAR(20),             -- Tanggal selesai
    maintenance_type VARCHAR(50),            -- Tipe: Preventive, Corrective, Emergency
    description TEXT,                        -- Deskripsi pekerjaan
    cost DECIMAL(15,2),                      -- Biaya
    status VARCHAR(20) DEFAULT 'Scheduled',  -- Status: Scheduled, In Progress, Completed, Pending
    approval_status VARCHAR(20) DEFAULT 'Draft',
    evidence_before TEXT,                    -- URL foto sebelum
    evidence_after TEXT,                     -- URL foto sesudah
    rating INT,                              -- Rating pekerjaan (1-5)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Utilities - Monitoring utilitas (Listrik, Air, Gas, Internet)
CREATE TABLE utilities (
    id SERIAL PRIMARY KEY,
    building_id INT REFERENCES buildings(id),
    period VARCHAR(10),                      -- Periode: YYYY-MM
    date VARCHAR(20),                        -- Tanggal
    location VARCHAR(255),                   -- Lokasi gedung
    type VARCHAR(50),                        -- Tipe: Listrik, Air, Gas, Internet
    meter_start DECIMAL(15,2),               -- Meter awal
    meter_end DECIMAL(15,2),                 -- Meter akhir
    usage DECIMAL(15,2),                     -- Pemakaian
    unit VARCHAR(20),                        -- Satuan: kWh, m3, dll
    cost DECIMAL(15,2),                      -- Biaya
    status VARCHAR(20) DEFAULT 'Pending',    -- Status: Paid, Unpaid, Pending
    attachment_url TEXT,                     -- URL bukti bayar
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_utilities_building_id ON utilities(building_id);

-- Compliances - Dokumen compliance/legal gedung
CREATE TABLE compliances (
    id SERIAL PRIMARY KEY,
    building_id INT REFERENCES buildings(id),
    building_name VARCHAR(255),              -- Nama gedung
    document_name VARCHAR(255) NOT NULL,     -- Nama dokumen
    document_type VARCHAR(100),              -- Tipe: IMB, SLF, PBB, Sertifikat, dll
    issue_date VARCHAR(20),                  -- Tanggal terbit
    expiry_date VARCHAR(20),                 -- Tanggal expired
    issuing_body VARCHAR(255),               -- Instansi penerbit
    status VARCHAR(20),                      -- Status: Active, Expiring, Expired
    attachment_url TEXT,                     -- URL dokumen
    notes TEXT,                              -- Catatan
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_compliances_building_id ON compliances(building_id);

-- Log Books - Log book kunjungan tamu
CREATE TABLE log_books (
    id SERIAL PRIMARY KEY,
    building_id INT REFERENCES buildings(id),
    lokasi_modena VARCHAR(255),              -- Lokasi Modena
    kategori_tamu VARCHAR(100),              -- Kategori tamu
    nama_tamu VARCHAR(255) NOT NULL,         -- Nama tamu
    tanggal_kunjungan VARCHAR(20),           -- Tanggal kunjungan
    jam_datang VARCHAR(10),                  -- Jam datang
    jam_pulang VARCHAR(10),                  -- Jam pulang
    wanita INT DEFAULT 0,                    -- Jumlah wanita
    laki_laki INT DEFAULT 0,                 -- Jumlah laki-laki
    anak_anak INT DEFAULT 0,                 -- Jumlah anak-anak
    note TEXT,                               -- Catatan
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 6. GENERAL ASSET MANAGEMENT (ASET UMUM)
-- =====================================================

-- General Assets - Aset umum (HC, IT, CS)
CREATE TABLE general_assets (
    id SERIAL PRIMARY KEY,
    asset_number VARCHAR(50) UNIQUE NOT NULL, -- Nomor aset
    asset_category VARCHAR(20),              -- Kategori: HC, IT, CS
    type VARCHAR(100),                       -- Tipe: Laptop, Chair, Display, dll
    asset_name VARCHAR(255),                 -- Nama aset
    ownership VARCHAR(50),                   -- Kepemilikan
    asset_location VARCHAR(255),             -- Lokasi aset
    sub_location VARCHAR(255),               -- Sub lokasi
    department VARCHAR(100),                 -- Departemen
    channel VARCHAR(100),                    -- Channel
    address TEXT,                            -- Alamat
    purchase_price DECIMAL(15,2),            -- Harga beli
    purchase_date VARCHAR(20),               -- Tanggal beli
    brand VARCHAR(100),                      -- Merek
    model_number VARCHAR(100),               -- Model/Serial number
    pic VARCHAR(255),                        -- PIC
    source_category VARCHAR(50),             -- Sumber: Asset HC, Asset IT
    status VARCHAR(20) DEFAULT 'Active',     -- Status: Active, Inactive
    approval_status VARCHAR(20) DEFAULT 'Pending',
    attachment_url TEXT,                     -- URL dokumen
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_general_assets_category ON general_assets(asset_category);

-- Asset Maintenances - Pemeliharaan aset umum
CREATE TABLE asset_maintenances (
    id SERIAL PRIMARY KEY,
    asset_id INT REFERENCES general_assets(id),
    asset_number VARCHAR(50),
    asset_name VARCHAR(255),
    location VARCHAR(255),
    category VARCHAR(100),                   -- Kategori: AC, Genset, dll
    frequency VARCHAR(50),                   -- Frekuensi: Monthly, Quarterly, Yearly
    last_maintenance_date VARCHAR(20),       -- Tanggal maintenance terakhir
    next_maintenance_date VARCHAR(20),       -- Tanggal maintenance berikutnya
    vendor_id INT REFERENCES vendors(id),
    vendor VARCHAR(255),
    cost DECIMAL(15,2),
    status VARCHAR(20),                      -- Status: Safe, Warning, Overdue
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance Reminders - Reminder pemeliharaan
CREATE TABLE maintenance_reminders (
    id SERIAL PRIMARY KEY,
    asset_id INT REFERENCES general_assets(id),
    asset_name VARCHAR(255),
    asset_code VARCHAR(50),
    location VARCHAR(255),
    category VARCHAR(100),
    frequency VARCHAR(50),
    last_maintenance_date VARCHAR(20),
    next_maintenance_date VARCHAR(20),
    status VARCHAR(20),                      -- Status: Safe, Warning, Overdue
    vendor VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Asset Mutations - Mutasi aset umum
CREATE TABLE asset_mutations (
    id SERIAL PRIMARY KEY,
    asset_id INT REFERENCES general_assets(id),
    asset_number VARCHAR(50),
    asset_name VARCHAR(255),
    asset_type VARCHAR(50) DEFAULT 'GENERAL_ASSET',
    cabang_aset VARCHAR(100),
    tipe_mutasi VARCHAR(100),
    tgl_permintaan VARCHAR(20),
    lokasi_asal VARCHAR(255),
    lokasi_tujuan VARCHAR(255),
    biaya_mutasi DECIMAL(15,2),
    pic_before VARCHAR(255),
    pic_after VARCHAR(255),
    checklist_condition TEXT,                -- JSON checklist kondisi
    status VARCHAR(20) DEFAULT 'Pending',
    status_approval VARCHAR(20) DEFAULT 'Pending',
    -- Photos
    photo_front TEXT,
    photo_rear TEXT,
    photo_right TEXT,
    photo_left TEXT,
    photo_interior TEXT,
    document_stnk TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Asset Sales - Penjualan aset umum
CREATE TABLE asset_sales (
    id SERIAL PRIMARY KEY,
    asset_id INT REFERENCES general_assets(id),
    asset_number VARCHAR(50),
    asset_name VARCHAR(255),
    asset_type VARCHAR(50) DEFAULT 'GENERAL_ASSET',
    tgl_request VARCHAR(20),
    channel VARCHAR(100),
    cabang VARCHAR(100),
    harga_pembuka DECIMAL(15,2),
    harga_tertinggi DECIMAL(15,2),
    status VARCHAR(20) DEFAULT 'Open',
    status_approval VARCHAR(20) DEFAULT 'Pending',
    bids TEXT,                               -- JSON array penawaran
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================
-- 7. STATIONERY MANAGEMENT (ATK/ARK)
-- =====================================================

-- Master Items - Master data item ATK/ARK
CREATE TABLE master_items (
    id SERIAL PRIMARY KEY,
    item_code VARCHAR(50) UNIQUE NOT NULL,   -- Kode item unik
    item_name VARCHAR(255) NOT NULL,         -- Nama item
    category VARCHAR(20),                    -- Kategori: ATK, ARK
    uom VARCHAR(50),                         -- Unit of Measure: Pcs, Box, Rim, dll
    remaining_stock INT DEFAULT 0,           -- Stok tersisa
    minimum_stock INT DEFAULT 0,             -- Stok minimum (reorder point)
    maximum_stock INT DEFAULT 0,             -- Stok maksimum
    requested_stock INT DEFAULT 0,           -- Stok yang sedang direquest
    last_purchase_price DECIMAL(15,2),       -- Harga beli terakhir
    average_price DECIMAL(15,2),             -- Harga rata-rata
    purchase_date VARCHAR(20),               -- Tanggal pembelian terakhir
    image_url TEXT,                          -- URL gambar item
    status VARCHAR(20) DEFAULT 'Active',     -- Status: Active, Inactive
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_master_items_category ON master_items(category);

-- Stationery Requests - Permintaan ATK/ARK
CREATE TABLE stationery_requests (
    id SERIAL PRIMARY KEY,
    request_no VARCHAR(50) UNIQUE NOT NULL,  -- Nomor request unik
    type VARCHAR(20),                        -- Tipe: ATK, ARK
    delivery_type VARCHAR(50),               -- Tipe pengiriman
    location_id INT REFERENCES delivery_locations(id),
    location VARCHAR(255),                   -- Nama lokasi
    requested_by INT REFERENCES users(id),   -- User yang request
    requester_name VARCHAR(255),             -- Nama requester
    date VARCHAR(20),                        -- Tanggal request
    remarks TEXT,                            -- Catatan
    status VARCHAR(20) DEFAULT 'Pending',    -- Status: Pending, Approved, Rejected, Delivered
    approval_status VARCHAR(20) DEFAULT 'Pending',
    items TEXT,                              -- JSON array of items
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_stationery_requests_type ON stationery_requests(type);

-- Stationery Request Items - Detail item dalam permintaan
CREATE TABLE stationery_request_items (
    id SERIAL PRIMARY KEY,
    request_id INT REFERENCES stationery_requests(id) ON DELETE CASCADE,
    item_id INT REFERENCES master_items(id),
    item_code VARCHAR(50),                   -- Kode item
    item_name VARCHAR(255),                  -- Nama item
    qty INT,                                 -- Jumlah
    uom VARCHAR(50),                         -- Satuan
    unit_price DECIMAL(15,2),                -- Harga satuan
    total_price DECIMAL(15,2),               -- Total harga
    notes TEXT,                              -- Catatan
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_stationery_request_items_request_id ON stationery_request_items(request_id);

-- Delivery Locations - Lokasi pengiriman
CREATE TABLE delivery_locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,              -- Nama lokasi
    address TEXT,                            -- Alamat lengkap
    type VARCHAR(50),                        -- Tipe: Warehouse, Branch
    status VARCHAR(20) DEFAULT 'Active',     -- Status: Active, Inactive
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchases - Pembelian item
CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    purchase_no VARCHAR(50) UNIQUE,          -- Nomor PO
    vendor_id INT REFERENCES vendors(id),
    vendor_name VARCHAR(255),                -- Nama vendor
    item_id INT REFERENCES master_items(id),
    item_name VARCHAR(255),                  -- Nama item
    date VARCHAR(20),                        -- Tanggal pembelian
    qty INT,                                 -- Jumlah
    unit_price DECIMAL(15,2),                -- Harga satuan
    total_price DECIMAL(15,2),               -- Total harga
    status VARCHAR(20) DEFAULT 'Pending',    -- Status: Pending, Received, Cancelled
    attachment_url TEXT,                     -- URL dokumen PO
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 8. DAILY OPERATIONS (Timesheet, Absensi, Stock Opname)
-- =====================================================

-- Timesheets - Data timesheet/absensi harian
CREATE TABLE timesheets (
    id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES users(id),
    employee_name VARCHAR(255),              -- Nama karyawan
    employee_role VARCHAR(100),              -- Role karyawan
    avatar TEXT,                             -- URL foto profil
    location VARCHAR(255),                   -- Lokasi kerja
    area VARCHAR(255),                       -- Area kerja
    date VARCHAR(20),                        -- Tanggal
    shift VARCHAR(50),                       -- Shift: Pagi, Siang, Malam
    clock_in VARCHAR(10),                    -- Jam masuk
    clock_out VARCHAR(10),                   -- Jam keluar
    status VARCHAR(50),                      -- Status: Tepat Waktu, Terlambat, Absen, Izin, Sakit
    tasks TEXT,                              -- JSON array tugas
    photos TEXT,                             -- JSON array foto
    notes TEXT,                              -- Catatan
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_timesheets_employee_id ON timesheets(employee_id);
CREATE INDEX idx_timesheets_date ON timesheets(date);

-- Absensis - Data absensi
CREATE TABLE absensis (
    id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES users(id),
    employee_name VARCHAR(255),              -- Nama karyawan
    department VARCHAR(100),                 -- Departemen
    location VARCHAR(255),                   -- Lokasi
    date VARCHAR(20),                        -- Tanggal
    check_in VARCHAR(10),                    -- Jam check in
    check_out VARCHAR(10),                   -- Jam check out
    work_hours DECIMAL(5,2),                 -- Total jam kerja
    status VARCHAR(50),                      -- Status: Hadir, Tidak Hadir, Izin, Sakit, Cuti
    notes TEXT,                              -- Catatan
    photo_in TEXT,                           -- URL foto check in
    photo_out TEXT,                          -- URL foto check out
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_absensis_employee_id ON absensis(employee_id);

-- Stock Opnames - Stock opname
CREATE TABLE stock_opnames (
    id SERIAL PRIMARY KEY,
    opname_no VARCHAR(50) UNIQUE NOT NULL,   -- Nomor stock opname
    date VARCHAR(20),                        -- Tanggal opname
    location VARCHAR(255),                   -- Lokasi
    category VARCHAR(50),                    -- Kategori: ATK, ARK, Asset
    conducted_by VARCHAR(255),               -- Dilakukan oleh
    status VARCHAR(20) DEFAULT 'Draft',      -- Status: Draft, In Progress, Completed
    items TEXT,                              -- JSON array item opname
    notes TEXT,                              -- Catatan
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 9. POD & LOKER MANAGEMENT
-- =====================================================

-- Modena PODs - Data kamar/kos karyawan
CREATE TABLE modena_pods (
    id SERIAL PRIMARY KEY,
    kode_pod VARCHAR(50) UNIQUE NOT NULL,    -- Kode POD unik
    nama_pod VARCHAR(255) NOT NULL,          -- Nama POD
    alamat TEXT,                             -- Alamat
    kota VARCHAR(100),                       -- Kota
    jumlah_kamar INT,                        -- Jumlah kamar total
    kamar_tersedia INT,                      -- Kamar yang tersedia
    harga_per_bulan DECIMAL(15,2),           -- Harga sewa per bulan
    fasilitas TEXT,                          -- Fasilitas (JSON atau text)
    status VARCHAR(20) DEFAULT 'Aktif',      -- Status: Aktif, Nonaktif
    keterangan TEXT,                         -- Keterangan
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- POD Occupants - Data penghuni POD
CREATE TABLE pod_occupants (
    id SERIAL PRIMARY KEY,
    pod_id INT REFERENCES modena_pods(id),
    no_kamar VARCHAR(20),                    -- Nomor kamar
    nama_karyawan VARCHAR(255) NOT NULL,     -- Nama karyawan
    nik VARCHAR(50),                         -- NIK karyawan
    departemen VARCHAR(100),                 -- Departemen
    cabang VARCHAR(100),                     -- Cabang
    tgl_masuk VARCHAR(20),                   -- Tanggal masuk
    tgl_keluar VARCHAR(20),                  -- Tanggal keluar
    status_huni VARCHAR(20) DEFAULT 'Aktif', -- Status: Aktif, Keluar
    biaya_per_bulan DECIMAL(15,2),           -- Biaya per bulan
    metode_pembayaran VARCHAR(100),          -- Metode pembayaran
    keterangan TEXT,                         -- Keterangan
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_pod_occupants_pod_id ON pod_occupants(pod_id);

-- POD Requests - Permintaan kamar POD
CREATE TABLE pod_requests (
    id SERIAL PRIMARY KEY,
    no_request VARCHAR(50) UNIQUE NOT NULL,  -- Nomor request
    nama_karyawan VARCHAR(255) NOT NULL,     -- Nama karyawan
    nik VARCHAR(50),                         -- NIK
    departemen VARCHAR(100),                 -- Departemen
    cabang VARCHAR(100),                     -- Cabang
    tgl_request VARCHAR(20),                 -- Tanggal request
    tgl_mulai VARCHAR(20),                   -- Tanggal mulai sewa
    durasi_sewa INT,                         -- Durasi sewa (bulan)
    alasan TEXT,                             -- Alasan request
    status VARCHAR(20) DEFAULT 'Pending',    -- Status: Pending, Approved, Rejected
    approved_by VARCHAR(255),                -- Disetujui oleh
    approved_date VARCHAR(20),               -- Tanggal disetujui
    pod_id INT REFERENCES modena_pods(id),
    no_kamar_assigned VARCHAR(20),           -- Nomor kamar yang diberikan
    keterangan TEXT,                         -- Keterangan
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lokers - Data loker karyawan
CREATE TABLE lokers (
    id SERIAL PRIMARY KEY,
    kode_loker VARCHAR(50) UNIQUE NOT NULL,  -- Kode loker unik
    nomor_loker VARCHAR(20),                 -- Nomor loker
    location VARCHAR(255),                   -- Lokasi
    building_id INT REFERENCES buildings(id),
    floor VARCHAR(50),                       -- Lantai
    status VARCHAR(20) DEFAULT 'Tersedia',   -- Status: Tersedia, Terpakai, Rusak
    current_user VARCHAR(255),               -- Pengguna saat ini
    current_user_id INT REFERENCES users(id),
    assigned_date VARCHAR(20),               -- Tanggal assign
    notes TEXT,                              -- Catatan
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_lokers_building_id ON lokers(building_id);

-- Loker Requests - Permintaan loker
CREATE TABLE loker_requests (
    id SERIAL PRIMARY KEY,
    no_request VARCHAR(50) UNIQUE NOT NULL,  -- Nomor request
    nama_karyawan VARCHAR(255) NOT NULL,     -- Nama karyawan
    nik VARCHAR(50),                         -- NIK
    departemen VARCHAR(100),                 -- Departemen
    cabang VARCHAR(100),                     -- Cabang
    tgl_request VARCHAR(20),                 -- Tanggal request
    alasan TEXT,                             -- Alasan request
    status VARCHAR(20) DEFAULT 'Pending',    -- Status: Pending, Approved, Rejected
    approved_by VARCHAR(255),                -- Disetujui oleh
    approved_date VARCHAR(20),               -- Tanggal disetujui
    loker_id INT REFERENCES lokers(id),
    keterangan TEXT,                         -- Keterangan
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 10. NOTIFICATION & APPROVAL SYSTEM
-- =====================================================

-- Notifications - Notifikasi approval
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    recipient_id INT REFERENCES users(id) NOT NULL,
    recipient_email VARCHAR(255),            -- Email penerima
    recipient_name VARCHAR(255),             -- Nama penerima
    recipient_role VARCHAR(100),             -- Role penerima
    
    -- Request Info
    module VARCHAR(100) NOT NULL,            -- Module: VEHICLE, BUILDING, TAX_KIR, SERVICE, MUTATION, SALES, CONTRACT, POD, LOKER, ATK, MAINTENANCE
    request_id VARCHAR(50) NOT NULL,         -- ID request
    request_no VARCHAR(100),                 -- Nomor request
    request_type VARCHAR(50),                -- Tipe: NEW, UPDATE, DELETE
    
    -- Notification Content
    title VARCHAR(255) NOT NULL,             -- Judul notifikasi
    message TEXT,                            -- Isi pesan
    action_url TEXT,                         -- URL untuk action
    
    -- Requester Info
    requester_id INT REFERENCES users(id),
    requester_name VARCHAR(255),             -- Nama requester
    requester_email VARCHAR(255),            -- Email requester
    
    -- Status
    status VARCHAR(20) DEFAULT 'Unread',     -- Status: Unread, Read, Actioned
    priority VARCHAR(20) DEFAULT 'Normal',   -- Priority: Low, Normal, High, Urgent
    
    -- Email Status
    email_sent BOOLEAN DEFAULT FALSE,        -- Apakah email sudah dikirim
    email_sent_at TIMESTAMP,                 -- Waktu email dikirim
    
    -- Timestamps
    read_at TIMESTAMP,                       -- Waktu dibaca
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_module ON notifications(module);
CREATE INDEX idx_notifications_status ON notifications(status);

-- Approval Requests - Tracking approval request
CREATE TABLE approval_requests (
    id SERIAL PRIMARY KEY,
    module VARCHAR(100) NOT NULL,            -- Module
    request_id VARCHAR(50) NOT NULL,         -- ID request
    request_no VARCHAR(100),                 -- Nomor request
    
    -- Request Details
    request_title VARCHAR(255),              -- Judul request
    request_data TEXT,                       -- JSON data request
    
    -- Requester
    requester_id INT REFERENCES users(id),
    requester_name VARCHAR(255),
    requester_email VARCHAR(255),
    requester_dept VARCHAR(100),             -- Departemen requester
    requester_branch VARCHAR(100),           -- Cabang requester
    
    -- Current Approval Level
    current_level INT DEFAULT 1,             -- Level approval saat ini
    total_levels INT,                        -- Total level approval
    
    -- Status
    status VARCHAR(20) DEFAULT 'Pending',    -- Status: Pending, Approved, Rejected, Revised
    
    -- Timestamps
    submitted_at TIMESTAMP,                  -- Waktu submit
    completed_at TIMESTAMP,                  -- Waktu selesai
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_approval_requests_module ON approval_requests(module);
CREATE INDEX idx_approval_requests_status ON approval_requests(status);

-- Approval Histories - History setiap approval action
CREATE TABLE approval_histories (
    id SERIAL PRIMARY KEY,
    approval_request_id INT REFERENCES approval_requests(id),
    
    -- Approver Info
    approver_id INT REFERENCES users(id),
    approver_name VARCHAR(255),
    approver_email VARCHAR(255),
    approver_role VARCHAR(100),
    
    -- Action
    level INT,                               -- Level approval
    action VARCHAR(50),                      -- Action: Approved, Rejected, Revised
    comment TEXT,                            -- Komentar
    
    -- Timestamps
    action_at TIMESTAMP,                     -- Waktu action
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_approval_histories_request_id ON approval_histories(approval_request_id);

-- Email Templates - Template email notifikasi
CREATE TABLE email_templates (
    id SERIAL PRIMARY KEY,
    module VARCHAR(100),                     -- Module
    type VARCHAR(50),                        -- Tipe: APPROVAL_REQUEST, APPROVED, REJECTED, REMINDER
    subject VARCHAR(255),                    -- Subject email
    body TEXT,                               -- Body email (HTML)
    is_active BOOLEAN DEFAULT TRUE,          -- Status aktif
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_email_templates_module ON email_templates(module);

-- Notification Settings - Pengaturan notifikasi per user
CREATE TABLE notification_settings (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) UNIQUE NOT NULL,
    email_enabled BOOLEAN DEFAULT TRUE,      -- Notifikasi email aktif
    push_enabled BOOLEAN DEFAULT TRUE,       -- Notifikasi push aktif
    module_settings TEXT,                    -- JSON pengaturan per module
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 11. REMINDER SYSTEM
-- =====================================================

-- Reminders - Reminder dokumen/aset
CREATE TABLE reminders (
    id SERIAL PRIMARY KEY,
    document_name VARCHAR(255),              -- Nama dokumen
    building_name VARCHAR(255),              -- Nama gedung
    asset_no VARCHAR(50),                    -- Nomor aset
    expiry_date VARCHAR(20),                 -- Tanggal expired
    days_remaining INT,                      -- Sisa hari
    status VARCHAR(20),                      -- Status: Safe, Warning, Urgent, Expired
    category VARCHAR(100),                   -- Kategori: Insurance, Lease, Legal, Permit
    source VARCHAR(50),                      -- Sumber: System, Manual
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 12. MASTER APPROVAL CONFIGURATION
-- =====================================================

-- Master Approvals - Konfigurasi approval workflow per module
CREATE TABLE master_approvals (
    id SERIAL PRIMARY KEY,
    module VARCHAR(100) NOT NULL,            -- Module: VEHICLE, BUILDING, SERVICE, TAX_KIR, MUTATION, SALES, CONTRACT, POD, LOKER, ATK
    branch VARCHAR(100),                     -- Cabang (opsional, untuk approval per cabang)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_master_approvals_module ON master_approvals(module);

-- Approval Tiers - Tier dalam approval workflow
CREATE TABLE approval_tiers (
    id SERIAL PRIMARY KEY,
    master_approval_id INT REFERENCES master_approvals(id) ON DELETE CASCADE,
    level INT NOT NULL,                      -- Level approval (1, 2, 3, ...)
    type VARCHAR(50),                        -- Tipe: Role, User
    value VARCHAR(255),                      -- Nilai: nama role atau user ID
    sla INT,                                 -- SLA dalam jam
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_approval_tiers_master_id ON approval_tiers(master_approval_id);

-- =====================================================
-- END OF SCHEMA
-- =====================================================

-- NOTES:
-- 1. Semua tabel menggunakan SERIAL untuk auto-increment primary key
-- 2. Timestamp menggunakan TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- 3. Foreign key dengan ON DELETE CASCADE untuk child tables
-- 4. Index dibuat untuk kolom yang sering digunakan untuk query
-- 5. JSON data disimpan sebagai TEXT (PostgreSQL juga support JSONB)
-- 6. Tanggal disimpan sebagai VARCHAR(20) untuk fleksibilitas format
-- 7. Status approval: Pending, Approved, Rejected, Revised
-- 8. Status umum: Active, Inactive, Draft, Completed
