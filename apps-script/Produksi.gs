/**
 * ============================================
 * MODUL PRODUKSI TELUR
 * ============================================
 * Fungsi untuk mengelola pencatatan produksi telur
 */

/**
 * Menambahkan catatan produksi telur
 * @param {string} kandangId - ID kandang
 * @param {number} jumlahButir - Jumlah telur (butir)
 * @param {number} jumlahKg - Jumlah telur (kg)
 * @param {number} hargaJual - Harga jual per kg
 * @param {string} keterangan - Keterangan
 * @returns {string} ID catatan
 */
function tambahProduksi(kandangId, jumlahButir, jumlahKg, hargaJual, keterangan) {
  // Validasi input
  if (!kandangId) {
    throw new Error('Kandang harus dipilih');
  }
  
  if ((!jumlahButir || jumlahButir <= 0) && (!jumlahKg || jumlahKg <= 0)) {
    throw new Error('Jumlah telur harus diisi (butir atau kg)');
  }
  
  if (!hargaJual || hargaJual <= 0) {
    throw new Error('Harga jual harus diisi');
  }
  
  // Cek apakah kandang ada
  const kandang = getKandangById(kandangId);
  if (!kandang) {
    throw new Error('Kandang tidak ditemukan');
  }
  
  // Hitung jumlah Kg jika belum diisi (estimasi: 1 butir = 0.055 kg)
  if (!jumlahKg || jumlahKg <= 0) {
    jumlahKg = Math.round(parseInt(jumlahButir) * 0.055 * 100) / 100;
  }
  
  // Hitung jumlah butir jika belum diisi
  if (!jumlahButir || jumlahButir <= 0) {
    jumlahButir = Math.round(parseInt(jumlahKg) / 0.055);
  }
  
  // Hitung total nilai
  const totalNilai = Math.round(parseInt(jumlahKg) * parseInt(hargaJual));
  
  // Generate ID
  const id = generateId('PRD');
  
  // Data yang akan disimpan
  const rowData = [
    id,
    new Date(),
    kandangId,
    kandang['Nama Kandang'],
    parseInt(jumlahButir),
    parseFloat(jumlahKg),
    parseInt(hargaJual),
    totalNilai,
    keterangan
  ];
  
  // Simpan ke sheet
  addSheetData(CONFIG.SHEETS.PRODUKSI, rowData);
  
  return id;
}

/**
 * Mendapatkan semua catatan produksi
 * @returns {Array} Array of catatan produksi
 */
function getAllProduksi() {
  return getSheetData(CONFIG.SHEETS.PRODUKSI);
}

/**
 * Mendapatkan catatan produksi berdasarkan kandang
 * @param {string} kandangId - ID kandang
 * @returns {Array} Array of catatan produksi
 */
function getProduksiByKandang(kandangId) {
  const data = getAllProduksi();
  return data.filter(p => p['ID Kandang'] === kandangId);
}

/**
 * Mendapatkan catatan produksi berdasarkan bulan
 * @param {number} bulan - Bulan (1-12)
 * @param {number} tahun - Tahun
 * @returns {Array} Array of catatan produksi
 */
function getProduksiByBulan(bulan, tahun) {
  const data = getAllProduksi();
  return data.filter(p => {
    const tgl = new Date(p['Tanggal']);
    return (tgl.getMonth() + 1) === bulan && tgl.getFullYear() === tahun;
  });
}

/**
 * Menghitung total produksi per kandang
 * @param {string} kandangId - ID kandang
 * @returns {Object} Total produksi
 */
function hitungTotalProduksiKandang(kandangId) {
  const data = getProduksiByKandang(kandangId);
  
  let totalButir = 0;
  let totalKg = 0;
  let totalNilai = 0;
  
  data.forEach(p => {
    totalButir += p['Jumlah Butir'] || 0;
    totalKg += p['Jumlah (kg)'] || 0;
    totalNilai += p['Total Nilai'] || 0;
  });
  
  return {
    totalButir: totalButir,
    totalKg: totalKg,
    totalNilai: totalNilai,
    rataRataPerHari: data.length > 0 ? Math.round(totalButir / 30) : 0
  };
}

/**
 * Menghitung total produksi per bulan
 * @param {number} bulan - Bulan (1-12)
 * @param {number} tahun - Tahun
 * @returns {Object} Total produksi
 */
function hitungTotalProduksiBulan(bulan, tahun) {
  try {
    const data = getProduksiByBulan(bulan, tahun);
    
    let totalButir = 0;
    let totalKg = 0;
    let totalNilai = 0;
    
    data.forEach(p => {
      totalButir += p['Jumlah Butir'] || 0;
      totalKg += p['Jumlah (kg)'] || 0;
      totalNilai += p['Total Nilai'] || 0;
    });
    
    return {
      totalButir: totalButir,
      totalKg: totalKg,
      totalNilai: totalNilai,
      jumlahTransaksi: data.length,
      rataRataPerHari: data.length > 0 ? Math.round(totalButir / 30) : 0
    };
  } catch (e) {
    Logger.log('Error hitungTotalProduksiBulan: ' + e.message);
    return { totalButir: 0, totalKg: 0, totalNilai: 0, jumlahTransaksi: 0, rataRataPerHari: 0 };
  }
}

/**
 * Menghitung produktivitas telur
 * @param {string} kandangId - ID kandang
 * @returns {Object} Produktivitas
 */
