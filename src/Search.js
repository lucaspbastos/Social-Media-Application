import { useState } from "react";
import AuthData from './AuthData';
import { Redirect } from 'react-router';
import { Link } from "react-router-dom";

function Search() {
  const [searchVal, setsearchVal]=useState('');
  if(AuthData.getAuth()!=="true" ){
    return <Redirect to="/"/>;
  }
  
  function handleClick(event,val){
    event.preventDefault();
    if(val!==''){
        console.log(val)
        fetch('/search', {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({search: val}) /*edited by Mike -- using key value pair to mirror the way the data is being retrieved on back end for search*/
          }).then(res => {
            return res.json();
          }).then(function(data) {
            console.log(data.login)
        })
    }
  }
  return (
      <div>
        <div>
            <Link to="/posts"  style={{height:"50px", width:"200px"}}>Posts</Link>
            {" "}
            <Link to="/admin" style={{height:"50px", width:"200px"}}>Admin</Link>
            {" "}
            <Link to="/messages" style={{height:"50px", width:"200px"}}>Messages</Link>
            <h1 style={{textAlign: "center"}}>{"Search Page"}</h1>
        </div>
        <div style={{textAlign: "center"}}>
            <form className={"searchBox"} >
            <input style={{height:"25px", width:"270px"}}type="text" name="searchVal" value={searchVal} onChange={(e) => setsearchVal(e.target.value)}/>
            <input style={{height:"31.5px", width:"100px"}}type="submit" value="Search" onClick={(e)=> handleClick(e,searchVal)}/>
            </form>
        </div>
        
    </div>
  );
}

export default Search;
/*
<div>
                    {dataObject.posts.map((index)=>
                        <div key={index.id}>
                            <PostCards id={index.id} caption={index.text} imgUrl={index.imgUrl}/>
                            {index.comments.map((idx)=>
                                <div key={idx.id }>
                                    <Comment id={index.id} comment={idx.text} />
                                </div>
                            )}
                            <br/>
                        </div>
                    )}               
                </div>*/