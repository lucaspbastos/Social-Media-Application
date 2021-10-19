import styles from './PostCards.module.scss'
import { useState } from 'react';
import Comment from './Comment'
import AuthData from '../AuthData';
function PostCards({ id, caption, imgUrl}) {
    const [comment,setComment]=useState('');

    
    function handleBlock(e, ids){
        //remove post from db
        e.preventDefault();
        /*fetch('/blockPost', {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username: AuthData.getName(), role: AuthData.getAdmin(), sessionString: AuthData.getSessionString(), postID: ids})

          }).then(res => {
            return res.json();
          }).then(function(data) {
            console.log(data.blocked)
            window.location.reload(true);

        })*/
        
    }
    function handleComment(e,pstid,cmnt){
        
        e.preventDefault();
        console.log("comment id "+pstid+" comment is "+cmnt)  
        /*fetch('/createComment', {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username: AuthData.getName(), role: AuthData.getAdmin(), sessionString: AuthData.getSessionString(), text: cmnt, attachment: "", postID: pstid})

          }).then(res => {
            return res.json();
          }).then(function(data) {
            console.log(data.created)
            window.location.reload(true);

        })*/
        
    }
    return (
        <>
        <div id={id} className={styles.boxModel}>
            <div dangerouslySetInnerHTML={{__html: `${caption}` }}/>
            {imgUrl ==='' ? (<></>) : (<><br/><img src={imgUrl} style={{width:"100px", height: "100px"}}/></>) }
            <br/><br/>
        <div/>
            <button className={styles.button} type="button" onClick={(e)=> handleBlock(e,id)}>{"Block Post"}</button>
            <span style={{display: "block", marginBottom: "10px"}}/>
            <form style={{textAlign: "center"}}>
            <label >
                <textarea type="text" name="comment" value={comment} onChange={(e) => setComment(e.target.value)}/>
            </label>
            <br/>
            <input style={{textAlign: "center"}} type="submit" value="Comment!" onClick={(e)=>handleComment(e,id,comment)} />
            </form>
            <p>{"id is "+id}</p>
        </div>
        </>
    );
}
  
export default PostCards;
