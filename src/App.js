import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Admin from './Admin'
import User from './User'
import Login from './Login'
import Invalid from './Invalid'
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
          <Route exact path="/user">
            <User/>
          </Route>
          <Route exact path="/invalid">
            <Invalid/>
          </Route>
        </Switch>
    </Router>
  );
}
export default App;
