/**
 * ============================================
 * MODUL KEMATIAN AYAM
 * ============================================
 * Fungsi untuk mengelola pencatatan kematian ayam
 */

/**
 * Menambahkan catatan kematian ayam
 * @param {string} kandangId - ID kandang
 * @param {number} jumlah - Jumlah ayam mati
 * @param {string} penyebab - Penyebab kematian
 * @param {string} keterangan - Keterangan tambahan
 * @returns {string} ID catatan
 */
function tambahKematian(kandangId, jumlah, penyebab, keterangan) {
  // Validasi input
  if (!kandangId) {
    throw new Error('Kandang harus dipilih');
  }
  
  if (!jumlah || jumlah <= 0) {
    throw new Error('Jumlah kematian harus lebih dari 0');
  }
  
  if (!penyebab) {
    throw new Error('Penyebab kematian harus diisi');
  }
  
  // Cek apakah kandang ada
  const kandang = getKandangById(kandangId);
  if (!kandang) {
    throw new Error('Kandang tidak ditemukan');
  }
  
  // Cek stok ayam
  const stokSaatIni = hitungStokAyam(kandangId);
  if (stokSaatIni < jumlah) {
    throw new Error('Stok ayam tidak mencukupi. Stok saat ini: ' + stokSaatIni + ' ekor');
  }
  
  // Generate ID
  const id = generateId('KMT');
  
  // Data yang akan disimpan
  const rowData = [
    id,
    new Date(),
    kandangId,
    kandang['Nama Kandang'],
    parseInt(jumlah),
    penyebab,
    keterangan
  ];
  
  // Simpan ke sheet
  addSheetData(CONFIG.SHEETS.KEMATIAN, rowData);
  
  // Otomatis kurangi stok ayam
  tambahInventaris(kandangId, 0, jumlah, 'Kematian - ' + penyebab);
  
  return id;
}

/**
 * Mendapatkan semua catatan kematian
 * @returns {Array} Array of catatan kematian
 */
function getAllKematian() {
  return getSheetData(CONFIG.SHEETS.KEMATIAN);
}

/**
 * Mendapatkan catatan kematian berdasarkan kandang
 * @param {string} kandangId - ID kandang
 * @returns {Array} Array of catatan kematian
 */
function getKematianByKandang(kandangId) {
  const data = getAllKematian();
  return data.filter(k => k['ID Kandang'] === kandangId);
}

/**
 * Mendapatkan catatan kematian berdasarkan bulan
 * @param {number} bulan - Bulan (1-12)
 * @param {number} tahun - Tahun
 * @returns {Array} Array of catatan kematian
 */
function getKematianByBulan(bulan, tahun) {
  const data = getAllKematian();
  return data.filter(k => {
    const tgl = new Date(k['Tanggal']);
    return (tgl.getMonth() + 1) === bulan && tgl.getFullYear() === tahun;
  });
}

/**
 * Menghitung total kematian per kandang
 * @param {string} kandangId - ID kandang
 * @returns {Object} Total kematian
 */
function hitungTotalKematianKandang(kandangId) {
  const data = getKematianByKandang(kandangId);
  
  let totalKematian = 0;
  const penyebabCount = {};
  
  data.forEach(k => {
    totalKematian += k['Jumlah'] || 0;
    const penyebab = k['Penyebab'];
    penyebabCount[penyebab] = (penyebabCount[penyebab] || 0) + (k['Jumlah'] || 0);
  });
  
  return {
    total: totalKematian,
    penyebab: penyebabCount
  };
}

/**
 * Menghitung total kematian per bulan
 * @param {number} bulan - Bulan (1-12)
 * @param {number} tahun - Tahun
 * @returns {Object} Total kematian
 */
