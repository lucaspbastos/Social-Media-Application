import styles from './PostCards.module.scss'
import { useState } from 'react';
import Comment from './Comment'
import AuthData from '../AuthData';
function PostCards({ id, caption, imgUrl}) {
    const [comment,setComment]=useState('');

    
    function handleBlock(ids){
        //remove post from db
        console.log("hello")
        if(ids===2){
            var element = document.getElementById(id);
            element.parentNode.removeChild(element);
            window.location.reload();

        }
        else{
            console.log("not 2")
        }
        //send post request
        //set blockstatus to true, and id of post
        //
    }
    function handleComment(e,pstid,cmnt){
        
        e.preventDefault();
        console.log("comment id "+pstid+" comment is "+cmnt)  
        
        //send data to the backend, with post id, comment,
        //add comment to post by id
        //window reload
    }
    return (
        <>
        <div id={id} className={styles.boxModel}>
            <div dangerouslySetInnerHTML={{__html: `${caption}` }}/>
            {imgUrl ==='' ? (<></>) : (<><br/><img src={imgUrl} style={{width:"100px", height: "100px"}}/></>) }
            <br/><br/>
        <div/>
            <button className={styles.button} type="button" onClick={()=> handleBlock(id)}>{"Block Post"}</button>
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
