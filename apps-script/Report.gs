/**
 * ============================================
 * MODUL LAPORAN & EXPORT
 * ============================================
 * Fungsi untuk membuat laporan dan export PDF
 */

/**
 * Membuat laporan bulanan di sheet Laporan
 * @param {number} bulan - Bulan (1-12)
 * @param {number} tahun - Tahun
 * @returns {boolean} Status keberhasilan
 */
function buatLaporanBulanan(bulan, tahun) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let laporanSheet = ss.getSheetByName(CONFIG.SHEETS.LAPORAN);
  
  if (!laporanSheet) {
    laporanSheet = ss.insertSheet(CONFIG.SHEETS.LAPORAN);
  }
  
  // Clear existing content
  laporanSheet.clear();
  
  // Get all data
  const namaBulan = getNamaBulan(bulan) + ' ' + tahun;
  const labaRugi = hitungLabaRugi(bulan, tahun);
  const produksi = hitungTotalProduksiBulan(bulan, tahun);
  const pakan = hitungTotalPakanBulan(bulan, tahun);
  const kematian = hitungTotalKematianBulan(bulan, tahun);
  const mortalitas = hitungMortalitasKeseluruhan();
  const ringkasanStok = getRingkasanStok();
  
  // Set header
  laporanSheet.getRange('A1').setValue('LAPORAN BULANAN PETERNAKAN AYAM PETELUR');
  laporanSheet.getRange('A1:H1').merge()
    .setFontSize(16)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setBackground('#4285F4')
    .setFontColor('#FFFFFF');
  
  laporanSheet.getRange('A2').setValue('Periode: ' + namaBulan);
  laporanSheet.getRange('A2:H2').merge()
    .setFontSize(12)
    .setHorizontalAlignment('center');
  
  // Ringkasan Stok Ayam - Row 4
  laporanSheet.getRange('A4').setValue('1. RINGKASAN STOK AYAM');
  laporanSheet.getRange('A4:H4').merge()
    .setFontSize(12)
    .setFontWeight('bold')
    .setBackground('#34A853')
    .setFontColor('#FFFFFF');
  
  // Header tabel stok
  const headerStok = ['Kandang', 'Kapasitas', 'Stok Akhir', 'Keterangan'];
  laporanSheet.getRange('A5:D5').setValues([headerStok]);
  laporanSheet.getRange('A5:D5').setFontWeight('bold').setBackground('#F8F9FA');
  
  let row = 6;
  ringkasanStok.detail.forEach(item => {
    laporanSheet.getRange(row, 1, 1, 4).setValues([
      [item.nama, item.kapasitas, item.stok, item.persentase + '% terisi']
    ]);
    row++;
  });
  
  laporanSheet.getRange('A' + row).setValue('TOTAL');
  laporanSheet.getRange('A' + row + ':D' + row).setFontWeight('bold').setBackground('#E8F0FE');
  laporanSheet.getRange('C' + row).setValue(ringkasanStok.totalAyam);
  row += 2;
  
  // Produksi Telur
  laporanSheet.getRange('A' + row).setValue('2. PRODUKSI TELUR');
  laporanSheet.getRange('A' + row + ':H' + row).merge()
    .setFontSize(12)
    .setFontWeight('bold')
    .setBackground('#FBBC04')
    .setFontColor('#000000');
  row++;
  
  const dataProduksi = [
    ['Total Produksi Butir', produksi.totalButir.toLocaleString() + ' butir'],
    ['Total Produksi Kg', produksi.totalKg.toLocaleString() + ' kg'],
    ['Total Nilai Produksi', 'Rp ' + produksi.totalNilai.toLocaleString()],
    ['Rata-rata/Hari', produksi.rataRataPerHari.toLocaleString() + ' butir']
  ];
  
  laporanSheet.getRange('A' + row + ':B' + (row + 3)).setValues(dataProduksi);
  row += 5;
  
  // Pakan
  laporanSheet.getRange('A' + row).setValue('3. PAKAN');
  laporanSheet.getRange('A' + row + ':H' + row).merge()
    .setFontSize(12)
    .setFontWeight('bold')
    .setBackground('#EA4335')
    .setFontColor('#FFFFFF');
  row++;
  
  const dataPakan = [
    ['Total Pakan', pakan.totalKg.toLocaleString() + ' kg'],
    ['Total Biaya Pakan', 'Rp ' + pakan.totalBiaya.toLocaleString()],
    ['Rata-rata/Hari', Math.round(pakan.totalKg / 30).toLocaleString() + ' kg']
  ];
  
  laporanSheet.getRange('A' + row + ':B' + (row + 2)).setValues(dataPakan);
  row += 4;
  
  // Kematian
  laporanSheet.getRange('A' + row).setValue('4. KEMATIAN AYAM');
  laporanSheet.getRange('A' + row + ':H' + row).merge()
    .setFontSize(12)
    .setFontWeight('bold')
    .setBackground('#FF6D01')
    .setFontColor('#FFFFFF');
  row++;
  
  const dataKematian = [
    ['Total Kematian', kematian.total + ' ekor'],
    ['Mortalitas', mortalitas.mortalitasPersen + '%'],
    ['Status', mortalitas.status]
  ];
  
  laporanSheet.getRange('A' + row + ':B' + (row + 2)).setValues(dataKematian);
  row += 4;
  
  // Keuangan
  laporanSheet.getRange('A' + row).setValue('5. RINGKASAN KEUANGAN');
  laporanSheet.getRange('A' + row + ':H' + row).merge()
    .setFontSize(12)
    .setFontWeight('bold')
    .setBackground('#46BDC6')
    .setFontColor('#FFFFFF');
  row++;
  
  const dataKeuangan = [
    ['Total Pemasukan', 'Rp ' + labaRugi.totalPemasukan.toLocaleString()],
    ['Total Pengeluaran', 'Rp ' + labaRugi.totalPengeluaran.toLocaleString()],
    ['Laba/Rugi', 'Rp ' + labaRugi.labaRugi.toLocaleString()],
    ['Status', labaRugi.status]
  ];
  
  laporanSheet.getRange('A' + row + ':B' + (row + 3)).setValues(dataKeuangan);
  
  // Highlight laba/rugi
  if (labaRugi.labaRugi >= 0) {
    laporanSheet.getRange('B' + (row + 2)).setFontColor('#28a745').setFontWeight('bold');
  } else {
    laporanSheet.getRange('B' + (row + 2)).setFontColor('#dc3545').setFontWeight('bold');
  }
  
  // Format kolom
  laporanSheet.setColumnWidth(1, 200);
  laporanSheet.setColumnWidth(2, 150);
  laporanSheet.setColumnWidth(3, 120);
  laporanSheet.setColumnWidth(4, 120);
  
  // Add borders to all tables
  laporanSheet.getRange('A5:D' + (row - 1)).setBorder(true, true, true, true, true, true);
  
  // Move to last position
  const sheets = ss.getSheets();
  ss.setActiveSheet(laporanSheet);
  ss.moveActiveSheet(sheets.length);
  
  return true;
}