function hitungProduktivitas(kandangId) {
  const stokAyam = hitungStokAyam(kandangId);
  const produksi = hitungTotalProduksiKandang(kandangId);
  
  if (stokAyam <= 0) {
    return {
      persentase: 0,
      butirPerAyam: 0
    };
  }
  
  // Produktivitas = rata-rata telur per ayam per hari
  const butirPerAyam = Math.round((produksi.rataRataPerHari / stokAyam) * 100) / 100;
  const persentase = Math.round((butirPerAyam / 1) * 100); // Asumsi target 1 butir/ayam/hari
  
  return {
    persentase: persentase,
    butirPerAyam: butirPerAyam,
    targetButir: stokAyam,
    aktualButir: produksi.rataRataPerHari
  };
}

/**
 * Form untuk pencatatan produksi telur
 */
function tampilkanFormProduksi() {
  const kandangList = getKandangDropdown();
  
  if (kandangList.length === 0) {
    showErrorMessage('Belum ada kandang. Silakan tambah kandang terlebih dahulu.');
    return;
  }
  
  let kandangOptions = '<option value="">-- Pilih Kandang --</option>';
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
          color: #333;
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
          border-color: #4285F4;
        }
        .row {
          display: flex;
          gap: 15px;
        }
        .row .form-group {
          flex: 1;
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
        .info-box {
          background-color: #d4edda;
          padding: 10px;
          border-radius: 4px;
          margin-top: 10px;
          font-size: 12px;
          color: #155724;
        }
      </style>
    </head>
    <body>
      <div class="form-container">
        <h2>Pencatatan Produksi Telur</h2>
        <form id="produksiForm">
          <div class="form-group">
            <label for="kandang">Kandang *</label>
            <select id="kandang" name="kandang" required>
              ${kandangOptions}
            </select>
          </div>
          
          <div class="row">
            <div class="form-group">
              <label for="butir">Jumlah (butir)</label>
              <input type="number" id="butir" name="butir" min="0" placeholder="Auto dari kg">
            </div>
            
            <div class="form-group">
              <label for="kg">Jumlah (kg) *</label>
              <input type="number" id="kg" name="kg" min="0" step="0.01" required>
            </div>
          </div>
          
          <div class="form-group">
            <label for="harga">Harga Jual/kg (Rp) *</label>
            <input type="number" id="harga" name="harga" min="0" required>
          </div>
          
          <div class="form-group">
            <label for="keterangan">Keterangan</label>
            <textarea id="keterangan" name="keterangan" rows="2" placeholder="Catatan tambahan (opsional)"></textarea>
          </div>
          
          <div class="info-box">
            * Isi salah satu (butir atau kg), yang lain akan otomatis dihitung
          </div>
          
          <button type="submit" class="btn btn-primary">Simpan Produksi</button>
          <button type="button" class="btn btn-cancel" onclick="google.script.host.close()">Batal</button>
          
          <div id="message" class="message"></div>
        </form>
      </div>
      
      <script>
        document.getElementById('produksiForm').addEventListener('submit', function(e) {
          e.preventDefault();
          
          const kandangId = document.getElementById('kandang').value;
          const butir = document.getElementById('butir').value;
          const kg = document.getElementById('kg').value;
          const harga = document.getElementById('harga').value;
          const keterangan = document.getElementById('keterangan').value;
          
          const messageDiv = document.getElementById('message');
          
          if (!kandangId) {
            messageDiv.className = 'message error';
            messageDiv.textContent = 'Pilih kandang terlebih dahulu';
            return;
          }
          
          if (!butir && !kg) {
            messageDiv.className = 'message error';
            messageDiv.textContent = 'Isi jumlah butir atau kg';
            return;
          }
          
          google.script.run
            .withSuccessHandler(function(id) {
              messageDiv.className = 'message success';
              messageDiv.textContent = 'Catatan produksi berhasil disimpan! ID: ' + id;
              setTimeout(function() {
                google.script.host.close();
              }, 1500);
            })
            .withFailureHandler(function(error) {
              messageDiv.className = 'message error';
              messageDiv.textContent = 'Error: ' + error.message;
            })
            .tambahProduksi(kandangId, butir, kg, harga, keterangan);
        });
      </script>
    </body>
    </html>
  `)
  .setWidth(500)
  .setHeight(550);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Pencatatan Produksi Telur');
}

/**
 * Menampilkan laporan produksi
 */
function tampilkanLaporanProduksi() {
  const today = new Date();
  const bulan = today.getMonth() + 1;
  const tahun = today.getFullYear();
  
  const totalProduksi = hitungTotalProduksiBulan(bulan, tahun);
  const namaBulan = getNamaBulan(bulan) + ' ' + tahun;
  
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
        .summary-box.butir {
          border-left: 4px solid #28a745;
        }
        .summary-box.kg {
          border-left: 4px solid #17a2b8;
        }
        .summary-box.nilai {
          border-left: 4px solid #ffc107;
        }
        .summary-box.rata-rata {
          border-left: 4px solid #6f42c1;
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
        <h2>Laporan Produksi Telur - ${namaBulan}</h2>
        
        <div class="summary-boxes">
          <div class="summary-box butir">
            <h3>Total Butir</h3>
            <div class="value">${totalProduksi.totalButir.toLocaleString()}</div>
          </div>
          
          <div class="summary-box kg">
            <h3>Total Kg</h3>
            <div class="value">${totalProduksi.totalKg.toLocaleString()} kg</div>
          </div>
          
          <div class="summary-box nilai">
            <h3>Total Nilai</h3>
            <div class="value">Rp ${totalProduksi.totalNilai.toLocaleString()}</div>
          </div>
          
          <div class="summary-box rata-rata">
            <h3>Rata-rata/Hari</h3>
            <div class="value">${totalProduksi.rataRataPerHari.toLocaleString()} butir</div>
          </div>
        </div>
        
        <button class="btn-close" onclick="google.script.host.close()">Tutup</button>
      </div>
    </body>
    </html>
  `;
  
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(700)
    .setHeight(350);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Laporan Produksi');
}
