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
function PostCards({ id, caption, imgUrl, handlePosts, blockStatus}) {
   const [comment,setComment]=useState('');
   var blockValue=""
   if(blockStatus===1){
       blockValue="Unblock Post"
   }else if(blockStatus===0){
       blockValue="Block Post"
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
            <Box component="div" sx={{width:"500px"}}>
                <Card style={{backgroundColor:"#181818", height:"450px", borderBottom: "1px solid red"}}>
                    <br/>
                    { AuthData.getAdmin() === '1' && (<Button variant="contained" style={{color: "white", backgroundColor: "#C60C30",right: "10px", float: "right"}} type="button" onClick={(e)=> handleBlock(e,id)}>{blockValue}</Button>)}
                    <br/>
                    <CardContent sx={{textAlign: "left"}}>
                    <Typography variant="body1" color="primary" style={{color:"white", fontSize:"large"}}>
                        {caption}
                    </Typography>
                    {imgUrl ==='' ? (<></>) : (<><br/><img src={imgUrl} style={{width:"100px", height: "100px"}}/></>) }
                    <br/><br/><br/>
                    <form style={{textAlign: "center"}}>
                        <label >
                            <TextField variant="filled" size="medium" color="secondary" InputProps={{style: { color: "white", borderBlockColor:"blue"} }} label="Comment"  InputLabelProps={{ style: { color: '#fff' }, }} type="text" name="comment" value={comment} onChange={(e) => setComment(e.target.value)} focused/>
                        </label>
                        <br/>
                        <Button type="submit" variant ="contained" size="small" color="primary" value="Submit" style={{textAlign: "center", paddingTop:"1px", marginTop:"8px", fontSize:"small"}} type="submit" onClick={(e)=>handleComment(e,id,comment)}>{"Comment!"}</Button>
                    </form>
                    </CardContent>
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