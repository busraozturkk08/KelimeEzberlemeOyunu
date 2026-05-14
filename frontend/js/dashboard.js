/* ==========================================================================
   KELİME EZBER SİSTEMİ - ANA SAYFA (dashboard.js)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    
    // Backend'den ana sayfa verilerini (kullanıcı adı vb.) çekiyoruz
    fetch(`${API_BASE_URL}/dashboard`)
        .then(response => {
            if (!response.ok) throw new Error("Veri çekilemedi");
            return response.json();
        })
        .then(data => {
            // HTML'de ID'sini 'welcomeText' yaptığımız başlığı buluyoruz
            const welcomeText = document.getElementById('welcomeText');
            
            if (welcomeText && data.kullaniciAdi) {
                // İsmi başlığın içine yazdırıyoruz
                welcomeText.innerText = `Hoş Geldin, ${data.UserName}!`;
            }

            // Eğer sağ üstteki profil ismini de değiştirmek istersen:
            // const headerName = document.getElementById('headerName');
            // if (headerName) headerName.innerText = data.kullaniciAdi;
        })
        .catch(error => {
            console.error("Kullanıcı bilgisi alınamadı:", error);
            // Hata olursa en azından boş kalmasın diye varsayılan bir şey yazabiliriz
            const welcomeText = document.getElementById('welcomeText');
            if (welcomeText) welcomeText.innerText = "Hoş Geldin, Misafir!";
        });
});