document.addEventListener("DOMContentLoaded", () => {
    const generateBtn = document.getElementById("generateBtn");
    const loader = document.getElementById("loader");
    const resultArea = document.getElementById("resultArea");
    const storyContent = document.getElementById("storyContent");
    const imagePromptContent = document.getElementById("imagePromptContent");
    const usedWordsContainer = document.getElementById("usedWords");

    // Story-1 kapsamında giriş yapan kullanıcı ID'si (Varsayılan: 1)
    const userId = 1; 

    generateBtn.addEventListener("click", () => {
        // Arayüzü sıfırla
        generateBtn.disabled = true;
        loader.classList.remove("d-none");
        resultArea.classList.add("d-none");

        // Backend POST isteği
        fetch(`${API_BASE_URL}/wordchain/generate-and-save/${userId}`, {
            method: 'POST'
        })
        .then(async response => {
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || data.error || "İşlem başarısız.");
            return data;
        })
        .then(data => {
            // 1. Kelimeleri rozet olarak ekle
            usedWordsContainer.innerHTML = "";
            const wordsArray = data.words.split(", ");
            wordsArray.forEach(word => {
                const badge = document.createElement("span");
                badge.className = "badge bg-info text-dark me-2 shadow-sm p-2";
                badge.innerText = word.toUpperCase();
                usedWordsContainer.appendChild(badge);
            });

            // 2. Hikaye ve Görsel Promptunu Ekrana Yaz
            storyContent.innerText = data.story;
            imagePromptContent.innerText = data.imagePrompt;

            // 3. Alanları Göster
            loader.classList.add("d-none");
            resultArea.classList.remove("d-none");
        })
        .catch(error => {
            alert("Hata: " + error.message);
            console.error("WordChain Hatası:", error);
        })
        .finally(() => {
            generateBtn.disabled = false;
            loader.classList.add("d-none");
        });
    });
});