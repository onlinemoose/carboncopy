import { AppProvider } from './store';
import './App.css';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from './pages/home';
import Modal from './pages/modal';
import Sidebar from './pages/sidebar';
import 'mirotone/dist/styles.css';

window.firebase.initializeApp({ projectId: process.env.REACT_APP_PROJECT_ID });

const App = () => (
  <AppProvider>
    <Router>
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route path="/sidebar">
          <Sidebar />
        </Route>
        <Route path="/modal">
          <Modal />
        </Route>
      </Switch>
    </Router>
  </AppProvider>
);

export default App;
