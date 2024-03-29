import { useState } from "react";
import AuthData from './AuthData';
import { Redirect } from 'react-router';
import { Link } from "react-router-dom";
import PostCards from './Posts/PostCards'
import Comment from "./Posts/Comment";
import Header from './Header';

function Search() {
  const [searchVal, setsearchVal]=useState('');
  const[searchObject,setsearchObject]=useState({
    results: {
      posts: [{
        comments: [{}]
      }],
      user: {},
      teams: {}
    }
  });

  if(AuthData.getAuth()!=="true" ){
    return <Redirect to="/"/>;
  }
  
  function handleClick(event,val){
    event.preventDefault();
    if(val!==''){
        console.log(val)
        fetch('http://localhost:3002/search', {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
              userID: AuthData.getID(), 
              sessionString: AuthData.getSessionString(), 
              search: val
            })

          }).then(res => {
            return res.json();
          }).then(function(data) {
            console.log(data.results.results)
            setsearchObject(data)
        })
    }
  }
  return (
      <div>
        <Header/><br></br><br></br><br></br><br></br><br></br><br></br>
        <div style={{textAlign: "center"}}>
            <form className={"searchBox"} >
            <input style={{height:"25px", width:"270px"}}type="text" name="searchVal" value={searchVal} onChange={(e) => setsearchVal(e.target.value)}/>
            <input style={{height:"31.5px", width:"100px"}}type="submit" value="Search" onClick={(e)=> handleClick(e,searchVal)}/>
            </form>
        </div>
        <div>
              { (Object.keys(searchObject.results.user).length===0 ) ? (<></>) : (<h2>{"user: "+searchObject.results.user.users}</h2>)}
        </div>
        {console.log(Object.keys(searchObject.results.teams))}
        {(Object.keys(searchObject.results.posts).length === 1) ? (<>{console.log("no posts")}</>) :
            (
            <div>
              {searchObject.results.posts.map((post)=>
                            (<div key={post.postID}>
                                <PostCards id={post.postID} caption={post.postText} imgUrl={post.postAttachments}/>
                                {post.comments.map((comment)=>
                                    <div key={comment.commentID }>
                                        <Comment id={comment.commentID} comment={comment.commentText} />
                                    </div>
                                )}
                                <br/>
                            </div>)
                        )}
            </div>
            )}

      {(Object.keys(searchObject.results.teams).length === 0) ? (<>{console.log("no teams found")}</>) :
                  (
                  <div>
                    <h1> Record</h1>
                    <h2> {searchObject.results.teams.summary}</h2>
                    <div>
                        <h1> Playoff Seed</h1>
                        <h2> {searchObject.results.teams.stats[0].value}</h2>
                        <h1> Win Percentage</h1>
                        <h2> {searchObject.results.teams.stats[3].value}</h2>
                    </div>
                  </div>
                  )
                }
    </div>
  );
}

export default Search;
