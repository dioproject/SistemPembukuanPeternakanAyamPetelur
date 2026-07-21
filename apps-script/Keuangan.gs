/**
 * ============================================
 * MODUL KEUANGAN
 * ============================================
 * Fungsi untuk mengelola pengeluaran dan pemasukan
 */

// ============================================
// PENGELUARAN
// ============================================

/**
 * Menambahkan pengeluaran baru
 * @param {string} kategori - Kategori pengeluaran
 * @param {string} deskripsi - Deskripsi pengeluaran
 * @param {number} jumlah - Jumlah pengeluaran (Rp)
 * @param {string} kandangId - ID kandang (opsional)
 * @param {string} keterangan - Keterangan tambahan
 * @returns {string} ID pengeluaran
 */
function tambahPengeluaran(kategori, deskripsi, jumlah, kandangId, keterangan) {
  // Validasi input
  if (!kategori) {
    throw new Error('Kategori pengeluaran harus diisi');
  }
  
  if (!deskripsi) {
    throw new Error('Deskripsi pengeluaran harus diisi');
  }
  
  if (!jumlah || jumlah <= 0) {
    throw new Error('Jumlah pengeluaran harus lebih dari 0');
  }
  
  // Generate ID
  const id = generateId('PG');
  
  // Dapatkan nama kandang jika ada
  let namaKandang = '-';
  if (kandangId) {
    namaKandang = getNamaKandang(kandangId);
  }
  
  // Data yang akan disimpan
  const rowData = [
    id,
    new Date(),
    kategori,
    deskripsi,
    parseInt(jumlah),
    kandangId || '-',
    namaKandang,
    keterangan
  ];
  
  // Simpan ke sheet
  addSheetData(CONFIG.SHEETS.PENGELUARAN, rowData);
  
  return id;
}

/**
 * Fungsi internal untuk catat pengeluaran otomatis (dari modul pakan)
 */
function catatPengeluaranOtomatis(kategori, deskripsi, jumlah, kandangId, namaKandang, keterangan) {
  const id = generateId('PG');
  
  const rowData = [
    id,
    new Date(),
    kategori,
    deskripsi,
    parseInt(jumlah),
    kandangId || '-',
    namaKandang || '-',
    keterangan || 'Otomatis dari pencatatan pakan'
  ];
  
  addSheetData(CONFIG.SHEETS.PENGELUARAN, rowData);
}

/**
 * Mendapatkan semua pengeluaran
 * @returns {Array} Array of pengeluaran
 */
function getAllPengeluaran() {
  return getSheetData(CONFIG.SHEETS.PENGELUARAN);
}

/**
 * Mendapatkan pengeluaran berdasarkan bulan
 * @param {number} bulan - Bulan (1-12)
 * @param {number} tahun - Tahun
 * @returns {Array} Array of pengeluaran
 */
function getPengeluaranByBulan(bulan, tahun) {
  const data = getAllPengeluaran();
  return data.filter(p => {
    const tgl = new Date(p['Tanggal']);
    return (tgl.getMonth() + 1) === bulan && tgl.getFullYear() === tahun;
  });
}

/**
 * Menghitung total pengeluaran per bulan
 * @param {number} bulan - Bulan (1-12)
 * @param {number} tahun - Tahun
 * @returns {Object} Total pengeluaran per kategori
 */
function hitungTotalPengeluaranBulan(bulan, tahun) {
  try {
    const data = getPengeluaranByBulan(bulan, tahun);
    
    let total = 0;
    const perKategori = {};
    
    data.forEach(p => {
      const jumlah = p['Jumlah (Rp)'] || 0;
      total += jumlah;
      
      const kategori = p['Kategori'];
      perKategori[kategori] = (perKategori[kategori] || 0) + jumlah;
    });
    
    return {
      total: total,
      perKategori: perKategori,
      jumlahTransaksi: data.length
    };
  } catch (e) {
    Logger.log('Error hitungTotalPengeluaranBulan: ' + e.message);
    return { total: 0, perKategori: {}, jumlahTransaksi: 0 };
  }
}

// ============================================
// PEMASUKAN
// ============================================

/**
 * Menambahkan pemasukan baru
 * @param {string} kategori - Kategori pemasukan
 * @param {string} deskripsi - Deskripsi pemasukan
 * @param {number} jumlah - Jumlah pemasukan (Rp)
 * @param {string} kandangId - ID kandang (opsional)
 * @param {string} keterangan - Keterangan tambahan
 * @returns {string} ID pemasukan
 */
