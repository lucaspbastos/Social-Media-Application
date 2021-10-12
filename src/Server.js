// Lucas Bastos
// CS-490 Alpha Project
const express = require('express');
const crypto = require('crypto');
const cors = require('cors')
const pool = require('./db');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors())
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

app.post('/login',async (req, res) => {
    let username = req.body.user;
    let password = req.body.pass;
    
    let conn;
    let isUser;
    let role;
    let error;
    try {
        conn = await fetchConn();

        // Use Connection
        try {
            var saltQuery = await getSalt(conn, username);
            let salt = saltQuery[0].Salt; 
            if (salt) {
                isUser = await verifyUser(conn, username, salt, password);
                if (isUser) {
                    var roleQuery = await getRole(conn, username);
                    role = roleQuery[0].AdminRole;
                } else {
                    role = 0;
                }
                
            } else {
                // no Salt -> user exists
                isUser = false;
                role = 0;
            }
            error = null;
        } catch(e) {
            isUser = false;
            role = 0;
            error = e;
        }
        let response = {
            'login': isUser,
            'role': role,
            'error': error
        }
        res.send(JSON.stringify(response));
        
    } catch (err) {
        // Manage Errors
        console.log(err)
        res.send({error: err});
    } finally {
        // Close Connection
        if (conn) conn.end();
    }
});

// misc functions

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
 * Verifies if username and login are correct.
 *
 * @param {String} username - Username to check.
 * @param {String} attemptedPassword - Password to attempt.
 **/
 async function verifyCredentials(conn, username, salt, attemptedPassword) {
    // Generate attemptedHashedSaltedPepperedPassword from attemptedPassword, leave as Buffer type
    const attemptedHashedSaltedPepperedPassword = hashSaltPepperPassword(attemptedPassword, salt);
    let rows = await getHashedSaltPepperPassword(conn, username);
    let usersHash = rows[0].HashedSaltPepperPassword;

    return crypto.timingSafeEqual(attemptedHashedSaltedPepperedPassword, Buffer.from(usersHash, 'base64'));
}

/**
 * Generates a random salt of specified length bytes.
 *
 * @param {number} length - Desired salt length.
 **/
function generateSalt(length) {
    return crypto.randomBytes(length/2);
}

// get functions

/**
 * Gets user salt from database.
 *
 * @param {String} userID - Desired userID.
 **/
async function getSalt(conn, userID) {
    let sqlQuery = "SELECT Salt from User where userID=?"
    return await conn.query(sqlQuery, [userID])
}

/**
 * Gets user role from database.
 *
 * @param {String} userID - Desired userID.
 **/
 async function getRole(conn, userID) {
    let sqlQuery = "SELECT AdminRole from User where userID=?"
    return await conn.query(sqlQuery, [userID])
}

/**
 * Gets username from database.
 *
 * @param {String} userID - Desired userID.
 **/
 async function getUsername(conn, userID) {
    let sqlQuery = "SELECT Username from User where userID=?"
    return await conn.query(sqlQuery, [userID])
}

/**
 * Gets user hashed password from database.
 *
 * @param {String} userID - Desired userID.
 **/
async function getHashedSaltPepperPassword(conn, userID) {
    let sqlQuery = "SELECT HashedSaltPepperPassword from User where userID=?"
    return await conn.query(sqlQuery, [userID])
}

/**
 * Gets posts for userID from database.
 *
 * @param {String} userID - Desired poster's userID.
 **/
async function getPostsFromUserID(conn, userID) {
    let sqlQuery = "SELECT * from Posts where posterID=?"
    return await conn.query(sqlQuery, [userID])
}

/**
 * Gets post from a postID from database.
 *
 * @param {String} postID - Desired postID.
 **/
async function getPostFromPostID(conn, postID) {
    let sqlQuery = "SELECT * from Posts where postID=?"
    return await conn.query(sqlQuery, [postID])
}

/**
 * Gets comments from a postID from database.
 *
 * @param {String} postID - Desired postID.
 **/
async function getCommentsFromPostID(conn, postID) {
    let sqlQuery = "SELECT * from Comments where postID=?"
    return await conn.query(sqlQuery, [postID])
}

