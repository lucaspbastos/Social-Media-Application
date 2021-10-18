create database if not exists CS490;
use CS490;

CREATE TABLE User(
    ID int NOT NULL,
    UserName varchar(255) NOT NULL,
    HashedSaltPepperPassword varchar(1024) NOT NULL,
    Salt varchar(255) NOT NULL,
    AdminRole int NOT NULL,
    PRIMARY KEY(ID)
);