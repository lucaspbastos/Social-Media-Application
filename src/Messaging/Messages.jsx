import { useState, useEffect } from 'react';
import MessageBox from './MessageBox';
import AuthData from '../AuthData';
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';
import styles from './MessageCard.module.scss'


function Messages() {
  const [users,setUsers]=useState('');
  const [actualUser,setactualUser]=useState('');
  const[message,setMessage]=useState('')
  const[clicked,setClicked]=useState(false)
  const[threadObject,setthreadObject]=useState({
    threads: [{messages: [{

      }]
    }]
});


    useEffect(()=>{
      if(AuthData.getLastThread!==''){
          console.log(AuthData.getLastThread())
          fetch('http://localhost:3002/getThreads', {
              method: 'POST',
              headers: {"Content-Type": "application/json"},
              body: JSON.stringify({userID: AuthData.getID(), role: AuthData.getAdmin(), sessionString: AuthData.getSessionString(), threadID: AuthData.getLastThread()})

            }).then(res => {
              return res.json();
            }).then(function(data){
              console.log(data.threads[0].userIDs)
              setthreadObject(data)
          })
      }
      else{
        console.log("no thread chosen")
      }
    }, [])

    if(AuthData.getAuth()!=="true"){
      return <Redirect to="/"/>;
  }

  //for setting thread
  function handleSubmit(event,thread){
    event.preventDefault();
    if(thread !==""){
      setactualUser(thread)
      AuthData.setLastThread(thread)
      console.log("thread is "+AuthData.getLastThread())
      setClicked(true)

    }
  }
  
  //for message posted by the user
  //currusr is thread number
  function handleMessage(e,msg,currUsr){
    e.preventDefault();
    if(msg!==''){
      console.log("curre user "+currUsr+ " message is "+msg)
        fetch('http://localhost:3002/createMessage', {
          method: 'POST',
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({userID: AuthData.getID(), role: AuthData.getAdmin(), sessionString: AuthData.getSessionString(), threadID: 1, recipientUserIDs: currUsr, messageText: msg, messageAttachments: ""})

        }).then(res => {
          return res.json();
        }).then(function(data) {
          console.log(data)
      })
    }
      
  }
  return (
    <>
        <div style={{textAlign: "center"}}>
          <Link to="/posts" className={styles.button} style={{height:"50px", width:"200px", backgroundColor:"#2b2b2b"}}>Posts</Link>
          {" "}
          <Link to="/admin" className={styles.button} style={{height:"50px", width:"200px", backgroundColor:"#2b2b2b"}}>Admin</Link>   
          {" "}
          <Link to="/search" className={styles.button} style={{height:"50px", width:"200px", backgroundColor:"#2b2b2b"}}>Search</Link>    
        </div>   
      <div>
          <form style={{textAlign: "center"}} >
          <label>
            Select a Thread: 
            <br/>
            <select value={users} onChange={(e)=>setUsers(e.target.value)} >
            {/* {threadObject.threads.map(thread => {
                  return (<option key={thread.threadID} value={thread.threadID}>{thread.userIDs.toString()}</option>);
                })} */}
            <option></option>
            <option>[2, 3]</option>
            </select>
          </label>
          <br/>
          <input type="submit" value="Submit" onClick={(e)=>handleSubmit(e, users)}/>
        </form>

        { ( actualUser !== '' && clicked) ? (
        <form style={{textAlign: "center", top: "30px"}}>
            <label >
                <textarea style={{width: "250px"}} type="text" name="message" value={message} onChange={(e) => setMessage(e.target.value)} />
            </label>
            <br/>
            <input type="submit" value="Send Message" onClick={(e)=> handleMessage(e,message,actualUser)} />
        </form>) : (<></>)
        }
      </div>

      <div>
      {threadObject.threads.map((thread)=>
                        <div key={thread.threadID}>
                            {thread.messages.map((message)=>
                                <div key={message.messageID }>
                                    <MessageBox username={message.userID} message={message.messageText} />
                                    <br/>
                                </div>
                            )}  
                        </div>
                    )} 
      </div>
    </>
    );
  }
  
  export default Messages;
  