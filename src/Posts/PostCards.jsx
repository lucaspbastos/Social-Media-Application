import styles from './PostCards.module.scss'
import { useState } from 'react';
import Comment from './Comment'
import AuthData from '../AuthData';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import { useEffect } from 'react';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import CardHeader from '@material-ui/core/CardHeader';
import { styled } from '@material-ui/core/styles';
import CardMedia from '@material-ui/core/CardMedia';
import CancelIcon from '@material-ui/icons/Cancel';
import SendIcon from '@material-ui/icons/Send';
import FavoriteIcon from '@material-ui/icons/Favorite';
import Divider from '@material-ui/core/Divider';
import SentimentVerySatisfiedIcon from '@material-ui/icons/SentimentVerySatisfied';

function PostCards({ id, caption, imgUrl, handlePosts, blockStatus, postLike}) {

   const [comment,setComment]=useState('');
   var pstlikeCnt=0
    if(postLike !== undefined){
        pstlikeCnt=postLike.length
    }
    // if(imgUrl[0].length===0){
    //     imgUrl="https://upload.wikimedia.org/wikipedia/commons/8/89/HD_transparent_picture.png"
    // }
   var blockValue=""
   if(blockStatus===1){
       blockValue="Unblock Post"
   }else if(blockStatus===0){
       blockValue="Block Post"
   }


   function handlePostLike(e, ids){
        e.preventDefault();
        if(postLike.includes(parseInt(AuthData.getID()))){
            console.log(AuthData.getID())
            console.log("liked")
        }
        else{
            console.log("not liked")
            /*
            fetch('http://localhost:3002/likePost', {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                userID: AuthData.getID(), 
                sessionString: AuthData.getSessionString(), 
                postID: id})
        }).then(res => {
            return res.json();
        }).then(function(data) {
            console.log(data)
            handlePosts();
        })


            */
            
        }
   }
   function handleBlock(e, ids){
       //remove post from db
       e.preventDefault();
       console.log(blockStatus)
       if(blockStatus===0){
           fetch('http://localhost:3002/blockPost', {
           method: 'POST',
           headers: {"Content-Type": "application/json"},
           body: JSON.stringify({
               userID: AuthData.getID(), 
               sessionString: AuthData.getSessionString(), 
               postID: ids
            })
 
       }).then(res => {
           return res.json();
       }).then(function(data) {
           console.log(data.blocked)
           window.location.reload(true);
 
       })
       }else{
           fetch('http://localhost:3002/unblockPost ', {
           method: 'POST',
           headers: {"Content-Type": "application/json"},
           body: JSON.stringify({
            userID: AuthData.getID(), 
            sessionString: AuthData.getSessionString(), 
            postID: ids
           })
 
           }).then(res => {
               return res.json();
           }).then(function(data) {
               console.log(data.blocked)
               window.location.reload(true);
 
           })
       }
      
      
   }
   function handleComment(e,pstid,cmnt){
      
       e.preventDefault();
       console.log("comment id "+pstid+" comment is "+cmnt) 
       fetch('http://localhost:3002/createComment', {
           method: 'POST',
           headers: {"Content-Type": "application/json"},
           body: JSON.stringify({
               userID: AuthData.getID(), 
               role: AuthData.getAdmin(), 
               sessionString: AuthData.getSessionString(), 
               commentText: cmnt, 
               commentAttachments: "", 
               postID: pstid})
       }).then(res => {
           return res.json();
       }).then(function(data) {
           console.log(data.created)
           handlePosts();
       })
      
   }
 
  
   return (
       <>
            <Box elevation={3} component="div" sx={{width:"500px", marginBottom: "-3px"}}>
                <Card style={{backgroundColor:"#181818", display: 'inline-block'}} sx={{ width: "400px", height: "500px"}}>
                    <Button variant="string" startIcon={<SentimentVerySatisfiedIcon color='secondary' sx={{size: "large", right: "0"}}/>} style={{color: "white", float: "right", borderColor:"red", fontSize:"14px"}} onClick={(e)=>handlePostLike(e,id)}>{pstlikeCnt}</Button>
                    <br/>
                    <CardMedia
                        style={{ display: "block", marginLeft: "auto", marginRight: "auto", height: "50%", width:"50%", textAlign: "center"}}
                        component="img"
                        height="100px"
                        width="100px"
                        alt="no image"
                        
                        image={imgUrl}
                    />
                    <CardContent>
                        <Typography variant="body1" style={{color:"white"}}>
                        {caption}
                        </Typography>
                    </CardContent>
                    <br/>
                    <form style={{textAlign: "center", borderColor: "red"}}>
                        <label >
                            <TextField variant="outlined" placeholder="Comment..." size="small" color="secondary" InputProps={{style: { color: "white", borderColor:"grey", borderRadius: `20px 20px 20px 20px`}}}  InputLabelProps={{ style: { color: '#fff'} }} style={{width:"300px"}}type="text" name="comment" value={comment} onChange={(e) => setComment(e.target.value)} focused/>
                        </label>
                        <Button endIcon={<SendIcon style={{color:"white"}} />}type="submit" variant ="outlined" color="secondary" size="large" value="Submit" style={{ borderColor: "grey", textAlign: "center", fontSize:"small", marginLeft:"2px", marginBottom:"-2px",paddingRight:"25px", borderRadius: `20px 20px 20px 20px`, height:"40px"}} type="submit" onClick={(e)=>handleComment(e,id,comment)} focused>{""}</Button>      
                    </form>
                    <CardActions >
                            { AuthData.getAdmin() === '1' && (<Button variant="string" startIcon={<CancelIcon />}style={{color: "red",right: "10px", float: "right", ':hover': { backgroundColor: "blue" }}} type="button" size="small" onClick={(e)=> handleBlock(e,id)}>{blockValue}</Button>)}
                  </CardActions>
                <Divider style={{background: 'grey',  marginBottom:"3px"}}/>
                </Card>
            </Box> 

     </>
   );
}
 export default PostCards;

/*
 <div id={id} className={styles.boxModel}>
                <Button variant="contained" style={{color: "white", backgroundColor: "#C60C30",right: "10px", float: "right"}} type="button" onClick={(e)=> handleBlock(e,id)}>{"Block Post"}</Button>
                <div style={{color: "white"}} dangerouslySetInnerHTML={{__html: `${caption}` }}/>
                {imgUrl ==='' ? (<></>) : (<><br/><img src={imgUrl} style={{width:"100px", height: "100px"}}/></>) }
                <br/><br/>
            <div/>
                <span style={{display: "block", marginBottom: "10px"}}/>
                <form style={{textAlign: "center"}}>
                <label >
                    <TextField variant="filled" size="small" color="primary" InputProps={{style: { color: "white", borderBlockColor:"blue"} }} label="Comment"  InputLabelProps={{ style: { color: '#fff' }, }} type="text" name="comment" value={comment} onChange={(e) => setComment(e.target.value)} focused/>
                </label>
                <br/>
                <input style={{textAlign: "center"}} type="submit" value="Comment!" onClick={(e)=>handleComment(e,id,comment)} />
                </form>
                <p>{"id is "+id}</p>
            </div>
*/