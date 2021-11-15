import './App.css';
import {useState } from 'react';
import { useHistory } from "react-router-dom";

import AuthData from './AuthData';

function Login() {
    const [user,setUser]=useState('');
    const [pass,setPass]=useState('');
    const history = useHistory();
    const styles = {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "20px"
      };

      function handleClick(event,user,pass){
          if(user!=='' && pass!==''){
            event.preventDefault();
            //keep this
            AuthData.setName(user);
            
          
              fetch('http://localhost:3002/login', {
                method: 'POST',
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username: user, password: pass})

              }).then(res => {
                return res.json();
              }).then(function(data) {
                console.log(data.login)
                // Handle no user
                console.log(data.role)
                if (data.login) {
                  AuthData.setAuth(true)
                  AuthData.setID(data.userID)
                  AuthData.setSessionString(data.login)
                  if (data.role === 1) {
                    AuthData.setAdmin(1)
                    history.push("/posts")
                  } else {
                    AuthData.setAdmin(0)
                    history.push("/posts")
                  }
                } else {
                  history.push("/invalid")
                }
                console.log(data.error)
              })
            history.push("/Posts")

          }
          else{
            return(
              <p>{"enter user name and password"}</p>
            )
          }
      }
    return (
        <form className={"App-header"} style={styles}>
        <label>
          Username:
          <br/>
          <input type="text" name="username" required value={user} onChange={(e) => setUser(e.target.value)}/>
        </label>
        <label>
          Password:
          <br/>
          <input type="text" name="password" required value={pass} onChange={(e) => setPass(e.target.value)}/>
        </label>
        <input type="submit" value="Submit" onClick={(e)=> handleClick(e,user,pass)}/>
      </form>
    );
  }
  
  export default Login;