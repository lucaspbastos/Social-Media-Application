import './App.css';
import {useState } from 'react';
import { useHistory } from "react-router-dom";


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
            console.log(user,pass)

            //Needs completion to recive updated back from backend
            fetch('http://localhost:3001', {
              method: 'POST',
              headers: {"Content-Type": "application/json"},
              body: JSON.stringify({user,pass})

            }).then(()=>{
              console.log("data sent")
            })
            //history.push("/admin")

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
        <p>{user}</p>
        <p>{pass}</p>
        <input type="submit" value="Submit" onClick={(e)=> handleClick(e,user,pass)}/>
      </form>
    );
  }
  
  export default Login;