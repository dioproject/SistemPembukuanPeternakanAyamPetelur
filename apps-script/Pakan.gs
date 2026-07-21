/**
 * ============================================
 * MODUL PAKAN
 * ============================================
 * Fungsi untuk mengelola pencatatan pakan
 */

/**
 * Menambahkan catatan pakan
 * @param {string} kandangId - ID kandang
 * @param {string} jenisPakan - Jenis pakan
 * @param {number} jumlah - Jumlah pakan (kg)
 * @param {number} biaya - Biaya pakan (Rp)
 * @param {string} keterangan - Keterangan
 * @returns {string} ID catatan
 */
function tambahPakan(kandangId, jenisPakan, jumlah, biaya, keterangan) {
  // Validasi input
  if (!kandangId) {
    throw new Error('Kandang harus dipilih');
  }
  
  if (!jenisPakan) {
    throw new Error('Jenis pakan harus diisi');
  }
  
  if (!jumlah || jumlah <= 0) {
    throw new Error('Jumlah pakan harus lebih dari 0');
  }
  
  if (!biaya || biaya < 0) {
    throw new Error('Biaya pakan tidak boleh negatif');
  }
  
  // Cek apakah kandang ada
  const kandang = getKandangById(kandangId);
  if (!kandang) {
    throw new Error('Kandang tidak ditemukan');
  }
  
  // Generate ID
  const id = generateId('PK');
  
  // Data yang akan disimpan
  const rowData = [
    id,
    new Date(),
    kandangId,
    kandang['Nama Kandang'],
    jenisPakan,
    parseInt(jumlah),
    parseInt(biaya),
    keterangan
  ];
  
  // Simpan ke sheet
  addSheetData(CONFIG.SHEETS.PAKAN, rowData);
  
  // Otomatis catat pengeluaran
  catatPengeluaranOtomatis(
    'Pakan',
    'Pakan ' + jenisPakan + ' - ' + kandang['Nama Kandang'],
    biaya,
    kandangId,
    kandang['Nama Kandang'],
    keterangan
  );
  
  return id;
}

/**
 * Mendapatkan semua catatan pakan
 * @returns {Array} Array of catatan pakan
 */
function getAllPakan() {
  return getSheetData(CONFIG.SHEETS.PAKAN);
}

/**
 * Mendapatkan catatan pakan berdasarkan kandang
 * @param {string} kandangId - ID kandang
 * @returns {Array} Array of catatan pakan
 */
function getPakanByKandang(kandangId) {
  const data = getAllPakan();
  return data.filter(p => p['ID Kandang'] === kandangId);
}

/**
 * Mendapatkan catatan pakan berdasarkan bulan
 * @param {number} bulan - Bulan (1-12)
 * @param {number} tahun - Tahun
 * @returns {Array} Array of catatan pakan
 */
function getPakanByBulan(bulan, tahun) {
  const data = getAllPakan();
  return data.filter(p => {
    const tgl = new Date(p['Tanggal']);
    return (tgl.getMonth() + 1) === bulan && tgl.getFullYear() === tahun;
  });
}

/**
 * Menghitung total pakan per kandang
 * @param {string} kandangId - ID kandang
 * @returns {Object} Total pakan dan biaya
 */
function hitungTotalPakanKandang(kandangId) {
  const data = getPakanByKandang(kandangId);
  
  let totalKg = 0;
  let totalBiaya = 0;
  
  data.forEach(p => {
    totalKg += p['Jumlah (kg)'] || 0;
    totalBiaya += p['Biaya (Rp)'] || 0;
  });
  
  return {
    totalKg: totalKg,
    totalBiaya: totalBiaya,
    rataRataPerHari: data.length > 0 ? Math.round(totalKg / 30) : 0
  };
}

/**
 * Menghitung total pakan per bulan
 * @param {number} bulan - Bulan (1-12)
 * @param {number} tahun - Tahun
 * @returns {Object} Total pakan dan biaya
 */
function hitungTotalPakanBulan(bulan, tahun) {
  try {
    const data = getPakanByBulan(bulan, tahun);
    
    let totalKg = 0;
    let totalBiaya = 0;
    
    data.forEach(p => {
      totalKg += p['Jumlah (kg)'] || 0;
      totalBiaya += p['Biaya (Rp)'] || 0;
    });
    
    return {
      totalKg: totalKg,
      totalBiaya: totalBiaya,
      jumlahTransaksi: data.length
    };
  } catch (e) {
    Logger.log('Error hitungTotalPakanBulan: ' + e.message);
    return { totalKg: 0, totalBiaya: 0, jumlahTransaksi: 0 };
  }
}

