// Lucas Bastos
// CS-490 Alpha Project
const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const session = require('express-session');
const pool = require('./db');
const app = express();
const PORT = process.env.PORT || 3001;

//app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
/*app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));*/

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
    let isUser;
    let role;
    let error;
    try {
        conn = await fetchConn();
        // Use Connection
        try {
            let userID = await getUserID(conn, username);
            let salt = await getSalt(conn, userID);
            if (salt) {
                isUser = await verifyCredentials(conn, userID, salt, password);
                //TODO: generate session
                if (isUser) {
                    role = await getRole(conn, userID);
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

app.post('/logout', async (req, res) => { 
    //TODO: fill in lougout
    // destroy local cookie
    // remove session from DB
});

app.post('/getPosts', async (req, res) => { 
    //TODO: only grab posts from users following
    let conn;
    let error = null;
    let postsArray = [];
    try {
        conn = await fetchConn();
        // Use Connection
        try {
            let postQuery = await getPosts(conn);
            for (post in postQuery) {
                let commentsArray = await getCommentsFromPostID(conn, post.postID);
                post["comments"] = commentsArray;
                postsArray.push(post);
            }
        } catch(e) {
            error = e;
        }
        let response = {
            'posts': postsArray,
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

app.post('/createPost', async (req, res) => { 
    //TODO: fill in message feed
    // grab thread list involving user with messages within
});

app.post('/search', async (req, res) => { 
    let searchQuery = req.body.query;
    let conn;
    let error = null;
    let resultsObject = {};
    let userObject = {};
    let postsArray = [];
    try {
        conn = await fetchConn();
        // Use Connection
        try {
            // find users
            let user = getID(searchQuery);
            if (Boolean(user)) {
                userObject["userID"] = user;
                userObject["username"] = searchQuery;
            }

            //find posts
            let postQuery = await getPosts(conn);
            for (post in postQuery) {
                if (post.postText.split().includes(searchQuery)) {
                    let commentsArray = await getCommentsFromPostID(conn, post.postID);
                    post["comments"] = commentsArray;
                    postsArray.push(post);
                }
            }
            resultsObject["user"] = userObject;
            resultsObject["posts"] = postsArray;
        } catch(e) {
            error = e;
        }
        let response = {
            'results': resultsObject,
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

app.post('/getThreads', async (req, res) => { 
    let conn;
    let error = null;
    let threadsArray = [];
    try {
        conn = await fetchConn();
        // Use Connection
        try {
            let threadQuery = await getThreads(conn);
            for (thread in threadQuery) {
                let messagesArray = await getMessagesFromThreadID(conn, thread.threadID);
                thread["messages"] = messagesArray;
                threadsArray.push(thread);
            }
        } catch(e) {
            error = e;
        }
        let response = {
            'threads': threadsArray,
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
 * Verifies if userID and login are correct.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {String} userID - UserID to check.
 * @param {String} salt - Salt to check.
 * @param {String} attemptedPassword - Password to attempt.
 **/
async function verifyCredentials(conn, userID, salt, attemptedPassword) {
    // Generate attemptedHashedSaltedPepperedPassword from attemptedPassword, leave as Buffer type
    const attemptedHashedSaltedPepperedPassword = hashSaltPepperPassword(attemptedPassword, salt);
    let rows = await getHashedSaltPepperPassword(conn, userID);
    let usersHash = rows[0].HashedSaltPepperPassword;

    return crypto.timingSafeEqual(attemptedHashedSaltedPepperedPassword, Buffer.from(usersHash, 'base64'));
}

/**
 * Verifies if auth details are correct.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {String} userID - UserID to check.
 * @param {String} sessionString - Session string to attempt.
 **/
async function verifyAuthSession(conn, userID, sessionString="") {
    let sqlQuery = "SELECT COUNT(1) as 'result' from SessionsTable WHERE userID=? AND sessionString=?";
    let ret = await conn.query(sqlQuery, [userID, sessionString]);
    let res;
    try {
        res = ret[0]['result'];
    } catch(e) {
        res = null;
    }
    return Boolean(res);
}

/**
 * Generates a random salt of specified length bytes.
 *
 * @param {number} length - Desired salt length.
 **/
function generateSalt(length) {
    return crypto.randomBytes(length/2);
}

function getFeedForUserID(conn, userID) {
    // Get following list
    const following = getFollowingListForUserID(conn, userID);
    let returnFeed = [];

    for (followingUserID in following) {
        const posts = getPostsFromUserID(conn, followingUserID);
        for (postID in posts) {
            const comments = getCommentsFromPostID(conn, postID);
        }
        // TODO: Fix
        returnFeed.push({posts, comments});
    }
    return returnFeed;
}

// get functions

/**
 * Gets user salt from database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {String} userID - Desired userID.
 **/
async function getSalt(conn, userID) {
    let sqlQuery = "SELECT salt from Users where userID=?";
    let ret = await conn.query(sqlQuery, [userID]);
    return ret[0];
}

/**
 * Gets user role from database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {String} userID - Desired userID.
 **/
async function getRole(conn, userID) {
    let sqlQuery = "SELECT adminRole from Users where userID=?";
    let ret = await conn.query(sqlQuery, [userID]);
    let res;
    try {
        res = ret.slice(0)[0].adminRole; //returns as object within array along with meta, remove meta
    } catch(e) {
        res = null;
    }
    return res;
}

/**
 * Gets username from database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {String} userID - Desired userID.
 **/
async function getUsername(conn, userID) {
    let sqlQuery = "SELECT username from Users where userID=?";
    let ret =  await conn.query(sqlQuery, [userID])
    let res;
    try {
        res = ret.slice(0)[0].username; //returns as object within array along with meta, remove meta
    } catch(e) {
        res = null;
    }
    return res;
}

/**
 * Gets userID from database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {String} username - Desired username.
 **/
 async function getUserID(conn, username) {
    let sqlQuery = "SELECT userID from Users where username=?";
    let ret =  await conn.query(sqlQuery, [username])
    let res;
    try {
        res = ret.slice(0)[0].userID; //returns as object within array along with meta, remove meta
    } catch(e) {
        res = null;
    }
    return res;
}

/**
 * Gets user hashed password from database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {String} userID - Desired userID.
 **/
async function getHashedSaltPepperPassword(conn, userID) {
    let sqlQuery = "SELECT HashedSaltPepperPassword from Userss where userID=?";
    let ret = await conn.query(sqlQuery, [userID]);
    let res;
    try {
        res = ret[0]['HashedSaltPepperPassword'];
    } catch(e) {
        res = null;
    }
    return res;
}

/**
 * TODO: update format
 * Gets posts for userID from database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {String} userID - Desired poster's userID.
 **/
async function getPostsFromUserID(conn, userID) {
    let sqlQuery = "SELECT * from Posts where posterID=?";
    let ret = await conn.query(sqlQuery, [userID]);
    return ret.slice(0);
}

/**
 * Gets all posts from database.
 *
 * @param {Promise<any>} conn - Pool connection.
 **/
 async function getPosts(conn) {
    let sqlQuery = "SELECT * from Posts LIMIT 100";
    let ret = await conn.query(sqlQuery);
    return ret.slice(0);
}

/**
 * Gets all threads from database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {Number} userID - Match userID.
 **/
 async function getThreadsWithUserID(conn, userID) {
    let sqlQuery = "SELECT * from Threads LIMIT 100";
    let ret = await conn.query(sqlQuery);
    let threadArray = ret.slice(0);
    let res = [];
    threadArray.forEach((thread) => {
        let parsedUserIDs = JSON.parse(thread.userIDs);
        if (parsedUserIDs.includes(userID)) {
            res.push(thread)
        }
    });
    
    return res;
}


/**
 * Gets post from a postID from database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {String} postID - Desired postID.
 **/
async function getPostFromPostID(conn, postID) {
    let sqlQuery = "SELECT * from Posts where postID=?";
    let ret = conn.query(sqlQuery, [postID]);
    return ret.slice(0);
}

/**
 * Gets comments from a postID from database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {String} postID - Desired postID.
 **/
async function getCommentsFromPostID(conn, postID) {
    let sqlQuery = "SELECT * from Comments where postID=?";
    let ret = await conn.query(sqlQuery, [postID]);
    return ret.slice(0);
}

/**
 * Gets messages from a userID from database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {String} userID - Desired userID.
 **/
async function getThreadsFromUserID(conn, userID) {
    let sqlQuery = "SELECT * from Threads where userID=?"
    return await conn.query(sqlQuery, [userID])
}

async function getMessagesFromThreadID(threadID) {
    let conn = await fetchConn();
    let sqlQuery = "SELECT * from Messages where threadID=?";
    let ret = await conn.query(sqlQuery, [threadID]);
    return ret.slice(0);
}

// set functions

/**
 * Creates a new user in the database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {String} username - Desired username.
 * @param {String} password - Desired password.
 * @param {String} role - Desired role.
 **/
 function createUser(conn, username, password, role) {
    const salt = generateSalt(hashConfig.SALT_LEN);
    const hashedSaltedPepperedPassword = hashSaltPepperPassword(password, salt.toString('base64'));
    let sqlQuery = "INSERT INTO User VALUES (?, ?, ?, ?, ?)"
    const time = Date.now();
    return conn.query(sqlQuery, [username, hashedSaltedPepperedPassword.toString('base64'), salt.toString('base64'), role, time]);
    //TODO: handle taken username
}

/**
 * Creates a post by userID into database.
 *
 * @param {Promise<any>} conn - Pool connection.
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
 * @param {Promise<any>} conn - Pool connection.
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
 * Creates a message from a sender userID to recipient userID into database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {String} senderUserID - Desired sender userID.
 * @param {String[]} recipientUserIDs - Desired recipient userID(s).
 * @param {String} messageText - Desired message text.
 * @param {String} messageAttachments - Desired message attachments.
 **/
async function createMessageFromUserIDToUserID(conn, senderUserID, recipientUserIDs, messageText, messageAttachments) {
    let sqlQuery = "INSERT INTO Messages VALUES (?, ?, ?, ?, ?)"
    return await conn.query(sqlQuery, [senderUserID, recipientUserID, messageText, messageAttachments, Date.now()])
}

// admin functions

/**
 * Blocks post by postID into database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {String} postID - Desired postID to block.
 **/
async function blockPost(conn, postID) {
    //TODO: check admin role
    let sqlQuery = "UPDATE Posts SET blockStatus=? WHERE postID=?"
    return await conn.query(sqlQuery, [1, postID])
}

/**
 * Unblocks post by postID into database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {String} postID - Desired postID to unblock.
 **/
async function unblockPost(conn, postID) {
    //TODO: check admin role
    let sqlQuery = "UPDATE Posts SET blockStatus=? WHERE postID=?"
    return await conn.query(sqlQuery, [0, postID])
}

/**
 * Blocks comment by commentID into database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {String} commentID - Desired commentID to block.
 **/
async function blockComment(conn, commentID) {
    //TODO: check admin role
    let sqlQuery = "UPDATE Comment SET blockStatus=? WHERE commentID=?"
    return await conn.query(sqlQuery, [1, commentID])
}

/**
 * Unblocks comment by commentID into database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {String} commentID - Desired commentID to unblock.
 **/
 async function unblockComment(conn, commentID) {
    //TODO: check admin role
    let sqlQuery = "UPDATE Comment SET blockStatus=? WHERE commentID=?"
    return await conn.query(sqlQuery, [0, commentID])
}

// Run web server
app.listen(PORT, () => console.log("Listening on port %s", PORT));