function hitungTotalKematianBulan(bulan, tahun) {
  try {
    const data = getKematianByBulan(bulan, tahun);
    
    let totalKematian = 0;
    const penyebabCount = {};
    
    data.forEach(k => {
      totalKematian += k['Jumlah'] || 0;
      const penyebab = k['Penyebab'];
      penyebabCount[penyebab] = (penyebabCount[penyebab] || 0) + (k['Jumlah'] || 0);
    });
    
    return {
      total: totalKematian,
      penyebab: penyebabCount,
      jumlahTransaksi: data.length
    };
  } catch (e) {
    Logger.log('Error hitungTotalKematianBulan: ' + e.message);
    return { total: 0, penyebab: {}, jumlahTransaksi: 0 };
  }
}

/**
 * Menghitung mortalitas (angka kematian)
 * @param {string} kandangId - ID kandang
 * @returns {Object} Data mortalitas
 */
function hitungMortalitas(kandangId) {
  const kandang = getKandangById(kandangId);
  if (!kandang) {
    throw new Error('Kandang tidak ditemukan');
  }
  
  const kematian = hitungTotalKematianKandang(kandangId);
  const kapasitas = kandang['Kapasitas'];
  
  // Hitung mortalitas per bulan (estimasi)
  const mortalitasPerBulan = Math.round((kematian.total / kapasitas) * 100 * 100) / 100;
  
  return {
    totalKematian: kematian.total,
    kapasitas: kapasitas,
    mortalitasPersen: mortalitasPerBulan,
    penyebab: kematian.penyebab,
    status: mortalitasPerBulan > 5 ? 'Tinggi' : mortalitasPerBulan > 2 ? 'Sedang' : 'Rendah'
  };
}

/**
 * Menghitung mortalitas keseluruhan
 * @returns {Object} Data mortalitas keseluruhan
 */
function hitungMortalitasKeseluruhan() {
  try {
    const kandangList = getAllKandang().filter(k => k['Status'] === 'Aktif');
    const semuaKematian = getAllKematian();
    let totalKematian = 0;
    let totalKapasitas = 0;
    
    kandangList.forEach(kandang => {
      try {
        const dataKandang = semuaKematian.filter(k => k['ID Kandang'] === kandang['ID']);
        let kematianTotal = 0;
        dataKandang.forEach(k => {
          kematianTotal += k['Jumlah'] || 0;
        });
        totalKematian += kematianTotal;
        totalKapasitas += kandang['Kapasitas'];
      } catch (e) {
        Logger.log('Error hitungTotalKematianKandang ' + kandang['ID'] + ': ' + e.message);
      }
    });
    
    const mortalitas = totalKapasitas > 0 
      ? Math.round((totalKematian / totalKapasitas) * 100 * 100) / 100 
      : 0;
    
    return {
      totalKematian: totalKematian,
      totalKapasitas: totalKapasitas,
      mortalitasPersen: mortalitas,
      status: mortalitas > 5 ? 'Tinggi' : mortalitas > 2 ? 'Sedang' : 'Rendah'
    };
  } catch (e) {
    Logger.log('Error hitungMortalitasKeseluruhan: ' + e.message);
    return { totalKematian: 0, totalKapasitas: 0, mortalitasPersen: 0, status: 'Rendah' };
  }
}

/**
 * Form untuk pencatatan kematian ayam
 */
