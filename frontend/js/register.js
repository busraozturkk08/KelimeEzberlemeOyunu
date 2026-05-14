document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const password = document.getElementById("reg-password").value;
            const passwordConfirm = document.getElementById("reg-password-confirm").value;

            if (password !== passwordConfirm) {
                alert("Hata: Şifreler eşleşmiyor!");
                return;
            }

            const registerData = {
                kullaniciAdi: document.getElementById("reg-username").value,
                email: document.getElementById("reg-email").value,
                sifre: password
            };

            fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registerData)
            })
            .then(response => {
                if (!response.ok) throw new Error("Kayıt hatası");
                return response.json();
            })
            .then(data => {
                alert("Kayıt başarılı! Giriş yapabilirsiniz.");
                document.getElementById("registerForm").reset();
                window.location.href = "index.html";
            })
            .catch(error => {
                alert("Kayıt işlemi başarısız. Lütfen tekrar deneyin.");
            });
        });
    }
});