/**
 * Form untuk pencatatan pakan
 */
function tampilkanFormPakan() {
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
          background-color: #4285F4;
          color: white;
        }
        .btn-primary:hover {
          background-color: #3367D6;
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
          background-color: #fff3cd;
          padding: 10px;
          border-radius: 4px;
          margin-top: 10px;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="form-container">
        <h2>Pencatatan Pakan</h2>
        <form id="pakanForm">
          <div class="form-group">
            <label for="kandang">Kandang *</label>
            <select id="kandang" name="kandang" required>
              ${kandangOptions}
            </select>
          </div>
          
          <div class="form-group">
            <label for="jenis">Jenis Pakan *</label>
            <select id="jenis" name="jenis" required>
              <option value="">-- Pilih Jenis Pakan --</option>
              <option value=" Starter">Starter</option>
              <option value="Grower">Grower</option>
              <option value="Layer">Layer</option>
              <option value="Koncentrat">Koncentrat</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
          
          <div class="row">
            <div class="form-group">
              <label for="jumlah">Jumlah (kg) *</label>
              <input type="number" id="jumlah" name="jumlah" min="1" required>
            </div>
            
            <div class="form-group">
              <label for="biaya">Biaya (Rp) *</label>
              <input type="number" id="biaya" name="biaya" min="0" required>
            </div>
          </div>
          
          <div class="form-group">
            <label for="keterangan">Keterangan</label>
            <textarea id="keterangan" name="keterangan" rows="2" placeholder="Catatan tambahan (opsional)"></textarea>
          </div>
          
          <div class="info-box">
            * Biaya pakan akan otomatis dicatat di pengeluaran
          </div>
          
          <button type="submit" class="btn btn-primary">Simpan Catatan</button>
          <button type="button" class="btn btn-cancel" onclick="google.script.host.close()">Batal</button>
          
          <div id="message" class="message"></div>
        </form>
      </div>
      
      <script>
        document.getElementById('pakanForm').addEventListener('submit', function(e) {
          e.preventDefault();
          
          const kandangId = document.getElementById('kandang').value;
          const jenis = document.getElementById('jenis').value;
          const jumlah = document.getElementById('jumlah').value;
          const biaya = document.getElementById('biaya').value;
          const keterangan = document.getElementById('keterangan').value;
          
          const messageDiv = document.getElementById('message');
          
          if (!kandangId) {
            messageDiv.className = 'message error';
            messageDiv.textContent = 'Pilih kandang terlebih dahulu';
            return;
          }
          
          if (!jenis) {
            messageDiv.className = 'message error';
            messageDiv.textContent = 'Pilih jenis pakan';
            return;
          }
          
          google.script.run
            .withSuccessHandler(function(id) {
              messageDiv.className = 'message success';
              messageDiv.textContent = 'Catatan pakan berhasil disimpan! ID: ' + id;
              setTimeout(function() {
                google.script.host.close();
              }, 1500);
            })
            .withFailureHandler(function(error) {
              messageDiv.className = 'message error';
              messageDiv.textContent = 'Error: ' + error.message;
            })
            .tambahPakan(kandangId, jenis, jumlah, biaya, keterangan);
        });
      </script>
    </body>
    </html>
  `)
  .setWidth(500)
  .setHeight(550);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Pencatatan Pakan');
}

/**
 * Menampilkan laporan pakan
 */
function tampilkanLaporanPakan() {
  const today = new Date();
  const bulan = today.getMonth() + 1;
  const tahun = today.getFullYear();
  
  const totalPakan = hitungTotalPakanBulan(bulan, tahun);
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
        .summary-box.pakan {
          border-left: 4px solid #4285F4;
        }
        .summary-box.biaya {
          border-left: 4px solid #dc3545;
        }
        .summary-box.transaksi {
          border-left: 4px solid #28a745;
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
        <h2>Laporan Pakan - ${namaBulan}</h2>
        
        <div class="summary-boxes">
          <div class="summary-box pakan">
            <h3>Total Pakan</h3>
            <div class="value">${totalPakan.totalKg.toLocaleString()} kg</div>
          </div>
          
          <div class="summary-box biaya">
            <h3>Total Biaya</h3>
            <div class="value">Rp ${totalPakan.totalBiaya.toLocaleString()}</div>
          </div>
          
          <div class="summary-box transaksi">
            <h3>Jumlah Transaksi</h3>
            <div class="value">${totalPakan.jumlahTransaksi}</div>
          </div>
        </div>
        
        <button class="btn-close" onclick="google.script.host.close()">Tutup</button>
      </div>
    </body>
    </html>
  `;
  
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(600)
    .setHeight(350);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Laporan Pakan');
}