function tambahPemasukan(kategori, deskripsi, jumlah, kandangId, keterangan) {
  // Validasi input
  if (!kategori) {
    throw new Error('Kategori pemasukan harus diisi');
  }
  
  if (!deskripsi) {
    throw new Error('Deskripsi pemasukan harus diisi');
  }
  
  if (!jumlah || jumlah <= 0) {
    throw new Error('Jumlah pemasukan harus lebih dari 0');
  }
  
  // Generate ID
  const id = generateId('PM');
  
  // Dapatkan nama kandang jika ada
  let namaKandang = '-';
  if (kandangId) {
    namaKandang = getNamaKandang(kandangId);
  }
  
  // Data yang akan disimpan
  const rowData = [
    id,
    new Date(),
    kategori,
    deskripsi,
    parseInt(jumlah),
    kandangId || '-',
    namaKandang,
    keterangan
  ];
  
  // Simpan ke sheet
  addSheetData(CONFIG.SHEETS.PEMASUKAN, rowData);
  
  return id;
}

/**
 * Mendapatkan semua pemasukan
 * @returns {Array} Array of pemasukan
 */
function getAllPemasukan() {
  return getSheetData(CONFIG.SHEETS.PEMASUKAN);
}

/**
 * Mendapatkan pemasukan berdasarkan bulan
 * @param {number} bulan - Bulan (1-12)
 * @param {number} tahun - Tahun
 * @returns {Array} Array of pemasukan
 */
function getPemasukanByBulan(bulan, tahun) {
  const data = getAllPemasukan();
  return data.filter(p => {
    const tgl = new Date(p['Tanggal']);
    return (tgl.getMonth() + 1) === bulan && tgl.getFullYear() === tahun;
  });
}

/**
 * Menghitung total pemasukan per bulan
 * @param {number} bulan - Bulan (1-12)
 * @param {number} tahun - Tahun
 * @returns {Object} Total pemasukan per kategori
 */
function hitungTotalPemasukanBulan(bulan, tahun) {
  try {
    const data = getPemasukanByBulan(bulan, tahun);
    
    let total = 0;
    const perKategori = {};
    
    data.forEach(p => {
      const jumlah = p['Jumlah (Rp)'] || 0;
      total += jumlah;
      
      const kategori = p['Kategori'];
      perKategori[kategori] = (perKategori[kategori] || 0) + jumlah;
    });
    
    return {
      total: total,
      perKategori: perKategori,
      jumlahTransaksi: data.length
    };
  } catch (e) {
    Logger.log('Error hitungTotalPemasukanBulan: ' + e.message);
    return { total: 0, perKategori: {}, jumlahTransaksi: 0 };
  }
}

// ============================================
// LABA RUGI
// ============================================

/**
 * Menghitung laba/rugi per bulan
 * @param {number} bulan - Bulan (1-12)
 * @param {number} tahun - Tahun
 * @returns {Object} Data laba/rugi
 */
function hitungLabaRugi(bulan, tahun) {
  try {
    const pengeluaran = hitungTotalPengeluaranBulan(bulan, tahun);
    const pemasukan = hitungTotalPemasukanBulan(bulan, tahun);
    
    const labaRugi = pemasukan.total - pengeluaran.total;
    
    return {
      bulan: bulan,
      tahun: tahun,
      namaBulan: getNamaBulan(bulan) + ' ' + tahun,
      totalPemasukan: pemasukan.total,
      totalPengeluaran: pengeluaran.total,
      labaRugi: labaRugi,
      status: labaRugi >= 0 ? 'Laba' : 'Rugi',
      persentaseLabarugi: pemasukan.total > 0 
        ? Math.round((labaRugi / pemasukan.total) * 100 * 100) / 100 
        : 0,
      detailPemasukan: pemasukan.perKategori,
      detailPengeluaran: pengeluaran.perKategori
    };
  } catch (e) {
    Logger.log('Error hitungLabaRugi: ' + e.message);
    return {
      bulan: bulan,
      tahun: tahun,
      namaBulan: getNamaBulan(bulan) + ' ' + tahun,
      totalPemasukan: 0,
      totalPengeluaran: 0,
      labaRugi: 0,
      status: 'Laba',
      persentaseLabarugi: 0,
      detailPemasukan: {},
      detailPengeluaran: {}
    };
  }
}

