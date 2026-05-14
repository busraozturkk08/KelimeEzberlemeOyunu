let currentRow = null;
let currentWordId = null;

document.addEventListener("DOMContentLoaded", () => {
    fetchWords();
});

function fetchWords() {
    // URL'nin sonuna /list ekleyerek backend'deki listeleme rotasına ulaşıyoruz.
    fetch(`${API_BASE_URL}/words/list`)
        .then(response => {
            if (!response.ok) throw new Error("Backend hatası: " + response.status);
            return response.json();
        })
        .then(data => {
            const tbody = document.querySelector("#wordTable tbody");
            if (!tbody) return;
            
            tbody.innerHTML = ""; // Önceki (sahte) verileri temizle

            // Backend'den gelen verileri tabloya diziyoruz
            if (data.basarili && data.kelimeler) {
                if (data.kelimeler.length === 0) {
                    tbody.innerHTML = "<tr><td colspan='6' class='text-center'>Henüz hiç kelime eklenmemiş.</td></tr>";
                    return;
                }

                data.kelimeler.forEach(kelime => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td class="fw-bold text-dark fs-5 eng-word">${kelime.ingilizce}</td>
                        <td class="tr-word">${kelime.turkce}</td>
                        <td>
                            <ul class="example-list mb-0">
                                <li>${kelime.ornekCumle || '-'}</li>
                            </ul>
                        </td>
                        <td><span class="badge bg-light text-dark border category-badge">${kelime.kategori || 'Genel'}</span></td>
                        <td><img src="${kelime.resim || 'https://images.unsplash.com/photo-1560806887-1e4cd0b6fac6?w=150'}" class="word-img" alt="Görsel"></td>
                        <td>
                            <button class="btn btn-primary btn-sm w-100 mb-1 fw-bold" onclick="openEditModal(this, ${kelime.id})">✎ Düzenle</button>
                            <button class="btn btn-danger btn-sm w-100 fw-bold" onclick="openDeleteModal(this, ${kelime.id})">🗑 Sil</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            } else {
                alert("Veri getirilemedi: " + (data.mesaj || "Bilinmeyen hata"));
            }
        })
        .catch(error => {
            console.error("Veri çekme hatası:", error);
            alert("Kelimeler yüklenirken bir hata oluştu. Bağlantıyı kontrol edin.");
        });
}

function openDeleteModal(btn, id) {
    currentRow = btn.closest('tr');
    currentWordId = id;
    document.getElementById('deleteWordText').innerText = currentRow.querySelector('.eng-word').innerText;
    
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    deleteModal.show();
}

function confirmDelete() {
    if (currentWordId) {
        // Silme rotası için /words/:id kullanıyoruz
        fetch(`${API_BASE_URL}/words/${currentWordId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.basarili) {
                if (currentRow) currentRow.remove();
                bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
            } else {
                alert("Silme işlemi başarısız: " + data.mesaj);
            }
        })
        .catch(error => alert("Bağlantı hatası!"));
    }
}

function previewEditImage(event) {
    const input = event.target;
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('editImagePreview').src = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function openEditModal(btn, id) {
    currentRow = btn.closest('tr');
    currentWordId = id;
    
    document.getElementById('editEngWord').value = currentRow.querySelector('.eng-word').innerText;
    document.getElementById('editTrWord').value = currentRow.querySelector('.tr-word').innerText;
    
    const sentenceLi = currentRow.querySelector('.example-list li');
    document.getElementById('editSentences').value = sentenceLi && sentenceLi.innerText !== '-' ? sentenceLi.innerText : "";
    document.getElementById('editImagePreview').src = currentRow.querySelector('.word-img').src;
    document.getElementById('editImageInput').value = "";

    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    editModal.show();
}

function saveEdit() {
    if (currentWordId) {
        const updatedData = {
            ingilizce: document.getElementById('editEngWord').value,
            turkce: document.getElementById('editTrWord').value,
            ornekCumle: document.getElementById('editSentences').value
        };

        // Güncelleme rotası için /words/:id kullanıyoruz
        fetch(`${API_BASE_URL}/words/${currentWordId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.basarili) {
                // Tabloyu veritabanına tekrar gitmeden manuel güncelliyoruz
                currentRow.querySelector('.eng-word').innerText = updatedData.ingilizce;
                currentRow.querySelector('.tr-word').innerText = updatedData.turkce;
                
                const ul = currentRow.querySelector('.example-list');
                ul.innerHTML = `<li>${updatedData.ornekCumle || '-'}</li>`;

                bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
            } else {
                alert("Güncelleme başarısız: " + data.mesaj);
            }
        })
        .catch(error => alert("Bağlantı hatası!"));
    }
}