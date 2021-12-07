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
import PostCards from './Posts/PostCards'
import Comment from './Posts/Comment'
import Header from './Header';

function Profile({ requestedUserID }){

    const[userInfo, setUserInfo] = useState('');
    const[userObject, setUserObject] = useState({
        user: {
            username: '',
            profilePicture: '',
            followingUsers: [0],
            posts: [],
        }
    });

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
        <div style={{textAlign: "center"}}>
            <Header/>  
            <h1> Username </h1>
            <h2>{userObject.user.username}</h2>
            <h1> Following:</h1>
            <h2>{userObject.user.followingUsers.length-1}</h2>
            <h1> Profile Picture </h1>
            <h2>{userObject.user.profilePicture}</h2>
            {console.log(userObject.user.posts)}
            <div>
            {userObject.user.posts.map((post)=>
                (<div key={post.postID}>
                    <PostCards id={post.postID} caption={post.postText} imgUrl={post.fileNames}/>
                    {post.comments.map((comment)=>
                        <div key={comment.commentID }>
                            <Comment id={comment.commentID} comment={comment.commentText} userID={comment.userID}/>
                        </div>
                    )}
                    <br/>
                </div>)
            )}
            </div>
        </div>
        
    )

}

export default Profile;