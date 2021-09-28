// Lucas Bastos
// CS-490 Alpha Project
const express = require('express');
const crypto = require('crypto');
const pool = require('./db');
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

app.post('/login', async (req, res) => {
    let username = req.body.user;
    let password = req.body.pass;
    
    let conn;
    try {
        conn = await fetchConn();

        // Use Connection
        var rows = await getSalt(conn, username);
        if (rows) {
            let salt = rows[0].Salt;
            var isUser = await verifyUser(conn, username, salt, password);
            let role;
            if (isUser) {
                var num = await getRole(conn, username);
                role = num[0].AdminRole;
            } else {
                role = 0;
            }
            let response = {
                'login': isUser,
                'role': role
            }
            res.send(JSON.stringify(response));
        }
        // no Salt exists
        
    } catch (err) {
        // Manage Errors
        console.log(err)
        res.send({error: err});
    } finally {
        // Close Connection
        if (conn) conn.end();
    }
});

async function fetchConn() {
    let conn = await pool.getConnection();
    return conn;
}

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


    const hashedSaltedPepperedPassword = hashSaltPepperPassword(password, salt.toString('base64'));
    // TODO: insert base64 hashedSaltedPepperedPassword into database in base64 .toString('base64')

    return hashedSaltedPepperedPassword.toString('base64');
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
async function getSalt(conn, username) {
    let sqlQuery = "SELECT Salt from User where UserName=?"
    return await conn.query(sqlQuery, [username])
}

/**
 * Gets user role from database.
 *
 * @param {String} username - Desired username.
 **/
 async function getRole(conn, username) {
    let sqlQuery = "SELECT AdminRole from User where UserName=?"
    return await conn.query(sqlQuery, [username])
}

/**
 * Gets user hashed password from database.
 *
 * @param {String} username - Desired username.
 **/
async function getHashedSaltPepperPassword(conn, username) {
    let sqlQuery = "SELECT HashedSaltPepperPassword from User where UserName=?"
    return await conn.query(sqlQuery, [username])
}

/**
 * Verifies if username and login are correct.
 *
 * @param {String} username - Username to check.
 * @param {String} attemptedPassword - Password to attempt.
 **/
async function verifyUser(conn, username, salt, attemptedPassword) {
    // Generate attemptedHashedSaltedPepperedPassword from attemptedPassword, leave as Buffer type
    const attemptedHashedSaltedPepperedPassword = hashSaltPepperPassword(attemptedPassword, salt);
    let rows = await getHashedSaltPepperPassword(conn, username);
    let usersHash = rows[0].HashedSaltPepperPassword;

    return crypto.timingSafeEqual(attemptedHashedSaltedPepperedPassword, Buffer.from(usersHash, 'base64'));
}

// Run web server
app.listen(PORT, () => console.log("Listening on port %s", PORT));
//verifyUser("admin", "admin")