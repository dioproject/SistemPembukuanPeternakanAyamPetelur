/**
 * ============================================
 * MODUL DASHBOARD
 * ============================================
 * Fungsi untuk menampilkan dashboard ringkasan
 */

/**
 * Mendapatkan data KPI untuk dashboard
 * @returns {Object} Data KPI
 */
function getKPIDashboard() {
  try {
    const today = new Date();
    const bulan = today.getMonth() + 1;
    const tahun = today.getFullYear();
    
    // Data Kandang
    let ringkasanKandang = {total:0,aktif:0,totalKapasitas:0};
    try { ringkasanKandang = getRingkasanKandang(); } catch(e) { Logger.log('Error getRingkasanKandang: ' + e.message); }
    
    // Data Stok Ayam
    let ringkasanStok = {totalAyam:0,detail:[]};
    try { ringkasanStok = getRingkasanStok(); } catch(e) { Logger.log('Error getRingkasanStok: ' + e.message); }
    
    // Data Produksi
    let produksi = {totalButir:0,totalKg:0,totalNilai:0,rataRataPerHari:0};
    try { produksi = hitungTotalProduksiBulan(bulan, tahun); } catch(e) { Logger.log('Error produksi: ' + e.message); }
    
    // Data Pakan
    let pakan = {totalKg:0,totalBiaya:0};
    try { pakan = hitungTotalPakanBulan(bulan, tahun); } catch(e) { Logger.log('Error pakan: ' + e.message); }
    
    // Data Kematian
    let kematian = {total:0};
    let mortalitas = {mortalitasPersen:0,status:'Rendah'};
    try { kematian = hitungTotalKematianBulan(bulan, tahun); } catch(e) { Logger.log('Error kematian: ' + e.message); }
    try { mortalitas = hitungMortalitasKeseluruhan(); } catch(e) { Logger.log('Error mortalitas: ' + e.message); }
    
    // Data Keuangan
    let labaRugi = {totalPemasukan:0,totalPengeluaran:0,labaRugi:0,status:'Laba'};
    try { labaRugi = hitungLabaRugi(bulan, tahun); } catch(e) { Logger.log('Error labaRugi: ' + e.message); }
    
    return {
      periode: getNamaBulan(bulan) + ' ' + tahun,
      kandang: {
        total: ringkasanKandang.total,
        aktif: ringkasanKandang.aktif,
        kapasitas: ringkasanKandang.totalKapasitas
      },
      stokAyam: {
        total: ringkasanStok.totalAyam,
        detail: ringkasanStok.detail
      },
      produksi: {
        totalButir: produksi.totalButir,
        totalKg: produksi.totalKg,
        totalNilai: produksi.totalNilai,
        rataRataHari: produksi.rataRataPerHari
      },
      pakan: {
        totalKg: pakan.totalKg,
        totalBiaya: pakan.totalBiaya
      },
      kematian: {
        total: kematian.total,
        mortalitasPersen: mortalitas.mortalitasPersen,
        statusMortalitas: mortalitas.status
      },
      keuangan: {
        pemasukan: labaRugi.totalPemasukan,
        pengeluaran: labaRugi.totalPengeluaran,
        labaRugi: labaRugi.labaRugi,
        status: labaRugi.status
      }
    };
  } catch (e) {
    Logger.log('FATAL getKPIDashboard: ' + e.message);
    return {
      periode: '',
      kandang: {total:0,aktif:0,kapasitas:0},
      stokAyam: {total:0,detail:[]},
      produksi: {totalButir:0,totalKg:0,totalNilai:0,rataRataHari:0},
      pakan: {totalKg:0,totalBiaya:0},
      kematian: {total:0,mortalitasPersen:0,statusMortalitas:'Rendah'},
      keuangan: {pemasukan:0,pengeluaran:0,labaRugi:0,status:'Laba'}
    };
  }
}

/**
 * Membuat Dashboard di sheet Dashboard
 */
function buatDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let dashboardSheet = ss.getSheetByName(CONFIG.SHEETS.DASHBOARD);
  
  if (!dashboardSheet) {
    dashboardSheet = ss.insertSheet(CONFIG.SHEETS.DASHBOARD);
  }
  
  // Clear existing content
  dashboardSheet.clear();
  
  // Get KPI data
  const kpi = getKPIDashboard();
  
  // Set title
  dashboardSheet.getRange('A1').setValue('DASHBOARD PEMBAYARAN AYAM PETELUR');
  dashboardSheet.getRange('A1:F1').merge()
    .setFontSize(18)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setBackground('#4285F4')
    .setFontColor('#FFFFFF');
  
  // Set periode
  dashboardSheet.getRange('A2').setValue('Periode: ' + kpi.periode);
  dashboardSheet.getRange('A2:F2').merge()
    .setFontSize(12)
    .setHorizontalAlignment('center');
  
  // KPI Cards - Row 4
  const kpiData = [
    ['TOTAL KANDANG', 'STOK AYAM', 'PRODUKSI TELUR', 'PAKAN', 'KEMATIAN', 'LABA/RUGI'],
    [kpi.kandang.aktif + ' unit', kpi.stokAyam.total.toLocaleString() + ' ekor', 
     kpi.produksi.totalButir.toLocaleString() + ' butir', 
     kpi.pakan.totalKg.toLocaleString() + ' kg',
     kpi.kematian.total + ' ekor', 
     'Rp ' + kpi.keuangan.labaRugi.toLocaleString()],
    ['Kapasitas: ' + kpi.kandang.kapasitas.toLocaleString(), 
     'Rata-rata: ' + kpi.produksi.rataRataHari.toLocaleString() + '/hari',
     'Nilai: Rp ' + kpi.produksi.totalNilai.toLocaleString(),
     'Biaya: Rp ' + kpi.pakan.totalBiaya.toLocaleString(),
     'Mortalitas: ' + kpi.kematian.mortalitasPersen + '%',
     kpi.keuangan.status]
  ];
  
  dashboardSheet.getRange('A4:F6').setValues(kpiData);
  dashboardSheet.getRange('A4:F4').setFontWeight('bold').setBackground('#E8F0FE');
  dashboardSheet.getRange('A5:F5').setFontSize(14).setFontWeight('bold');
  dashboardSheet.getRange('A6:F6').setFontSize(10).setFontColor('#666666');
  
  // Add borders
  dashboardSheet.getRange('A4:F6').setBorder(true, true, true, true, true, true);
  
  // Detail Stok per Kandang - Row 8
  dashboardSheet.getRange('A8').setValue('DETAIL STOK PER KANDANG');
  dashboardSheet.getRange('A8:F8').merge()
    .setFontSize(12)
    .setFontWeight('bold')
    .setBackground('#34A853')
    .setFontColor('#FFFFFF');
  
  // Header tabel
  const headerKandang = ['Kandang', 'Kapasitas', 'Stok Saat Ini', 'Persentase', 'Status'];
  dashboardSheet.getRange('A9:E9').setValues([headerKandang]);
  dashboardSheet.getRange('A9:E9').setFontWeight('bold').setBackground('#F8F9FA');
  
  // Data kandang
  let row = 10;
  kpi.stokAyam.detail.forEach(item => {
    const status = item.persentase > 90 ? 'Penuh' : item.persentase > 70 ? 'Cukup' : 'Kosong';
    dashboardSheet.getRange(row, 1, 1, 5).setValues([
      [item.nama, item.kapasitas, item.stok, item.persentase + '%', status]
    ]);
    row++;
  });
  
  // Add borders to detail table
  dashboardSheet.getRange('A9:E' + (row - 1)).setBorder(true, true, true, true, true, true);
  
  // Keuangan Summary - Row After Kandang + 2
  const keuanganRow = row + 1;
  dashboardSheet.getRange('A' + keuanganRow).setValue('RINGKASAN KEUANGAN');
  dashboardSheet.getRange('A' + keuanganRow + ':F' + keuanganRow).merge()
    .setFontSize(12)
    .setFontWeight('bold')
    .setBackground('#FBBC04')
    .setFontColor('#000000');
  
  const keuanganData = [
    ['Total Pemasukan', 'Rp ' + kpi.keuangan.pemasukan.toLocaleString()],
    ['Total Pengeluaran', 'Rp ' + kpi.keuangan.pengeluaran.toLocaleString()],
    ['Laba/Rugi', 'Rp ' + kpi.keuangan.labaRugi.toLocaleString()],
    ['Status', kpi.keuangan.status]
  ];
  
  dashboardSheet.getRange('A' + (keuanganRow + 1) + ':B' + (keuanganRow + 4)).setValues(keuanganData);
  
  // Highlight laba/rugi
  if (kpi.keuangan.labaRugi >= 0) {
    dashboardSheet.getRange('B' + (keuanganRow + 3)).setFontColor('#28a745').setFontWeight('bold');
  } else {
    dashboardSheet.getRange('B' + (keuanganRow + 3)).setFontColor('#dc3545').setFontWeight('bold');
  }
  
  // Format kolom
  dashboardSheet.setColumnWidth(1, 150);
  dashboardSheet.setColumnWidth(2, 120);
  dashboardSheet.setColumnWidth(3, 120);
  dashboardSheet.setColumnWidth(4, 120);
  dashboardSheet.setColumnWidth(5, 120);
  dashboardSheet.setColumnWidth(6, 150);
  
  // Set alignment
  dashboardSheet.getRange('A4:F6').setHorizontalAlignment('center');
  
  // Move Dashboard to first position
  ss.setActiveSheet(dashboardSheet);
  ss.moveActiveSheet(1);
  
  return true;
}