/**
 * Gets messages from a userID from database.
 *
 * @param {String} userID - Desired userID.
 **/
async function getMessagesFromUserID(conn, userID) {
    let sqlQuery = "SELECT * from Messages where userID=?"
    return await conn.query(sqlQuery, [userID])
}

/**
 * Gets username from a userID from database.
 *
 * @param {String} userID - Desired userID.
 **/
 async function getUsernameFromUserID(conn, userID) {
    let sqlQuery = "SELECT username from User where userID=?"
    return await conn.query(sqlQuery, [userID])
}

// set functions

/**
 * Creates a new user in the database.
 *
 * @param {String} username - Desired username.
 * @param {String} password - Desired password.
 * @param {String} role - Desired role.
 **/
 function createUser(username, password, role) {
    const salt = generateSalt(hashConfig.SALT_LEN);
    const hashedSaltedPepperedPassword = hashSaltPepperPassword(password, salt.toString('base64'));
    let sqlQuery = "INSERT INTO User VALUES (?, ?, ?, ?, ?)"
    return await conn.query(sqlQuery, [username, hashedSaltedPepperedPassword.toString('base64'), salt.toString('base64'), role, Date.now()])
}

/**
 * Creates a post by userID into database.
 *
 * @param {String} userID - Desired userID.
 * @param {String} postText - Desired post text.
 * @param {String} postAttachments - Desired post attachments.
 **/
 async function createPostFromUserID(conn, userID, postText, postAttachments) {
    let sqlQuery = "INSERT INTO Posts VALUES (?, ?, ?, ?)"
    return await conn.query(sqlQuery, [userID, postText, postAttachments, Date.now()])
}

/**
 * Blocks a comment by userID for postID into database.
 *
 * @param {String} userID - Desired userID.
 * @param {String} postID - Desired postID to comment under.
 * @param {String} commentText - Desired comment text.
 * @param {String} commentAttachments - Desired comment attachments.
 **/
 async function createCommentFromUserIDForPostID(conn, userID, postID, commentText, commentAttachments) {
    let sqlQuery = "INSERT INTO Comments WHERE VALUES (?, ?, ?, ?, ?)"
    return await conn.query(sqlQuery, [userID, postID, commentText, commentAttachments, Date.now()])
}

/**
 * Creates a comment by userID for postID into database.
 *
 * @param {String} userID - Desired userID.
 **/
 async function createPostFromUserID(conn, userID, postText, postAttachments) {
    let sqlQuery = "INSERT INTO Posts VALUES (?, ?, ?, ?)"
    return await conn.query(sqlQuery, [userID, postText, postAttachments, Date.now()])
}

/**
 * Creates a message from a sender userID to recipient userID into database.
 *
 * @param {String} senderUserID - Desired sender userID.
 * @param {String} recipientUserID - Desired recipient userID.
 * @param {String} messageText - Desired message text.
 * @param {String} messageAttachments - Desired message attachments.
 **/
async function createMessageFromUserIDToUserID(conn, senderUserID, recipientUserID, messageText, messageAttachments) {
    let sqlQuery = "INSERT INTO Messages VALUES (?, ?, ?, ?, ?)"
    return await conn.query(sqlQuery, [senderUserID, recipientUserID, messageText, messageAttachments, Date.now()])
}

// admin functions

/**
 * Blocks post by postID into database.
 *
 * @param {String} postID - Desired postID to block.
 **/
 async function blockPost(conn, postID) {
    let sqlQuery = "UPDATE Posts SET blockStatus=? WHERE postID=?"
    return await conn.query(sqlQuery, [1, postID])
}

/**
 * Blocks comment by commentID into database.
 *
 * @param {String} commentID - Desired commentID to block.
 **/
 async function blockComment(conn, commentID) {
    let sqlQuery = "UPDATE Comment SET blockStatus=? WHERE commentID=?"
    return await conn.query(sqlQuery, [1, commentID])
}


// Run web server
app.listen(PORT, () => console.log("Listening on port %s", PORT));
//verifyUser("admin", "admin")