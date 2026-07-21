/**
 * ============================================
 * PEMBAYARAN AYAM PETELUR - APLIKASI GOOGLE APPS SCRIPT
 * ============================================
 * Aplikasi pembukuan lengkap untuk peternakan ayam petelur
 * dengan fitur pencatatan, pelaporan, dan dashboard.
 */

// ============================================
// KONFIGURASI
// ============================================
const CONFIG = {
  SHEETS: {
    DASHBOARD: 'Dashboard',
    KANDANG: 'Data Kandang',
    INVENTARIS: 'Inventaris Ayam',
    PAKAN: 'Pakan',
    PRODUKSI: 'Produksi Telur',
    KEMATIAN: 'Kematian',
    PENGELUARAN: 'Pengeluaran',
    PEMASUKAN: 'Pemasukan',
    LAPORAN: 'Laporan'
  },
  COLUMNS: {
    KANDANG: ['ID', 'Nama Kandang', 'Kapasitas', 'Lokasi', 'Status', 'Tanggal Dibuat'],
    INVENTARIS: ['ID', 'Tanggal', 'ID Kandang', 'Nama Kandang', 'Jumlah Masuk', 'Jumlah Keluar', 'Sisa Ayam', 'Keterangan'],
    PAKAN: ['ID', 'Tanggal', 'ID Kandang', 'Nama Kandang', 'Jenis Pakan', 'Jumlah (kg)', 'Biaya (Rp)', 'Keterangan'],
    PRODUKSI: ['ID', 'Tanggal', 'ID Kandang', 'Nama Kandang', 'Jumlah Butir', 'Jumlah (kg)', 'Harga Jual/kg', 'Total Nilai', 'Keterangan'],
    KEMATIAN: ['ID', 'Tanggal', 'ID Kandang', 'Nama Kandang', 'Jumlah', 'Penyebab', 'Keterangan'],
    PENGELUARAN: ['ID', 'Tanggal', 'Kategori', 'Deskripsi', 'Jumlah (Rp)', 'ID Kandang', 'Nama Kandang', 'Keterangan'],
    PEMASUKAN: ['ID', 'Tanggal', 'Kategori', 'Deskripsi', 'Jumlah (Rp)', 'ID Kandang', 'Nama Kandang', 'Keterangan']
  }
};

// ============================================
// INISIALISASI SPREADSHEET
// ============================================

/**
 * Fungsi utama - dijalankan pertama kali
 * Membuat semua sheet yang diperlukan
 */
function inisialisasiSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Buat semua sheet
  Object.values(CONFIG.SHEETS).forEach(sheetName => {
    buatSheetJikaBelumAda(ss, sheetName);
  });
  
  // Set header untuk setiap sheet
  setHeaderSheet(ss);
  
  // Pindah ke Dashboard
  ss.setActiveSheet(ss.getSheetByName(CONFIG.SHEETS.DASHBOARD));
  
  SpreadsheetApp.getUi().alert(
    'Inisialisasi Berhasil!',
    'Semua sheet telah berhasil dibuat.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Membuat sheet jika belum ada
 */
function buatSheetJikaBelumAda(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

/**
 * Set header untuk semua sheet
 */
function setHeaderSheet(ss) {
  // Header Kandang
  setHeader(ss, CONFIG.SHEETS.KANDANG, CONFIG.COLUMNS.KANDANG);
  
  // Header Inventaris
  setHeader(ss, CONFIG.SHEETS.INVENTARIS, CONFIG.COLUMNS.INVENTARIS);
  
  // Header Pakan
  setHeader(ss, CONFIG.SHEETS.PAKAN, CONFIG.COLUMNS.PAKAN);
  
  // Header Produksi
  setHeader(ss, CONFIG.SHEETS.PRODUKSI, CONFIG.COLUMNS.PRODUKSI);
  
  // Header Kematian
  setHeader(ss, CONFIG.SHEETS.KEMATIAN, CONFIG.COLUMNS.KEMATIAN);
  
  // Header Pengeluaran
  setHeader(ss, CONFIG.SHEETS.PENGELUARAN, CONFIG.COLUMNS.PENGELUARAN);
  
  // Header Pemasukan
  setHeader(ss, CONFIG.SHEETS.PEMASUKAN, CONFIG.COLUMNS.PEMASUKAN);
}

/**
 * Set header untuk sheet tertentu
 */
function setHeader(ss, sheetName, headers) {
  const sheet = ss.getSheetByName(sheetName);
  if (sheet && sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#4285F4')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold')
      .setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate ID unik dengan prefix
 */
function generateId(prefix) {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return prefix + '-' + timestamp + '-' + random;
}

/**
 * Format tanggal ke format Indonesia
 */
function formatDate(date) {
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return new Date(date).toLocaleDateString('id-ID', options);
}

/**
 * Format angka ke format Rupiah
 */
function formatRupiah(angka) {
  return 'Rp ' + angka.toLocaleString('id-ID');
}

/**
 * Mendapatkan data dari sheet
 */
function getSheetData(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('Spreadsheet tidak ditemukan. Pastikan script terhubung ke spreadsheet.');
  }
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet || sheet.getLastRow() <= 1) {
    return [];
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

/**
 * Menambahkan data ke sheet
 */
function addSheetData(sheetName, rowData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('Spreadsheet tidak ditemukan. Pastikan script terhubung ke spreadsheet.');
  }
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    throw new Error('Sheet ' + sheetName + ' tidak ditemukan');
  }
  
  sheet.appendRow(rowData);
  return true;
}

/**
 * Update data berdasarkan ID
 */
function updateSheetData(sheetName, id, newData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('Spreadsheet tidak ditemukan. Pastikan script terhubung ke spreadsheet.');
  }
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    throw new Error('Sheet ' + sheetName + ' tidak ditemukan');
  }
  
  const data = sheet.getDataRange().getValues();
  const idColumn = 0; // Kolom ID selalu pertama
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idColumn] === id) {
      const range = sheet.getRange(i + 1, 1, 1, newData.length);
      range.setValues([newData]);
      return true;
    }
  }
  
  return false;
}

