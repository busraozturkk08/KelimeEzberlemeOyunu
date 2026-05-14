document.addEventListener("DOMContentLoaded", () => {
    const forgotForm = document.getElementById("forgotPasswordForm");

    if (forgotForm) {
        forgotForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const emailInput = document.getElementById("reset-email").value;

            fetch(`${API_BASE_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailInput })
            })
            .then(res => {
                if (!res.ok) throw new Error("Gönderim hatası");
                alert("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.");
                forgotForm.reset();
                window.location.href = "index.html"; 
            })
            .catch(err => alert("İşlem başarısız! Sisteme kayıtlı bir e-posta girdiğinizden emin olun."));
        });
    }
});