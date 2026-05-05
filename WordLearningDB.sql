CREATE DATABASE WordLearningDB;
GO
USE WordLearningDB;

-- 1. Users (Admin rolü ve Kayýt Tarihi eklendi)
CREATE TABLE Users (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    UserName NVARCHAR(255) NOT NULL UNIQUE,
    Password NVARCHAR(255) NOT NULL,
    Email NVARCHAR(255) UNIQUE, -- Story-1: Þifre sýfýrlama için kritik
    UserRole NVARCHAR(50) DEFAULT 'Student', -- Sýnav Sorumlusu ayrýmý için
    DailyNewWordLimit INT DEFAULT 10, -- Story-4
    CreatedAt DATETIME DEFAULT GETDATE() -- Takip için
);

-----------------------------------------------------

-- 2. Categories (Story-5 için gerekli)
CREATE TABLE Categories (
    CategoryID INT PRIMARY KEY IDENTITY(1,1),
    CategoryName NVARCHAR(100) NOT NULL
);

-----------------------------------------------------

-- 3. Words (Story-2)
CREATE TABLE Words (
    WordID INT PRIMARY KEY IDENTITY(1,1),
    EngWordName NVARCHAR(255) NOT NULL,
    TurWordName NVARCHAR(255) NOT NULL,
    PicturePath NVARCHAR(MAX), -- ZORUNLU alan olarak var ama NULL olabilir
    CategoryID INT,
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
);

-----------------------------------------------------

-- 4. Word Samples (Story-2)
CREATE TABLE WordSamples (
    SampleID INT PRIMARY KEY IDENTITY(1,1),
    WordID INT NOT NULL,
    Sentence NVARCHAR(MAX) NOT NULL,
    FOREIGN KEY (WordID) REFERENCES Words(WordID)
);

-----------------------------------------------------

-- 5. User Progress (Story-3)
CREATE TABLE UserWordProgress (
    ProgressID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    WordID INT NOT NULL,
    CurrentStep INT DEFAULT 0,
    LastCorrectDate DATETIME DEFAULT GETDATE(),
    NextQuizDate DATETIME DEFAULT GETDATE(),

    IsLearned AS (
        CASE 
            WHEN CurrentStep >= 6 THEN 1 
            ELSE 0 
        END
    ),

    CONSTRAINT UQ_UserWord UNIQUE (UserID, WordID),

    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (WordID) REFERENCES Words(WordID)
);

-----------------------------------------------------

-- 6. Exam Logs (Story-5)
CREATE TABLE ExamLogs (
    LogID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    WordID INT NOT NULL,
    IsCorrect BIT NOT NULL,
    ExamDate DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (WordID) REFERENCES Words(WordID)
);

-----------------------------------------------------

-- 7. AI Word Chains (Story-7)
CREATE TABLE AI_WordChains (
    ChainID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    StoryText NVARCHAR(MAX),
    StoredImagePath NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-----------------------------------------------------

-- 8. Wordle (Story-6)
CREATE TABLE WordleGames (
    GameID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    WordID INT NOT NULL,
    AttemptCount INT DEFAULT 0,
    IsCompleted BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (WordID) REFERENCES Words(WordID)
);