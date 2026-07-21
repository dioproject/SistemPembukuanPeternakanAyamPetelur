/**
 * ============================================
 * MODUL INVENTARIS AYAM
 * ============================================
 * Fungsi untuk mengelola stok ayam di setiap kandang
 */

/**
 * Menambahkan catatan masuk/keluar ayam
 * @param {string} kandangId - ID kandang
 * @param {number} jumlahMasuk - Jumlah ayam masuk
 * @param {number} jumlahKeluar - Jumlah ayam keluar
 * @param {string} keterangan - Keterangan
 * @returns {string} ID catatan
 */
function tambahInventaris(kandangId, jumlahMasuk, jumlahKeluar, keterangan) {
  // Validasi input
  if (!kandangId) {
    throw new Error('Kandang harus dipilih');
  }
  
  if (jumlahMasuk < 0 || jumlahKeluar < 0) {
    throw new Error('Jumlah tidak boleh negatif');
  }
  
  // Cek apakah kandang ada
  const kandang = getKandangById(kandangId);
  if (!kandang) {
    throw new Error('Kandang tidak ditemukan');
  }
  
  // Hitung sisa ayam
  const stokSebelumnya = hitungStokAyam(kandangId);
  const sisa = stokSebelumnya + (parseInt(jumlahMasuk) || 0) - (parseInt(jumlahKeluar) || 0);
  
  if (sisa < 0) {
    throw new Error('Stok ayam tidak mencukupi untuk pengeluaran ini');
  }
  
  // Generate ID
  const id = generateId('INV');
  
  // Data yang akan disimpan
  const rowData = [
    id,
    new Date(),
    kandangId,
    kandang['Nama Kandang'],
    parseInt(jumlahMasuk) || 0,
    parseInt(jumlahKeluar) || 0,
    sisa,
    keterangan
  ];
  
  // Simpan ke sheet
  addSheetData(CONFIG.SHEETS.INVENTARIS, rowData);
  
  return id;
}

/**
 * Mendapatkan semua catatan inventaris
 * @returns {Array} Array of catatan inventaris
 */
function getAllInventaris() {
  return getSheetData(CONFIG.SHEETS.INVENTARIS);
}

/**
 * Mendapatkan catatan inventaris berdasarkan kandang
 * @param {string} kandangId - ID kandang
 * @returns {Array} Array of catatan inventaris
 */
function getInventarisByKandang(kandangId) {
  const data = getAllInventaris();
  return data.filter(i => i['ID Kandang'] === kandangId);
}

/**
 * Mendapatkan catatan inventaris berdasarkan tanggal
 * @param {string} tanggal - Tanggal (YYYY-MM-DD)
 * @returns {Array} Array of catatan inventaris
 */
function getInventarisByTanggal(tanggal) {
  const data = getAllInventaris();
  return data.filter(i => {
    const tgl = new Date(i['Tanggal']);
    const tglFormatted = Utilities.formatDate(tgl, 'Asia/Jakarta', 'yyyy-MM-dd');
    return tglFormatted === tanggal;
  });
}

/**
 * Menghitung stok ayam saat ini di kandang
 * @param {string} kandangId - ID kandang
 * @returns {number} Jumlah ayam saat ini
 */
function hitungStokAyam(kandangId) {
  const data = getInventarisByKandang(kandangId);
  
  if (data.length === 0) {
    return 0;
  }
  
  // Ambil data terakhir (stok terkini)
  const lastRecord = data[data.length - 1];
  return lastRecord['Sisa Ayam'] || 0;
}

/**
 * Mendapatkan ringkasan stok semua kandang
 * @returns {Object} Ringkasan stok
 */
function getRingkasanStok() {
  try {
    const kandangList = getAllKandang().filter(k => k['Status'] === 'Aktif');
    const ringkasan = [];
    
    let totalAyam = 0;
    
    kandangList.forEach(kandang => {
      try {
        const stok = hitungStokAyam(kandang['ID']);
        totalAyam += stok;
        ringkasan.push({
          id: kandang['ID'],
          nama: kandang['Nama Kandang'],
          kapasitas: kandang['Kapasitas'],
          stok: stok,
          persentase: kandang['Kapasitas'] > 0 ? Math.round((stok / kandang['Kapasitas']) * 100) : 0
        });
      } catch (e) {
        Logger.log('Error hitungStokAyam ' + kandang['ID'] + ': ' + e.message);
      }
    });
    
    return {
      totalAyam: totalAyam,
      detail: ringkasan
    };
  } catch (e) {
    Logger.log('Error getRingkasanStok: ' + e.message);
    return { totalAyam: 0, detail: [] };
  }
}

/**
 * Form untuk pencatatan masuk/keluar ayam
 */