/**
 * Export laporan ke PDF
 * @param {number} bulan - Bulan (1-12)
 * @param {number} tahun - Tahun
 * @returns {string} URL file PDF
 */
function exportLaporanPDF(bulan, tahun) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const namaBulan = getNamaBulan(bulan) + ' ' + tahun;
  
  // Buat laporan terlebih dahulu
  buatLaporanBulanan(bulan, tahun);
  
  // Get laporan sheet
  const laporanSheet = ss.getSheetByName(CONFIG.SHEETS.LAPORAN);
  if (!laporanSheet) {
    throw new Error('Sheet laporan tidak ditemukan');
  }
  
  // Create PDF
  const url = ss.getUrl().replace(/edit$/, '');
  const exportUrl = url + 'export?format=pdf' +
    '&gid=' + laporanSheet.getSheetId() +
    '&size=A4' +
    '&portrait=true' +
    '&fitw=true' +
    '&gridlines=false' +
    '&printtitle=false' +
    '&sheetnames=false' +
    '&pagenum=UNDEFINED' +
    '&fzr=false';
  
  // Get access token
  const token = ScriptApp.getOAuthToken();
  
  // Download PDF
  const response = UrlFetchApp.fetch(exportUrl, {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  });
  
  // Save to Drive
  const blob = response.getBlob().setName('Laporan_Ayam_Petelur_' + bulan + '_' + tahun + '.pdf');
  const file = DriveApp.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  return file.getUrl();
}

