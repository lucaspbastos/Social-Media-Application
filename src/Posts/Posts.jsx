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

function Posts() {
    let run = 0;

    const [msg,setMsg]=useState('');
    const [img,setImg]=useState('');
    let [newpost, setnewPost]=useState(false);
    const [dataObject, setdataObject]=useState({
        posts: [{}],
        user: {}
    });

    //initial load
    // if (run == 0) {
    //     console.log(run)
    //     fetch('http://localhost:3002/getPosts', {
    //         method: 'POST',
    //         headers: {"Content-Type": "application/json"},
    //         body: JSON.stringify({})

    //     }).then(res => {
    //         return res.json();
    //     }).then(function(data){
    //         console.log("data", data)
    //         setdataObject(data)
    //         console.log(dataObject)
    //     })
    // }
    

    
    useEffect(()=>{
        if(newpost===true){
            console.log("new post was made")
            newpost=false
            fetch('http://localhost:3002/getPosts', {
                method: 'POST',
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ username: AuthData.getName(), role: AuthData.getAdmin(), sessionString: AuthData.getSessionString()})

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
                body: JSON.stringify({username: AuthData.getName(), role: AuthData.getAdmin(), sessionString: AuthData.getSessionString(), text: msgs, attachment: imgs})
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
    // //remove this placeholder
    // const dataObject = {
    //     posts: [
    //         { id: 1, imgUrl: "https://secure.img1-fg.wfcdn.com/im/98270403/resize-h800-w800%5Ecompr-r85/8470/84707680/Pokemon+Pikachu+Wall+Decal.jpg", text : "<i><strong>somedata</strong></i>", user: "bob", comments: [{id: 1, imgUrl: "", text: "comment1", user: "blah"}, { id: 2, text: "comment2", user: "blah"}]}, { id: 2, text : "blah blah blah", user: "bob", comments: [{id: 1, text: "comment1", user: "blah"}, { id: 2, text: "comment3", user: "comment4"}]}
    //     ]
    // };
    
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
                        <CKEditor
                            editor={ ClassicEditor }
                            data={msg}
                            onChange={ ( event, editor ) => {
                                const data = editor.getData();
                                setMsg(data)
                            }}
                        />
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
                        <div key={post.id}>
                            <PostCards id={post.postID} caption={post.postText} imgUrl={post.fileNames}/>
                            
                            <br/>
                        </div>
                    )}               
                </div>
            </div >
        </div>

    );
}
    
export default Posts;


