import { useState, useEffect } from 'react';
import MessageBox from './MessageBox';
import AuthData from '../AuthData';
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';
import styles from './MessageCard.module.scss'

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Header from '../Header';


function Messages() {
  const [message, setMessage] = useState('');
  const [messageCount, setMessageCount] = useState(0);
  const [time, setTime] = useState(0);
  const [selectedThread, setSelectedThread] = useState(null);
  const [threadObject, setThreadObject] = useState({
    threads: [],
  });
  const [messageObject, setMessageObject] = useState({
    messages: [],
  });

  useEffect(() => {
    getThreads();
  }, []);

  useEffect(() => {
    getMessages(selectedThread);
    if (messageCount != 0){
      const interval = setInterval(() => setTime(Date.now()), 1000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [selectedThread, messageCount, time]);

  function getThreads() {
    fetch('http://localhost:3002/getThreads', {
      method: 'POST',
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        userID: AuthData.getID(), 
        sessionString: AuthData.getSessionString(),
      })
    }).then(res => {
      return res.json();
    }).then((data) =>{
      console.log(data)
      setThreadObject(previousState => {
        return {
          ...previousState,
          threads: data.threads,
        }
      })
    })
  }

  function getMessages(threadID) {
    fetch('http://localhost:3002/getMessages', {
      method: 'POST',
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        userID: AuthData.getID(), 
        sessionString: AuthData.getSessionString(),
        threadID: threadID,
      }),
    }).then(res => {
      return res.json();
    }).then(function(data){
      console.log(data)
      setMessageObject(data)
      setMessageCount(data.messages.length)
    })
  }

    if(AuthData.getAuth()!=="true"){
      return <Redirect to="/"/>;
  }

  
  //for message posted by the user
  function handleMessage(e, message, threadID){
    e.preventDefault();
    if(message !== ''){
        fetch('http://localhost:3002/createMessage', {
          method: 'POST',
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            userID: AuthData.getID(), 
            role: AuthData.getAdmin(), 
            sessionString: AuthData.getSessionString(), 
            threadID: threadID, 
            messageText: message, 
            messageAttachments: ""
          })
        }).then(res => {
          return res.json();
        }).then(function(data) {
          console.log("h")
          console.log(data)
          setMessageCount((messageCount) => messageCount + 1)
      })
    }
  }
  return (
    <div>
      <Header/><br></br><br></br><br></br>
      <Box>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'black' }}>
              {threadObject.threads.map((thread)=>
                <ListItem>
                  <ListItemButton onClick={()=>setSelectedThread(thread.threadID)}>
                    <ListItemText primary={thread.threadName} />
                  </ListItemButton>
                </ListItem>
              )}
            </List>
          </Grid>
          <Grid item xs={4}>
            <Stack>
              {messageObject.messages.map((message)=>
                <MessageBox message={message.messageText} username={message.username}/>
              )}
            </Stack>
          </Grid>
        </Grid>
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
        >
          {(selectedThread === null) ? (<></>) : (
            <>
              <TextField
                  autoFocus="true"
                    color="primary"
                    id="outlined-textarea"
                    label="Send Message"
                    placeholder="Placeholder"
                    multiline
                    onChange={(e) => setMessage(e.target.value)}
              />
              <Button variant="contained" onClick={(e)=>handleMessage(e, message, selectedThread)}>Submit</Button>
            </>
          )}
        </Grid>
      </Box>
      </div>
    );
  }
  
  export default Messages;
  