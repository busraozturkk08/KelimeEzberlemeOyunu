document.addEventListener("DOMContentLoaded", () => {
    fetch(`${API_BASE_URL}/profile`)
        .then(res => res.json())
        .then(data => {
            document.getElementById('firstName').value = data.ad || "";
            document.getElementById('lastName').value = data.soyad || "";
            document.getElementById('email').value = data.email || "";
            document.getElementById('aboutUser').value = data.hakkinda || "";
        })
        .catch(err => console.error("Profil bilgileri alınamadı", err));

    const profileForm = document.getElementById("profileForm");
    if (profileForm) {
        profileForm.addEventListener("submit", function (event) {
            event.preventDefault();
            
            const profileData = {
                ad: document.getElementById('firstName').value,
                soyad: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                hakkinda: document.getElementById('aboutUser').value
            };

            fetch(`${API_BASE_URL}/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData)
            })
            .then(res => {
                if (!res.ok) throw new Error("Güncelleme hatası");
                alert("Profil bilgileri başarıyla güncellendi!");
            })
            .catch(err => alert("Güncelleme başarısız! Bağlantıyı kontrol edin."));
        });
    }
});