function tampilkanFormKematian() {
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
        .stok-info {
          background-color: #fff3cd;
          padding: 10px;
          border-radius: 4px;
          margin-top: 10px;
          display: none;
        }
        .stok-info strong {
          color: #856404;
        }
      </style>
    </head>
    <body>
      <div class="form-container">
        <h2>Pencatatan Kematian Ayam</h2>
        <form id="kematianForm">
          <div class="form-group">
            <label for="kandang">Kandang *</label>
            <select id="kandang" name="kandang" required>
              ${kandangOptions}
            </select>
            <div id="stokInfo" class="stok-info">
              Stok saat ini: <strong id="stokSaatIni">0</strong> ekor
            </div>
          </div>
          
          <div class="form-group">
            <label for="jumlah">Jumlah Ayam Mati *</label>
            <input type="number" id="jumlah" name="jumlah" min="1" required>
          </div>
          
          <div class="form-group">
            <label for="penyebab">Penyebab *</label>
            <select id="penyebab" name="penyebab" required>
              <option value="">-- Pilih Penyebab --</option>
              <option value="Penyakit">Penyakit</option>
              <option value="Cuaca Ekstrem">Cuaca Ekstrem</option>
              <option value="Kecelakaan">Kecelakaan</option>
              <option value="Kekurangan Pakan">Kekurangan Pakan</option>
              <option value="Predator">Predator</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="keterangan">Keterangan</label>
            <textarea id="keterangan" name="keterangan" rows="2" placeholder="Detail tambahan tentang kematian"></textarea>
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
        
        document.getElementById('kematianForm').addEventListener('submit', function(e) {
          e.preventDefault();
          
          const kandangId = document.getElementById('kandang').value;
          const jumlah = document.getElementById('jumlah').value;
          const penyebab = document.getElementById('penyebab').value;
          const keterangan = document.getElementById('keterangan').value;
          
          const messageDiv = document.getElementById('message');
          
          if (!kandangId) {
            messageDiv.className = 'message error';
            messageDiv.textContent = 'Pilih kandang terlebih dahulu';
            return;
          }
          
          if (!penyebab) {
            messageDiv.className = 'message error';
            messageDiv.textContent = 'Pilih penyebab kematian';
            return;
          }
          
          google.script.run
            .withSuccessHandler(function(id) {
              messageDiv.className = 'message success';
              messageDiv.textContent = 'Catatan kematian berhasil disimpan! ID: ' + id;
              setTimeout(function() {
                google.script.host.close();
              }, 1500);
            })
            .withFailureHandler(function(error) {
              messageDiv.className = 'message error';
              messageDiv.textContent = 'Error: ' + error.message;
            })
            .tambahKematian(kandangId, jumlah, penyebab, keterangan);
        });
      </script>
    </body>
    </html>
  `)
  .setWidth(500)
  .setHeight(550);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Pencatatan Kematian Ayam');
}

/**
 * Menampilkan laporan kematian
 */
function tampilkanLaporanKematian() {
  const today = new Date();
  const bulan = today.getMonth() + 1;
  const tahun = today.getFullYear();
  
  const totalKematian = hitungTotalKematianBulan(bulan, tahun);
  const mortalitas = hitungMortalitasKeseluruhan();
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
          color: #dc3545;
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
        .summary-box.mati {
          border-left: 4px solid #dc3545;
        }
        .summary-box.mortalitas {
          border-left: 4px solid #ffc107;
        }
        .summary-box.status {
          border-left: 4px solid #28a745;
        }
        .status-rendah { color: #28a745; }
        .status-sedang { color: #ffc107; }
        .status-tinggi { color: #dc3545; }
        .penyebab-list {
          margin-top: 20px;
        }
        .penyebab-item {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          border-bottom: 1px solid #ddd;
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
        <h2>Laporan Kematian Ayam - ${namaBulan}</h2>
        
        <div class="summary-boxes">
          <div class="summary-box mati">
            <h3>Total Kematian</h3>
            <div class="value">${totalKematian.total} ekor</div>
          </div>
          
          <div class="summary-box mortalitas">
            <h3>Mortalitas</h3>
            <div class="value">${mortalitas.mortalitasPersen}%</div>
          </div>
          
          <div class="summary-box status">
            <h3>Status</h3>
            <div class="value status-${mortalitas.status.toLowerCase()}">${mortalitas.status}</div>
          </div>
        </div>
        
        <div class="penyebab-list">
          <h3>Penyebab Kematian:</h3>
  `;
  
  if (Object.keys(totalKematian.penyebab).length > 0) {
    Object.entries(totalKematian.penyebab).forEach(([penyebab, jumlah]) => {
      html += `
        <div class="penyebab-item">
          <span>${penyebab}</span>
          <strong>${jumlah} ekor</strong>
        </div>
      `;
    });
  } else {
    html += '<p style="text-align: center; color: #666;">Tidak ada data kematian</p>';
  }
  
  html += `
        </div>
        
        <button class="btn-close" onclick="google.script.host.close()">Tutup</button>
      </div>
    </body>
    </html>
  `;
  
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(600)
    .setHeight(500);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Laporan Kematian');
}
