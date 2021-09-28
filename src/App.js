import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Admin from './Admin'
import User from './User'
import Login from './Login'
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
        </Switch>
    </Router>
  );
}
export default App;
