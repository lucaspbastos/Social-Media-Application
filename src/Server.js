// Lucas Bastos
// CS-490 Alpha Project
const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const pool = require('./db');
const app = express();
const PORT = process.env.SERVER_PORT || 3002;

app.use(cors());
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
    let username = req.body.username;
    let password = req.body.password;
    let conn;
    let isUser = false;
    let role = null;
    let error = null;
    let authString = null;
    let userID = null;

    try {
        conn = await fetchConn();
        // Use Connection
        try {
            userID = await getUserID(conn, username);
            const salt = await getSalt(conn, userID);
            if (salt) {
                isUser = await verifyCredentials(conn, userID, salt, password);
                if (isUser) {
                    role = await getRole(conn, userID);
                    authString = await generateSession(conn, userID);
                } else {
                    error = 'bad creds';
                }
            }
        } catch(e) {
            error = e;
        }
        let response = {
            'userID': userID,
            'login': authString,
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
    // remove session from DB
});

app.post('/getPosts', async (req, res) => { 
    let conn;
    let error = null;
    let postsArray = [];
    let sessionString = req.body.sessionString;
    let username = req.body.username;
    let userID = req.body.userID;
    let authenticated = false;

    try {
        conn = await fetchConn();
        const userID = await getUserID(conn, username);
        if (await verifyAuthSession(conn, userID, sessionString)) {
            authenticated = true;
        } else {
            res.send({
                'created': false,
                'error': 'bad auth'
            });
        }
    } catch (err) {
        // Manage Errors
        console.log(err)
        res.send({error: err});
    } finally {
        // Close Connection
        if (conn) conn.end();
    }

    if (authenticated) {
        try {
            conn = await fetchConn();
            // Use Connection
            try {
                let following = await getFollowing(conn, userID);
                let posts = await getPostsFromFollowing(conn, following);
                for (const post of posts) {
                    const postID = post.postID;
                    const commentsArray = await getCommentsFromPostID(conn, postID);
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
    }
});

app.post('/createPost', async (req, res) => { 
    let username = req.body.username;
    let sessionString = req.body.sessionString;
    let postText = req.body.text;
    let postAttachments = req.body.attachment;
    let conn;
    let authenticated = false;
    let error = null;
    let createResult = false;

    try {
        conn = await fetchConn();
        const userID = await getUserID(conn, username);
        if (await verifyAuthSession(conn, userID, sessionString)) {
            authenticated = true;
        } else {
            res.send({
                'created': false,
                'error': 'bad auth'
            });
        }
    } catch (err) {
        // Manage Errors
        console.log(err)
        res.send({error: err});
    } finally {
        // Close Connection
        if (conn) conn.end();
    }

    if (authenticated) {
        try {
            conn = await fetchConn();
            // Use Connection
            try {
                const userID = await getUserID(conn, username);
                createResult = await createPostFromUserID(conn, userID, postAttachments, postText);
            } catch(e) {
                error = e;
            }
            let response = {
                'created': createResult,
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
    }
});

app.post('/createComment', async (req, res) => { 
    let username = req.body.username;
    let role = req.body.role;
    let sessionString = req.body.sessionString;
    let postID = req.body.postID;
    let commentText = req.body.commentText;
    let commentAttachments = req.body.commentAttachments;
    let authenticated = false;
    let conn;

    try {
        conn = await fetchConn();
        const userID = await getUserID(conn, username);
        const isUser = await verifyAuthSession(conn, userID, sessionString);
        if (isUser) {
            authenticated = true;
        } else {
            res.send({
                'blocked': false,
                'error': 'bad auth'
            });
        }
    } catch (err) {
        // Manage Errors
        console.log(err)
        res.send({error: err});
    } finally {
        // Close Connection
        if (conn) conn.end();
    }

    let error = null;
    let createResult = false;

    try {
        conn = await fetchConn();
        // Use Connection
        try {
            const userID = await getUserID(conn, username);
            createResult = await createCommentFromUserID(conn, userID, postID, commentText, commentAttachments);
        } catch(e) {
            error = e;
        }
        let response = {
            'created': createResult,
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

app.post('/search', async (req, res) => {
    let searchQuery = req.body.search;
    let error = null;
    let resultsObject = {};
    let userObject = {};
    let postsArray = [];
    let sessionString = req.body.sessionString;
    let authenticated = false;
    let conn;

    try {
        conn = await fetchConn();
        const userID = await getUserID(conn, username);
        const isUser = await verifyAuthSession(conn, userID, sessionString);
        if (isUser) {
            authenticated = true;
        } else {
            res.send({
                'blocked': false,
                'error': 'bad auth'
            });
        }
    } catch (err) {
        // Manage Errors
        console.log(err)
        res.send({error: err});
    } finally {
        // Close Connection
        if (conn) conn.end();
    }

    if (authenticated) {
        try {
            conn = await fetchConn();
            // Use Connection
            try {
                // find users
                const user = await getUserID(conn, searchQuery);

                if (Boolean(user)) {
                    userObject["userID"] = user;
                    userObject["username"] = searchQuery;
                }

                //find posts
                let posts = await getPosts(conn);
                for (const post of posts) {
                    const text = post.postText;
                    const textSplit = text.split(" ");
                    if (textSplit.includes(searchQuery)) {
                        const postID = post.postID;
                        const commentsArray = await getCommentsFromPostID(conn, postID);
                        post["comments"] = commentsArray;
                        postsArray.push(post);
                    }
                }
                resultsObject["user"] = userObject;
                resultsObject["posts"] = postsArray;
            } catch(e) {
                error = e;
            }
            const response = {
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
    }
});

app.post('/getThreads', async (req, res) => { 
    const username = req.body.username;
    let sessionString = req.body.sessionString;
    let authenticated = false;
    let conn;

    try {
        conn = await fetchConn();
        const userID = await getUserID(conn, username);
        const isUser = await verifyAuthSession(conn, userID, sessionString);
        if (isUser) {
            authenticated = true;
        } else {
            res.send({
                'blocked': false,
                'error': 'bad auth'
            });
        }
    } catch (err) {
        // Manage Errors
        console.log(err)
        res.send({error: err});
    } finally {
        // Close Connection
        if (conn) conn.end();
    }

    if (authenticated) {
        let error = null;
        let threadsArray = [];

        try {
            conn = await fetchConn();
            // Use Connection
            try {
                const userID = await getUserID(conn, username);
                let threads = await getThreadsWithUserID(conn, userID);
                for (let thread of threads) {
                    const threadID = thread.threadID;
                    const messagesArray = await getMessagesFromThreadID(conn, threadID);
                    thread["messages"] = messagesArray;
                    threadsArray.push(thread);
                }
                const response = {
                'threads': threadsArray,
                'error': error
            }
            res.send(JSON.stringify(response));
            } catch(e) {
                error = e;
            }     
        } catch (err) {
            // Manage Errors
            console.log(err)
            res.send({error: err});
        } finally {
            // Close Connection
            if (conn) conn.end();
        }
    }
});

app.post('/createThread', async (req, res) => { 
    //TODO: fill in new thread creation
});

app.post('/createMessage', async (req, res) => { 
    //TODO: fill in new thread creation
    let username = req.body.username;
    let role = req.body.role;
    let threadID = req.body.threadID;
    let recipientUserIDs = req.body.recipientUserIDs;
    let messageText = req.body.messageText;
    let messageAttachments = req.body.messageAttachments;
    let sessionString = req.body.sessionString;
    let authenticated = false;
    let conn;

    try {
        conn = await fetchConn();
        const userID = await getUserID(conn, username);
        const isUser = await verifyAuthSession(conn, userID, sessionString);
        if (isUser) {
            authenticated = true;
        } else {
            res.send({
                'blocked': false,
                'error': 'bad auth'
            });
        }
    } catch (err) {
        // Manage Errors
        console.log(err)
        res.send({error: err});
    } finally {
        // Close Connection
        if (conn) conn.end();
    }

    if (authenticated) {
        let error = null;
        let createResult = false;

        try {
            conn = await fetchConn();
            // Use Connection
            try {
                const userID = await getUserID(conn, username);
                console.log(userID);
                createResult = await createMessageFromUserID(conn, threadID, userID, recipientUserIDs, messageText, messageAttachments);
            } catch(e) {
                error = e;
            }
            let response = {
                'created': createResult,
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
    }
});

app.post('/createUser', async (req, res) => { 
    let username = req.body.username;
    let role = req.body.role;
    let sessionString = req.body.sessionString;
    let newUsername = req.body.newUsername;
    let password = req.body.password;
    let authenticated = false;
    let created = false;
    let error = null;
    let conn;

    //check session
    try {
        conn = await fetchConn();
        const userID = await getUserID(conn, username);
        const isUser = await verifyAuthSession(conn, userID, sessionString);
        if (isUser) {
            authenticated = true;
        } else {
            res.send({
                'created': false,
                'error': 'bad auth'
            });
        }
    } catch (err) {
        // Manage Errors
        console.log(err)
        res.send({error: err});
    } finally {
        // Close Connection
        if (conn) conn.end();
    }

    if (authenticated) {
        try {
            conn = await fetchConn();
            // Use Connection
            try {
                if (role == 1) {
                    created = await createUser(conn, newUsername, password, 0);
                }
            } catch(e) {
                error = e;
            }
            let response = {
                'created': created,
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
    }
});

app.post('/blockPost', async (req, res) => { 
    let username = req.body.username;
    let role = req.body.role;
    let postID = req.body.postID;
    let blocked;
    let authenticated = false;
    let error = null;
    let sessionString = req.body.sessionString;

    //check session
    try {
        conn = await fetchConn();
        const userID = await getUserID(conn, username);
        const isUser = await verifyAuthSession(conn, userID, sessionString);
        if (isUser) {
            authenticated = true;
        } else {
            res.send({
                'blocked': false,
                'error': 'bad auth'
            });
        }
    } catch (err) {
        // Manage Errors
        console.log(err)
        res.send({error: err});
    } finally {
        // Close Connection
        if (conn) conn.end();
    }

    if (authenticated) {
        try {
            conn = await fetchConn();
            // Use Connection
            try {
                if (role == 1) {
                    blocked = await blockPost(conn, postID);
                }
            } catch(e) {
                error = e;
            }
            let response = {
                'blocked': blocked,
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
    }
});

app.post('/unblockPost', async (req, res) => { 
    //TODO: fill in post blocking, check auth
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
 * @param {Number} userID - UserID to check.
 * @param {String} salt - Salt to check.
 * @param {String} attemptedPassword - Password to attempt.
 **/
async function verifyCredentials(conn, userID, salt, attemptedPassword) {
    // Generate attemptedHashedSaltedPepperedPassword from attemptedPassword, leave as Buffer type
    const attemptedHashedSaltedPepperedPassword = hashSaltPepperPassword(attemptedPassword, salt);
    let usersHash = await getHashedSaltPepperPassword(conn, userID);
    return crypto.timingSafeEqual(attemptedHashedSaltedPepperedPassword, Buffer.from(usersHash, 'base64'));
}

/**
 * Verifies if auth details are correct.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {Number} userID - UserID to check.
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
 * @param {Number} length - Desired salt length.
 **/
function generateSalt(length) {
    return crypto.randomBytes(length/2);
}

async function generateSession(conn, userID) {
    const sessionString = crypto.randomBytes(64).toString('base64');
    let sqlQuery = "INSERT INTO SessionsTable VALUES (?, ?, ?)"
    const epochTime = new Date().getTime()/1000;
    const row = await conn.query(sqlQuery, [userID, sessionString, epochTime]);
    if (row.constructor.name == "OkPacket") {
        return sessionString;
    }
    return null;
}

// get functions

/**
 * Gets user salt from database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {Number} userID - Desired userID.
 **/
async function getSalt(conn, userID) {
    let sqlQuery = "SELECT salt from Users where userID=?";
    let ret = await conn.query(sqlQuery, [userID]);
    return ret[0]['salt'];
}

/**
 * Gets user role from database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {Number} userID - Desired userID.
 **/
async function getRole(conn, userID) {
    let sqlQuery = "SELECT adminRole from Users where userID=?";
    let ret = await conn.query(sqlQuery, [userID]);
    let res;
    console.log(res)
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
 * @param {Number} userID - Desired userID.
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
 * @param {Number} userID - Desired userID.
 **/
async function getHashedSaltPepperPassword(conn, userID) {
    let sqlQuery = "SELECT HashedSaltPepperPassword from Users where userID=?";
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
 * Gets list of following from userID.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {Number} userID - User to grab following list from.
 **/
async function getFollowingListForUserID(conn, userID) {
    let sqlQuery = "SELECT followingList from Users WHERE userID=?";
    let ret = await conn.query(sqlQuery, [userID]);
    return ret.slice(0);
}

/**
 * TODO: update format
 * Gets posts for userID from database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {Number} userID - Desired poster's userID.
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
 async function getAllPosts(conn) {
    let sqlQuery = "SELECT * from Posts LIMIT 100";
    let ret = await conn.query(sqlQuery);
    return ret.slice(0);
}

/**
 * Gets posts from database for list of users.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {Array<Number>} following - List of users to grab posts from.
 **/
 async function getPostsFromFollowing(conn, following) {
    let sqlQuery = "SELECT * from Posts WHERE userID in (?) LIMIT 100 ORDER BY postDatetime ASC";
    let ret = await conn.query(sqlQuery, [following]);
    return ret.slice(0);
}

/**
 * Gets all threads from database.
 *
 * @param {Promise<any>} conn - Pool connection.
 **/
 async function getThreads(conn) {
    let sqlQuery = "SELECT * from Threads LIMIT 100";
    let ret = await conn.query(sqlQuery);
    return ret.slice(0);
}

/**
 * Gets post from a postID from database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {Number} postID - Desired postID.
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
 * @param {Number} postID - Desired postID.
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
 * @param {Number} userID - Desired userID.
 **/
async function getThreadsWithUserID(conn, userID) {
    let sqlQuery = "SELECT * from Threads where userID=? LIMIT 100";
    const ret = await conn.query(sqlQuery, userID);
    const res = ret.slice(0);
    //let res = [];
    // for (const thread of threads) {
    //     const userIDs = thread.userIDs;
    //     const parsedUserIDs = JSON.parse(userIDs)
    //     if (parsedUserIDs.includes(userID)) {
    //         res.push(thread)
    //     }
    // }
    return res;
}

/**
 * Gets messages from a threadID from database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {Number} threadID - Desired threadID.
 **/
async function getMessagesFromThreadID(conn, threadID) {
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
 * @param {Number} role - Desired role.
 **/
async function createUser(conn, username, password, role) {
    const salt = generateSalt(hashConfig.SALT_LEN).toString('base64');
    const hashedSaltedPepperedPassword = hashSaltPepperPassword(password, salt.toString('base64'));
    let sqlQuery = "INSERT INTO Users VALUES (?, ?, ?, ?, ?)"
    //const epochTime = Date.now()/1000;
    const row = await conn.query(sqlQuery, [0, username, hashedSaltedPepperedPassword.toString('base64'), salt, role]);
    if (row.constructor.name == "OkPacket") {
        return true;
    }
    return false;
}

/**
 * Creates a post by userID into database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {Number} userID - Desired userID.
 * @param {String} postText - Desired post text.
 * @param {Array<String>} postAttachments - Desired post attachments.
 **/
async function createPostFromUserID(conn, userID, postText, postAttachments) {
    let sqlQuery = "INSERT INTO Posts VALUES (?, ?, ?, ?, ?, ?)"
    const epochTime = new Date().getTime()/1000;
    const blockStatus = 0;
    const row = await conn.query(sqlQuery, [0, userID, postAttachments, postText, epochTime, blockStatus]);
    if (row.constructor.name == "OkPacket") {
        return true;
    }
    return false;
}

/**
 * Blocks a comment by userID for postID into database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {Number} userID - Desired userID.
 * @param {Number} postID - Desired postID to comment under.
 * @param {String} commentText - Desired comment text.
 * @param {String} commentAttachments - Desired comment attachments.
 **/
async function createCommentFromUserID(conn, userID, postID, commentText, commentAttachments) {
    let sqlQuery = "INSERT INTO Comments VALUES (?, ?, ?, ?, ?, ?, ?)"
    const epochTime = new Date().getTime()/1000;
    const blockStatus = 0;
    const row = await conn.query(sqlQuery, [0, userID, postID, commentText,commentAttachments, epochTime, blockStatus]);
    if (row.constructor.name == "OkPacket") {
        return true;
    }
    return false;
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
async function createMessageFromUserID(conn, threadID, senderUserID, recipientUserIDs, messageText, messageAttachments) {
    let sqlQuery = "INSERT INTO Messages VALUES (?, ?, ?, ?, ?, ?, ?)"
    const epochTime = new Date().getTime()/1000;
    const row = await conn.query(sqlQuery, [0, threadID, senderUserID, recipientUserIDs, messageText, messageAttachments, epochTime]);
    if (row.constructor.name == "OkPacket") {
        return true;
    }
    return false;
}

// admin functions

/**
 * Blocks post by postID into database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {Number} postID - Desired postID to block.
 **/
async function blockPost(conn, postID) {
    let sqlQuery = "UPDATE Posts SET blockStatus=? WHERE postID=?"
    let row = await conn.query(sqlQuery, [1, postID]);
    if (row.constructor.name == "OkPacket") {
        return true;
    }
    return false;
}

/**
 * Unblocks post by postID into database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {Number} postID - Desired postID to unblock.
 **/
async function unblockPost(conn, postID) {
    let sqlQuery = "UPDATE Posts SET blockStatus=? WHERE postID=?";
    let row = await conn.query(sqlQuery, [0, postID]);
    if (row.constructor.name == "OkPacket") {
        return true;
    }
    return false;
}

/**
 * Blocks comment by commentID into database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {String} commentID - Desired commentID to block.
 **/
async function blockComment(conn, commentID) {
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
    let sqlQuery = "UPDATE Comment SET blockStatus=? WHERE commentID=?"
    return await conn.query(sqlQuery, [0, commentID])
}

// Run web server
app.listen(PORT, () => console.log("Listening on port %s", PORT));

//TODO: consolidate authentications into one function to avoid multiple reused code