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
    
    //for new comments on posts
    function handlePosts(){
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
                body: JSON.stringify({userID: AuthData.getID(), role: AuthData.getAdmin(), sessionString: AuthData.getSessionString(), text: msgs, attachment: imgs})
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
                <Box component="div" sx={{ display: 'flex', borderRadius: '10px', alignItems: 'center', justifyContent: 'center', alignContent:"center", p: 1, border: '1px solid #0074D9', marginLeft:'650px',  marginRight:'200px', width: "550px"}} >
                    <form style={{textAlign: "center"}}>
                        <label >
                            <TextField InputProps={{style: { color: "white" } }} label="Enter Message"  InputLabelProps={{ style: { color: '#fff' }, }} multiline minRows={4} variant="standard" color="primary" maxRows={7} style={{color: "white", width: "500px"}} type="text" name="message" value={msg} onChange={(e) => setMsg(e.target.value)}/>
                        </label>
                        <br/>
                        <TextField InputProps={{style: { color: "white" } }} label="Enter Message"  InputLabelProps={{ style: { color: '#fff' }, }} minRows={1} label="Enter Image Url" variant="standard" type="text" color="primary" name="url" value={img} onChange={(e) => setImg(e.target.value)} />
                        <br/><br/>
                        <Button type="submit" variant ="contained" size="large" color="primary" value="Submit" onClick={(e)=> { return handleClick(e,msg,img) }}>{"Post"}</Button>
                    </form> 
                </Box>
                    <div>
                        {dataObject.posts.map((post)=>
                                post.blockStatus === 0 ? (
                                <div key={post.id}>
                                    {console.log(post)}
                                    <PostCards id={post.postID} caption={post.postText} imgUrl={post.fileNames} handlePosts={handlePosts} blockStatus={post.blockStatus}/>
                                    {post.comments.map((comment) =>
                                        <div key={comment.commentID }>
                                            <Comment id={comment.commentID} comment={comment.commentText}/>
                                            <br/>
                                        </div>
                                    )} 
                                    <br/>
                                </div>
                            ) :
                            ((post.blockStatus === 1 && AuthData.getAdmin()==='1') && (
                                    <div key={post.id}>
                                        {console.log(post)}
                                        <PostCards id={post.postID} caption={post.postText} imgUrl={post.fileNames} handlePosts={handlePosts} blockStatus={post.blockStatus}/>
                                        {post.comments.map((comment) =>
                                            <div key={comment.commentID }>
                                                <Comment id={comment.commentID} comment={comment.commentText}/>
                                                <br/>
                                            </div>
                                        )} 
                                        <br/>
                                    </div>
                                )
                            )
                        )}             
                </div>
            </div >
        </div>

    );
}
    
export default Posts;