//fetch username, following, profile pic
//send userID, sessionID, and target profile
//show posts on click
//import Posts.jsx

import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Admin from './Admin'
import Login from './Login'
import AuthData from './AuthData';
import Invalid from './Invalid'
import Posts from './Posts/Posts'
import Messages from './Messaging/Messages'
import Search from './Search'
import { useState, useEffect } from 'react';

function Profile({ requestedUserID }){

    const[userInfo, setUserInfo] = useState('');
    const[userObject, setUserObject] = useState({});

    useEffect(async () => {
        fetch('http://localhost:3002/getUser', {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                userID: AuthData.getID(),
                sessionString: AuthData.getSessionString(),
                requestedUserID: AuthData.getID()
            })
        }).then(res => {
            return res.json();
        }).then(function(data) {
            console.log(data)
            setUserObject(data)
        })
    }, [])


    return(
        
        <div>
            {console.log(userObject.user)}
            <h2>{userObject.user.username}</h2>
            <h2>{userObject.user.followingList}</h2>
            <h2>{userObject.user.profilePicture}</h2>
        </div>
        
    )

}

export default Profile;