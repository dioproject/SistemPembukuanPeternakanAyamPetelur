# Aplikasi Pembukuan Ayam Petelur

Aplikasi Google Apps Script untuk pembukuan lengkap peternakan ayam petelur dengan **sistem login** dan **akses web app**.

## Fitur Utama

- **Sistem Login** - Login dengan username & password
- **Dashboard** - Ringkasan visual KPI
- **Manajemen Kandang** - Tambah, edit, dan kelola data kandang
- **Inventaris Ayam** - Pencatatan masuk/keluar ayam per kandang
- **Pencatatan Pakan** - Tracking pakan dan biaya
- **Produksi Telur** - Pencatatan hasil telur per hari
- **Kematian Ayam** - Pencatatan mortalitas dengan analisis penyebab
- **Keuangan** - Pengeluaran, pemasukan, dan laba/rugi
- **Laporan** - Generate laporan bulanan dan export PDF
- **Web App** - Akses semua fitur dari browser tanpa Google Sheets

## Cara Instalasi

### Langkah 1: Buat Google Spreadsheet Baru
1. Buka [Google Sheets](https://sheets.google.com)
2. Buat spreadsheet baru
3. Beri nama "Pembukuan Ayam Petelur"

### Langkah 2: Buka Script Editor
1. Klik menu **Extensions** > **Apps Script**
2. Hapus semua code yang ada di editor

### Langkah 3: Copy Paste Code
Copy paste semua file berikut ke dalam Apps Script:

1. **Code.gs** - Utility functions
2. **Auth.gs** - Sistem login & register
3. **Kandang.gs** - Manajemen kandang
4. **Inventaris.gs** - Stok ayam
5. **Pakan.gs** - Pencatatan pakan
6. **Produksi.gs** - Produksi telur
7. **Kematian.gs** - Pencatatan kematian
8. **Keuangan.gs** - Pengeluaran & pemasukan
9. **Dashboard.gs** - Dashboard & KPI
10. **Report.gs** - Laporan & export PDF
11. **WebApp.gs** - Web App dengan login
12. **Menu.gs** - Custom menu

### Langkah 4: Inisialisasi
1. Simpan semua file (Ctrl+S)
2. Muat ulang spreadsheet (F5)
3. Klik menu **  Ayam Petelur** > **  Inisialisasi Spreadsheet**
4. Berikan izin jika diminta

## Cara Penggunaan

### 1. Setup Awal
```
Menu  > Inisialisasi Spreadsheet
```

### 2. Tambah Kandang
```
Menu  > Tambah Kandang > Isi data > Simpan
```

### 3. Pencatatan Harian

**Pakan:**
```
Menu  > Catat Pakan > Pilih kandang > Isi data > Simpan
```

**Produksi Telur:**
```
Menu  > Catat Produksi Telur > Pilih kandang > Isi data > Simpan
```

**Kematian:**
```
Menu  > Catat Kematian Ayam > Pilih kandang > Isi data > Simpan
```

### 4. Pencatatan Keuangan
```
Menu  > Catat Pengeluaran > Isi data > Simpan
Menu  > Catat Pemasukan > Isi data > Simpan
```

### 5. Lihat Dashboard
```
Menu  > Dashboard > Lihat ringkasan visual
```

### 6. Generate Laporan
```
Menu  > Generate Laporan Bulanan > Pilih bulan > Generate
Menu  > Export ke PDF
```

## Struktur Sheet

| Sheet | Fungsi |
|-------|--------|
| Dashboard | Tampilan visual ringkasan |
| Users | Data user login |
| Data Kandang | Master data kandang |
| Inventaris Ayam | Stok ayam per kandang |
| Pakan | Pencatatan pakan |
| Produksi Telur | Hasil produksi |
| Kematian | Pencatatan kematian |
| Pengeluaran | Semua pengeluaran |
| Pemasukan | Semua pemasukan |
| Laporan | Rekap bulanan |

## Deploy sebagai Web App

Aplikasi bisa diakses dari browser tanpa perlu Google Sheets.

### Cara Deploy:
1. Buka **Apps Script** → Klik **Deploy** → **New deployment**
2. Klik icon gear ⚙️ → Pilih **Web app**
3. Isi konfigurasi:
   - **Description**: Ayam Petelur Web App
   - **Execute as**: **Me** (akun kamu)
   - **Who has access**: **Anyone** (atau sesuai kebutuhan)
4. Klik **Deploy** → **Authorize access**
5. Salin URL yang diberikan

### Login Default:
- **Username**: admin
- **Password**: admin123

### Fitur Web App:
- **Login/Register** - Sistem autentikasi user
- **Dashboard** - Ringkasan data peternakan
- **CRUD Kandang** - Tambah/edit kandang
- **CRUD Inventaris** - Catat ayam masuk/keluar
- **CRUD Pakan** - Catat pakan harian
- **CRUD Produksi** - Catat hasil telur
- **CRUD Kematian** - Catat kematian ayam
- **CRUD Keuangan** - Catat pengeluaran & pemasukan
- **Laporan** - Laporan keuangan bulanan

## Tips Penggunaan

1. **Pencatatan Konsisten** - Isi data setiap hari secara konsisten
2. **Gunakan Dropdown** - Pilih kandang dari dropdown untuk konsistensi data
3. **Cek Dashboard** - Pantau KPI melalui dashboard secara berkala
4. **Export PDF** - Export laporan bulanan untuk arsip

## Troubleshooting

**Menu tidak muncul?**
- Muat ulang spreadsheet (F5)
- Pastikan semua file sudah disimpan

**Error saat inisialisasi?**
- Pastikan ada koneksi internet
- Berikan semua izin yang diminta

**Data tidak tersimpan?**
- Cek apakah ada error di Apps Script Editor
- Pastikan semua field wajib diisi

## License

MIT License
