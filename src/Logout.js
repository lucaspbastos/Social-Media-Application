//fetch username, following, profile pic
//send userID, sessionID, and target profile
//show posts on click
//import Posts.jsx

import './App.css';

import AuthData from './AuthData';
import { useState, useEffect } from 'react';

function Logout(){
    useEffect(async () => {
        fetch('http://localhost:3002/logout', {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                userID: AuthData.getID(),
                sessionString: AuthData.getSessionString(),
            })
        }).then(res => {
            return res.json();
        }).then(function(data) {
            console.log(data)
        })
    }, [])


    return(
        <div >
            <h1 style={{textAlign: "center"}}>{"Logged out"}</h1>
            <a href={"http://localhost:3001"}>{"Log in again"}</a>
        </div>
    )

}

export default Logout;