/**
 * Hapus data berdasarkan ID
 */
function deleteSheetData(sheetName, id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('Spreadsheet tidak ditemukan. Pastikan script terhubung ke spreadsheet.');
  }
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    throw new Error('Sheet ' + sheetName + ' tidak ditemukan');
  }
  
  const data = sheet.getDataRange().getValues();
  const idColumn = 0;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idColumn] === id) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  
  return false;
}

/**
 * Cari data berdasarkan kolom tertentu
 */
function searchSheetData(sheetName, columnName, value) {
  const data = getSheetData(sheetName);
  return data.filter(row => row[columnName] === value);
}

/**
 * Mendapatkan tanggal hari ini dalam format YYYY-MM-DD
 */
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Mendapatkan bulan dan tahun dari tanggal
 */
function getMonthYear(date) {
  const d = new Date(date);
  return {
    month: d.getMonth() + 1,
    year: d.getFullYear()
  };
}

/**
 * Mendapatkan nama bulan dalam Bahasa Indonesia
 */
function getNamaBulan(bulan) {
  const namaBulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return namaBulan[bulan - 1];
}

/**
 * Validasi input - pastikan tidak ada field kosong
 */
function validateInput(data, requiredFields) {
  const missingFields = requiredFields.filter(field => !data[field]);
  
  if (missingFields.length > 0) {
    throw new Error('Field berikut harus diisi: ' + missingFields.join(', '));
  }
  
  return true;
}

/**
 * Tampilkan notifikasi sukses
 */
function showSuccessMessage(pesan) {
  SpreadsheetApp.getUi().alert(
    'Berhasil!',
    pesan,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Tampilkan error message
 */
function showErrorMessage(pesan) {
  SpreadsheetApp.getUi().alert(
    'Error!',
    pesan,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Konfirmasi aksi
 */
function showConfirmMessage(pesan) {
  const response = SpreadsheetApp.getUi().alert(
    'Konfirmasi',
    pesan,
    SpreadsheetApp.getUi().ButtonSet.YES_NO
  );
  return response === SpreadsheetApp.getUi().Button.YES;
}

/**
 * Mendapatkan list kandang untuk dropdown
 */
function getKandangList() {
  const kandangData = getSheetData(CONFIG.SHEETS.KANDANG);
  return kandangData
    .filter(k => k['Status'] === 'Aktif')
    .map(k => [k['ID'], k['Nama Kandang']]);
}

/**
 * Mendapatkan nama kandang berdasarkan ID
 */
function getNamaKandang(id) {
  const kandangData = getSheetData(CONFIG.SHEETS.KANDANG);
  const kandang = kandangData.find(k => k['ID'] === id);
  return kandang ? kandang['Nama Kandang'] : 'Tidak Diketahui';
}
