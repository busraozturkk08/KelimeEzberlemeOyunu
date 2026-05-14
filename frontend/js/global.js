/* ==========================================================================
   KELİME EZBER SİSTEMİ - ORTAK JAVASCRIPT DOSYASI (global.js)
   Tüm sayfalarda geçerli olan fonksiyonlar burada yer alır.
   ========================================================================== */

const API_BASE_URL = "http://10.49.169.149:5000/api";
// --- Gece/Gündüz Modu ---
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    
    // Eğer ayarlar sayfasındaysak ve etiket varsa onu da güncelle
    const themeLabel = document.getElementById('themeLabel');
    if (themeLabel) {
        if (body.classList.contains('dark-mode')) {
            themeLabel.innerText = "🌙 Gece Modu Aktif";
            themeLabel.className = "badge bg-primary mt-2 px-3 py-2";
        } else {
            themeLabel.innerText = "☀️ Gündüz Modu Aktif";
            themeLabel.className = "badge bg-secondary mt-2 px-3 py-2";
        }
    }
}

// --- Profil Fotoğrafı Önizleme ---
function previewProfileImage(event) {
    const input = event.target;
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Profil sayfasındaki büyük resmi güncelle
            const mainAvatar = document.getElementById('mainAvatar');
            if (mainAvatar) mainAvatar.src = e.target.result;
            
            // Tüm sayfalardaki (Header'daki) küçük profil resmini güncelle
            const headerAvatar = document.getElementById('headerAvatar');
            if (headerAvatar) headerAvatar.src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}