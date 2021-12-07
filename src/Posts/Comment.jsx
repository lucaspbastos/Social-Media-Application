import styles from './PostCards.module.scss'
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import CardHeader from '@material-ui/core/CardHeader';
import FavoriteIcon from '@material-ui/icons/Favorite';
import Button from '@material-ui/core/Button';
import AuthData from '../AuthData';


import Box from '@material-ui/core/Box';
import {
    List,
    ListItem,
    Divider,
    ListItemText,
    ListItemAvatar,
    Avatar,
} from "@material-ui/core";

function Comment({id,comment, handlePosts, likesArr}) {

    var likesCnt=0
    if(likesArr !== undefined){
        likesCnt=likesArr.length
    }

    function handleCommentLike(e, id){
        e.preventDefault();
        if(likesArr.includes(parseInt(AuthData.getID()))){
            console.log(AuthData.getID())
            fetch('http://localhost:3002/unlikeComment', {
                method: 'POST',
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    userID: AuthData.getID(), 
                    sessionString: AuthData.getSessionString(), 
                    commentID: id})
            }).then(res => {
                return res.json();
            }).then(function(data) {
                console.log(data)
                handlePosts();
            })
        }
        else{
            console.log("not liked")
            
            fetch('http://localhost:3002/likeComment', {
                method: 'POST',
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    userID: AuthData.getID(), 
                    sessionString: AuthData.getSessionString(), 
                    commentID: id})
            }).then(res => {
                return res.json();
            }).then(function(data) {
                console.log(data)
                handlePosts();
            })
        }
    }
    return (
        <>
            <Box style={{marginTop:"-20px"}}>
            <ListItem alignItems="flex-start" style={{backgroundColor:"#181818", width:"500px"}}>
              <Divider style={{background:"grey"}}/>
              <ListItemAvatar>
                <Avatar alt="avatar" src={""} />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography >
                    {"User 5"}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography
                      component="span"
                      variant="body2"
                      style={{color:"white"}}
                    >
                      {comment}
                    </Typography>
                  </>
                }
              />
                <Button endIcon={<FavoriteIcon />} color='secondary' style={{marginLeft: "10px"}} onClick={(e)=>handleCommentLike(e,id)}>{likesCnt+" likes"} </Button>
            </ListItem>
         </Box> 
        </>
    );
}
  
export default Comment;

/*
get id of post from db 
send id as prop to componenet
pass id to button on click
buttons will either 
pass to comment componenet which adds a comement by id
comment will get id, and add comment to db by id, username etc
or
blocks a post, sends to db, and removes the post from view

*/

/*when looping through db and putting post to ui, do second loop check for commenets by id, then post those one by one 
send comment id and username to comment template componenet, then print the comment */

/**<div className={styles.boxModelComment} id={id}>
                {comment}
            </div>
            <div className={styles.boxModelComment}>
                {"second is a comment"}
            </div>
            <div className={styles.boxModelComment}>
                {"third is a comment"}
            </div>
            <div className={styles.boxModelComment}>
                {"fourth is a comment"}
            </div>
 */