let targetWord = ""; 
const maxGuesses = 5; 
let currentGuesses = 0;
let isGameOver = false;

document.addEventListener("DOMContentLoaded", () => {
    fetch(`${API_BASE_URL}/wordle/random`)
        .then(res => res.json())
        .then(data => {
            targetWord = data.gizliKelime.toUpperCase();
            
            const hintBoard = document.getElementById('hintBoard');
            if (hintBoard) {
                document.getElementById('wordLengthDisplay').innerText = targetWord.length;
                document.getElementById('remainingDisplay').innerText = maxGuesses;
                
                const guessInput = document.getElementById('guessInput');
                if(guessInput) guessInput.maxLength = targetWord.length;

                for (let i = 0; i < targetWord.length; i++) {
                    const tile = document.createElement('div');
                    tile.className = 'tile hint-tile';
                    if (i === 0) tile.innerText = targetWord[0];
                    hintBoard.appendChild(tile);
                }
            }
        })
        .catch(err => alert("Kelime sunucudan alınamadı!"));
});

function submitGuess(event) {
    event.preventDefault();
    if (isGameOver) return;

    const guessInput = document.getElementById('guessInput');
    const errorMsg = document.getElementById('errorMsg');
    let guess = guessInput.value.toUpperCase();

    if (guess.length !== targetWord.length) {
        errorMsg.className = "text-danger small fw-bold mb-3";
        errorMsg.innerText = `Kelime ${targetWord.length} harf olmalıdır!`;
        return;
    }
    errorMsg.innerText = ""; 

    currentGuesses++;
    document.getElementById('remainingDisplay').innerText = (maxGuesses - currentGuesses);
    document.getElementById('historyTitle').style.display = "block";

    const historyBoard = document.getElementById('historyBoard');
    const row = document.createElement('div');
    row.className = 'word-row';

    let targetArr = targetWord.split('');
    let guessArr = guess.split('');
    let colors = new Array(targetWord.length).fill('absent');

    for (let i = 0; i < targetWord.length; i++) {
        if (guessArr[i] === targetArr[i]) {
            colors[i] = 'correct';
            targetArr[i] = null; 
        }
    }

    for (let i = 0; i < targetWord.length; i++) {
        if (colors[i] === 'correct') continue;
        let index = targetArr.indexOf(guessArr[i]);
        if (index !== -1) {
            colors[i] = 'present';
            targetArr[index] = null;
        }
    }

    for (let i = 0; i < targetWord.length; i++) {
        const tile = document.createElement('div');
        tile.className = `tile ${colors[i]}`;
        tile.innerText = guessArr[i];
        row.appendChild(tile);
    }

    historyBoard.appendChild(row);

    if (guess === targetWord || currentGuesses >= maxGuesses) {
        isGameOver = true;
        guessInput.disabled = true;

        let statusMsg = (guess === targetWord) 
            ? `<span class="text-success">Tebrikler, kelimeyi buldunuz! 🎉</span>` 
            : `<span class="text-danger">Oyun bitti! Doğru kelime: ${targetWord}</span>`;

        fetch(`${API_BASE_URL}/wordle/result`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kazandiMi: (guess === targetWord), tahminSayisi: currentGuesses })
        });

        errorMsg.innerHTML = `
            <div class="mt-3">
                <p class="fw-bold fs-5">${statusMsg}</p>
                <div class="d-flex justify-content-center gap-3 mt-3">
                    <button class="btn btn-primary fw-bold px-4 shadow-sm" onclick="location.reload()">🔄 Yeni Oyun</button>
                    <a href="dashboard.html" class="btn btn-outline-secondary fw-bold px-4 shadow-sm">🏠 Ana Sayfa</a>
                </div>
            </div>
        `;
    } else {
        guessInput.value = "";
        guessInput.focus();
    }
}