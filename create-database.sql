create database if not exists CS490;
use CS490;

CREATE TABLE Users (
    userID int AUTO_INCREMENT UNIQUE NOT NULL,
    UserName varchar(1000) UNIQUE NOT NULL,
    HashedSaltPepperPassword varchar(1000) NOT NULL,
    Salt varchar(1000) NOT NULL,
    AdminRole int NOT NULL,
    PRIMARY KEY(userID)
);

CREATE TABLE SessionsTable (
    userID int NOT NULL,
    sessionString varchar(255),
    sessionDatetime datetime,
    PRIMARY KEY(userID),
    FOREIGN KEY(userID) REFERENCES User(userID)
);


CREATE TABLE Posts (
    postID int AUTO_INCREMENT UNIQUE NOT NULL,
    userID int not NULL,
    fileNames varchar(1000),
    postText varchar(1000),
    postDate datetime NOT NULL,
    blockStatus int NOT NULL,
    PRIMARY KEY(postID),
    FOREIGN KEY(userID) REFERENCES User(userID)
);

CREATE TABLE Comments (
    commentID int AUTO_INCREMENT UNIQUE NOT NULL,
    userID int not NULL,
    postID int not NULL,
    commentText varchar(1000),
    fileNames varchar(1000),
    commentDate datetime NOT NULL,
    blockStatus int NOT NULL,
    PRIMARY KEY(commentID),
    FOREIGN KEY(userID) REFERENCES Users(userID),
    FOREIGN KEY(postID) REFERENCES Posts(postID)
);

CREATE TABLE Threads (
    threadID int AUTO_INCREMENT UNIQUE NOT NULL,
    threadName varchar(255) NOT NULL,
    userIDs varchar(1000) NOT NULL,
    PRIMARY KEY(threadID)
);


CREATE TABLE Messages (
    messageID int AUTO_INCREMENT UNIQUE NOT NULL,
    threadID int NOT NULL,
    userID int NOT NULL,
    recipientUserIDs varchar(1000) NOT NULL,
    messageText varchar(1000),
    messageDate datetime NOT NULL,
    PRIMARY KEY(messageID),
    FOREIGN KEY(userID) REFERENCES Users(userID),
    FOREIGN KEY(threadID) REFERENCES Threads(threadID)
);
