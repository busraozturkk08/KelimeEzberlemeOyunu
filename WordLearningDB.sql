-- ============================================================
--  WordLearningDB - Tam Veritabaný Þemasý
--  Proje: 6 Sefer Tekrar Prensibi ile Kelime Ezberleme Oyunu
--  Story Kapsamý: Story-1'den Story-7'ye 
-- ============================================================

CREATE DATABASE WordLearningDB;
GO
USE WordLearningDB;
GO

-- ============================================================
-- TABLO 1: Users
-- Story-1: Kayýt, giriþ, þifremi unuttum
-- Story-4: Kullanýcý ayarlarý (DailyNewWordLimit)
-- ============================================================
CREATE TABLE Users (
    UserID            INT           PRIMARY KEY IDENTITY(1,1),
    UserName          NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash      NVARCHAR(255) NOT NULL,                  -- Plain text DEÐÝL, hash sakla
    Email             NVARCHAR(255) NOT NULL UNIQUE,           -- Þifremi unuttum için zorunlu
    ResetToken        NVARCHAR(255) NULL,                      -- Þifre sýfýrlama token'ý
    ResetTokenExpiry  DATETIME      NULL,                      -- Token geçerlilik süresi
    UserRole          NVARCHAR(50)  NOT NULL DEFAULT 'Student',-- 'Student' veya 'Admin'
    DailyNewWordLimit INT           NOT NULL DEFAULT 10,       -- Story-4: Ayarlanabilir
    CreatedAt         DATETIME      NOT NULL DEFAULT GETDATE()
);
GO

-- ============================================================
-- TABLO 2: Categories
-- Story-5: Kategori bazlý baþarý raporu için þart
-- ============================================================
CREATE TABLE Categories (
    CategoryID   INT           PRIMARY KEY IDENTITY(1,1),
    CategoryName NVARCHAR(100) NOT NULL UNIQUE
);
GO

-- ============================================================
-- TABLO 3: Words
-- Story-2: Kelime ekleme modülü
-- ============================================================
CREATE TABLE Words (
    WordID        INT           PRIMARY KEY IDENTITY(1,1),
    EngWordName   NVARCHAR(255) NOT NULL,
    TurWordName   NVARCHAR(255) NOT NULL,
    PicturePath   NVARCHAR(MAX) NULL,                 -- Opsiyonel resim yolu
    AudioPath     NVARCHAR(MAX) NULL,                 -- Opsiyonel sesli okunuþ (Story-2'de "ops" olarak geçiyor)
    CategoryID    INT           NULL,
	AddedByUserID INT           NULL,                 -- Kelimeyi ekleyen kullanýcýyý takip etmek için
    CreatedAt     DATETIME      NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID),
	CONSTRAINT FK_Words_Category FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID) ON DELETE SET NULL,
    CONSTRAINT FK_Words_AddedBy FOREIGN KEY (AddedByUserID) REFERENCES Users(UserID)
);
GO

-- ============================================================
-- TABLO 4: WordSamples
-- Story-2: Bir kelimenin birden çok cümle içinde geçmesi
-- ============================================================
CREATE TABLE WordSamples (
    SampleID  INT          PRIMARY KEY IDENTITY(1,1),
    WordID    INT          NOT NULL,
    Sentence  NVARCHAR(MAX) NOT NULL,
    FOREIGN KEY (WordID) REFERENCES Words(WordID) ON DELETE CASCADE
);
GO

