document.addEventListener("DOMContentLoaded", () => {
    fetch(`${API_BASE_URL}/reports`)
        .then(response => {
            if (!response.ok) throw new Error("Sunucu bulunamadı veya kapalı.");
            return response.json();
        })
        .then(data => {
            // Backend'den SQL hatası geldiyse ekranda uyar
            if (data.error) {
                alert("Veritabanı Hatası: " + data.error);
                return;
            }

            const elements = {
                'statTotalWords': data.toplamKelime,
                'statMemorized': data.ezberlenen,
                'statSuccessRate': "%" + data.basariOrani,
                'statToday': data.bugunCozulen
            };
            
            for (const [id, val] of Object.entries(elements)) {
                const el = document.getElementById(id);
                if(el) el.innerText = val;
            }

            renderBarChart(data.haftalikAktivite);
            renderDoughnutChart(data.dogruYanlisBos || [0,0,0]);
            
            const tbody = document.querySelector(".custom-table tbody");
            if (tbody && data.zorlanilanKelimeler) {
                tbody.innerHTML = ""; 
                if (data.zorlanilanKelimeler.length === 0) {
                     tbody.innerHTML = "<tr><td colspan='6' class='text-center py-4 text-muted fw-bold'>Henüz test çözmediniz veya zorlandığınız kelime yok.</td></tr>";
                } else {
                    data.zorlanilanKelimeler.forEach(kelime => {
                        tbody.innerHTML += `
                            <tr>
                                <td class="fw-bold text-dark">${kelime.ingilizce}</td>
                                <td>${kelime.turkce}</td>
                                <td><span class="badge bg-light text-dark border">${kelime.kategori}</span></td>
                                <td class="text-center text-success fw-bold">${kelime.dogruSayisi}</td>
                                <td class="text-center text-danger fw-bold">${kelime.yanlisSayisi}</td>
                                <td class="align-middle">
                                    <div class="progress" style="height: 8px;">
                                        <div class="progress-bar bg-warning" style="width: ${kelime.basari}%"></div>
                                    </div>
                                </td>
                            </tr>
                        `;
                    });
                }
            }
        })
        .catch(error => {
            console.error("Hata:", error);
            alert("Sunucuya bağlanılamadı! Lütfen Node.js terminalinin (node app.js) çalıştığından emin olun.");
        });
});

function renderBarChart(haftalikVeri) {
    const barCanvas = document.getElementById('barChart');
    if (!barCanvas) return;
    
    const safeData = haftalikVeri || { dogru: [0,0,0,0,0,0,0], yanlis: [0,0,0,0,0,0,0], bos: [0,0,0,0,0,0,0] };

    new Chart(barCanvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
            datasets: [
                { label: 'Doğru', data: safeData.dogru, backgroundColor: '#198754', borderRadius: 4 },
                { label: 'Yanlış', data: safeData.yanlis, backgroundColor: '#dc3545', borderRadius: 4 },
                { label: 'Boş', data: safeData.bos, backgroundColor: '#6c757d', borderRadius: 4 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } } }
    });
}

function renderDoughnutChart(pastaVerisi) {
    const doughnutCanvas = document.getElementById('doughnutChart');
    if (doughnutCanvas) {
        new Chart(doughnutCanvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Doğru', 'Yanlış', 'Boş'],
                datasets: [{ data: pastaVerisi, backgroundColor: ['#198754', '#dc3545', '#6c757d'], borderWidth: 0 }]
            },
            options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { position: 'bottom' } } }
        });
    }
}