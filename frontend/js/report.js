document.addEventListener("DOMContentLoaded", () => {
    fetch(`${API_BASE_URL}/reports`)
        .then(response => response.json())
        .then(data => {
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

            renderBarChart(data.haftalikAktivite || [0,0,0,0,0,0,0]);
            renderDoughnutChart(data.dogruYanlisBos || [0,0,0]);
        })
        .catch(error => console.error("Raporlar çekilemedi:", error));
});

function renderBarChart(haftalikVeri) {
    const barCanvas = document.getElementById('barChart');
    if (barCanvas) {
        new Chart(barCanvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
                datasets: [{ data: haftalikVeri, backgroundColor: '#0d6efd', borderRadius: 6, barThickness: 25 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } } }
        });
    }
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