/**
 * Menghitung laba/rugi tahun berjalan
 * @param {number} tahun - Tahun
 * @returns {Object} Data laba/rugi tahunan
 */
function hitungLabaRugiTahunan(tahun) {
  const bulanan = [];
  let totalPemasukan = 0;
  let totalPengeluaran = 0;
  
  for (let bulan = 1; bulan <= 12; bulan++) {
    const data = hitungLabaRugi(bulan, tahun);
    bulanan.push(data);
    totalPemasukan += data.totalPemasukan;
    totalPengeluaran += data.totalPengeluaran;
  }
  
  return {
    tahun: tahun,
    bulanan: bulanan,
    totalPemasukan: totalPemasukan,
    totalPengeluaran: totalPengeluaran,
    labaRugi: totalPemasukan - totalPengeluaran,
    status: (totalPemasukan - totalPengeluaran) >= 0 ? 'Laba' : 'Rugi'
  };
}

// ============================================
// FORM INPUT
// ============================================

/**
 * Form untuk pencatatan pengeluaran
 */
function tampilkanFormPengeluaran() {
  const kandangList = getKandangDropdown();
  
  let kandangOptions = '<option value="">-- Tidak Terikat Kandang --</option>';
  kandangList.forEach(k => {
    kandangOptions += `<option value="${k[0]}">${k[1]}</option>`;
  });
  
  const html = HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html>
    <head>
      <base target="_top">
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .form-container {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          max-width: 450px;
          margin: 0 auto;
        }
        h2 {
          color: #dc3545;
          margin-top: 0;
          text-align: center;
        }
        .form-group {
          margin-bottom: 15px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
          color: #555;
        }
        input, select, textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-sizing: border-box;
          font-size: 14px;
        }
        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #dc3545;
        }
        .btn {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          margin-top: 10px;
        }
        .btn-primary {
          background-color: #dc3545;
          color: white;
        }
        .btn-primary:hover {
          background-color: #c82333;
        }
        .btn-cancel {
          background-color: #f5f5f5;
          color: #333;
          margin-top: 5px;
        }
        .btn-cancel:hover {
          background-color: #e5e5e5;
        }
        .message {
          padding: 10px;
          margin-top: 10px;
          border-radius: 4px;
          display: none;
        }
        .message.success {
          background-color: #d4edda;
          color: #155724;
          display: block;
        }
        .message.error {
          background-color: #f8d7da;
          color: #721c24;
          display: block;
        }
      </style>
    </head>
    <body>
      <div class="form-container">
        <h2>Catat Pengeluaran</h2>
        <form id="pengeluaranForm">
          <div class="form-group">
            <label for="kategori">Kategori *</label>
            <select id="kategori" name="kategori" required>
              <option value="">-- Pilih Kategori --</option>
              <option value="Pakan">Pakan</option>
              <option value="Obat/Vitamin">Obat/Vitamin</option>
              <option value="Tenaga Kerja">Tenaga Kerja</option>
              <option value="Listrik/Air">Listrik/Air</option>
              <option value="Perawatan Kandang">Perawatan Kandang</option>
              <option value="Transportasi">Transportasi</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="deskripsi">Deskripsi *</label>
            <input type="text" id="deskripsi" name="deskripsi" placeholder="Contoh: Beli pakan layer 1 ton" required>
          </div>
          
          <div class="form-group">
            <label for="jumlah">Jumlah (Rp) *</label>
            <input type="number" id="jumlah" name="jumlah" min="1" required>
          </div>
          
          <div class="form-group">
            <label for="kandang">Kandang (Opsional)</label>
            <select id="kandang" name="kandang">
              ${kandangOptions}
            </select>
          </div>
          
          <div class="form-group">
            <label for="keterangan">Keterangan</label>
            <textarea id="keterangan" name="keterangan" rows="2" placeholder="Catatan tambahan"></textarea>
          </div>
          
          <button type="submit" class="btn btn-primary">Simpan Pengeluaran</button>
          <button type="button" class="btn btn-cancel" onclick="google.script.host.close()">Batal</button>
          
          <div id="message" class="message"></div>
        </form>
      </div>
      
      <script>
        document.getElementById('pengeluaranForm').addEventListener('submit', function(e) {
          e.preventDefault();
          
          const kategori = document.getElementById('kategori').value;
          const deskripsi = document.getElementById('deskripsi').value;
          const jumlah = document.getElementById('jumlah').value;
          const kandangId = document.getElementById('kandang').value;
          const keterangan = document.getElementById('keterangan').value;
          
          const messageDiv = document.getElementById('message');
          
          google.script.run
            .withSuccessHandler(function(id) {
              messageDiv.className = 'message success';
              messageDiv.textContent = 'Pengeluaran berhasil dicatat! ID: ' + id;
              setTimeout(function() {
                google.script.host.close();
              }, 1500);
            })
            .withFailureHandler(function(error) {
              messageDiv.className = 'message error';
              messageDiv.textContent = 'Error: ' + error.message;
            })
            .tambahPengeluaran(kategori, deskripsi, jumlah, kandangId, keterangan);
        });
      </script>
    </body>
    </html>
  `)
  .setWidth(500)
  .setHeight(550);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Catat Pengeluaran');
}

/**
 * Form untuk pencatatan pemasukan
 */
function tampilkanFormPemasukan() {
  const kandangList = getKandangDropdown();
  
  let kandangOptions = '<option value="">-- Tidak Terikat Kandang --</option>';
  kandangList.forEach(k => {
    kandangOptions += `<option value="${k[0]}">${k[1]}</option>`;
  });
  
  const html = HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html>
    <head>
      <base target="_top">
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .form-container {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          max-width: 450px;
          margin: 0 auto;
        }
        h2 {
          color: #28a745;
          margin-top: 0;
          text-align: center;
        }
        .form-group {
          margin-bottom: 15px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
          color: #555;
        }
        input, select, textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-sizing: border-box;
          font-size: 14px;
        }
        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #28a745;
        }
        .btn {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          margin-top: 10px;
        }
        .btn-primary {
          background-color: #28a745;
          color: white;
        }
        .btn-primary:hover {
          background-color: #218838;
        }
        .btn-cancel {
          background-color: #f5f5f5;
          color: #333;
          margin-top: 5px;
        }
        .btn-cancel:hover {
          background-color: #e5e5e5;
        }
        .message {
          padding: 10px;
          margin-top: 10px;
          border-radius: 4px;
          display: none;
        }
        .message.success {
          background-color: #d4edda;
          color: #155724;
          display: block;
        }
        .message.error {
          background-color: #f8d7da;
          color: #721c24;
          display: block;
        }
      </style>
    </head>
    <body>
      <div class="form-container">
        <h2>Catat Pemasukan</h2>
        <form id="pemasukanForm">
          <div class="form-group">
            <label for="kategori">Kategori *</label>
            <select id="kategori" name="kategori" required>
              <option value="">-- Pilih Kategori --</option>
              <option value="Penjualan Telur">Penjualan Telur</option>
              <option value="Penjualan Ayam Afkir">Penjualan Ayam Afkir</option>
              <option value="Penjualan Ayam Potong">Penjualan Ayam Potong</option>
              <option value="Subsidi">Subsidi</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="deskripsi">Deskripsi *</label>
            <input type="text" id="deskripsi" name="deskripsi" placeholder="Contoh: Penjualan telur 500 kg" required>
          </div>
          
          <div class="form-group">
            <label for="jumlah">Jumlah (Rp) *</label>
            <input type="number" id="jumlah" name="jumlah" min="1" required>
          </div>
          
          <div class="form-group">
            <label for="kandang">Kandang (Opsional)</label>
            <select id="kandang" name="kandang">
              ${kandangOptions}
            </select>
          </div>
          
          <div class="form-group">
            <label for="keterangan">Keterangan</label>
            <textarea id="keterangan" name="keterangan" rows="2" placeholder="Catatan tambahan"></textarea>
          </div>
          
          <button type="submit" class="btn btn-primary">Simpan Pemasukan</button>
          <button type="button" class="btn btn-cancel" onclick="google.script.host.close()">Batal</button>
          
          <div id="message" class="message"></div>
        </form>
      </div>
      
      <script>
        document.getElementById('pemasukanForm').addEventListener('submit', function(e) {
          e.preventDefault();
          
          const kategori = document.getElementById('kategori').value;
          const deskripsi = document.getElementById('deskripsi').value;
          const jumlah = document.getElementById('jumlah').value;
          const kandangId = document.getElementById('kandang').value;
          const keterangan = document.getElementById('keterangan').value;
          
          const messageDiv = document.getElementById('message');
          
          google.script.run
            .withSuccessHandler(function(id) {
              messageDiv.className = 'message success';
              messageDiv.textContent = 'Pemasukan berhasil dicatat! ID: ' + id;
              setTimeout(function() {
                google.script.host.close();
              }, 1500);
            })
            .withFailureHandler(function(error) {
              messageDiv.className = 'message error';
              messageDiv.textContent = 'Error: ' + error.message;
            })
            .tambahPemasukan(kategori, deskripsi, jumlah, kandangId, keterangan);
        });
      </script>
    </body>
    </html>
  `)
  .setWidth(500)
  .setHeight(550);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Catat Pemasukan');
}

