import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import CreateAccountPage from "./components/CreateAccountPage";
import ProfilePage from "./components/ProfilePage";
import DashboardPage from "./components/DashboardPage";
import ChatPage from "./components/ChatPage";

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/create-account" component={CreateAccountPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/chat/:chatId" component={ChatPage} />
      </Switch>
    </Router>
  );
}

export default App;
