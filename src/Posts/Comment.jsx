import styles from './PostCards.module.scss'
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import CardHeader from '@material-ui/core/CardHeader';
import Box from '@material-ui/core/Box';

function Comment({id,comment}) {
    return (
        <>
            <Box component="div" sx={{width:"500px",marginBottom: "-20px", opacity: "[0.9, 0.8, 0.7]"}}>
                <Card style={{backgroundColor:"#181818", height:"50px", borderBottom: "1px solid grey", borderLeft: "1px solid red", borderRight: "1px solid red"}}>
                    <CardContent sx={{textAlign: "left"}}>
                        <Typography variant="body1" color="primary" style={{color:"white", fontSize:"large"}}> 
                            {comment}
                        </Typography>
                    </CardContent>
                </Card>
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