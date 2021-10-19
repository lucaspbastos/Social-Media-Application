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
  //const[messageObject,setmessageObject]=useState(false)

    useEffect(()=>{
      if(AuthData.getLastThread!==''){
          console.log(AuthData.getLastThread())
          /*fetch('/getThreads', {
              method: 'POST',
              headers: {"Content-Type": "application/json"},
              body: JSON.stringify({username: AuthData.getName(), role: AuthData.getAdmin(), sessionString: AuthData.getSessionString(), threadID: AuthData.getLastThread()})

            }).then(res => {
              return res.json();
            }).then(function(data){
                setmessageObject(data)
          })*/
      }
      else{
        console.log("no thread chosen")
      }
    }, [])

    if(AuthData.getAuth()!=="true"){
      return <Redirect to="/"/>;
  }

//get rid of placeholder values
  const messageObject= { 
    threads: [
    {id: 1, userIDs: ["1", "2", "3", "4"], name: "Cool kids chat", messages: [
        {id: 1, fromUser: 1, message: "Yerrr", datetime: 1294131780237},
        {id: 2, fromUser: 4, message: "Yo", datetime: 1294131780269}
      ]}, {id: 2, userIDs: ["1", "2"], name: "Bob", messages: [
        {id: 1, fromUser: 1, message:"Hi", datetime:1294131780237},
        {id: 2, fromUser: 2, message:"Yo", datetime: 1294131780269},
        {id: 3, fromUser: 1, message:"Bye", datetime: 1294131780532},
      ]}
    ]
  } 

  //for setting thread
  function handleSubmit(event,usr){
    event.preventDefault();
    if(usr !==""){
      setactualUser(usr)
      AuthData.setLastThread(usr)
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
        /*fetch('/createMessage', {
          method: 'POST',
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({username: AuthData.getName(), role: AuthData.getAdmin(), sessionString: AuthData.getSessionString(), threadID: currUsr, text: msg, attachment: ""})

        }).then(res => {
          return res.json();
        }).then(function(data) {
          console.log(data.created)
          window.location.reload(true);
      })*/
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
            <option value={""}>{""}</option>
            {messageObject.threads.map(item => {
                  return (<option key={item.id} value={item.id}>{item.userIDs.toString()}</option>);
                })}
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
      {messageObject.threads.map((index)=>
                        <div key={index.id}>
                            {index.messages.map((idx)=>
                                <div key={idx.id }>
                                    <MessageBox username={idx.fromUser} message={idx.message} />
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
  