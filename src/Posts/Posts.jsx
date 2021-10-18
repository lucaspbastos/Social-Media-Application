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
    

    const [msg,setMsg]=useState('');
    const [img,setImg]=useState('');
    const [newpost,setnewPost]=useState(false);
    
    useEffect(()=>{
        if(newpost===true){
            console.log("new post was made")
            /*fetch('/posts', {
                method: 'GET',
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({msgs,imgs,blockestatus})
  
              }).then(res => {
                return res.json();
              }).then(function(data) {*/
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
            setnewPost(true)
            //send username, img, msg intially, id not necessary
            /*fetch('/posts', {
                method: 'POST',
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({msgs,imgs,blockestatus})
  
              }).then(res => {
                return res.json();
              }).then(function(data) {
                console.log(data.login)
                // Handle no user
                console.log(data.role)
                if (data.login) {
                  if (data.role === 1) {
                    history.push("/admin")
                  } else {
                    history.push("/user")
                  }
                } else {
                  history.push("/invalid")
                }
                console.log(data.error)
            })*/

        }
        else{
            console.log("nothing entered")
        }
    }
    const dataObject = {
        posts: [
            { id: 1, imgUrl: "https://secure.img1-fg.wfcdn.com/im/98270403/resize-h800-w800%5Ecompr-r85/8470/84707680/Pokemon+Pikachu+Wall+Decal.jpg", text : "<i><strong>somedata</strong></i>", user: "bob", comments: [{id: 1, imgUrl: "", text: "comment1", user: "blah"}, { id: 2, text: "comment2", user: "blah"}]}, { id: 2, text : "blah blah blah", user: "bob", comments: [{id: 1, text: "comment1", user: "blah"}, { id: 2, text: "comment3", user: "comment4"}]}
        ]
    };
    
    const htmlString = "<h1><strong>somedata</strong></h1>";
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
                    {dataObject.posts.map((index)=>
                        <div key={index.id}>
                            <PostCards id={index.id} caption={index.text} imgUrl={index.imgUrl}/>
                            {index.comments.map((idx)=>
                                <div key={idx.id }>
                                    <Comment id={index.id} comment={idx.text} />
                                </div>
                            )}
                            <br/>
                        </div>
                    )}               
                </div>
            </div >
        </div>

    );
}
    
export default Posts;


/*{
    postid
    post text
    username
    attached files/images
    datetime
    message
    block status
}*/
/*{Object.keys(foodsObject).map(key => (
                        <div>
                        <h1> {foodsObject[key].name} </h1>
                        <PostCards key={foodsObject[key].id} id={foodsObject[key].id}/>
                        {Object.keys(foodsObject[key].cost).map(keys => (
                            <Comment key={foodsObject[key].id} comment={foodsObject[key].cost[keys]} />
                        ))}
                        <p> {foodsObject[key].calories} </p>
                        </div>
                    ))}*/