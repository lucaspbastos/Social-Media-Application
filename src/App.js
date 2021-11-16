import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Admin from './Admin'
import Login from './Login'
import Invalid from './Invalid'
import Posts from './Posts/Posts'
import Messages from './Messaging/Messages'
import Search from './Search'
import Profile from './Profile'
import Logout from './Logout'

function App() {
  return (
    <Router>
        <Switch>
          <Route exact path="/">
            <Login/>
          </Route>
          <Route exact path="/admin">
            <Admin/>
          </Route>
          <Route exact path="/posts" >
            <Posts/>
          </Route>
          <Route exact path="/messages" >
            <Messages/>
          </Route>
          <Route exact path="/search">
            <Search/> 
          </Route>
          <Route exact path="/invalid">
            <Invalid/> 
          </Route>
          <Route exact path="/profile">
            <Profile/> 
          </Route>
          <Route exact path="/logout">
            <Logout/> 
          </Route>
        </Switch>
    </Router>
  );
}
export default App;

/*
<Switch>
          <Route exact path="/">
            <Login/>
          </Route>
          <Route exact path={ userProfile.getAdmin() === 1 ? "/admin" : "/posts" } />
            <Posts/>
          </Route>
          <Route exact path="/invalid">
            <Invalid/> 
          </Route>
        </Switch>
*/

/*
make a form
select user from a list then
textbox come ups send texts
when the sends message
store to db display on website based on date time

on the other side same thing

*/