function tampilkanFormInventaris() {
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
        .stok-info {
          background-color: #e7f3ff;
          padding: 10px;
          border-radius: 4px;
          margin-top: 10px;
          display: none;
        }
      </style>
    </head>
    <body>
      <div class="form-container">
        <h2>Pencatatan Ayam</h2>
        <form id="inventarisForm">
          <div class="form-group">
            <label for="kandang">Kandang *</label>
            <select id="kandang" name="kandang" required>
              ${kandangOptions}
            </select>
            <div id="stokInfo" class="stok-info">
              Stok saat ini: <strong id="stokSaatIni">0</strong> ekor
            </div>
          </div>
          
          <div class="row">
            <div class="form-group">
              <label for="masuk">Jumlah Masuk</label>
              <input type="number" id="masuk" name="masuk" value="0" min="0">
            </div>
            
            <div class="form-group">
              <label for="keluar">Jumlah Keluar</label>
              <input type="number" id="keluar" name="keluar" value="0" min="0">
            </div>
          </div>
          
          <div class="form-group">
            <label for="keterangan">Keterangan *</label>
            <textarea id="keterangan" name="keterangan" rows="3" placeholder="Contoh: Pembelian DOC, Penjualan ayam afkir, dll" required></textarea>
          </div>
          
          <button type="submit" class="btn btn-primary">Simpan Catatan</button>
          <button type="button" class="btn btn-cancel" onclick="google.script.host.close()">Batal</button>
          
          <div id="message" class="message"></div>
        </form>
      </div>
      
      <script>
        document.getElementById('kandang').addEventListener('change', function() {
          const kandangId = this.value;
          const stokInfo = document.getElementById('stokInfo');
          const stokSaatIni = document.getElementById('stokSaatIni');
          
          if (kandangId) {
            google.script.run
              .withSuccessHandler(function(stok) {
                stokSaatIni.textContent = stok.toLocaleString();
                stokInfo.style.display = 'block';
              })
              .hitungStokAyam(kandangId);
          } else {
            stokInfo.style.display = 'none';
          }
        });
        
        document.getElementById('inventarisForm').addEventListener('submit', function(e) {
          e.preventDefault();
          
          const kandangId = document.getElementById('kandang').value;
          const masuk = document.getElementById('masuk').value;
          const keluar = document.getElementById('keluar').value;
          const keterangan = document.getElementById('keterangan').value;
          
          const messageDiv = document.getElementById('message');
          
          if (!kandangId) {
            messageDiv.className = 'message error';
            messageDiv.textContent = 'Pilih kandang terlebih dahulu';
            return;
          }
          
          if (parseInt(masuk) === 0 && parseInt(keluar) === 0) {
            messageDiv.className = 'message error';
            messageDiv.textContent = 'Jumlah masuk atau keluar harus diisi';
            return;
          }
          
          google.script.run
            .withSuccessHandler(function(id) {
              messageDiv.className = 'message success';
              messageDiv.textContent = 'Catatan berhasil disimpan! ID: ' + id;
              setTimeout(function() {
                google.script.host.close();
              }, 1500);
            })
            .withFailureHandler(function(error) {
              messageDiv.className = 'message error';
              messageDiv.textContent = 'Error: ' + error.message;
            })
            .tambahInventaris(kandangId, masuk, keluar, keterangan);
        });
      </script>
    </body>
    </html>
  `)
  .setWidth(500)
  .setHeight(500);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Pencatatan Ayam');
}

/**
 * Menampilkan laporan stok ayam
 */
function tampilkanLaporanStok() {
  const ringkasan = getRingkasanStok();
  
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
        .summary-box {
          background-color: #e7f3ff;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin-bottom: 20px;
        }
        .summary-box h3 {
          margin: 0;
          color: #333;
        }
        .summary-box .total {
          font-size: 36px;
          font-weight: bold;
          color: #4285F4;
          margin: 10px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        th {
          background-color: #4285F4;
          color: white;
        }
        tr:hover {
          background-color: #f5f5f5;
        }
        .progress-bar {
          width: 100%;
          height: 20px;
          background-color: #e0e0e0;
          border-radius: 10px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background-color: #4285F4;
          transition: width 0.3s;
        }
        .progress-fill.warning {
          background-color: #FFC107;
        }
        .progress-fill.danger {
          background-color: #dc3545;
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
        <h2>Laporan Stok Ayam</h2>
        
        <div class="summary-box">
          <h3>Total Ayam Saat Ini</h3>
          <div class="total">${ringkasan.totalAyam.toLocaleString()} Ekor</div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Kandang</th>
              <th>Kapasitas</th>
              <th>Stok</th>
              <th>Ketersediaan</th>
            </tr>
          </thead>
          <tbody>
  `;
  
  ringkasan.detail.forEach(item => {
    let progressClass = '';
    if (item.persentase > 90) progressClass = 'danger';
    else if (item.persentase > 70) progressClass = 'warning';
    
    html += `
      <tr>
        <td>${item.nama}</td>
        <td>${item.kapasitas.toLocaleString()}</td>
        <td>${item.stok.toLocaleString()}</td>
        <td>
          <div class="progress-bar">
            <div class="progress-fill ${progressClass}" style="width: ${Math.min(item.persentase, 100)}%"></div>
          </div>
          <small>${item.persentase}%</small>
        </td>
      </tr>
    `;
  });
  
  html += `
          </tbody>
        </table>
        <button class="btn-close" onclick="google.script.host.close()">Tutup</button>
      </div>
    </body>
    </html>
  `;
  
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(700)
    .setHeight(500);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Laporan Stok Ayam');
}
