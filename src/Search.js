import { useState } from "react";
import AuthData from './AuthData';
import { Redirect } from 'react-router';
import { Link } from "react-router-dom";
import PostCards from './Posts/PostCards'
import Comment from "./Posts/Comment";

function Search() {
  const [searchVal, setsearchVal]=useState('');
  //const[searchObject,setsearchObject]=useState('');

  if(AuthData.getAuth()!=="true" ){
    return <Redirect to="/"/>;
  }
  
  const searchObject = { 
    results: {
      posts: [{ id: 1, imgUrl: "", text : "<i><strong>somedata</strong></i>", user: "bob", comments: [{id: 1, imgUrl: "", text: "comment1", user: "blah"}, { id: 2, text: "comment2", user: "blah"}]}, { id: 2, text : "blah blah blah", user: "bob", comments: [{id: 1, text: "comment1", user: "blah"}, { id: 2, text: "comment3", user: "comment4"}]}],
      user: {userID: 1, username: "bob"}
    }
  } 
  
  function handleClick(event,val){
    event.preventDefault();
    if(val!==''){
        console.log(val)
        /*fetch('/search', {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({search: val})

          }).then(res => {
            return res.json();
          }).then(function(data) {
            console.log(data)
            setsearchObject(data)
        })*/
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
        <div>
              { (Object.keys(searchObject.results.user).length===0 ) ? (<></>) : (<h2>{"user: "+searchObject.results.user.username}</h2>)}
        </div>
        {(Object.keys(searchObject.results.posts).length === 0) ? (<>{console.log("no posts")}</>) :
            (
            <div>
              {searchObject.results.posts.map((index)=>
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
            </div>
            )}
    </div>
  );
}

export default Search;
