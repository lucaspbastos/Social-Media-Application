create database if not exists CS490;

CREATE TABLE User(

    ID int NOT NULL,
    UserName varchar(255) NOT NULL,
    HashedSaltPepperPassword varchar(255) NOT NULL,
    Salt varchar(255) NOT NULL,
    AdminRole int NOT NULL,
    PRIMARY KEY(ID)
)

INSERT into User values (44532, "Mike", "wijefewi", "fdjwikeik", 0);
INSERT into User values (5464564, "Jeff", "sdfjhusd", "ddssdd", 1);
INSERT into User values (4554, "Paul", "dgfg", "cdsadsd", 1);
INSERT into User values (0788756, "Lucas", "fddfghtrgg", "dffghha", 0);
INSERT into User values (8674, "Carlos", "dghfrdg", "saffd", 1);
