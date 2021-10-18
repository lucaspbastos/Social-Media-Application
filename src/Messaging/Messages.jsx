import { useState } from 'react';
import MessageBox from './MessageBox';
import AuthData from '../AuthData';
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';
import styles from './MessageCard.module.scss'


//call to get intial users,
//after selection of user to send messages to get alrdy sent messages messages 
  //send messages back in order
  //[message 1, username, datetime], [message2,username,datetime]
  //send in order
  //on click send username, selected user and message to db
  //get json back 
  
  //function userlist

function Messages() {
  const [users,setUsers]=useState('');
  const [actualUser,setactualUser]=useState('');
  const[message,setMessage]=useState('')
  const[clicked,setClicked]=useState(false)

    if(AuthData.getAuth()!=="true"){
      return <Redirect to="/"/>;
  }

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
  function getMessages(){
    console.log("getting messages")
  }

  function handleSubmit(event,usr){
    event.preventDefault();
    if(usr !==""){
      setactualUser(usr)
      console.log("thread is "+usr)
      setClicked(true)
      //make a request get list of messages with both users

    }
  }

  function handleMessage(e,msg,currUsr){
    e.preventDefault();
    if(msg!==''){
      console.log("curre user "+currUsr+ " message is "+msg)
    }
    //make post request to update db
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
  