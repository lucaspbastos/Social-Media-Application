// Lucas Bastos
// CS-490 Alpha Project
const express = require('express');
const crypto = require('crypto');
const db = require('./db')
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Contains options and parameters for hashing functions.
 **/
const hashConfig = {
    SALT_LEN: 128,
    HASH_LEN: 256,
    HASH_ITERATIONS: 2**20,
    DIGEST: 'SHA512',
    PEPPER: 'Yerr490'
}

app.post('/login', (req,res) => {
    let body = req.body;
    let username = body.user;
    let password = body.pass;
    try {
        if (verifyUser(username, password)) {

        }
    } catch(e) {
        throw e;
    }
    
});

/**
 * Returns a hashed, salted, and peppered password.
 *
 * @param {String} password - The password to pepper, salt, then hash. * 
 * @param {Buffer} salt - Salt to be used for salting password.
 **/
function hashSaltPepperPassword(password, salt) {
    return crypto.pbkdf2Sync(hashConfig.PEPPER + password, salt, hashConfig.HASH_ITERATIONS, hashConfig.HASH_LEN, hashConfig.DIGEST);
}

/**
 * Creates a new user in the database.
 *
 * @param {String} username - Desired username.
 * @param {String} password - Desired password.
 * @param {String} role - Desired role.
 **/
function createUser(username, password, role) {
    // TODO: check if username exists
    // TODO: check if password valid
    // TODO: insert username into database
    // TODO: insert role into database

    const salt = generateSalt(hashConfig.SALT_LEN);
    // TODO: insert salt into database in base64 .toString('base64')


    const hashedSaltedPepperedPassword = hashSaltPepperPassword(password, salt);
    // TODO: insert base64 hashedSaltedPepperedPassword into database in base64 .toString('base64')

    return true;
}

/**
 * Generates a random salt of specified length bytes.
 *
 * @param {number} length - Desired salt length.
 **/
function generateSalt(length) {
    return crypto.randomBytes(length/2);
}

/**
 * Gets user salt from database.
 *
 * @param {String} username - Desired username.
 **/
function getSalt(username) {
    const sqlQuery = "SELECT Salt from User where username = ?"
    const results = db.pool.query(sqlQuery, [username], (error, results, fields) => {
        if (error) {
            throw error;
        }
        return results;
    });
    return Buffer.from(results, "Base64");
}

/**
 * Gets user hashed password from database.
 *
 * @param {String} username - Desired username.
 **/
function getHashedSaltPepperPassword(username) {
    const sqlQuery = "SELECT HashedSaltPepperPassword from User where username = ?"
    const results = db.pool.query(sqlQuery, [username], (error, results, fields) => {
        if (error) {
            throw error;
        }
        return results;
    });
    return Buffer.from(results, "Base64");
}


/**
 * Gets user salt from database.
 *
 * @param {String} username - Username to check.
 * @param {String} attemptedPassword - Password to attempt.
 **/
function verifyUser(username, attemptedPassword) {
    // Generate attemptedHashedSaltedPepperedPassword from attemptedPassword, leave as Buffer type
    const salt = getSalt(username);
    const attemptedHashedSaltedPepperedPassword = hashSaltPepperPassword(attemptedPassword, salt);

    const usersHash = getHashedSaltPepperPassword(username);
    return crypto.timingSafeEqual(attemptedHashedSaltedPepperedPassword, usersHash);
}

// Run web server
app.listen(PORT, () => console.log("Listening on port %s", PORT));