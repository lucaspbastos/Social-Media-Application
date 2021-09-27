create database if not exists CS490;

CREATE TABLE User(

    ID int NOT NULL,
    UserName varchar(255) NOT NULL,
    HashedSaltPepperPassword varchar(255) NOT NULL,
    Salt varchar(255) NOT NULL,
    AdminRole int NOT NULL,
    PRIMARY KEY(ID)
)

INSERT into User values ((44532, "Mike", "wijefewi", "fdjwikeik", 0), (44531, "Mike", "wijefewi", "fdjwikeik", 0), (44533, "Mike", "wijefewi", "fdjwikeik", 0)
(44535, "Mike", "wijefewi", "fdjwikeik", 0), (44539, "Mike", "wijefewi", "fdjwikeik", 0))