-- ============================================================
-- TABLO 5: UserWordProgress
-- Story-3: 6 Sefer tekrar algoritmasýnýn kalbi
--
-- Algoritma:
--   CurrentStep 0-6 arasýnda artar.
--   Yanlýþ yapýlýrsa CurrentStep sýfýrlanýr.
--   Her adýmdaki NextQuizDate aralýðý:
--     Adým 0 -> 1  : ayný gün (hemen)
--     Adým 1 -> 2  : 1 gün sonra
--     Adým 2 -> 3  : 1 hafta sonra
--     Adým 3 -> 4  : 1 ay sonra
--     Adým 4 -> 5  : 3 ay sonra
--     Adým 5 -> 6  : 6 ay sonra
--     Adým 6       : 1 yýl sonra -> IsLearned = 1
-- ============================================================
CREATE TABLE UserWordProgress (
    ProgressID        INT      PRIMARY KEY IDENTITY(1,1),
    UserID            INT      NOT NULL,
    WordID            INT      NOT NULL,
    CurrentStep       INT      NOT NULL DEFAULT 0,   -- 0-6 arasý (6 = tamamen öðrenildi)
    ConsecutiveCorrect INT     NOT NULL DEFAULT 0,   -- Üst üste doðru sayýsý (sýfýrlanabilir)
    NextQuizDate      DATETIME NOT NULL DEFAULT GETDATE(),
    LastAnsweredAt    DATETIME NULL,
	IsActive  BIT  NOT NULL DEFAULT 1,				 -- 1 ise çalýþýlýyor, 0 ise kullanýcý bu kelimeyi listeden çýkardý
    IsLearned AS (CASE WHEN CurrentStep >= 6 THEN 1 ELSE 0 END) PERSISTED, -- Hesaplamalý sütun
    CONSTRAINT UQ_UserWord UNIQUE (UserID, WordID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (WordID) REFERENCES Words(WordID)
);
GO

-- ============================================================
-- TABLO 6: QuizSessions
-- Story-3 & Story-5: Her sýnav oturumunu gruplamak için
-- Analiz raporunda "oturum bazlý" istatistik bu tablodan gelir
-- ============================================================
CREATE TABLE QuizSessions (
    SessionID   INT      PRIMARY KEY IDENTITY(1,1),
    UserID      INT      NOT NULL,
    SessionDate DATETIME NOT NULL DEFAULT GETDATE(),
    TotalWords  INT      NOT NULL DEFAULT 0,   -- O gün kaç kelime soruldu
    CorrectCount INT     NOT NULL DEFAULT 0,   -- Kaç tanesi doðru
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);
GO

-- ============================================================
-- TABLO 7: ExamLogs
-- Story-3 & Story-5: Her soruya verilen cevabýn kaydý
-- Analiz raporu bu tablodan üretilir
-- ============================================================
CREATE TABLE ExamLogs (
    LogID      INT      PRIMARY KEY IDENTITY(1,1),
    SessionID  INT      NOT NULL,
    UserID     INT      NOT NULL,
    WordID     INT      NOT NULL,
    IsCorrect  BIT      NOT NULL,
	CategoryID INT      NOT NULL,
    AnsweredAt DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (SessionID) REFERENCES QuizSessions(SessionID),
    FOREIGN KEY (UserID)    REFERENCES Users(UserID),
    FOREIGN KEY (WordID)    REFERENCES Words(WordID),
	FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
);
GO

-- ============================================================
-- TABLO 8: WordleGames
-- Story-6: Bulmaca (Wordle) - Öðrenilen kelimelerden oynanýr
-- ============================================================
CREATE TABLE WordleGames (
    GameID      INT      PRIMARY KEY IDENTITY(1,1),
    UserID      INT      NOT NULL,
    WordID      INT      NOT NULL,               -- Tahmin edilmesi gereken kelime
    IsCompleted BIT      NOT NULL DEFAULT 0,     -- Oyun bitti mi
    IsWon       BIT      NOT NULL DEFAULT 0,     -- Kazandý mý
    CreatedAt   DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (WordID) REFERENCES Words(WordID)
);
GO

-- ============================================================
-- TABLO 9: WordleAttempts
-- Story-6: Wordle'da her tahmin ayrý satýr olarak saklanýr
-- AttemptNumber: kaçýncý tahmin (1-6)
-- ============================================================
CREATE TABLE WordleAttempts (
    AttemptID     INT           PRIMARY KEY IDENTITY(1,1),
    GameID        INT           NOT NULL,
    GuessedWord   NVARCHAR(255) NOT NULL,
    AttemptNumber INT           NOT NULL,   -- 1'den 6'ya kadar
    FOREIGN KEY (GameID) REFERENCES WordleGames(GameID) ON DELETE CASCADE
);
GO

-- ============================================================
-- TABLO 10: AI_WordChains
-- Story-7: LLM ile üretilen hikaye ve görsel saklanýr
-- ============================================================
CREATE TABLE AI_WordChains (
    ChainID         INT           PRIMARY KEY IDENTITY(1,1),
    UserID          INT           NOT NULL,
    StoryText       NVARCHAR(MAX) NOT NULL,       -- LLM'in ürettiði hikaye
    StoredImagePath NVARCHAR(MAX) NULL,           -- Uygulama içinde kaydedilen görsel yolu
    CreatedAt       DATETIME      NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);
GO

-- ============================================================
-- TABLO 11: WordChain_Words  (köprü tablo)
-- Story-7: Bir zincirde hangi kelimeler kullanýldý?
-- OrderIndex: kelimenin zincirdeki sýrasý (1,2,3...)
-- ============================================================
CREATE TABLE WordChain_Words (
    ID         INT PRIMARY KEY IDENTITY(1,1),
    ChainID    INT NOT NULL,
    WordID     INT NOT NULL,
    OrderIndex INT NOT NULL,
    FOREIGN KEY (ChainID) REFERENCES AI_WordChains(ChainID) ON DELETE CASCADE,
    FOREIGN KEY (WordID)  REFERENCES Words(WordID)
);
GO