/**
 * Menampilkan laporan laba/rugi
 */
function tampilkanLaporanKeuangan() {
  const today = new Date();
  const bulan = today.getMonth() + 1;
  const tahun = today.getFullYear();
  
  const labaRugi = hitungLabaRugi(bulan, tahun);
  
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <base target="_top">
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h2 {
          color: #333;
          margin-top: 0;
          text-align: center;
        }
        .summary-boxes {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
        }
        .summary-box {
          flex: 1;
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        }
        .summary-box h3 {
          margin: 0;
          color: #666;
          font-size: 14px;
        }
        .summary-box .value {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin-top: 10px;
        }
        .summary-box.pemasukan {
          border-left: 4px solid #28a745;
        }
        .summary-box.pengeluaran {
          border-left: 4px solid #dc3545;
        }
        .summary-box.laba {
          border-left: 4px solid #28a745;
        }
        .summary-box.rugi {
          border-left: 4px solid #dc3545;
        }
        .detail-section {
          margin-top: 20px;
        }
        .detail-section h3 {
          color: #333;
          border-bottom: 2px solid #4285F4;
          padding-bottom: 10px;
        }
        .detail-item {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          border-bottom: 1px solid #eee;
        }
        .btn-close {
          width: 100%;
          padding: 12px;
          background-color: #f5f5f5;
          color: #333;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          margin-top: 20px;
        }
        .btn-close:hover {
          background-color: #e5e5e5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Laporan Keuangan - ${labaRugi.namaBulan}</h2>
        
        <div class="summary-boxes">
          <div class="summary-box pemasukan">
            <h3>Total Pemasukan</h3>
            <div class="value">Rp ${labaRugi.totalPemasukan.toLocaleString()}</div>
          </div>
          
          <div class="summary-box pengeluaran">
            <h3>Total Pengeluaran</h3>
            <div class="value">Rp ${labaRugi.totalPengeluaran.toLocaleString()}</div>
          </div>
          
          <div class="summary-box ${labaRugi.status === 'Laba' ? 'laba' : 'rugi'}">
            <h3>${labaRugi.status}</h3>
            <div class="value">Rp ${Math.abs(labaRugi.labaRugi).toLocaleString()}</div>
          </div>
        </div>
        
        <div class="detail-section">
          <h3>Detail Pemasukan</h3>
  `;
  
  if (Object.keys(labaRugi.detailPemasukan).length > 0) {
    Object.entries(labaRugi.detailPemasukan).forEach(([kategori, jumlah]) => {
      html += `
        <div class="detail-item">
          <span>${kategori}</span>
          <strong>Rp ${jumlah.toLocaleString()}</strong>
        </div>
      `;
    });
  } else {
    html += '<p style="text-align: center; color: #666;">Tidak ada data pemasukan</p>';
  }
  
  html += `
        </div>
        
        <div class="detail-section">
          <h3>Detail Pengeluaran</h3>
  `;
  
  if (Object.keys(labaRugi.detailPengeluaran).length > 0) {
    Object.entries(labaRugi.detailPengeluaran).forEach(([kategori, jumlah]) => {
      html += `
        <div class="detail-item">
          <span>${kategori}</span>
          <strong>Rp ${jumlah.toLocaleString()}</strong>
        </div>
      `;
    });
  } else {
    html += '<p style="text-align: center; color: #666;">Tidak ada data pengeluaran</p>';
  }
  
  html += `
        </div>
        
        <button class="btn-close" onclick="google.script.host.close()">Tutup</button>
      </div>
    </body>
    </html>
  `;
  
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(700)
    .setHeight(600);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Laporan Keuangan');
}
