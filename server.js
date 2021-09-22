// Lucas Bastos
// CS-490 Alpha Project

const express = require('express');
const app = express();
const port = process.env.PORT || 3001;


app.get('/', (req,res)=> { 
    // default landing
    const index = 'hello!';
    res.send(index);
});

app.post('/login', (req,res) => {

});

hashSaltPepper = (password, salt, pepper) => {
    // Compute hashedSaltedPepperedPassword
    return hash.sha256(password + salt + pepper);
};

function getSalt(username) {
    // get user salt from database
    return "";
}

function checkUser(username, hashedSaltedPepperedPassword) {
    // check if hashed passwords match
    return false;
}

// Run web server


app.listen(port, () => console.log("Listening on port %s", port));