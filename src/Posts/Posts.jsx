import AuthData from '../AuthData';
import { Redirect } from 'react-router';
import { useState, useEffect } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import PostCards from './PostCards'
import Comment from './Comment'
import { Link } from 'react-router-dom';
import styles from './PostCards.module.scss'
import { Fade } from 'react-bootstrap';
import { conditionalExpression } from '@babel/types';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import { FilterFramesTwoTone } from '@material-ui/icons';


function Posts() {
    let run = 0;

    const [msg,setMsg]=useState('');
    const [img,setImg]=useState('');
    let [newpost, setnewPost]=useState(false);
    const [dataObject, setdataObject]=useState({
        posts: [{comments: [{}]
        }],
        user: {}
    });

    console.log("admin is "+AuthData.getAdmin())

    //fetch data onload
    useEffect(()=>{
            fetch('http://localhost:3002/getPosts', {
                method: 'POST',
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ userID: AuthData.getID(), role: AuthData.getAdmin(), sessionString: AuthData.getSessionString()})
            }).then(res => {
                return res.json();
            }).then(function(data){
                setdataObject(data)
            })
    }, [])

    //fetch every post
    useEffect(()=>{
        if(newpost===true){
            console.log("new post was made")
            newpost=false
            fetch('http://localhost:3002/getPosts', {
                method: 'POST',
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ userID: AuthData.getID(), role: AuthData.getAdmin(), sessionString: AuthData.getSessionString()})

            }).then(res => {
                return res.json();
            }).then(function(data){
                setdataObject(data)
            })
        }
    }, [newpost])

    if(AuthData.getAuth()!=="true"){
        return <Redirect to="/"/>;
    }
    

    function handleClick(event,msgs,imgs){
        event.preventDefault();
        if(msgs!=='' || imgs!==''){
            console.log(msgs)
            console.log(imgs)
            fetch('http://localhost:3002/createPost', {
                method: 'POST',
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    userID: AuthData.getID(), 
                    sessionString: AuthData.getSessionString(), 
                    text: msgs, 
                    attachment: imgs
                })
            }).then(res => {
                return res.json();
            }).then(function(data) {
                console.log(data)
                setnewPost(true)
            })

        }
        else{
            console.log("nothing entered")
        }
    }
    
    
    return (
        <div style={{textAlign: "center"}}>
            <Link to="/messages" className={styles.button} style={{height:"50px", width:"200px", backgroundColor:"#2b2b2b"}}>Messages</Link>
            {" "}
            <Link to="/admin" className={styles.button} style={{height:"50px", width:"200px", backgroundColor:"#2b2b2b"}}>Admin</Link>
            {" "}
            <Link to="/search" className={styles.button} style={{height:"50px", width:"200px", backgroundColor:"#2b2b2b"}}>Search</Link>
            <h1 style={{textAlign: "center"}}>{"Posts"}</h1>
            <br/>
            <div>
                <form style={{textAlign: "center"}}>
                    <label>
                    Post Message:
                    <br/>
                    <div className = "editor" style={{display: "block", marginLeft: "auto", marginRight: "auto", width:"50%"}}>
                    <label >
                        <textarea style={{width: "250px"}} type="text" name="message" value={msg} onChange={(e) => setMsg(e.target.value)} />
                    </label>
                    </div>
                    </label>
                    <br/>
                    <label>
                    Image Url:
                    <br/>
                    <input type="text" name="url" value={img} onChange={(e) => setImg(e.target.value)}/>
                    </label>
                    <br/>
                    <input type="submit" value="Submit" onClick={(e)=> { return handleClick(e,msg,img) }}/>
                </form> 

                <div>
                    {dataObject.posts.map((post)=>
                            (
                            <div key={post.id}>
                                {console.log(post)}
                                <PostCards id={post.postID} caption={post.fileNames} imgUrl={post.fileNames}/>
                                {post.comments.map((comment) => 
                                    <div key={comment.commentID }>
                                        <Comment id={comment.commentID} comment={comment.commentText} />
                                        <br/>
                                    </div>
                                )}  
                                <br/>
                            </div>
                        )                                 
                    )}               
                </div>
            </div >
        </div>

    );
}
    
export default Posts;


