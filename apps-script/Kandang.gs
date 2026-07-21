/**
 * ============================================
 * MODUL KANDANG
 * ============================================
 * Fungsi untuk mengelola data kandang
 */

/**
 * Menambahkan kandang baru
 * @param {string} nama - Nama kandang
 * @param {number} kapasitas - Kapasitas ayam
 * @param {string} lokasi - Lokasi kandang
 * @returns {string} ID kandang baru
 */
function tambahKandang(nama, kapasitas, lokasi) {
  // Validasi input
  if (!nama || !kapasitas || !lokasi) {
    throw new Error('Semua field harus diisi');
  }
  
  // Generate ID
  const id = generateId('KDG');
  
  // Data yang akan disimpan
  const rowData = [
    id,
    nama,
    parseInt(kapasitas),
    lokasi,
    'Aktif',
    new Date()
  ];
  
  // Simpan ke sheet
  addSheetData(CONFIG.SHEETS.KANDANG, rowData);
  
  return id;
}

/**
 * Mendapatkan semua data kandang
 * @returns {Array} Array of kandang objects
 */
function getAllKandang() {
  return getSheetData(CONFIG.SHEETS.KANDANG);
}

/**
 * Mendapatkan kandang berdasarkan ID
 * @param {string} id - ID kandang
 * @returns {Object} Data kandang
 */
function getKandangById(id) {
  const data = getSheetData(CONFIG.SHEETS.KANDANG);
  return data.find(k => k['ID'] === id);
}

/**
 * Update data kandang
 * @param {string} id - ID kandang
 * @param {Object} newData - Data baru
 * @returns {boolean} Status keberhasilan
 */
function updateKandang(id, newData) {
  const kandang = getKandangById(id);
  if (!kandang) {
    throw new Error('Kandang tidak ditemukan');
  }
  
  const updatedData = [
    id,
    newData.nama || kandang['Nama Kandang'],
    newData.kapasitas || kandang['Kapasitas'],
    newData.lokasi || kandang['Lokasi'],
    newData.status || kandang['Status'],
    kandang['Tanggal Dibuat']
  ];
  
  return updateSheetData(CONFIG.SHEETS.KANDANG, id, updatedData);
}

/**
 * Hapus kandang (set status non-aktif)
 * @param {string} id - ID kandang
 * @returns {boolean} Status keberhasilan
 */
function hapusKandang(id) {
  return updateKandang(id, { status: 'Non-Aktif' });
}

/**
 * Mendapatkan daftar kandang aktif untuk dropdown
 * @returns {Array} Array [id, nama]
 */
function getKandangDropdown() {
  const data = getAllKandang();
  return data
    .filter(k => k['Status'] === 'Aktif')
    .map(k => [k['ID'], k['Nama Kandang']]);
}

/**
 * Mendapatkan kapasitas kandang
 * @param {string} id - ID kandang
 * @returns {number} Kapasitas kandang
 */
function getKapasitasKandang(id) {
  const kandang = getKandangById(id);
  return kandang ? kandang['Kapasitas'] : 0;
}

/**
 * Menghitung jumlah kandang aktif
 * @returns {number} Jumlah kandang aktif
 */
function hitungKandangAktif() {
  const data = getAllKandang();
  return data.filter(k => k['Status'] === 'Aktif').length;
}

/**
 * Mendapatkan ringkasan kandang
 * @returns {Object} Ringkasan data kandang
 */
function getRingkasanKandang() {
  try {
    const data = getAllKandang();
    const aktif = data.filter(k => k['Status'] === 'Aktif');
    const totalKapasitas = aktif.reduce((sum, k) => sum + (k['Kapasitas'] || 0), 0);
    
    return {
      total: data.length,
      aktif: aktif.length,
      nonAktif: data.length - aktif.length,
      totalKapasitas: totalKapasitas
    };
  } catch (e) {
    Logger.log('Error getRingkasanKandang: ' + e.message);
    return { total: 0, aktif: 0, nonAktif: 0, totalKapasitas: 0 };
  }
}

/**
 * Form untuk menambahkan kandang baru
 * Ditampilkan sebagai dialog modal
 */
