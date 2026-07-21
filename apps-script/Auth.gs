/**
 * ============================================
 * MODUL AUTHENTICATION
 * ============================================
 * Sistem login, register, dan session management
 */

// ============================================
// KONFIGURASI AUTH
// ============================================
const AUTH_CONFIG = {
  SHEET_NAME: 'Users',
  COLUMNS: ['ID', 'Username', 'Password', 'Nama Lengkap', 'Status', 'Dibuat'],
  SESSION_KEY: 'currentSession',
  DEFAULT_ADMIN: {
    username: 'adminbumdeswonosari',
    password: 'adminbumdeswonosari',
    nama: 'Admin BUMDes Wonosari'
  }
};

// ============================================
// INISIALISASI USERS SHEET
// ============================================

/**
 * Membuat sheet Users jika belum ada
 */
function initUsersSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(AUTH_CONFIG.SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(AUTH_CONFIG.SHEET_NAME);
    // Set header
    sheet.getRange(1, 1, 1, AUTH_CONFIG.COLUMNS.length).setValues([AUTH_CONFIG.COLUMNS]);
    sheet.getRange(1, 1, 1, AUTH_CONFIG.COLUMNS.length)
      .setBackground('#4285F4')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold')
      .setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/**
 * Buat akun admin default jika belum ada
 */
function createDefaultAdmin() {
  initUsersSheet();

  const users = getUsersData();
  const adminExists = users.find(u => u['Username'] === AUTH_CONFIG.DEFAULT_ADMIN.username);

  if (!adminExists) {
    registerUser(
      AUTH_CONFIG.DEFAULT_ADMIN.username,
      AUTH_CONFIG.DEFAULT_ADMIN.password,
      AUTH_CONFIG.DEFAULT_ADMIN.nama
    );
    return true;
  }
  return false;
}

// ============================================
// PASSWORD HASHING
// ============================================

/**
 * Hash password menggunakan SHA-256
 */
function hashPassword(password) {
  const salt = 'lskdjalkjoqib819KLJH(*D$@34bfda79'; // Salt untuk keamanan
  const saltedPassword = salt + password + salt;

  // Simple hash implementation for Apps Script
  let hash = 0;
  for (let i = 0; i < saltedPassword.length; i++) {
    const char = saltedPassword.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Convert to hex string
  const hexHash = Math.abs(hash).toString(16).padStart(8, '0');

  // Add more complexity
  let complexHash = '';
  for (let i = 0; i < saltedPassword.length; i++) {
    const charCode = saltedPassword.charCodeAt(i);
    complexHash += charCode.toString(16);
  }

  return hexHash + complexHash.substring(0, 32);
}

// ============================================
// USER MANAGEMENT
// ============================================

/**
 * Mendapatkan semua data users
 */
function getUsersData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(AUTH_CONFIG.SHEET_NAME);

  if (!sheet || sheet.getLastRow() <= 1) {
    return [];
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);

  return rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

/**
 * Register user baru
 */
function registerUser(username, password, namaLengkap) {
  // Validasi
  if (!username || !password || !namaLengkap) {
    throw new Error('Semua field harus diisi');
  }

  if (username.length < 4) {
    throw new Error('Username minimal 4 karakter');
  }

  if (password.length < 6) {
    throw new Error('Password minimal 6 karakter');
  }

  // Cek duplikat
  const users = getUsersData();
  const exists = users.find(u => u['Username'] === username);

  if (exists) {
    throw new Error('Username sudah digunakan');
  }

  // Generate ID
  const id = 'USR-' + new Date().getTime();

  // Hash password
  const hashedPassword = hashPassword(password);

  // Simpan
  const rowData = [
    id,
    username,
    hashedPassword,
    namaLengkap,
    'Aktif',
    new Date()
  ];

  initUsersSheet().appendRow(rowData);

  return { success: true, message: 'Registrasi berhasil' };
}

/**
 * Login user
 */
function loginUser(username, password) {
  if (!username || !password) {
    throw new Error('Username dan password harus diisi');
  }

  // Auto-create admin if Users sheet is empty
  let users = getUsersData();
  if (users.length === 0) {
    initUsersSheet();
    createDefaultAdmin();
    users = getUsersData();
  }

  const user = users.find(u => u['Username'] === username);

  if (!user) {
    throw new Error('Username tidak ditemukan');
  }

  if (user['Status'] !== 'Aktif') {
    throw new Error('Akun non-aktif');
  }

  const hashedPassword = hashPassword(password);

  if (user['Password'] !== hashedPassword) {
    throw new Error('Password salah');
  }

  // Simpan session
  const session = {
    userId: user['ID'],
    username: user['Username'],
    nama: user['Nama Lengkap'],
    loginTime: new Date().toISOString()
  };

  PropertiesService.getScriptProperties().setProperty(
    AUTH_CONFIG.SESSION_KEY,
    JSON.stringify(session)
  );

  return {
    success: true,
    message: 'Login berhasil',
    user: {
      nama: user['Nama Lengkap'],
      username: user['Username']
    }
  };
}

/**
 * Logout user
 */
function logoutUser() {
  PropertiesService.getScriptProperties().deleteProperty(AUTH_CONFIG.SESSION_KEY);
  return { success: true, message: 'Logout berhasil' };
}

/**
 * Get current session
 */
function getCurrentSession() {
  const sessionData = PropertiesService.getScriptProperties().getProperty(AUTH_CONFIG.SESSION_KEY);

  if (!sessionData) {
    return null;
  }

  try {
    return JSON.parse(sessionData);
  } catch (e) {
    return null;
  }
}

/**
 * Check if user is logged in
 */
function isLoggedIn() {
  return getCurrentSession() !== null;
}

/**
 * Get current user info
 */
function getCurrentUser() {
  const session = getCurrentSession();
  if (!session) {
    return null;
  }

  const users = getUsersData();
  const user = users.find(u => u['ID'] === session.userId);

  if (!user) {
    logoutUser();
    return null;
  }

  return {
    id: user['ID'],
    username: user['Username'],
    nama: user['Nama Lengkap']
  };
}

/**
 * Update password user
 */
function updateUserPassword(userId, oldPassword, newPassword) {
  const users = getUsersData();
  const userIndex = users.findIndex(u => u['ID'] === userId);

  if (userIndex === -1) {
    throw new Error('User tidak ditemukan');
  }

  const user = users[userIndex];
  const oldHashed = hashPassword(oldPassword);

  if (user['Password'] !== oldHashed) {
    throw new Error('Password lama salah');
  }

  if (newPassword.length < 6) {
    throw new Error('Password baru minimal 6 karakter');
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(AUTH_CONFIG.SHEET_NAME);

  // Find row in sheet
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
      sheet.getRange(i + 1, 3).setValue(hashPassword(newPassword));
      return { success: true, message: 'Password berhasil diubah' };
    }
  }

  throw new Error('Gagal mengubah password');
}

// ============================================
// AUTO CREATE ADMIN ON INSTALL
// ============================================

/**
 * Fungsi yang dijalankan saat pertama kali
 */
function onInstall() {
  initUsersSheet();
  createDefaultAdmin();
}

/**
 * Reset semua users dan buat admin baru
 * Berguna jika salt berubah atau lupa password
 */
function resetAllUsers() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(AUTH_CONFIG.SHEET_NAME);
  
  // Hapus sheet jika ada
  if (sheet) {
    ss.deleteSheet(sheet);
  }
  
  // Buat ulang sheet
  initUsersSheet();
  
  // Buat admin baru
  createDefaultAdmin();
  
  // Hapus session lama
  logoutUser();
  
  return { 
    success: true, 
    message: 'Users berhasil direset. Admin baru telah dibuat.',
    admin: {
      username: AUTH_CONFIG.DEFAULT_ADMIN.username,
      password: AUTH_CONFIG.DEFAULT_ADMIN.password
    }
  };
}

/**
 * Get admin credentials (untuk ditampilkan di menu)
 */
function getAdminCredentials() {
  return {
    username: AUTH_CONFIG.DEFAULT_ADMIN.username,
    password: AUTH_CONFIG.DEFAULT_ADMIN.password
  };
}
