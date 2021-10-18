create database if not exists CS490;

CREATE TABLE User(

    ID int AUTO_INCREMENT UNIQUE NOT NULL,
    UserName varchar(1000) UNIQUE NOT NULL,
    HashedSaltPepperPassword varchar(1000) NOT NULL,
    Salt varchar(1000) NOT NULL,
    AdminRole int NOT NULL,
    PRIMARY KEY(ID)
)

CREATE TABLE Post(

    postID int AUTO_INCREMENT UNIQUE NOT NULL,
    postUserID int not NULL,
    fileNames varchar(1000),
    postText varchar(1000),
    postDate datetime NOT NULL,
    blockStatus int NOT NULL,
    PRIMARY KEY(postID),
    FOREIGN KEY(postUserID) REFERENCES User(ID)
);

CREATE TABLE Comment(

    commentID int AUTO_INCREMENT UNIQUE NOT NULL,
    commentUserID int not NULL,
    originalPostID int not NULL,
    commentText varchar(1000),
    fileNames varchar(1000),
    commentDate datetime NOT NULL,
    blockStatus int NOT NULL,
    PRIMARY KEY(commentID),
    FOREIGN KEY(commentUserID) REFERENCES User(ID)

);

CREATE TABLE Messages(
    messageID int AUTO_INCREMENT UNIQUE NOT NULL,
    senderUserID int NOT NULL,
    recipientUserID varchar(1000) NOT NULL,
    messageText varchar(1000),
    messageDate datetime NOT NULL,
    PRIMARY KEY(messageID),
    FOREIGN KEY(senderUserID) REFERENCES User(ID)

);

CREATE TABLE SessionsTable(
    sessionUserID int NOT NULL,
    sessionString varchar(255),
    sessionDatetime datetime,
    PRIMARY KEY(sessionUserID),
    FOREIGN KEY(sessionUserID) REFERENCES User(ID)

);

INSERT into User values (44532, "Mike", "wijefewi", "fdjwikeik", 0);
INSERT into User values (5464564, "Jeff", "sdfjhusd", "ddssdd", 1);
INSERT into User values (4554, "Paul", "dgfg", "cdsadsd", 1);
INSERT into User values (0788756, "Lucas", "fddfghtrgg", "dffghha", 0);
INSERT into User values (8674, "Carlos", "dghfrdg", "saffd", 1);

INSERT into Post values ()
    postID int AUTO_INCREMENT UNIQUE NOT NULL,
    postUserID int not NULL,
    fileNames varchar(1000),
    postText varchar(1000),
    postDate datetime NOT NULL,
    blockStatus int NOT NULL,
    PRIMARY KEY(postID)