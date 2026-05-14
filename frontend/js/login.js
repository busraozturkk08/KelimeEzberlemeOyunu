/* ==========================================================================
   KELİME EZBER SİSTEMİ - GİRİŞ SAYFASI (login.js)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // Formu ID'si ile yakalıyoruz
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault(); // Sayfa yenilenmesini engelle

            // Kullanıcının girdiği bilgileri HTML'den alıyoruz
            const emailInput = document.getElementById("username").value;
            const passwordInput = document.getElementById("password").value;

            // 1. Backend'e gönderilecek JSON paketini hazırlıyoruz
            const loginData = {
                email: emailInput,
                sifre: passwordInput
            };

            console.log("Giriş denemesi yapılıyor:", loginData.email);

            // 2. Fetch ile Backend'e (API) POST isteği atıyoruz
            // UYARI: API_BASE_URL değişkeninin global.js içinde (const API_BASE_URL = "http://localhost:3000/api";) tanımlı olduğundan emin ol.
            fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData) // JavaScript objesini JSON metnine çevirip yolluyoruz
            })
            .then(response => response.json()) // Gelen cevabı JSON formatında oku
            .then(data => {
                // 3. Backend'den gelen cevaba (data) göre işlem yapıyoruz
                if (data.basarili) { 
                    // Giriş başarılıysa onay ver ve yönlendir
                    alert("Giriş Başarılı! Yönlendiriliyorsunuz...");
                    
                    // İleride backend'den gelen güvenlik anahtarını (token) kaydetmek istersen burayı açarsın:
                    // localStorage.setItem('token', data.token);
                    
                    window.location.href = "dashboard.html";
                } else {
                    // Şifre veya e-posta yanlışsa backend'den gelen hata mesajını göster
                    alert("Giriş Başarısız: " + (data.mesaj || "Bilinmeyen bir hata oluştu."));
                }
            })
            .catch(error => {
                // Sunucu kapalıysa veya bağlantı koparsa burası çalışır
                console.error("Sunucuya bağlanılamadı!", error);
                alert("Sunucuya ulaşılamıyor. Lütfen backend'in çalıştığından ve CORS ayarlarının açık olduğundan emin olun.");
            });
        });
    }
});