function tampilkanFormTambahKandang() {
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
          max-width: 400px;
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
        input, select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-sizing: border-box;
          font-size: 14px;
        }
        input:focus, select:focus {
          outline: none;
          border-color: #4285F4;
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
      </style>
    </head>
    <body>
      <div class="form-container">
        <h2>Tambah Kandang Baru</h2>
        <form id="kandangForm">
          <div class="form-group">
            <label for="nama">Nama Kandang *</label>
            <input type="text" id="nama" name="nama" placeholder="Contoh: Kandang A1" required>
          </div>
          
          <div class="form-group">
            <label for="kapasitas">Kapasitas (ekor) *</label>
            <input type="number" id="kapasitas" name="kapasitas" placeholder="Contoh: 1000" min="1" required>
          </div>
          
          <div class="form-group">
            <label for="lokasi">Lokasi *</label>
            <input type="text" id="lokasi" name="lokasi" placeholder="Contoh: Blok A, Sisi Utara" required>
          </div>
          
          <button type="submit" class="btn btn-primary">Simpan Kandang</button>
          <button type="button" class="btn btn-cancel" onclick="google.script.host.close()">Batal</button>
          
          <div id="message" class="message"></div>
        </form>
      </div>
      
      <script>
        document.getElementById('kandangForm').addEventListener('submit', function(e) {
          e.preventDefault();
          
          const nama = document.getElementById('nama').value;
          const kapasitas = document.getElementById('kapasitas').value;
          const lokasi = document.getElementById('lokasi').value;
          
          const messageDiv = document.getElementById('message');
          
          google.script.run
            .withSuccessHandler(function(id) {
              messageDiv.className = 'message success';
              messageDiv.textContent = 'Kandang berhasil ditambahkan! ID: ' + id;
              setTimeout(function() {
                google.script.host.close();
              }, 1500);
            })
            .withFailureHandler(function(error) {
              messageDiv.className = 'message error';
              messageDiv.textContent = 'Error: ' + error.message;
            })
            .tambahKandang(nama, kapasitas, lokasi);
        });
      </script>
    </body>
    </html>
  `)
  .setWidth(450)
  .setHeight(450);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Tambah Kandang Baru');
}

/**
 * Form untuk mengedit kandang
 * @param {string} id - ID kandang yang akan diedit
 */
function tampilkanFormEditKandang(id) {
  const kandang = getKandangById(id);
  if (!kandang) {
    showErrorMessage('Kandang tidak ditemukan');
    return;
  }
  
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
          max-width: 400px;
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
        input, select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-sizing: border-box;
          font-size: 14px;
        }
        input:focus, select:focus {
          outline: none;
          border-color: #4285F4;
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
      </style>
    </head>
    <body>
      <div class="form-container">
        <h2>Edit Kandang</h2>
        <form id="kandangForm">
          <input type="hidden" id="id" value="${id}">
          
          <div class="form-group">
            <label for="nama">Nama Kandang *</label>
            <input type="text" id="nama" name="nama" value="${kandang['Nama Kandang']}" required>
          </div>
          
          <div class="form-group">
            <label for="kapasitas">Kapasitas (ekor) *</label>
            <input type="number" id="kapasitas" name="kapasitas" value="${kandang['Kapasitas']}" min="1" required>
          </div>
          
          <div class="form-group">
            <label for="lokasi">Lokasi *</label>
            <input type="text" id="lokasi" name="lokasi" value="${kandang['Lokasi']}" required>
          </div>
          
          <div class="form-group">
            <label for="status">Status</label>
            <select id="status" name="status">
              <option value="Aktif" ${kandang['Status'] === 'Aktif' ? 'selected' : ''}>Aktif</option>
              <option value="Non-Aktif" ${kandang['Status'] === 'Non-Aktif' ? 'selected' : ''}>Non-Aktif</option>
            </select>
          </div>
          
          <button type="submit" class="btn btn-primary">Update Kandang</button>
          <button type="button" class="btn btn-cancel" onclick="google.script.host.close()">Batal</button>
          
          <div id="message" class="message"></div>
        </form>
      </div>
      
      <script>
        document.getElementById('kandangForm').addEventListener('submit', function(e) {
          e.preventDefault();
          
          const id = document.getElementById('id').value;
          const nama = document.getElementById('nama').value;
          const kapasitas = document.getElementById('kapasitas').value;
          const lokasi = document.getElementById('lokasi').value;
          const status = document.getElementById('status').value;
          
          const messageDiv = document.getElementById('message');
          
          google.script.run
            .withSuccessHandler(function(result) {
              messageDiv.className = 'message success';
              messageDiv.textContent = 'Kandang berhasil diupdate!';
              setTimeout(function() {
                google.script.host.close();
              }, 1500);
            })
            .withFailureHandler(function(error) {
              messageDiv.className = 'message error';
              messageDiv.textContent = 'Error: ' + error.message;
            })
            .updateKandang(id, {
              nama: nama,
              kapasitas: kapasitas,
              lokasi: lokasi,
              status: status
            });
        });
      </script>
    </body>
    </html>
  `)
  .setWidth(450)
  .setHeight(500);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Edit Kandang');
}

/**
 * Menampilkan daftar kandang dalam format tabel
 */
function tampilkanDaftarKandang() {
  const data = getAllKandang();
  
  if (data.length === 0) {
    showErrorMessage('Belum ada data kandang');
    return;
  }
  
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
        .status-aktif {
          color: green;
          font-weight: bold;
        }
        .status-nonaktif {
          color: red;
          font-weight: bold;
        }
        .btn {
          padding: 8px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          margin-right: 5px;
        }
        .btn-edit {
          background-color: #FFC107;
          color: #333;
        }
        .btn-edit:hover {
          background-color: #FFB300;
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
        <h2>Daftar Kandang</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama Kandang</th>
              <th>Kapasitas</th>
              <th>Lokasi</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
  `;
  
  data.forEach(k => {
    const statusClass = k['Status'] === 'Aktif' ? 'status-aktif' : 'status-nonaktif';
    html += `
      <tr>
        <td>${k['ID']}</td>
        <td>${k['Nama Kandang']}</td>
        <td>${k['Kapasitas']}</td>
        <td>${k['Lokasi']}</td>
        <td class="${statusClass}">${k['Status']}</td>
        <td>
          <button class="btn btn-edit" onclick="editKandang('${k['ID']}')">Edit</button>
        </td>
      </tr>
    `;
  });
  
  html += `
          </tbody>
        </table>
        <button class="btn-close" onclick="google.script.host.close()">Tutup</button>
      </div>
      
      <script>
        function editKandang(id) {
          google.script.run
            .withSuccessHandler(function() {
              google.script.host.close();
            })
            .tampilkanFormEditKandang(id);
        }
      </script>
    </body>
    </html>
  `;
  
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(800)
    .setHeight(500);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Daftar Kandang');
}
