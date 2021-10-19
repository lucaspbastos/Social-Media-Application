
import styles from './MessageCard.module.scss'

function MessageBox({username,message}) {
    return (
        <div className={styles.boxModelComment} id={username}>
            <div style={{align:"left", paddingBottom:"10px"}}>
                {username}
                <br/> 
            </div>
            <div style={{textAlign:"left"}}>
                {message}
            </div>       
        </div>

    );
}

export default MessageBox;
