/**
 * ============================================
 * MODUL MENU
 * ============================================
 * Fungsi untuk membuat custom menu di spreadsheet
 */

/**
 * Fungsi onOpen - dijalankan saat spreadsheet dibuka
 * Membuat custom menu
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  // Buat menu utama
  ui.createMenu('  Ayam Petelur')
    .addItem('  Inisialisasi Spreadsheet', 'inisialisasiSpreadsheet')
    .addSeparator()
    .addSubMenu(ui.createMenu(' ')
      .addItem('  Dashboard', 'tampilkanDashboard')
      .addItem('  Buat Dashboard di Sheet', 'buatDashboard')
    )
    .addSeparator()
    .addSubMenu(ui.createMenu(' ')
      .addItem('  Tambah Kandang', 'tampilkanFormTambahKandang')
      .addItem('  Lihat Daftar Kandang', 'tampilkanDaftarKandang')
      .addItem('  Ringkasan Kandang', 'tampilkanRingkasanKandang')
    )
    .addSeparator()
    .addSubMenu(ui.createMenu(' ')
      .addItem('  Catat Ayam Masuk/Keluar', 'tampilkanFormInventaris')
      .addItem('  Lihat Laporan Stok', 'tampilkanLaporanStok')
    )
    .addSeparator()
    .addSubMenu(ui.createMenu(' ')
      .addItem('  Catat Pakan', 'tampilkanFormPakan')
      .addItem('  Lihat Laporan Pakan', 'tampilkanLaporanPakan')
    )
    .addSeparator()
    .addSubMenu(ui.createMenu(' ')
      .addItem('  Catat Produksi Telur', 'tampilkanFormProduksi')
      .addItem('  Lihat Laporan Produksi', 'tampilkanLaporanProduksi')
    )
    .addSeparator()
    .addSubMenu(ui.createMenu(' ')
      .addItem('  Catat Kematian Ayam', 'tampilkanFormKematian')
      .addItem('  Lihat Laporan Kematian', 'tampilkanLaporanKematian')
    )
    .addSeparator()
    .addSubMenu(ui.createMenu(' ')
      .addItem('  Catat Pengeluaran', 'tampilkanFormPengeluaran')
      .addItem('  Catat Pemasukan', 'tampilkanFormPemasukan')
      .addItem('  Lihat Laporan Keuangan', 'tampilkanLaporanKeuangan')
    )
    .addSeparator()
    .addSubMenu(ui.createMenu(' ')
      .addItem('  Generate Laporan Bulanan', 'tampilkanFormLaporan')
      .addItem('  Preview Laporan', 'tampilkanPreviewLaporan')
    )
    .addSeparator()
    .addSubMenu(ui.createMenu('  Web App')
      .addItem('  Deploy Dashboard', 'deployWebApp')
      .addItem('  Buka Dashboard Web', 'bukaDashboardWeb')
    )
    .addSeparator()
    .addSubMenu(ui.createMenu('⚙️ Pengaturan')
      .addItem('  Inisialisasi Ulang', 'inisialisasiSpreadsheet')
      .addItem('  Update Dashboard', 'updateDashboardOtomatis')
      .addItem('  Reset Admin', 'tampilkanResetAdmin')
    )
    .addToUi();
}

/**
 * Fungsi untuk menampilkan ringkasan kandang
 */
