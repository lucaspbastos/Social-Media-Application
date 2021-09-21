const hash = require('hash.js');
// Grab pepper from GitHub secrets
const pepper = process.env.PEPPER;

function hashSaltPepper(password, salt, pepper) {
    // Compute hashedSaltedPepperedPassword
    return hash.sha256(password + salt + pepper);
}

function getSalt(username) {
    // get user salt from database
    return "";
}

function checkUser(username, hashedSaltedPepperedPassword) {
    // check if hashed passwords match
    return false;
}

// Run web server