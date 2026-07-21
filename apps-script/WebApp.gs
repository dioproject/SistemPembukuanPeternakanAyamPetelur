/**
 * WEB APP - FULL APPLICATION (v3)
 * Semua navigasi via AJAX, tidak ada full page reload
 */

// ============================================
// MAIN ROUTER
// ============================================
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';
  
  if (action === 'logout') {
    logoutUser();
  }
  
  var session = getCurrentSession();
  
  if (action === 'logout' || !session) {
    return renderLoginPage();
  }
  
  return renderMainApp(action || 'dashboard');
}

// ============================================
// LOGIN PAGE
// ============================================
function renderLoginPage() {
  var html = '<!DOCTYPE html><html><head>';
  html += '<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">';
  html += '<title>Login - Ayam Petelur</title>';
  html += '<style>';
  html += '*{box-sizing:border-box;margin:0;padding:0}';
  html += 'body{font-family:"Segoe UI",sans-serif;background:linear-gradient(135deg,#667eea,#764ba2);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}';
  html += '.c{background:white;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,.3);overflow:hidden;width:100%;max-width:400px}';
  html += '.h{background:linear-gradient(135deg,#4285F4,#34A853);padding:40px 30px;text-align:center;color:white}';
  html += '.h .logo{font-size:60px;margin-bottom:15px}.h h1{font-size:24px;margin-bottom:5px}.h p{opacity:.9;font-size:14px}';
  html += '.b{padding:30px}.fg{margin-bottom:20px}.fg label{display:block;margin-bottom:8px;font-weight:600;color:#333;font-size:14px}';
  html += '.fg input{width:100%;padding:14px 16px;border:2px solid #e0e0e0;border-radius:10px;font-size:14px;transition:all .3s}';
  html += '.fg input:focus{outline:none;border-color:#4285F4;box-shadow:0 0 0 3px rgba(66,133,244,.2)}';
  html += '.btn{width:100%;padding:14px;background:linear-gradient(135deg,#4285F4,#34A853);color:white;border:none;border-radius:10px;font-size:16px;font-weight:600;cursor:pointer;transition:all .3s}';
  html += '.btn:hover{transform:translateY(-2px);box-shadow:0 5px 20px rgba(66,133,244,.4)}';
  html += '.err{background:#fee;color:#c00;padding:12px;border-radius:8px;margin-bottom:20px;display:none;font-size:14px}';
  html += '</style></head><body>';
  html += '<div class="c"><div class="h"><div class="logo"> </div><h1>Ayam Petelur</h1><p>Sistem Pembukuan Peternakan</p></div>';
  html += '<div class="b"><div class="err" id="errMsg"></div>';
  html += '<form id="loginForm"><div class="fg"><label>Username</label><input type="text" id="username" placeholder="Masukkan username" required></div>';
  html += '<div class="fg"><label>Password</label><input type="password" id="password" placeholder="Masukkan password" required></div>';
  html += '<button type="submit" class="btn">Masuk</button></form></div></div>';
  html += '<script>document.getElementById("loginForm").addEventListener("submit",function(e){e.preventDefault();';
  html += 'var u=document.getElementById("username").value,p=document.getElementById("password").value,em=document.getElementById("errMsg");';
  html += 'em.style.display="none";';
  html += 'google.script.run.withSuccessHandler(function(r){if(r.success){location.reload();}else{em.textContent=r.message;em.style.display="block";}})';
  html += '.withFailureHandler(function(e){em.textContent=e.message;em.style.display="block";}).loginUser(u,p);});';
  html += '</script></body></html>';
  
  return HtmlService.createHtmlOutput(html)
    .setTitle('Login - Ayam Petelur')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// ============================================
// MAIN APP (LOGGED IN) - SEMUA VIA AJAX
// ============================================
function renderMainApp(activeMenu) {
  var user = getCurrentUser();
  if (!user) return renderLoginPage();
  
  var menuTitle = getMenuTitleServer(activeMenu);
  var menuSubtitle = getMenuSubtitleServer(activeMenu);
  var tanggal = new Date().toLocaleDateString('id-ID', {weekday:'long',year:'numeric',month:'long',day:'numeric'});
  
  var html = '<!DOCTYPE html><html><head>';
  html += '<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">';
  html += '<title>Ayam Petelur</title>';
  html += '<style>';
  html += '*{box-sizing:border-box;margin:0;padding:0}';
  html += 'body{font-family:"Segoe UI",sans-serif;background:#f5f7fa;min-height:100vh}';
  
  // SIDEBAR
  html += '.sb{position:fixed;left:0;top:0;bottom:0;width:260px;background:linear-gradient(180deg,#1a1a2e,#16213e);color:#fff;padding:20px 0;overflow-y:auto;z-index:1000}';
  html += '.sb-h{padding:0 20px 20px;border-bottom:1px solid rgba(255,255,255,.1);margin-bottom:20px;text-align:center}';
  html += '.sb-h .logo{font-size:40px}.sb-h h2{font-size:16px;margin-top:10px}.sb-h p{font-size:11px;opacity:.7}';
  html += '.ms{padding:0 15px;margin-bottom:10px}';
  html += '.mst{font-size:10px;text-transform:uppercase;letter-spacing:1px;opacity:.5;padding:10px 10px 5px}';
  html += '.mi{display:flex;align-items:center;padding:12px 15px;border-radius:10px;cursor:pointer;transition:all .3s;margin-bottom:5px;text-decoration:none;color:rgba(255,255,255,.7)}';
  html += '.mi:hover{background:rgba(255,255,255,.1);color:#fff}';
  html += '.mi.active{background:linear-gradient(135deg,#4285F4,#34A853);color:#fff}';
  html += '.mi .ic{font-size:18px;margin-right:12px;width:24px;text-align:center}.mi .tx{font-size:14px}';
  
  // SIDEBAR FOOTER
  html += '.sf{position:absolute;bottom:0;left:0;right:0;padding:15px 20px;border-top:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.2)}';
  html += '.ui{display:flex;align-items:center;margin-bottom:10px}';
  html += '.ua{width:40px;height:40px;background:linear-gradient(135deg,#4285F4,#34A853);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;margin-right:10px}';
  html += '.un{font-size:14px;font-weight:600}.ur{font-size:11px;opacity:.7}';
  html += '.bl{width:100%;padding:10px;background:rgba(220,53,69,.2);color:#dc3545;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;transition:all .3s}';
  html += '.bl:hover{background:#dc3545;color:#fff}';
  
  // MAIN CONTENT
  html += '.mc{margin-left:260px;padding:20px;min-height:100vh}';
  html += '.ch{background:#fff;padding:20px 25px;border-radius:15px;margin-bottom:20px;box-shadow:0 2px 10px rgba(0,0,0,.05);display:flex;justify-content:space-between;align-items:center}';
  html += '.ch h1{font-size:24px;color:#333}.ch p{color:#666;font-size:14px;margin-top:5px}';
  html += '.cb{background:#fff;padding:25px;border-radius:15px;box-shadow:0 2px 10px rgba(0,0,0,.05);min-height:300px}';
  
  // TABLE
  html += '.dt{width:100%;border-collapse:collapse}.dt th,.dt td{padding:12px 15px;text-align:left;border-bottom:1px solid #eee}';
  html += '.dt th{background:#f8f9fa;font-weight:600;color:#555;font-size:12px;text-transform:uppercase}.dt tr:hover{background:#f8f9fa}';
  
  // BUTTONS
  html += '.btn{padding:10px 20px;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;transition:all .3s;display:inline-flex;align-items:center;gap:8px}';
  html += '.bp{background:#4285F4;color:#fff}.bp:hover{background:#3367D6}';
  html += '.bs{background:#34A853;color:#fff}.bs:hover{background:#2d8f47}';
  html += '.bw{background:#FBBC04;color:#333}.bw:hover{background:#e5a800}';
  html += '.bd{background:#dc3545;color:#fff}.bd:hover{background:#c82333}';
  html += '.bsm{padding:6px 12px;font-size:12px}';
  
  // FORM
  html += '.fg{margin-bottom:20px}.fg label{display:block;margin-bottom:8px;font-weight:600;color:#333;font-size:14px}';
  html += '.fc{width:100%;padding:12px 14px;border:2px solid #e0e0e0;border-radius:8px;font-size:14px;transition:all .3s}';
  html += '.fc:focus{outline:none;border-color:#4285F4}';
  html += '.fr{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px}';
  
  // KPI
  html += '.kg{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:15px;margin-bottom:25px}';
  html += '.kc{background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,.05);text-align:center}';
  html += '.kc .icon{font-size:32px;margin-bottom:10px}.kc .label{font-size:11px;color:#888;text-transform:uppercase}';
  html += '.kc .value{font-size:24px;font-weight:bold;color:#333;margin-top:5px}.kc .sub{font-size:11px;color:#aaa;margin-top:5px}';
  
  // ALERT
  html += '.al{padding:15px;border-radius:8px;margin-bottom:20px}';
  html += '.asi{background:#cce5ff;color:#004085}.asd{background:#f8d7da;color:#721c24}.ass{background:#d4edda;color:#155724}';
  
  // MOBILE
  html += '.mob{display:none;position:fixed;top:15px;left:15px;z-index:1001;background:#4285F4;color:#fff;border:none;padding:12px 15px;border-radius:10px;font-size:20px;cursor:pointer}';
  html += '@media(max-width:768px){.sb{transform:translateX(-100%);transition:transform .3s}.sb.open{transform:translateX(0)}.mc{margin-left:0;padding:70px 15px 15px}.mob{display:block}}';
  
  html += '</style></head><body>';
  
  // MOBILE BUTTON
  html += '<button class="mob" onclick="document.getElementById(\'sidebar\').classList.toggle(\'open\')">☰</button>';
  
  // SIDEBAR
  html += '<div class="sb" id="sidebar">';
  html += '<div class="sb-h"><div class="logo"> </div><h2>Ayam Petelur</h2><p>Sistem Pembukuan</p></div>';
  
  html += '<div class="ms"><div class="mst">Menu Utama</div>';
  html += '<a href="#" class="mi' + (activeMenu === 'dashboard' ? ' active' : '') + '" onclick="event.preventDefault();go(\'dashboard\')">';
  html += '<span class="ic"> </span><span class="tx">Dashboard</span></a></div>';
  
  html += '<div class="ms"><div class="mst">Pencatatan</div>';
  var menus = [
    {id:'kandang',ic:' ',tx:'Data Kandang'},
    {id:'inventaris',ic:' ',tx:'Inventaris Ayam'},
    {id:'pakan',ic:' ',tx:'Pakan'},
    {id:'produksi',ic:' ',tx:'Produksi Telur'},
    {id:'kematian',ic:' ',tx:'Kematian'}
  ];
  menus.forEach(function(m) {
    html += '<a href="#" class="mi' + (activeMenu === m.id ? ' active' : '') + '" onclick="event.preventDefault();go(\'' + m.id + '\')">';
    html += '<span class="ic">' + m.ic + '</span><span class="tx">' + m.tx + '</span></a>';
  });
  html += '</div>';
  
  html += '<div class="ms"><div class="mst">Keuangan</div>';
  var keu = [{id:'pengeluaran',ic:' ',tx:'Pengeluaran'},{id:'pemasukan',ic:' ',tx:'Pemasukan'}];
  keu.forEach(function(m) {
    html += '<a href="#" class="mi' + (activeMenu === m.id ? ' active' : '') + '" onclick="event.preventDefault();go(\'' + m.id + '\')">';
    html += '<span class="ic">' + m.ic + '</span><span class="tx">' + m.tx + '</span></a>';
  });
  html += '</div>';
  
  html += '<div class="ms"><div class="mst">Laporan</div>';
  html += '<a href="#" class="mi' + (activeMenu === 'laporan' ? ' active' : '') + '" onclick="event.preventDefault();go(\'laporan\')">';
  html += '<span class="ic"> </span><span class="tx">Laporan Bulanan</span></a></div>';
  
  // FOOTER
  html += '<div class="sf"><div class="ui"><div class="ua">👤</div><div><div class="un">' + user.nama + '</div><div class="ur">' + user.username + '</div></div></div>';
  html += '<button class="bl" onclick="doLogout()">  Logout</button></div>';
  html += '</div>';
  
  // MAIN CONTENT
  html += '<div class="mc"><div class="ch"><div><h1>' + menuTitle + '</h1><p>' + menuSubtitle + '</p></div><div>' + tanggal + '</div></div>';
  html += '<div class="cb" id="contentBody"><div style="text-align:center;padding:50px"><div style="font-size:48px;margin-bottom:20px">⏳</div><p>Memuat data...</p></div></div></div>';
  
  // JAVASCRIPT
  html += '<script>';
  html += 'var currentMenu="' + activeMenu + '";';
  
  // go() - navigasi via AJAX
  html += 'function go(menu){';
  html += 'currentMenu=menu;';
  html += 'document.querySelectorAll(".mi").forEach(function(el){el.classList.remove("active")});';
  html += 'var names=["dashboard","kandang","inventaris","pakan","produksi","kematian","pengeluaran","pemasukan","laporan"];';
  html += 'var idx=names.indexOf(menu);';
  html += 'var items=document.querySelectorAll(".mi");';
  html += 'if(idx>=0&&items[idx])items[idx].classList.add("active");';
  
  // Update header
  html += 'var titles={dashboard:"Dashboard",kandang:"Data Kandang",inventaris:"Inventaris Ayam",pakan:"Pencatatan Pakan",produksi:"Produksi Telur",kematian:"Kematian Ayam",pengeluaran:"Pengeluaran",pemasukan:"Pemasukan",laporan:"Laporan Keuangan"};';
  html += 'var subs={dashboard:"Ringkasan data peternakan",kandang:"Kelola data kandang",inventaris:"Pencatatan stok ayam",pakan:"Pencatatan pakan harian",produksi:"Pencatatan hasil telur",kematian:"Pencatatan kematian ayam",pengeluaran:"Catat semua pengeluaran",pemasukan:"Catat semua pemasukan",laporan:"Laporan keuangan bulanan"};';
  html += 'var h1=document.querySelector(".ch h1");var ps=document.querySelector(".ch p");';
  html += 'if(h1)h1.textContent=titles[menu]||"Dashboard";';
  html += 'if(ps)ps.textContent=subs[menu]||"";';
  
  // Loading
  html += 'var cb=document.getElementById("contentBody");';
  html += 'cb.innerHTML="<div style=\\"text-align:center;padding:50px\\"><div style=\\"font-size:48px;margin-bottom:20px\\">⏳</div><p>Memuat data...</p></div>";';
  html += 'clearTimeout(window._loadTimer);';
  html += 'window._loadTimer=setTimeout(function(){var c=document.getElementById("contentBody");if(c&&c.querySelector("p")&&c.querySelector("p").textContent==="Memuat data..."){c.innerHTML="<div class=\\"al asd\\"><b>Timeout:</b> Server tidak merespon dalam 30 detik. <button class=\\"btn bp bsm\\" onclick=\\"go(currentMenu)\\">Coba Lagi</button></div>";}},30000);';
  html += 'loadData(menu);';
  html += '}';
  
  // doLogout
  html += 'function doLogout(){if(confirm("Yakin ingin logout?")){google.script.run.logoutUser();location.reload();}}';
  
  // loadData - panggil server function sesuai menu
  html += 'function loadData(menu){';
  html += 'var el=document.getElementById("contentBody");';
  html += 'switch(menu){';
  html += 'case "dashboard":loadDashboard(el);break;';
  html += 'case "kandang":loadKandang(el);break;';
  html += 'case "inventaris":loadInventaris(el);break;';
  html += 'case "pakan":loadPakan(el);break;';
  html += 'case "produksi":loadProduksi(el);break;';
  html += 'case "kematian":loadKematian(el);break;';
  html += 'case "pengeluaran":loadPengeluaran(el);break;';
  html += 'case "pemasukan":loadPemasukan(el);break;';
  html += 'case "laporan":loadLaporan(el);break;';
  html += 'default:loadDashboard(el);';
  html += '}}';
  
  // Helper: safe call with error display
  html += 'function sc(fn,el,cb){';
  html += 'google.script.run';
  html += '.withSuccessHandler(function(d){cb(d,el);})';
  html += '.withFailureHandler(function(e){el.innerHTML="<div class=\\"al asd\\"><b>Error:</b> "+e.message+"</div>";})';
  html += '[fn];}';
  
  // DASHBOARD
  html += 'function loadDashboard(el){';
  html += 'google.script.run.withSuccessHandler(function(kpi){';
  html += 'var h="<div class=\\"kg\\">";';
  html += 'h+="<div class=\\"kc\\"><div class=\\"icon\\"> </div><div class=\\"label\\">Kandang</div><div class=\\"value\\">"+kpi.kandang.aktif+"</div></div>";';
  html += 'h+="<div class=\\"kc\\"><div class=\\"icon\\"> </div><div class=\\"label\\">Total Ayam</div><div class=\\"value\\">"+kpi.stokAyam.total.toLocaleString()+"</div></div>";';
  html += 'h+="<div class=\\"kc\\"><div class=\\"icon\\"> </div><div class=\\"label\\">Produksi</div><div class=\\"value\\">"+kpi.produksi.totalButir.toLocaleString()+"</div><div class=\\"sub\\">butir</div></div>";';
  html += 'h+="<div class=\\"kc\\"><div class=\\"icon\\"> </div><div class=\\"label\\">Pakan</div><div class=\\"value\\">"+kpi.pakan.totalKg.toLocaleString()+"</div><div class=\\"sub\\">kg</div></div>";';
  html += 'h+="<div class=\\"kc\\"><div class=\\"icon\\"> </div><div class=\\"label\\">Mortalitas</div><div class=\\"value\\">"+kpi.kematian.mortalitasPersen+"%</div></div>";';
  html += 'h+="<div class=\\"kc\\"><div class=\\"icon\\"> </div><div class=\\"label\\">Laba/Rugi</div><div class=\\"value\\">Rp "+kpi.keuangan.labaRugi.toLocaleString()+"</div></div>";';
  html += 'h+="</div>";';
  html += 'h+="<h3 style=\\"margin-bottom:15px\\">Detail Stok per Kandang</h3>";';
  html += 'h+="<table class=\\"dt\\"><thead><tr><th>Kandang</th><th>Kapasitas</th><th>Stok</th><th>Persentase</th></tr></thead><tbody>";';
  html += 'kpi.stokAyam.detail.forEach(function(i){';
  html += 'h+="<tr><td>"+i.nama+"</td><td>"+i.kapasitas.toLocaleString()+"</td><td>"+i.stok.toLocaleString()+"</td><td>"+i.persentase+"%</td></tr>";';
  html += '});h+="</tbody></table>";';
  html += 'el.innerHTML=h;';
  html += '}).withFailureHandler(function(e){el.innerHTML="<div class=\\"al asd\\"><b>Error:</b> "+e.message+"</div>";}).getKPIDashboard();';
  html += '}';
  
  // KANDANG
  html += 'function loadKandang(el){';
  html += 'google.script.run.withSuccessHandler(function(data){';
  html += 'var h="<div style=\\"margin-bottom:20px\\"><button class=\\"btn bp\\" onclick=\\"showFormKandang()\\">  Tambah Kandang</button></div>";';
  html += 'if(data.length===0){h+="<div class=\\"al asi\\">Belum ada data kandang</div>";}';
  html += 'else{h+="<table class=\\"dt\\"><thead><tr><th>ID</th><th>Nama</th><th>Kapasitas</th><th>Lokasi</th><th>Status</th><th>Aksi</th></tr></thead><tbody>";';
  html += 'data.forEach(function(k){';
  html += "h+=\"<tr><td>\"+k[\"ID\"]+\"</td><td>\"+k[\"Nama Kandang\"]+\"</td><td>\"+k[\"Kapasitas\"]+\"</td><td>\"+k[\"Lokasi\"]+\"</td><td>\"+k[\"Status\"]+\"</td><td><button class=\\\"btn bw bsm\\\" onclick=\\\"editKandang('\"+k[\"ID\"]+\"')\\\">Edit</button></td></tr>\";";
  html += '});h+="</tbody></table>";}el.innerHTML=h;';
  html += '}).withFailureHandler(function(e){el.innerHTML="<div class=\\"al asd\\"><b>Error:</b> "+e.message+"</div>";}).getAllKandang();';
  html += '}';
  
  // Show/Edit/Save functions inline
  html += 'function showFormKandang(){var h="<div class=\\"al asi\\"><h3>Tambah Kandang</h3>";';
  html += 'h+="<div class=\\"fg\\"><label>Nama Kandang</label><input type=\\"text\\" id=\\"fNama\\" class=\\"fc\\" placeholder=\\"Contoh: Kandang A1\\"></div>";';
  html += 'h+="<div class=\\"fg\\"><label>Kapasitas</label><input type=\\"number\\" id=\\"fKapasitas\\" class=\\"fc\\" placeholder=\\"Jumlah ekor\\"></div>";';
  html += 'h+="<div class=\\"fg\\"><label>Lokasi</label><input type=\\"text\\" id=\\"fLokasi\\" class=\\"fc\\" placeholder=\\"Lokasi kandang\\"></div>";';
  html += 'h+="<button class=\\"btn bs\\" onclick=\\"simpanKandang()\\">Simpan</button> <button class=\\"btn bd\\" onclick=\\"go(\'kandang\')\\">Batal</button></div>";';
  html += 'document.getElementById("contentBody").innerHTML=h;}';
  
  html += 'function simpanKandang(){';
  html += 'var n=document.getElementById("fNama").value,k=document.getElementById("fKapasitas").value,l=document.getElementById("fLokasi").value;';
  html += 'google.script.run.withSuccessHandler(function(){alert("Kandang berhasil ditambahkan!");go("kandang");})';
  html += '.withFailureHandler(function(e){alert("Error: "+e.message);}).tambahKandang(n,k,l);}';
  
  html += 'function editKandang(id){';
  html += 'google.script.run.withSuccessHandler(function(k){';
  html += 'var h="<div class=\\"al asi\\"><h3>Edit Kandang</h3>";';
  html += 'h+="<div class=\\"fg\\"><label>Nama</label><input type=\\"text\\" id=\\"fNama\\" class=\\"fc\\" value=\\""+k["Nama Kandang"]+"\\"></div>";';
  html += 'h+="<div class=\\"fg\\"><label>Kapasitas</label><input type=\\"number\\" id=\\"fKapasitas\\" class=\\"fc\\" value=\\""+k["Kapasitas"]+"\\"></div>";';
  html += 'h+="<div class=\\"fg\\"><label>Lokasi</label><input type=\\"text\\" id=\\"fLokasi\\" class=\\"fc\\" value=\\""+k["Lokasi"]+"\\"></div>";';
  html += 'h+="<div class=\\"fg\\"><label>Status</label><select id=\\"fStatus\\" class=\\"fc\\"><option value=\\"Aktif\\""+(k["Status"]==="Aktif"?" selected":"")+">Aktif</option><option value=\\"Non-Aktif\\""+(k["Status"]==="Non-Aktif"?" selected":"")+">Non-Aktif</option></select></div>";';
  html += "h+=\"<button class=\\\"btn bs\\\" onclick=\\\"updateKandang('\"+id+\"')\\\">Update</button> <button class=\\\"btn bd\\\" onclick=\\\"go('kandang')\\\">Batal</button></div>\";";
  html += 'document.getElementById("contentBody").innerHTML=h;}).getKandangById(id);}';
  
  html += 'function updateKandang(id){';
  html += 'var n=document.getElementById("fNama").value,k=document.getElementById("fKapasitas").value,l=document.getElementById("fLokasi").value,s=document.getElementById("fStatus").value;';
  html += 'google.script.run.withSuccessHandler(function(){alert("Kandang diupdate!");go("kandang");})';
  html += '.withFailureHandler(function(e){alert("Error: "+e.message);}).updateKandang(id,{nama:n,kapasitas:k,lokasi:l,status:s});}';
  
  // INVENTARIS
  html += 'function loadInventaris(el){';
  html += 'google.script.run.withSuccessHandler(function(stok){';
  html += 'var h="<div class=\\"kg\\"><div class=\\"kc\\"><div class=\\"icon\\"> </div><div class=\\"label\\">Total Ayam</div><div class=\\"value\\">"+stok.totalAyam.toLocaleString()+"</div></div></div>";';
  html += 'h+="<div style=\\"margin-bottom:20px\\"><button class=\\"btn bp\\" onclick=\\"showFormInventaris()\\">  Catat Ayam</button></div>";';
  html += 'h+="<table class=\\"dt\\"><thead><tr><th>Kandang</th><th>Kapasitas</th><th>Stok</th><th>Persentase</th></tr></thead><tbody>";';
  html += 'stok.detail.forEach(function(i){';
  html += 'h+="<tr><td>"+i.nama+"</td><td>"+i.kapasitas.toLocaleString()+"</td><td>"+i.stok.toLocaleString()+"</td><td>"+i.persentase+"%</td></tr>";';
  html += '});h+="</tbody></table>";el.innerHTML=h;';
  html += '}).withFailureHandler(function(e){el.innerHTML="<div class=\\"al asd\\"><b>Error:</b> "+e.message+"</div>";}).getRingkasanStok();';
  html += '}';
  
  html += 'function showFormInventaris(){';
  html += 'google.script.run.withSuccessHandler(function(kl){';
  html += 'var o="<option value=\\"\\">-- Pilih Kandang --</option>";';
  html += 'kl.forEach(function(k){o+="<option value=\\""+k[0]+"\\">"+k[1]+"</option>";});';
  html += 'var h="<div class=\\"al asi\\"><h3>Catat Ayam Masuk/Keluar</h3>";';
  html += 'h+="<div class=\\"fg\\"><label>Kandang</label><select id=\\"fKandang\\" class=\\"fc\\">"+o+"</select></div>";';
  html += 'h+="<div class=\\"fr\\"><div class=\\"fg\\"><label>Jumlah Masuk</label><input type=\\"number\\" id=\\"fMasuk\\" class=\\"fc\\" value=\\"0\\"></div>";';
  html += 'h+="<div class=\\"fg\\"><label>Jumlah Keluar</label><input type=\\"number\\" id=\\"fKeluar\\" class=\\"fc\\" value=\\"0\\"></div></div>";';
  html += 'h+="<div class=\\"fg\\"><label>Keterangan</label><input type=\\"text\\" id=\\"fKet\\" class=\\"fc\\"></div>";';
  html += 'h+="<button class=\\"btn bs\\" onclick=\\"simpanInventaris()\\">Simpan</button> <button class=\\"btn bd\\" onclick=\\"go(\'inventaris\')\\">Batal</button></div>";';
  html += 'document.getElementById("contentBody").innerHTML=h;}).getKandangDropdown();}';
  
  html += 'function simpanInventaris(){';
  html += 'var k=document.getElementById("fKandang").value,m=document.getElementById("fMasuk").value,o=document.getElementById("fKeluar").value,t=document.getElementById("fKet").value;';
  html += 'google.script.run.withSuccessHandler(function(){alert("Berhasil disimpan!");go("inventaris");})';
  html += '.withFailureHandler(function(e){alert("Error: "+e.message);}).tambahInventaris(k,m,o,t);}';
  
  // PAKAN
  html += 'function loadPakan(el){';
  html += 'google.script.run.withSuccessHandler(function(data){';
  html += 'var h="<div style=\\"margin-bottom:20px\\"><button class=\\"btn bp\\" onclick=\\"showFormPakan()\\">  Catat Pakan</button></div>";';
  html += 'if(data.length===0){h+="<div class=\\"al asi\\">Belum ada data pakan</div>";}';
  html += 'else{h+="<table class=\\"dt\\"><thead><tr><th>Tanggal</th><th>Kandang</th><th>Jenis</th><th>Jumlah(kg)</th><th>Biaya</th></tr></thead><tbody>";';
  html += 'data.slice(-10).reverse().forEach(function(p){';
  html += 'h+="<tr><td>"+new Date(p["Tanggal"]).toLocaleDateString("id-ID")+"</td><td>"+p["Nama Kandang"]+"</td><td>"+p["Jenis Pakan"]+"</td><td>"+p["Jumlah (kg)"]+"</td><td>Rp "+(p["Biaya (Rp)"]||0).toLocaleString()+"</td></tr>";';
  html += '});h+="</tbody></table>";}el.innerHTML=h;';
  html += '}).withFailureHandler(function(e){el.innerHTML="<div class=\\"al asd\\"><b>Error:</b> "+e.message+"</div>";}).getAllPakan();';
  html += '}';
  
  html += 'function showFormPakan(){';
  html += 'google.script.run.withSuccessHandler(function(kl){';
  html += 'var o="<option value=\\"\\">-- Pilih Kandang --</option>";';
  html += 'kl.forEach(function(k){o+="<option value=\\""+k[0]+"\\">"+k[1]+"</option>";});';
  html += 'var h="<div class=\\"al asi\\"><h3>Catat Pakan</h3>";';
  html += 'h+="<div class=\\"fg\\"><label>Kandang</label><select id=\\"fKandang\\" class=\\"fc\\">"+o+"</select></div>";';
  html += 'h+="<div class=\\"fg\\"><label>Jenis Pakan</label><select id=\\"fJenis\\" class=\\"fc\\"><option value=\\"\\">-- Pilih --</option><option value=\\"Starter\\">Starter</option><option value=\\"Grower\\">Grower</option><option value=\\"Layer\\">Layer</option><option value=\\"Koncentrat\\">Koncentrat</option><option value=\\"Lainnya\\">Lainnya</option></select></div>";';
  html += 'h+="<div class=\\"fr\\"><div class=\\"fg\\"><label>Jumlah(kg)</label><input type=\\"number\\" id=\\"fJumlah\\" class=\\"fc\\"></div>";';
  html += 'h+="<div class=\\"fg\\"><label>Biaya(Rp)</label><input type=\\"number\\" id=\\"fBiaya\\" class=\\"fc\\"></div></div>";';
  html += 'h+="<div class=\\"fg\\"><label>Keterangan</label><input type=\\"text\\" id=\\"fKet\\" class=\\"fc\\"></div>";';
  html += 'h+="<button class=\\"btn bs\\" onclick=\\"simpanPakan()\\">Simpan</button> <button class=\\"btn bd\\" onclick=\\"go(\'pakan\')\\">Batal</button></div>";';
  html += 'document.getElementById("contentBody").innerHTML=h;}).getKandangDropdown();}';
  
  html += 'function simpanPakan(){';
  html += 'var k=document.getElementById("fKandang").value,j=document.getElementById("fJenis").value,n=document.getElementById("fJumlah").value,b=document.getElementById("fBiaya").value,t=document.getElementById("fKet").value;';
  html += 'google.script.run.withSuccessHandler(function(){alert("Berhasil disimpan!");go("pakan");})';
  html += '.withFailureHandler(function(e){alert("Error: "+e.message);}).tambahPakan(k,j,n,b,t);}';
  
  // PRODUKSI
  html += 'function loadProduksi(el){';
  html += 'google.script.run.withSuccessHandler(function(data){';
  html += 'var h="<div style=\\"margin-bottom:20px\\"><button class=\\"btn bp\\" onclick=\\"showFormProduksi()\\">  Catat Produksi</button></div>";';
  html += 'if(data.length===0){h+="<div class=\\"al asi\\">Belum ada data produksi</div>";}';
  html += 'else{h+="<table class=\\"dt\\"><thead><tr><th>Tanggal</th><th>Kandang</th><th>Butir</th><th>Kg</th><th>Nilai</th></tr></thead><tbody>";';
  html += 'data.slice(-10).reverse().forEach(function(p){';
  html += 'h+="<tr><td>"+new Date(p["Tanggal"]).toLocaleDateString("id-ID")+"</td><td>"+p["Nama Kandang"]+"</td><td>"+(p["Jumlah Butir"]||0).toLocaleString()+"</td><td>"+(p["Jumlah (kg)"]||0)+"</td><td>Rp "+(p["Total Nilai"]||0).toLocaleString()+"</td></tr>";';
  html += '});h+="</tbody></table>";}el.innerHTML=h;';
  html += '}).withFailureHandler(function(e){el.innerHTML="<div class=\\"al asd\\"><b>Error:</b> "+e.message+"</div>";}).getAllProduksi();';
  html += '}';
  
  html += 'function showFormProduksi(){';
  html += 'google.script.run.withSuccessHandler(function(kl){';
  html += 'var o="<option value=\\"\\">-- Pilih Kandang --</option>";';
  html += 'kl.forEach(function(k){o+="<option value=\\""+k[0]+"\\">"+k[1]+"</option>";});';
  html += 'var h="<div class=\\"al asi\\"><h3>Catat Produksi Telur</h3>";';
  html += 'h+="<div class=\\"fg\\"><label>Kandang</label><select id=\\"fKandang\\" class=\\"fc\\">"+o+"</select></div>";';
  html += 'h+="<div class=\\"fr\\"><div class=\\"fg\\"><label>Jumlah(Butir)</label><input type=\\"number\\" id=\\"fButir\\" class=\\"fc\\"></div>";';
  html += 'h+="<div class=\\"fg\\"><label>Jumlah(Kg)</label><input type=\\"number\\" id=\\"fKg\\" class=\\"fc\\"></div></div>";';
  html += 'h+="<div class=\\"fg\\"><label>Harga Jual/kg(Rp)</label><input type=\\"number\\" id=\\"fHarga\\" class=\\"fc\\"></div>";';
  html += 'h+="<div class=\\"fg\\"><label>Keterangan</label><input type=\\"text\\" id=\\"fKet\\" class=\\"fc\\"></div>";';
  html += 'h+="<button class=\\"btn bs\\" onclick=\\"simpanProduksi()\\">Simpan</button> <button class=\\"btn bd\\" onclick=\\"go(\'produksi\')\\">Batal</button></div>";';
  html += 'document.getElementById("contentBody").innerHTML=h;}).getKandangDropdown();}';
  
  html += 'function simpanProduksi(){';
  html += 'var k=document.getElementById("fKandang").value,b=document.getElementById("fButir").value,g=document.getElementById("fKg").value,h=document.getElementById("fHarga").value,t=document.getElementById("fKet").value;';
  html += 'google.script.run.withSuccessHandler(function(){alert("Berhasil disimpan!");go("produksi");})';
  html += '.withFailureHandler(function(e){alert("Error: "+e.message);}).tambahProduksi(k,b,g,h,t);}';
  
  // KEMATIAN
  html += 'function loadKematian(el){';
  html += 'google.script.run.withSuccessHandler(function(data){';
  html += 'var h="<div style=\\"margin-bottom:20px\\"><button class=\\"btn bp\\" onclick=\\"showFormKematian()\\">  Catat Kematian</button></div>";';
  html += 'if(data.length===0){h+="<div class=\\"al asi\\">Belum ada data kematian</div>";}';
  html += 'else{h+="<table class=\\"dt\\"><thead><tr><th>Tanggal</th><th>Kandang</th><th>Jumlah</th><th>Penyebab</th></tr></thead><tbody>";';
  html += 'data.slice(-10).reverse().forEach(function(k){';
  html += 'h+="<tr><td>"+new Date(k["Tanggal"]).toLocaleDateString("id-ID")+"</td><td>"+k["Nama Kandang"]+"</td><td>"+k["Jumlah"]+"</td><td>"+k["Penyebab"]+"</td></tr>";';
  html += '});h+="</tbody></table>";}el.innerHTML=h;';
  html += '}).withFailureHandler(function(e){el.innerHTML="<div class=\\"al asd\\"><b>Error:</b> "+e.message+"</div>";}).getAllKematian();';
  html += '}';
  
  html += 'function showFormKematian(){';
  html += 'google.script.run.withSuccessHandler(function(kl){';
  html += 'var o="<option value=\\"\\">-- Pilih Kandang --</option>";';
  html += 'kl.forEach(function(k){o+="<option value=\\""+k[0]+"\\">"+k[1]+"</option>";});';
  html += 'var h="<div class=\\"al asi\\"><h3>Catat Kematian Ayam</h3>";';
  html += 'h+="<div class=\\"fg\\"><label>Kandang</label><select id=\\"fKandang\\" class=\\"fc\\">"+o+"</select></div>";';
  html += 'h+="<div class=\\"fg\\"><label>Jumlah Mati</label><input type=\\"number\\" id=\\"fJumlah\\" class=\\"fc\\"></div>";';
  html += 'h+="<div class=\\"fg\\"><label>Penyebab</label><select id=\\"fPenyebab\\" class=\\"fc\\"><option value=\\"\\">-- Pilih --</option><option value=\\"Penyakit\\">Penyakit</option><option value=\\"Cuaca Ekstrem\\">Cuaca Ekstrem</option><option value=\\"Kecelakaan\\">Kecelakaan</option><option value=\\"Predator\\">Predator</option><option value=\\"Lainnya\\">Lainnya</option></select></div>";';
  html += 'h+="<div class=\\"fg\\"><label>Keterangan</label><input type=\\"text\\" id=\\"fKet\\" class=\\"fc\\"></div>";';
  html += 'h+="<button class=\\"btn bs\\" onclick=\\"simpanKematian()\\">Simpan</button> <button class=\\"btn bd\\" onclick=\\"go(\'kematian\')\\">Batal</button></div>";';
  html += 'document.getElementById("contentBody").innerHTML=h;}).getKandangDropdown();}';
  
  html += 'function simpanKematian(){';
  html += 'var k=document.getElementById("fKandang").value,j=document.getElementById("fJumlah").value,p=document.getElementById("fPenyebab").value,t=document.getElementById("fKet").value;';
  html += 'google.script.run.withSuccessHandler(function(){alert("Berhasil disimpan!");go("kematian");})';
  html += '.withFailureHandler(function(e){alert("Error: "+e.message);}).tambahKematian(k,j,p,t);}';
  
  // PENGELUARAN
  html += 'function loadPengeluaran(el){';
  html += 'google.script.run.withSuccessHandler(function(data){';
  html += 'var h="<div style=\\"margin-bottom:20px\\"><button class=\\"btn bp\\" onclick=\\"showFormPengeluaran()\\">  Catat Pengeluaran</button></div>";';
  html += 'if(data.length===0){h+="<div class=\\"al asi\\">Belum ada data pengeluaran</div>";}';
  html += 'else{h+="<table class=\\"dt\\"><thead><tr><th>Tanggal</th><th>Kategori</th><th>Deskripsi</th><th>Jumlah</th></tr></thead><tbody>";';
  html += 'data.slice(-10).reverse().forEach(function(p){';
  html += 'h+="<tr><td>"+new Date(p["Tanggal"]).toLocaleDateString("id-ID")+"</td><td>"+p["Kategori"]+"</td><td>"+p["Deskripsi"]+"</td><td>Rp "+(p["Jumlah (Rp)"]||0).toLocaleString()+"</td></tr>";';
  html += '});h+="</tbody></table>";}el.innerHTML=h;';
  html += '}).withFailureHandler(function(e){el.innerHTML="<div class=\\"al asd\\"><b>Error:</b> "+e.message+"</div>";}).getAllPengeluaran();';
  html += '}';
  
  html += 'function showFormPengeluaran(){';
  html += 'google.script.run.withSuccessHandler(function(kl){';
  html += 'var o="<option value=\\"\\">-- Tidak Terikat --</option>";';
  html += 'kl.forEach(function(k){o+="<option value=\\""+k[0]+"\\">"+k[1]+"</option>";});';
  html += 'var h="<div class=\\"al asi\\"><h3>Catat Pengeluaran</h3>";';
  html += 'h+="<div class=\\"fg\\"><label>Kategori</label><select id=\\"fKategori\\" class=\\"fc\\"><option value=\\"\\">-- Pilih --</option><option value=\\"Pakan\\">Pakan</option><option value=\\"Obat/Vitamin\\">Obat/Vitamin</option><option value=\\"Tenaga Kerja\\">Tenaga Kerja</option><option value=\\"Listrik/Air\\">Listrik/Air</option><option value=\\"Perawatan\\">Perawatan</option><option value=\\"Lainnya\\">Lainnya</option></select></div>";';
  html += 'h+="<div class=\\"fg\\"><label>Deskripsi</label><input type=\\"text\\" id=\\"fDeskripsi\\" class=\\"fc\\"></div>";';
  html += 'h+="<div class=\\"fg\\"><label>Jumlah(Rp)</label><input type=\\"number\\" id=\\"fJumlah\\" class=\\"fc\\"></div>";';
  html += 'h+="<div class=\\"fg\\"><label>Kandang(Opsional)</label><select id=\\"fKandang\\" class=\\"fc\\">"+o+"</select></div>";';
  html += 'h+="<div class=\\"fg\\"><label>Keterangan</label><input type=\\"text\\" id=\\"fKet\\" class=\\"fc\\"></div>";';
  html += 'h+="<button class=\\"btn bs\\" onclick=\\"simpanPengeluaran()\\">Simpan</button> <button class=\\"btn bd\\" onclick=\\"go(\'pengeluaran\')\\">Batal</button></div>";';
  html += 'document.getElementById("contentBody").innerHTML=h;}).getKandangDropdown();}';
  
  html += 'function simpanPengeluaran(){';
  html += 'var g=document.getElementById("fKategori").value,d=document.getElementById("fDeskripsi").value,j=document.getElementById("fJumlah").value,k=document.getElementById("fKandang").value,t=document.getElementById("fKet").value;';
  html += 'google.script.run.withSuccessHandler(function(){alert("Berhasil dicatat!");go("pengeluaran");})';
  html += '.withFailureHandler(function(e){alert("Error: "+e.message);}).tambahPengeluaran(g,d,j,k,t);}';
  
  // PEMASUKAN
  html += 'function loadPemasukan(el){';
  html += 'google.script.run.withSuccessHandler(function(data){';
  html += 'var h="<div style=\\"margin-bottom:20px\\"><button class=\\"btn bp\\" onclick=\\"showFormPemasukan()\\">  Catat Pemasukan</button></div>";';
  html += 'if(data.length===0){h+="<div class=\\"al asi\\">Belum ada data pemasukan</div>";}';
  html += 'else{h+="<table class=\\"dt\\"><thead><tr><th>Tanggal</th><th>Kategori</th><th>Deskripsi</th><th>Jumlah</th></tr></thead><tbody>";';
  html += 'data.slice(-10).reverse().forEach(function(p){';
  html += 'h+="<tr><td>"+new Date(p["Tanggal"]).toLocaleDateString("id-ID")+"</td><td>"+p["Kategori"]+"</td><td>"+p["Deskripsi"]+"</td><td>Rp "+(p["Jumlah (Rp)"]||0).toLocaleString()+"</td></tr>";';
  html += '});h+="</tbody></table>";}el.innerHTML=h;';
  html += '}).withFailureHandler(function(e){el.innerHTML="<div class=\\"al asd\\"><b>Error:</b> "+e.message+"</div>";}).getAllPemasukan();';
  html += '}';
  
  html += 'function showFormPemasukan(){';
  html += 'google.script.run.withSuccessHandler(function(kl){';
  html += 'var o="<option value=\\"\\">-- Tidak Terikat --</option>";';
  html += 'kl.forEach(function(k){o+="<option value=\\""+k[0]+"\\">"+k[1]+"</option>";});';
  html += 'var h="<div class=\\"al asi\\"><h3>Catat Pemasukan</h3>";';
  html += 'h+="<div class=\\"fg\\"><label>Kategori</label><select id=\\"fKategori\\" class=\\"fc\\"><option value=\\"\\">-- Pilih --</option><option value=\\"Penjualan Telur\\">Penjualan Telur</option><option value=\\"Penjualan Ayam Afkir\\">Penjualan Ayam Afkir</option><option value=\\"Subsidi\\">Subsidi</option><option value=\\"Lainnya\\">Lainnya</option></select></div>";';
  html += 'h+="<div class=\\"fg\\"><label>Deskripsi</label><input type=\\"text\\" id=\\"fDeskripsi\\" class=\\"fc\\"></div>";';
  html += 'h+="<div class=\\"fg\\"><label>Jumlah(Rp)</label><input type=\\"number\\" id=\\"fJumlah\\" class=\\"fc\\"></div>";';
  html += 'h+="<div class=\\"fg\\"><label>Kandang(Opsional)</label><select id=\\"fKandang\\" class=\\"fc\\">"+o+"</select></div>";';
  html += 'h+="<div class=\\"fg\\"><label>Keterangan</label><input type=\\"text\\" id=\\"fKet\\" class=\\"fc\\"></div>";';
  html += 'h+="<button class=\\"btn bs\\" onclick=\\"simpanPemasukan()\\">Simpan</button> <button class=\\"btn bd\\" onclick=\\"go(\'pemasukan\')\\">Batal</button></div>";';
  html += 'document.getElementById("contentBody").innerHTML=h;}).getKandangDropdown();}';
  
  html += 'function simpanPemasukan(){';
  html += 'var g=document.getElementById("fKategori").value,d=document.getElementById("fDeskripsi").value,j=document.getElementById("fJumlah").value,k=document.getElementById("fKandang").value,t=document.getElementById("fKet").value;';
  html += 'google.script.run.withSuccessHandler(function(){alert("Berhasil dicatat!");go("pemasukan");})';
  html += '.withFailureHandler(function(e){alert("Error: "+e.message);}).tambahPemasukan(g,d,j,k,t);}';
  
  // LAPORAN
  html += 'function loadLaporan(el){';
  html += 'var now=new Date(),bl=now.getMonth()+1,th=now.getFullYear();';
  html += 'google.script.run.withSuccessHandler(function(lr){';
  html += 'var h="<div class=\\"kg\\">";';
  html += 'h+="<div class=\\"kc\\"><div class=\\"icon\\"> </div><div class=\\"label\\">Pemasukan</div><div class=\\"value\\">Rp "+lr.totalPemasukan.toLocaleString()+"</div></div>";';
  html += 'h+="<div class=\\"kc\\"><div class=\\"icon\\"> </div><div class=\\"label\\">Pengeluaran</div><div class=\\"value\\">Rp "+lr.totalPengeluaran.toLocaleString()+"</div></div>";';
  html += 'h+="<div class=\\"kc\\"><div class=\\"icon\\"> </div><div class=\\"label\\">"+lr.status+"</div><div class=\\"value\\">Rp "+Math.abs(lr.labaRugi).toLocaleString()+"</div></div>";';
  html += 'h+="</div>";';
  html += 'h+="<div style=\\"margin-bottom:20px\\"><button class=\\"btn bp\\" onclick=\\"genLaporan()\\">  Generate Laporan</button></div>";';
  html += 'h+="<h3>Detail Pemasukan</h3>";';
  html += 'if(Object.keys(lr.detailPemasukan).length>0){h+="<table class=\\"dt\\"><thead><tr><th>Kategori</th><th>Jumlah</th></tr></thead><tbody>";';
  html += 'Object.entries(lr.detailPemasukan).forEach(function(kv){h+="<tr><td>"+kv[0]+"</td><td>Rp "+kv[1].toLocaleString()+"</td></tr>";});';
  html += 'h+="</tbody></table>";}';
  html += 'h+="<h3 style=\\"margin-top:20px\\">Detail Pengeluaran</h3>";';
  html += 'if(Object.keys(lr.detailPengeluaran).length>0){h+="<table class=\\"dt\\"><thead><tr><th>Kategori</th><th>Jumlah</th></tr></thead><tbody>";';
  html += 'Object.entries(lr.detailPengeluaran).forEach(function(kv){h+="<tr><td>"+kv[0]+"</td><td>Rp "+kv[1].toLocaleString()+"</td></tr>";});';
  html += 'h+="</tbody></table>";}';
  html += 'el.innerHTML=h;}).withFailureHandler(function(e){el.innerHTML="<div class=\\"al asd\\"><b>Error:</b> "+e.message+"</div>";}).hitungLabaRugi(bl,th);';
  html += '}';
  
  html += 'function genLaporan(){';
  html += 'var now=new Date();';
  html += 'google.script.run.withSuccessHandler(function(){alert("Laporan berhasil di-generate di Google Sheets!");})';
  html += '.withFailureHandler(function(e){alert("Error: "+e.message);}).buatLaporanBulanan(now.getMonth()+1,now.getFullYear());}';
  
  html += 'window.onload=function(){loadData("' + activeMenu + '");};';
  html += '</script></body></html>';
  
  return HtmlService.createHtmlOutput(html)
    .setTitle('Ayam Petelur - Sistem Pembukuan')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getMenuTitleServer(menu) {
  var t = {dashboard:'Dashboard',kandang:'Data Kandang',inventaris:'Inventaris Ayam',pakan:'Pencatatan Pakan',produksi:'Produksi Telur',kematian:'Kematian Ayam',pengeluaran:'Pengeluaran',pemasukan:'Pemasukan',laporan:'Laporan Keuangan'};
  return t[menu] || 'Dashboard';
}

function getMenuSubtitleServer(menu) {
  var s = {dashboard:'Ringkasan data peternakan',kandang:'Kelola data kandang',inventaris:'Pencatatan stok ayam',pakan:'Pencatatan pakan harian',produksi:'Pencatatan hasil telur',kematian:'Pencatatan kematian ayam',pengeluaran:'Catat semua pengeluaran',pemasukan:'Catat semua pemasukan',laporan:'Laporan keuangan bulanan'};
  return s[menu] || '';
}
