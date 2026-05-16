let quizWords = [];
let currentIdx = 0;
let corrects = 0;
let wrongs = 0;
let empties = 0;

function toggleCustomInput() {
    const select = document.getElementById('questionCountSelect');
    const customDiv = document.getElementById('customInputDiv');
    if (select && customDiv) {
        if (select.value === 'custom') customDiv.classList.remove('d-none');
        else customDiv.classList.add('d-none');
    }
}

function startQuiz() {
    const select = document.getElementById('questionCountSelect');
    let count = select.value === 'custom' ? document.getElementById('customQuestionCount').value : select.value;

    if (!count || count <= 0) {
        alert("Geçerli bir soru sayısı girin!");
        return;
    }

    fetch(`${API_BASE_URL}/quiz?count=${count}`)
        .then(res => res.json())
        .then(data => {
            quizWords = data;
            document.getElementById('totalQuestionNum').innerText = quizWords.length;
            document.getElementById('setup-section').classList.add('d-none');
            document.getElementById('active-quiz-section').classList.remove('d-none');
            loadQuestion();
        })
        .catch(err => alert("Sorular sunucudan çekilemedi!"));
}

function loadQuestion() {
    if (currentIdx < quizWords.length) {
        document.getElementById('currentQuestionNum').innerText = currentIdx + 1;
        document.getElementById('questionWord').innerText = quizWords[currentIdx].ingilizce;
        
        const imgEl = document.getElementById('questionImage');
        if(imgEl) imgEl.src = quizWords[currentIdx].resimUrl || 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800';
        
        const sentenceUl = document.getElementById('questionSentences');
        if(sentenceUl) sentenceUl.innerHTML = `<li>${quizWords[currentIdx].ornekCumle}</li>`;
        
        const answerInput = document.getElementById('answerInput');
        answerInput.value = "";
        answerInput.focus();
    } else {
        showResults();
    }
}

function submitAnswer(event) {
    event.preventDefault();
    const answer = document.getElementById('answerInput').value.trim().toLowerCase();
    const currentWord = quizWords[currentIdx];
    const isCorrect = (answer === currentWord.turkce.toLowerCase());

    // 1. CEVABI SENİN BACKEND ALGORİTMANA GÖNDERİYORUZ
    fetch(`${API_BASE_URL}/quiz/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: 1, // Şimdilik sabit kullanıcı
            wordId: currentWord.id, // Doğru/Yanlış bilinen kelimenin ID'si
            isCorrect: isCorrect // true veya false
        })
    }).catch(err => console.error("Kelime algoritması güncellenemedi:", err));

    // 2. LOKAL SKORLARI GÜNCELLE
    if (isCorrect) corrects++;
    else wrongs++;
    
    currentIdx++;
    loadQuestion();
}

function skipQuestion() {
    empties++;
    currentIdx++;
    loadQuestion();
}

function showResults() {
    document.getElementById('active-quiz-section').classList.add('d-none');
    document.getElementById('result-section').classList.remove('d-none');
    
    document.getElementById('finalCorrect').innerText = corrects;
    document.getElementById('finalWrong').innerText = wrongs;
    document.getElementById('finalEmpty').innerText = empties;
    
    let score = Math.round((corrects / quizWords.length) * 100);
    const circle = document.getElementById('resultCircle');
    circle.innerText = "%" + score;
    circle.className = score < 50 ? "result-circle res-wrong shadow-sm" : "result-circle res-correct shadow-sm";

    const resultData = { dogru: corrects, yanlis: wrongs, bos: empties, skor: score };
    
    fetch(`${API_BASE_URL}/quiz/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultData)
    }).catch(err => console.error("Sonuçlar veritabanına kaydedilemedi."));
}

function endQuizEarly() {
    if(confirm("Sınavdan çıkmak istediğine emin misin?")) location.reload();
}