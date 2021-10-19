import { useState } from "react";
import AuthData from './AuthData';
import { Redirect } from 'react-router';
import { Link } from "react-router-dom";
function Admin() {
  const[password,setPassword]=useState('');
  const[username,setUsername]=useState('');
  if(AuthData.getAuth()!=="true" ){
    return <Redirect to="/"/>;
  } else if (AuthData.getAdmin()!=="1"){
    return <Redirect to="/posts"/>;
  }
  function handleClick(e,usr,pass){
    e.preventDefault();
    if(usr!=='' && pass!==''){
      console.log(usr,pass)
        fetch('http://localhost:3002/createUser', {
          method: 'POST',
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({username: AuthData.getName(), role: AuthData.getAdmin(), sessionString: AuthData.getSessionString(), newUsername: usr, password: pass})

        }).then(res => {
          return res.json();
        }).then(function(data) {
          console.log("done")
      })
    }
  }

  return (
    <div >
      <Link to="/messages"  style={{height:"50px", width:"200px"}}>Messages</Link>
      {" "}
      <Link to="/search" style={{height:"50px", width:"200px"}}>Search</Link>
      {" "}
      <Link to="/posts" style={{height:"50px", width:"200px"}}>Posts</Link>
      <h1 style={{textAlign: "center"}}>{"Admin User Page"}</h1>
      <br/>
      <h2 style={{textAlign: "center"}}>{"Create a User"}</h2>
      <form className={"admin-creator"} style={{textAlign: "center"}}>
        <label>
          Username:
          <br/>
          <input type="text" name="username" required value={username} onChange={(e) => setUsername(e.target.value)}/>
        </label>
        <label>
          <br/>
          Password:
          <br/>
          <input type="text" name="password" required value={password} onChange={(e) => setPassword(e.target.value)}/>
        </label>
          <br/> 
        <button type="submit" className="form-button-submit" value="Submit" onClick={(e)=> handleClick(e,username,password)}>{"Create User"}</button>

      </form>
    </div>
  );
}

export default Admin;

//        <input type="submit" value="Submit" onClick={(e)=> handleClick(e,username,password)}/>
