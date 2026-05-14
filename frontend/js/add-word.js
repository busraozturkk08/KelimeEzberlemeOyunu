document.addEventListener("DOMContentLoaded", () => {
    
    // 1. SAYFA AÇILIR AÇILMAZ KATEGORİLERİ VERİTABANINDAN ÇEK
    kategorileriYukle();

    // 2. KELİME EKLEME FORMU İŞLEMLERİ (Arkadaşının orijinal mantığı korundu)
    const addWordForm = document.getElementById("addWordForm");

    if (addWordForm) {
        addWordForm.addEventListener("submit", function (event) {
            event.preventDefault();

            // Ekrandaki kutucuklardan verileri alıyoruz
            const newWordData = {
                ingilizce: document.getElementById("engWordInput").value,
                turkce: document.getElementById("trWordInput").value,
                kategori: document.getElementById("category").value, 
                ornekCumle: document.getElementById("sentences").value
            };

            // Senin backend'ine (POST /words/add) gönderiyoruz
            fetch(`${API_BASE_URL}/words/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newWordData)
            })
            .then(response => {
                if (!response.ok) throw new Error('Bağlantı hatası');
                return response.json(); 
            })
            .then(data => {
                if(data.basarili) {
                    alert("Kelime başarıyla eklendi.");
                    addWordForm.reset();
                    document.getElementById("engWordInput").focus();
                } else {
                    alert("Backend'den hata döndü: " + data.mesaj);
                }
            })
            .catch(error => {
                alert("Kelime eklenemedi! Bağlantıyı kontrol edin.");
            });
        });
    }
});

// KATEGORİLERİ BACKEND'DEN (GET /words/categories) ÇEKEN FONKSİYON
function kategorileriYukle() {
    const categorySelect = document.getElementById("category");
    
    fetch(`${API_BASE_URL}/words/categories`)
        .then(response => {
            if (!response.ok) throw new Error("Sunucu hatası");
            return response.json();
        })
        .then(data => {
            if(data.basarili) {
                // Önce "Yükleniyor" yazısını silip varsayılan yazıyı ekliyoruz
                categorySelect.innerHTML = '<option value="" selected disabled>Seçiniz...</option>';
                
                // Veritabanından gelen 32 kategoriyi döngüyle kutuya ekliyoruz
                data.kategoriler.forEach(kat => {
                    const option = document.createElement("option");
                    option.value = kat.id;       // Veritabanına gidecek olan ID (Örn: 1)
                    option.textContent = kat.ad; // Ekranda görünecek olan İsim (Örn: Mutfak & Yemek)
                    categorySelect.appendChild(option);
                });
            }
        })
        .catch(error => {
            categorySelect.innerHTML = '<option value="" disabled>Kategoriler yüklenemedi!</option>';
            console.error("Kategori çekme hatası:", error);
        });
}