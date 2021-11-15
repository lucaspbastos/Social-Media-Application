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
    let response;
    let conn;

    try {
        conn = await fetchConn();
        const userID = await getUserID(conn, username);
        if (userID) {
            const salt = await getSalt(conn, userID);
            if (salt) {
                const isUser = await verifyCredentials(conn, userID, salt, password);
                if (isUser) {
                    const role = await getRole(conn, userID);
                    const authString = await generateSession(conn, userID);
                    response = {
                        'userID': userID,
                        'login': authString,
                        'role': role,
                    }
                } else {
                    throw 'bad auth';
                }
            } else {
                throw 'bad auth';
            }
        } else {
            throw "bad auth";  
        }
    } catch (err) {
        response = {
            'error': err
        }; 
    } finally {
        if (conn) conn.end();
        res.send(JSON.stringify(response));
    }
});

app.post('/logout', async (req, res) => { 
    let userID = req.body.userID;
    let sessionString = req.body.sessionString;
    let response;
    let conn;

    try {
        conn = await fetchConn();
        const isUser = await verifyAuthSession(conn, userID, sessionString);
        if (isUser) {
            const loggedOut = await removeSession(conn, userID, sessionString);
            if (loggedOut) {
                response = {
                    'loggedOut': loggedOut
                }
            } else {
                throw 'could not log out';
            }
            
        } else {
            throw 'bad auth';
        }
    } catch (err) {
        response = {
            'error': err
        };
    } finally {
        if (conn) conn.end();
        res.send(JSON.stringify(response));
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

app.post('/follow', async (req, res) => { 
    let userID = req.body.userID;
    let followUserID = req.body.followUserID;
    let sessionString = req.body.sessionString;
    let response;
    let conn;

    try {
        conn = await fetchConn();
        const isUser = await verifyAuthSession(conn, userID, sessionString);
        if (isUser) {
            let followingList = await getFollowingListForUserID(conn, userID);
            if (followingList.includes(Number(followUserID))) {
                throw 'already following';
            } else {
                followingList.push(Number(followUserID));
            }
            const updatedFollowingList = await updateFollowingListForUserID(conn, userID, followingList);
            if (updatedFollowingList) {
                response = {
                    'followed': updatedFollowingList
                }
            } else {
                throw 'could not follow';
            }
        } else {
            throw 'bad auth';
        }
    } catch (err) {
        response = {
            'error': err
        };
    } finally {
        if (conn) conn.end();
        res.send(JSON.stringify(response));
    }
});

app.post('/unfollow', async (req, res) => { 
    let userID = req.body.userID;
    let unfollowUserID = req.body.unfollowUserID;
    let sessionString = req.body.sessionString;
    let response;
    let conn;

    try {
        conn = await fetchConn();
        const isUser = await verifyAuthSession(conn, userID, sessionString);
        if (isUser) {
            let followingList = await getFollowingListForUserID(conn, userID);
            let newList = followingList.filter(user => Number(user) != Number(unfollowUserID));
            const updatedFollowingList = await updateFollowingListForUserID(conn, userID, newList);
            if (updatedFollowingList && followingList.length != newList.length) {
                response = {
                    'unfollowed': updatedFollowingList
                }
            } else {
                throw 'could not unfollow';
            }
        } else {
            throw 'bad auth';
        }
    } catch (err) {
        response = {
            'error': err
        };
    } finally {
        if (conn) conn.end();
        res.send(JSON.stringify(response));
    }
});

app.post('/search', async (req, res) => {
    let userID = req.body.userID;
    let searchQuery = req.body.search;
    let sessionString = req.body.sessionString;
    let response;
    let conn;

    try {
        conn = await fetchConn();
        //const isUser = await verifyAuthSession(conn, userID, sessionString);
        //TODO: change userObject["username"] to "users"
        isUser=true;
        if (isUser) {
            let resultsObject = {};
            let userObject = {
                "username": []
            };
            userObject["username"] = [];
            let postsArray = [];

            //find close matches
            const others = await getAllUsers(conn);
            console.log(others)
            if (others) {
                for (let username of others) {
                    if (username.username.includes(searchQuery)) {
                        userObject["username"].push(username.username);
                    }
                }
            }

            //find posts
            const posts = await getAllPosts(conn);
            if (posts) {
                for (let post of posts) {
                    const text = post.postText;
                    const textSplit = text.split(" ");
                    if (textSplit.includes(searchQuery)) {
                        const postID = post.postID;
                        const commentsArray = await getCommentsFromPostID(conn, postID);
                        post["comments"] = commentsArray;
                        postsArray.push(post);
                    }
                }
            }
            
            resultsObject["user"] = userObject;
            resultsObject["posts"] = postsArray;

            response = {
                'results': resultsObject,
            }
            console.log(response);
        } else {
            throw 'bad auth';
        }
    } catch (err) {
        response = {
            'error': err
        };
    } finally {
        if (conn) conn.end();
        res.send(JSON.stringify(response));
    }
});

app.post('/getPosts', async (req, res) => {
    let userID = req.body.userID;
    let sessionString = req.body.sessionString;
    let response;
    let conn;

    try {
        conn = await fetchConn();
        const isUser = await verifyAuthSession(conn, userID, sessionString);
        if (isUser) {
            let postsArray = [];

            // let following = await getFollowing(conn, userID);
            // let posts = await getPostsFromFollowing(conn, following);
            const posts = await getAllPosts(conn);
            for (const post of posts) {
                const postID = post.postID;
                const commentsArray = await getCommentsFromPostID(conn, postID);
                post["comments"] = commentsArray;
                postsArray.push(post);
            }
            response = {
                'posts': postsArray,
            }
        } else {
            throw 'bad auth';
        }
    } catch (err) {
        response = {
            'error': err
        };
    } finally {
        if (conn) conn.end();
        res.send(JSON.stringify(response));
    }
});

app.post('/createPost', async (req, res) => { 
    let userID = req.body.userID;
    let postText = req.body.text;
    let sessionString = req.body.sessionString;
    let postAttachments = req.body.attachment;
    let conn;

    try {
        conn = await fetchConn();
        const isUser = await verifyAuthSession(conn, userID, sessionString);
        if (isUser) {
            const created = await createPostFromUserID(conn, userID, postText, postAttachments);
            if (created) {
                response = {
                    'created': created,
                }
            } else {
                throw 'could not create post';
            }
        } else {
            throw 'bad auth';
        }
    } catch (err) {
        response = {
            'error': err
        };
    } finally {
        if (conn) conn.end();
        res.send(JSON.stringify(response));
    }
});

app.post('/createComment', async (req, res) => { 
    let userID = req.body.userID;
    let postID = req.body.postID;
    let commentText = req.body.commentText;
    let sessionString = req.body.sessionString;
    let commentAttachments = req.body.commentAttachments;
    let conn;

    try {
        conn = await fetchConn();
        const isUser = await verifyAuthSession(conn, userID, sessionString);
        if (isUser) {
            const created = await createCommentFromUserID(conn, userID, postID, commentText, commentAttachments);
            if (created) {
                response = {
                    'created': created
                }
            } else {
                throw 'could not create comment';
            }
        } else {
            throw 'bad auth';
        }
    } catch (err) {
        response ={
            'error': err
        };
    } finally {
        if (conn) conn.end();
        res.send(JSON.stringify(response));
    }
});


app.post('/getThreads', async (req, res) => { 
    let userID = req.body.userID;
    let sessionString = req.body.sessionString;
    let response;
    let conn;

    try {
        conn = await fetchConn();
        const isUser = await verifyAuthSession(conn, userID, sessionString);
        if (isUser) {
            let threadsArray = [];
            const threads = await getThreadsWithUserID(conn, userID);
            console.log(threads);
            for (let thread of threads) {
                const threadID = thread.threadID;
                const messagesArray = await getMessagesFromThreadID(conn, threadID);
                thread["messages"] = messagesArray;
                threadsArray.push(thread);
            }

            response = {
                'threads': threadsArray
            }
            console.log(response);
        } else {
            throw 'bad auth';
        }
    } catch (err) {
        response = {
            'error': err
        };
    } finally {
        if (conn) conn.end();
        res.send(JSON.stringify(response));
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
    let userID = req.body.userID;
    let threadName = req.body.threadName;
    let sessionString = req.body.sessionString;
    let recipientUserIDs = req.body.recipientUserIDs;
    let response;
    let conn;

    try {
        conn = await fetchConn();
        const isUser = await verifyAuthSession(conn, userID, sessionString);
        if (isUser) {
            const created = await createThread(conn, threadName, recipientUserIDs);
            if (created) {
                response = {
                    'created': created,
                }
            } else {
                throw 'could not create thread';
            }
        } else {
            throw 'bad auth';
        }
    } catch (err) {
        response = {
            'error': err
        };
    } finally {
        if (conn) conn.end();
        res.send(JSON.stringify(response));
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

app.post('/createMessage', async (req, res) => { 
    let userID = req.body.userID;
    let threadID = req.body.threadID;
    let recipientUserIDs = req.body.recipientUserIDs;
    let messageText = req.body.messageText;
    let messageAttachments = req.body.messageAttachments;
    let sessionString = req.body.sessionString;
    let response;
    let conn;

    try {
        conn = await fetchConn();
        const isUser = await verifyAuthSession(conn, userID, sessionString);
        if (isUser) {
            const createResult = await createMessageFromUserID(conn, threadID, userID, recipientUserIDs, messageText, messageAttachments);
            if (createResult) {
                response = {
                    'created': createResult,
                }
            } else {
                throw 'could not create message';
            }
        } else {
            throw 'bad auth';
        }
    } catch (err) {
        response = {
            'error': err
        };
    } finally {
        if (conn) conn.end();
        res.send(JSON.stringify(response));
    }
});

app.post('/createUser', async (req, res) => { 
    let userID = req.body.userID;
    let password = req.body.password;
    let newUsername = req.body.newUsername;
    let sessionString = req.body.sessionString;
    let response;
    let conn;

    try {
        conn = await fetchConn();
        const isUser = await verifyAuthSession(conn, userID, sessionString);
        if (isUser) {
            const role = await getRole(conn, userID);
            if (role == 1) {
                const created = await createUser(conn, newUsername, password, 0);
                if (created) {
                    response = {
                        'created': created,
                    }
                } else {
                    throw 'could not create user';
                }
            } else {
                throw 'not admin';
            }
        } else {
            throw 'bad auth';
        }
    } catch (err) {
        response = {
            'error': err
        };
    } finally {
        if (conn) conn.end();
        res.send(JSON.stringify(response));
    }
});

app.post('/blockPost', async (req, res) => { 
    let userID = req.body.userID;
    let postID = req.body.postID;
    let sessionString = req.body.sessionString;
    let response;
    let conn;

    try {
        conn = await fetchConn();
        const isUser = await verifyAuthSession(conn, userID, sessionString);
        if (isUser) {
            const role = await getRoleFromUserID(conn, userID);
            if (role == 1) {
                const blocked = await blockPost(conn, postID);
                if (blocked) {
                    response = {
                        'blocked': blocked,
                    }
                } else {
                    throw 'could not block post';
                }
            } else {
                throw 'not admin';
            }
        }
    } catch (err) {
        response = {
            error: err
        };
    } finally {
        if (conn) conn.end();
        res.send(JSON.stringify(response));
    }
});

app.post('/unblockPost', async (req, res) => { 
    let userID = req.body.userID;
    let postID = req.body.postID;
    let sessionString = req.body.sessionString;
    let response;
    let conn;

    try {
        conn = await fetchConn();
        const isUser = await verifyAuthSession(conn, userID, sessionString);
        if (isUser) {
            const role = await getRoleFromUserID(conn, userID);
            if (role == 1) {
                const unblocked = await unblockPost(conn, postID);
                if (unblocked) {
                    response = {
                        'blocked': blocked,
                    }
                } else {
                    throw 'could not unblock post';
                }
            } else {
                throw 'not admin';
            }
        }
    } catch (err) {
        response = {
            error: err
        };
    } finally {
        if (conn) conn.end();
        res.send(JSON.stringify(response));
    }
});

// misc functions

/**
 * Returns a connection to the database.
 **/
async function fetchConn() {
    let conn = await pool.getConnection();
    return conn;
}

/**
 * Returns a hashed, salted, and peppered password buffer.
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
 * Generates a random salt buffer of specified length bytes.
 *
 * @param {Number} length - Desired salt length.
 **/
function generateSalt(length) {
    return crypto.randomBytes(length/2);
}

/**
 * Generate a new session string for a usr.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {Number} userID - Desired userID.
 **/
async function generateSession(conn, userID) {
    const sessionString = crypto.randomBytes(64).toString('base64');
    let sqlQuery = "INSERT INTO SessionsTable VALUES (?, ?, ?)"
    const epochTime = new Date().getTime()/1000;
    const row = await conn.query(sqlQuery, [userID, sessionString, epochTime]);
    if (row.constructor.name == "OkPacket" && row.affectedRows == 1) {
        return sessionString;
    }
    return null;
}

/**
 * Generate a new session string for a usr.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {Number} userID - Desired userID.
 * @param {String} sessionString - Desired session string.
 **/
async function removeSession(conn, userID, sessionString) {
    let sqlQuery = "DELETE FROM SessionsTable WHERE userID=? AND sessionString=?";
    const row = await conn.query(sqlQuery, [userID, sessionString]);
    if (row.constructor.name == "OkPacket" && row.affectedRows == 1) {
        return true;
    }
    return false;
}

// get functions

/**
 * Gets user salt from database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {Number} userID - Desired userID.
 **/
async function getSalt(conn, userID) {
    let sqlQuery = "SELECT salt from Users WHERE userID=?";
    let ret = await conn.query(sqlQuery, [userID]);
    if (ret.length == 0) {
        return null;
    }
    return ret[0].salt;
}

/**
 * Gets user role from database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {Number} userID - Desired userID.
 **/
async function getRole(conn, userID) {
    let sqlQuery = "SELECT adminRole from Users WHERE userID=?";
    let ret = await conn.query(sqlQuery, [userID]);
    if (ret.length == 0) {
        return null;
    }
    return ret[0].adminRole;
}

/**
 * Gets username from database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {Number} userID - Desired userID.
 **/
async function getUsername(conn, userID) {
    let sqlQuery = "SELECT username from Users WHERE userID=?";
    let ret =  await conn.query(sqlQuery, [userID]);
    if (ret.length == 0) {
        return null;
    }
    return ret[0].username;
}

/**
 * Gets userID from database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {String} username - Desired username.
 **/
async function getUserID(conn, username) {
    let sqlQuery = "SELECT userID from Users WHERE username=?";
    let ret =  await conn.query(sqlQuery, [username]);
    if (ret.length == 0) {
        return null;
    }
    return ret[0].userID;
}

/**
 * Gets userID from database.
 *
 * @param {Promise<any>} conn - Pool connection.
 **/
async function getAllUsers(conn) {
    let sqlQuery = "SELECT username from Users";
    let ret =  await conn.query(sqlQuery);
    if (ret.length == 0) {
        return null;
    }
    return ret.slice(0);
}

/**
 * Gets user hashed password from database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {Number} userID - Desired userID.
 **/
async function getHashedSaltPepperPassword(conn, userID) {
    let sqlQuery = "SELECT HashedSaltPepperPassword from Users WHERE userID=?";
    let ret = await conn.query(sqlQuery, [userID]);
    if (ret.length == 0) {
        return null;
    }
    return ret[0].HashedSaltPepperPassword;
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
    if (ret.length == 0) {
        return null;
    }
    return JSON.parse(ret[0].followingList);
}

/**
 * Gets posts for userID from database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {Number} userID - Desired poster's userID.
 **/
async function getPostsFromUserID(conn, userID) {
    let sqlQuery = "SELECT * from Posts WHERE posterID=?";
    let ret = await conn.query(sqlQuery, [userID]);
    return ret.slice(0);
}

/**
 * Gets post that matches postID from database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {Number} postID - Desired postID.
 **/
async function getPostsFromPostID(conn, postID) {
    let sqlQuery = "SELECT * from Posts WHERE postID=?";
    let ret = await conn.query(sqlQuery, [postID]);
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
    let sqlQuery = "SELECT * from Posts WHERE postID=?";
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
    let sqlQuery = "SELECT * from Comments WHERE postID=?";
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
    //TODO: super inefficient, fix
    let sqlQuery = "SELECT * from Threads LIMIT 100";
    const ret = await conn.query(sqlQuery);
    const threads = ret.slice(0);
    let res = [];
    for (let thread of threads) {
        const userIDs = thread.userIDs;
        const parsedUserIDs = JSON.parse(userIDs)
        if (parsedUserIDs.includes(userID)) {
            res.push(thread)
        }
    }
    return res;
}

/**
 * Gets messages from a threadID from database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {Number} threadID - Desired threadID.
 **/
async function getMessagesFromThreadID(conn, threadID) {
    let sqlQuery = "SELECT * from Messages WHERE threadID=?";
    let ret = await conn.query(sqlQuery, [threadID]);
    return ret.slice(0);
}

// set functions

/**
 * Sets new following list for userID.
 * @param {Promise<any>} conn - Pool connection.
 * @param {Number} userID - Desired userID.
 * @param {Number} followingList - Desired new following list.
 **/
async function updateFollowingListForUserID(conn, userID, followingList) {
    let sqlQuery = "UPDATE Users SET followingList=? WHERE userID=?";
    const row = await conn.query(sqlQuery, [JSON.stringify(followingList), userID]);
    console.log(row);
    if (row.constructor.name == "OkPacket" && row.affectedRows == 1) {
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
    if (row.constructor.name == "OkPacket" && row.affectedRows == 1) {
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
    if (row.constructor.name == "OkPacket" && row.affectedRows == 1) {
        return true;
    }
    return false;
}

/**
 * Creates a message from a sender userID to recipient userID into database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {String} threadName - Desired threadName.
 * @param {String[]} recipientUserIDs - Desired recipient userID(s).
 **/
async function createThread(conn, threadName, recipientUserIDs) {
    let sqlQuery = "INSERT INTO Threads VALUES (?, ?)"
    const row = await conn.query(sqlQuery, [threadName, recipientUserIDs]);
    if (row.constructor.name == "OkPacket" && row.affectedRows == 1) {
        return true;
    }
    return false;
}

/**
 * Creates a message from a sender userID to recipient userID into database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {String} threadName - Desired new threadName.
 * @param {Number} threadID - Desired threadID to change.
 **/
async function changeThreadName(conn, threadName, threadID) {
    let sqlQuery = "UPDATE Threads SET threadName=? WHERE threadID=?"
    const row = await conn.query(sqlQuery, [threadName, threadID]);
    if (row.constructor.name == "OkPacket" && row.affectedRows == 1) {
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
    if (row.constructor.name == "OkPacket" && row.affectedRows == 1) {
        return true;
    }
    return false;
}

// admin functions

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
    let sqlQuery = "INSERT INTO Users VALUES (?, ?, ?, ?, ?, ?, ?)"
    //const epochTime = Date.now()/1000;
    const row = await conn.query(sqlQuery, [0, username, hashedSaltedPepperedPassword.toString('base64'), salt, "[]", 1, role]);
    if (row.constructor.name == "OkPacket" && row.affectedRows == 1) {
        return true;
    }
    return false;
}

/**
 * Reactivates a user in the database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {Number} userID - Desired userID.
 **/
async function reactivateUser(conn, userID) {
    let sqlQuery = "UPDATE Users SET activateStatus=? WHERE userID=?"
    const row = await conn.query(sqlQuery, [1, userID]);
    if (row.constructor.name == "OkPacket" && row.affectedRows == 1) {
        return true;
    }
    return false;
}

/**
 * Deactivates a user in the database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {Number} userID - Desired userID.
 **/
async function deactivateUser(conn, userID) {
    let sqlQuery = "UPDATE Users SET activateStatus=? WHERE userID=?"
    const row = await conn.query(sqlQuery, [0, userID]);
    if (row.constructor.name == "OkPacket" && row.affectedRows == 1) {
        return true;
    }
    return false;
}

/**
 * Blocks post by postID into database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {Number} postID - Desired postID to block.
 **/
async function blockPost(conn, postID) {
    let sqlQuery = "UPDATE Posts SET blockStatus=? WHERE postID=?"
    let row = await conn.query(sqlQuery, [1, postID]);
    if (row.constructor.name == "OkPacket"&& row.affectedRows == 1) {
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
    if (row.constructor.name == "OkPacket" && row.affectedRows == 1) {
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
    const row = await conn.query(sqlQuery, [1, commentID]);
    if (row.constructor.name == "OkPacket" && row.affectedRows == 1) {
        return true;
    }
    return false;
}

/**
 * Unblocks comment by commentID into database.
 *
 * @param {Promise<any>} conn - Pool connection.
 * @param {String} commentID - Desired commentID to unblock.
 **/
async function unblockComment(conn, commentID) {
    let sqlQuery = "UPDATE Comment SET blockStatus=? WHERE commentID=?"
    const row = await conn.query(sqlQuery, [0, commentID]);
    if (row.constructor.name == "OkPacket" && row.affectedRows == 1) {
        return true;
    }
    return false;
}

// Run web server
app.listen(PORT, () => console.log("Listening on port %s", PORT));

//TODO: consolidate authentications into one function to avoid multiple reused code