function tampilkanRingkasanKandang() {
  const ringkasan = getRingkasanKandang();
  const stok = getRingkasanStok();
  
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
          max-width: 500px;
          margin: 0 auto;
        }
        h2 {
          color: #333;
          margin-top: 0;
          text-align: center;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-top: 20px;
        }
        .summary-item {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        }
        .summary-item .label {
          color: #666;
          font-size: 12px;
          text-transform: uppercase;
        }
        .summary-item .value {
          font-size: 28px;
          font-weight: bold;
          color: #333;
          margin-top: 10px;
        }
        .summary-item.kandang { border-left: 4px solid #4285F4; }
        .summary-item.ayam { border-left: 4px solid #34A853; }
        .summary-item.kapasitas { border-left: 4px solid #FBBC04; }
        .summary-item.nonaktif { border-left: 4px solid #EA4335; }
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
        <h2>Ringkasan Kandang</h2>
        
        <div class="summary-grid">
          <div class="summary-item kandang">
            <div class="label">Total Kandang</div>
            <div class="value">${ringkasan.total}</div>
          </div>
          
          <div class="summary-item ayam">
            <div class="label">Kandang Aktif</div>
            <div class="value">${ringkasan.aktif}</div>
          </div>
          
          <div class="summary-item kapasitas">
            <div class="label">Total Kapasitas</div>
            <div class="value">${ringkasan.totalKapasitas.toLocaleString()}</div>
          </div>
          
          <div class="summary-item nonaktif">
            <div class="label">Non-Aktif</div>
            <div class="value">${ringkasan.nonAktif}</div>
          </div>
          
          <div class="summary-item ayam">
            <div class="label">Total Ayam Saat Ini</div>
            <div class="value">${stok.totalAyam.toLocaleString()}</div>
          </div>
          
          <div class="summary-item kapasitas">
            <div class="label">Terisi</div>
            <div class="value">${ringkasan.totalKapasitas > 0 ? Math.round((stok.totalAyam / ringkasan.totalKapasitas) * 100) : 0}%</div>
          </div>
        </div>
        
        <button class="btn-close" onclick="google.script.host.close()">Tutup</button>
      </div>
    </body>
    </html>
  `;
  
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(550)
    .setHeight(400);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Ringkasan Kandang');
}

/**
 * Fungsi untuk membuka dashboard web app
 */
function bukaDashboardWeb() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const scriptUrl = ScriptApp.getService().getUrl();
  
  if (scriptUrl) {
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
          .container {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            max-width: 500px;
            margin: 0 auto;
            text-align: center;
          }
          h2 {
            color: #333;
            margin-top: 0;
          }
          .url-box {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            word-break: break-all;
            font-family: monospace;
            font-size: 12px;
            border: 1px solid #ddd;
          }
          .btn {
            display: inline-block;
            padding: 12px 24px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            text-decoration: none;
            margin: 5px;
          }
          .btn-primary {
            background-color: #4285F4;
            color: white;
          }
          .btn-primary:hover {
            background-color: #3367D6;
          }
          .btn-copy {
            background-color: #34A853;
            color: white;
          }
          .btn-copy:hover {
            background-color: #2d8f47;
          }
          .btn-close {
            background-color: #f5f5f5;
            color: #333;
          }
          .btn-close:hover {
            background-color: #e5e5e5;
          }
          .message {
            margin-top: 10px;
            padding: 10px;
            border-radius: 4px;
            display: none;
          }
          .message.success {
            background-color: #d4edda;
            color: #155724;
            display: block;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Dashboard Web App</h2>
          <p>Bagikan link berikut untuk mengakses dashboard:</p>
          
          <div class="url-box" id="url">${scriptUrl}</div>
          
          <a href="${scriptUrl}" target="_blank" class="btn btn-primary">Buka Dashboard</a>
          <button class="btn btn-copy" onclick="copyUrl()">Salin Link</button>
          <button class="btn btn-close" onclick="google.script.host.close()">Tutup</button>
          
          <div id="message" class="message">Link berhasil disalin!</div>
        </div>
        
        <script>
          function copyUrl() {
            const url = document.getElementById('url').textContent;
            navigator.clipboard.writeText(url).then(function() {
              const msg = document.getElementById('message');
              msg.style.display = 'block';
              setTimeout(function() {
                msg.style.display = 'none';
              }, 2000);
            });
          }
        </script>
      </body>
      </html>
    `)
    .setWidth(550)
    .setHeight(350);
    
    SpreadsheetApp.getUi().showModalDialog(html, 'Dashboard Web App');
  } else {
    SpreadsheetApp.getUi().alert(
      'Web App Belum Di-deploy',
      'Silakan deploy terlebih dahulu melalui menu:   Web App →   Deploy Dashboard',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Fungsi untuk membantu user memahami aplikasi
 */
function tampilkanBantuan() {
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
        .container {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          max-width: 600px;
          margin: 0 auto;
        }
        h2 {
          color: #4285F4;
          margin-top: 0;
          text-align: center;
        }
        .section {
          margin-bottom: 20px;
        }
        h3 {
          color: #333;
          border-bottom: 2px solid #4285F4;
          padding-bottom: 5px;
        }
        ul {
          list-style-type: none;
          padding-left: 0;
        }
        li {
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        li:before {
          content: "✓ ";
          color: #34A853;
          font-weight: bold;
        }
        .btn-close {
          width: 100%;
          padding: 12px;
          background-color: #4285F4;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          margin-top: 20px;
        }
        .btn-close:hover {
          background-color: #3367D6;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Bantuan Aplikasi</h2>
        
        <div class="section">
          <h3>Langkah Awal</h3>
          <ul>
            <li>Klik menu "Ayam Petelur" di atas</li>
            <li>Pilih "Inisialisasi Spreadsheet" untuk membuat semua sheet</li>
            <li>Mulai tambah data kandang</li>
          </ul>
        </div>
        
        <div class="section">
          <h3>Pencatatan Harian</h3>
          <ul>
            <li>Catat pakan setiap hari</li>
            <li>Catat produksi telur setiap hari</li>
            <li>Catat kematian ayam jika ada</li>
            <li>Catat pengeluaran/pemasukan</li>
          </ul>
        </div>
        
        <div class="section">
          <h3>Laporan</h3>
          <ul>
            <li>Dashboard untuk ringkasan visual</li>
            <li>Laporan bulanan untuk analisis</li>
            <li>Export PDF untuk arsip</li>
          </ul>
        </div>
        
        <button class="btn-close" onclick="google.script.host.close()">Tutup</button>
      </div>
    </body>
    </html>
  `)
  .setWidth(650)
  .setHeight(500);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Bantuan Aplikasi');
}

/**
 * Tampilkan dialog Reset Admin
 */
function tampilkanResetAdmin() {
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
        .container {
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
        .warning {
          background-color: #fff3cd;
          border: 1px solid #ffc107;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          color: #856404;
        }
        .btn {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          margin-top: 10px;
        }
        .btn-danger {
          background-color: #dc3545;
          color: white;
        }
        .btn-danger:hover {
          background-color: #c82333;
        }
        .btn-cancel {
          background-color: #f5f5f5;
          color: #333;
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
        .credentials {
          background-color: #e7f3ff;
          padding: 15px;
          border-radius: 8px;
          margin-top: 15px;
          display: none;
        }
        .credentials h4 {
          margin-top: 0;
          color: #333;
        }
        .credentials p {
          margin: 5px 0;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Reset Admin</h2>
        
        <div class="warning">
          <strong>Peringatan!</strong> Ini akan menghapus SEMUA user dan membuat admin baru. 
          Semua user yang sudah terdaftar akan kehilangan akses.
        </div>
        
        <button class="btn btn-danger" onclick="resetAdmin()">Reset Sekarang</button>
        <button class="btn btn-cancel" onclick="google.script.host.close()">Batal</button>
        
        <div id="message" class="message"></div>
        <div id="credentials" class="credentials">
          <h4>Akun Admin Baru:</h4>
          <p><strong>Username:</strong> <span id="newUsername"></span></p>
          <p><strong>Password:</strong> <span id="newPassword"></span></p>
        </div>
      </div>
      
      <script>
        function resetAdmin() {
          if (!confirm('Yakin ingin reset? Semua user akan dihapus!')) {
            return;
          }
          
          const messageDiv = document.getElementById('message');
          const credDiv = document.getElementById('credentials');
          
          google.script.run
            .withSuccessHandler(function(result) {
              if (result.success) {
                messageDiv.className = 'message success';
                messageDiv.textContent = result.message;
                messageDiv.style.display = 'block';
                
                document.getElementById('newUsername').textContent = result.admin.username;
                document.getElementById('newPassword').textContent = result.admin.password;
                credDiv.style.display = 'block';
              } else {
                messageDiv.className = 'message error';
                messageDiv.textContent = result.message;
                messageDiv.style.display = 'block';
              }
            })
            .withFailureHandler(function(error) {
              messageDiv.className = 'message error';
              messageDiv.textContent = 'Error: ' + error.message;
              messageDiv.style.display = 'block';
            })
            .resetAllUsers();
        }
      </script>
    </body>
    </html>
  `)
  .setWidth(500)
  .setHeight(450);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Reset Admin');
}
