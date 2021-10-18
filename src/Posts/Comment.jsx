import styles from './PostCards.module.scss'

function Comment({id,comment}) {
    return (
        <>
            <div className={styles.boxModelComment} id={id}>
                {comment}
            </div>
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