/**
 * Form untuk generate laporan
 */
function tampilkanFormLaporan() {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  
  let bulanOptions = '';
  for (let i = 1; i <= 12; i++) {
    const selected = i === currentMonth ? 'selected' : '';
    bulanOptions += `<option value="${i}" ${selected}>${getNamaBulan(i)}</option>`;
  }
  
  let tahunOptions = '';
  for (let i = currentYear - 2; i <= currentYear + 1; i++) {
    const selected = i === currentYear ? 'selected' : '';
    tahunOptions += `<option value="${i}" ${selected}>${i}</option>`;
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
        select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-sizing: border-box;
          font-size: 14px;
        }
        select:focus {
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
          font-size: 14px;
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
        .btn-pdf {
          background-color: #dc3545;
          color: white;
        }
        .btn-pdf:hover {
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
        .message.info {
          background-color: #cce5ff;
          color: #004085;
          display: block;
        }
      </style>
    </head>
    <body>
      <div class="form-container">
        <h2>Generate Laporan</h2>
        <form id="laporanForm">
          <div class="row">
            <div class="form-group">
              <label for="bulan">Bulan *</label>
              <select id="bulan" name="bulan" required>
                ${bulanOptions}
              </select>
            </div>
            
            <div class="form-group">
              <label for="tahun">Tahun *</label>
              <select id="tahun" name="tahun" required>
                ${tahunOptions}
              </select>
            </div>
          </div>
          
          <button type="submit" class="btn btn-primary">Generate Laporan</button>
          <button type="button" class="btn btn-pdf" onclick="exportPDF()">Export ke PDF</button>
          <button type="button" class="btn btn-cancel" onclick="google.script.host.close()">Batal</button>
          
          <div id="message" class="message"></div>
        </form>
      </div>
      
      <script>
        document.getElementById('laporanForm').addEventListener('submit', function(e) {
          e.preventDefault();
          
          const bulan = document.getElementById('bulan').value;
          const tahun = document.getElementById('tahun').value;
          
          const messageDiv = document.getElementById('message');
          messageDiv.className = 'message info';
          messageDiv.textContent = 'Sedang membuat laporan...';
          
          google.script.run
            .withSuccessHandler(function() {
              messageDiv.className = 'message success';
              messageDiv.textContent = 'Laporan berhasil dibuat di sheet Laporan!';
              setTimeout(function() {
                google.script.host.close();
              }, 2000);
            })
            .withFailureHandler(function(error) {
              messageDiv.className = 'message error';
              messageDiv.textContent = 'Error: ' + error.message;
            })
            .buatLaporanBulanan(parseInt(bulan), parseInt(tahun));
        });
        
        function exportPDF() {
          const bulan = document.getElementById('bulan').value;
          const tahun = document.getElementById('tahun').value;
          
          const messageDiv = document.getElementById('message');
          messageDiv.className = 'message info';
          messageDiv.textContent = 'Sedang export PDF...';
          
          google.script.run
            .withSuccessHandler(function(url) {
              messageDiv.className = 'message success';
              messageDiv.innerHTML = 'PDF berhasil dibuat! <a href="' + url + '" target="_blank">Klik untuk melihat</a>';
            })
            .withFailureHandler(function(error) {
              messageDiv.className = 'message error';
              messageDiv.textContent = 'Error: ' + error.message;
            })
            .exportLaporanPDF(parseInt(bulan), parseInt(tahun));
        }
      </script>
    </body>
    </html>
  `)
  .setWidth(450)
  .setHeight(350);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Generate Laporan');
}

/**
 * Menampilkan preview laporan
 */
function tampilkanPreviewLaporan() {
  const today = new Date();
  const bulan = today.getMonth() + 1;
  const tahun = today.getFullYear();
  
  // Generate laporan terlebih dahulu
  buatLaporanBulanan(bulan, tahun);
  
  // Show success message
  showSuccessMessage('Laporan bulan ' + getNamaBulan(bulan) + ' ' + tahun + ' berhasil dibuat di sheet Laporan');
  
  // Switch to Laporan sheet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const laporanSheet = ss.getSheetByName(CONFIG.SHEETS.LAPORAN);
  if (laporanSheet) {
    ss.setActiveSheet(laporanSheet);
  }
}