/**
 * Menampilkan dashboard dalam dialog
 */
function tampilkanDashboard() {
  const kpi = getKPIDashboard();
  
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <base target="_top">
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .dashboard {
          max-width: 1200px;
          margin: 0 auto;
        }
        .header {
          background: linear-gradient(135deg, #4285F4, #34A853);
          color: white;
          padding: 30px;
          border-radius: 10px;
          margin-bottom: 20px;
          text-align: center;
        }
        .header h1 {
          font-size: 24px;
          margin-bottom: 10px;
        }
        .header p {
          opacity: 0.9;
        }
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }
        .kpi-card {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          text-align: center;
        }
        .kpi-card .icon {
          font-size: 32px;
          margin-bottom: 10px;
        }
        .kpi-card .label {
          color: #666;
          font-size: 12px;
          text-transform: uppercase;
          margin-bottom: 5px;
        }
        .kpi-card .value {
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }
        .kpi-card .sub {
          font-size: 11px;
          color: #999;
          margin-top: 5px;
        }
        .kpi-card.kandang { border-top: 4px solid #4285F4; }
        .kpi-card.ayam { border-top: 4px solid #34A853; }
        .kpi-card.telur { border-top: 4px solid #FBBC04; }
        .kpi-card.pakan { border-top: 4px solid #EA4335; }
        .kpi-card.kematian { border-top: 4px solid #FF6D01; }
        .kpi-card.keuangan { border-top: 4px solid #46BDC6; }
        .section {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }
        .section h2 {
          font-size: 16px;
          color: #333;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #eee;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        th {
          background-color: #f8f9fa;
          font-weight: 600;
          color: #555;
        }
        .progress-bar {
          width: 100%;
          height: 8px;
          background-color: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background-color: #4285F4;
        }
        .progress-fill.warning { background-color: #FBBC04; }
        .progress-fill.danger { background-color: #EA4335; }
        .financial-row {
          display: flex;
          justify-content: space-between;
          padding: 15px 0;
          border-bottom: 1px solid #eee;
        }
        .financial-row:last-child {
          border-bottom: none;
          font-weight: bold;
          font-size: 18px;
        }
        .financial-row .label { color: #666; }
        .financial-row .value { font-weight: 600; }
        .financial-row .value.positive { color: #34A853; }
        .financial-row .value.negative { color: #EA4335; }
        .btn-refresh {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #4285F4;
          color: white;
          border: none;
          padding: 15px 25px;
          border-radius: 30px;
          cursor: pointer;
          font-size: 14px;
          box-shadow: 0 4px 15px rgba(66,133,244,0.4);
        }
        .btn-refresh:hover {
          background: #3367D6;
        }
      </style>
    </head>
    <body>
      <div class="dashboard">
        <div class="header">
          <h1>DASHBOARD PEMBAYARAN AYAM PETELUR</h1>
          <p>Periode: ${kpi.periode}</p>
        </div>
        
        <div class="kpi-grid">
          <div class="kpi-card kandang">
            <div class="icon"> </div>
            <div class="label">Total Kandang Aktif</div>
            <div class="value">${kpi.kandang.aktif}</div>
            <div class="sub">Kapasitas: ${kpi.kandang.kapasitas.toLocaleString()} ekor</div>
          </div>
          
          <div class="kpi-card ayam">
            <div class="icon"> </div>
            <div class="label">Total Stok Ayam</div>
            <div class="value">${kpi.stokAyam.total.toLocaleString()}</div>
            <div class="sub">ekor aktif</div>
          </div>
          
          <div class="kpi-card telur">
            <div class="icon"> </div>
            <div class="label">Produksi Telur</div>
            <div class="value">${kpi.produksi.totalButir.toLocaleString()}</div>
            <div class="sub">butir (${kpi.produksi.totalKg.toLocaleString()} kg)</div>
          </div>
          
          <div class="kpi-card pakan">
            <div class="icon"> </div>
            <div class="label">Total Pakan</div>
            <div class="value">${kpi.pakan.totalKg.toLocaleString()}</div>
            <div class="sub">kg (Rp ${kpi.pakan.totalBiaya.toLocaleString()})</div>
          </div>
          
          <div class="kpi-card kematian">
            <div class="icon"> </div>
            <div class="label">Kematian Ayam</div>
            <div class="value">${kpi.kematian.total}</div>
            <div class="sub">Mortalitas: ${kpi.kematian.mortalitasPersen}%</div>
          </div>
          
          <div class="kpi-card keuangan">
            <div class="icon"> </div>
            <div class="label">Laba/Rugi</div>
            <div class="value ${kpi.keuangan.labaRugi >= 0 ? 'positive' : 'negative'}">
              Rp ${kpi.keuangan.labaRugi.toLocaleString()}
            </div>
            <div class="sub">${kpi.keuangan.status}</div>
          </div>
        </div>
        
        <div class="section">
          <h2>  Detail Stok per Kandang</h2>
          <table>
            <thead>
              <tr>
                <th>Kandang</th>
                <th>Kapasitas</th>
                <th>Stok</th>
                <th>Persentase</th>
                <th>Visual</th>
              </tr>
            </thead>
            <tbody>
  `;
  
  kpi.stokAyam.detail.forEach(item => {
    let progressClass = '';
    if (item.persentase > 90) progressClass = 'danger';
    else if (item.persentase > 70) progressClass = 'warning';
    
    html += `
      <tr>
        <td>${item.nama}</td>
        <td>${item.kapasitas.toLocaleString()}</td>
        <td>${item.stok.toLocaleString()}</td>
        <td>${item.persentase}%</td>
        <td>
          <div class="progress-bar">
            <div class="progress-fill ${progressClass}" style="width: ${Math.min(item.persentase, 100)}%"></div>
          </div>
        </td>
      </tr>
    `;
  });
  
  html += `
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <h2>  Ringkasan Keuangan</h2>
          <div class="financial-row">
            <span class="label">Total Pemasukan</span>
            <span class="value positive">Rp ${kpi.keuangan.pemasukan.toLocaleString()}</span>
          </div>
          <div class="financial-row">
            <span class="label">Total Pengeluaran</span>
            <span class="value negative">Rp ${kpi.keuangan.pengeluaran.toLocaleString()}</span>
          </div>
          <div class="financial-row">
            <span class="label">${kpi.keuangan.status}</span>
            <span class="value ${kpi.keuangan.labaRugi >= 0 ? 'positive' : 'negative'}">
              Rp ${Math.abs(kpi.keuangan.labaRugi).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      
      <button class="btn-refresh" onclick="refreshDashboard()">  Refresh Dashboard</button>
      
      <script>
        function refreshDashboard() {
          google.script.run
            .withSuccessHandler(function() {
              location.reload();
            })
            .buatDashboard();
        }
      </script>
    </body>
    </html>
  `;
  
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(1200)
    .setHeight(800);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Dashboard Ayam Petelur');
}

/**
 * Update dashboard secara otomatis
 */
function updateDashboardOtomatis() {
  try {
    buatDashboard();
    return true;
  } catch (error) {
    console.error('Error updating dashboard:', error);
    return false;
  }
}
