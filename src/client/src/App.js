import { Container } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Landing from "./Pages/Landing";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import Nav from "./Components/Nav";

// import AuthenticatedApp from './AuthenticatedApp';
import { AuthContext } from "./context/auth";
import PrivateRoute from "./PrivateRoute";

function App() {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);


  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("userData"));
    if (data) {
      setUser(data.user.email);
      setUserId(data.user.id);
      setToken(data.jwt);
    }
  }, []);

  const setUserData = (data) => {
    localStorage.setItem("userData", JSON.stringify(data));
    setUser(data.user.email);
    setUserId(data.user.id);
    setToken(data.jwt);
  };

  const unsetUserData = () => {
    localStorage.setItem("token", JSON.stringify({}));
    setUser(null);
    setUserId(null);
    setToken(null);
  };
    
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        userId,
        setUserData: setUserData,
        unsetUserData: unsetUserData,
      }}
    >
      <Router>
        <Nav />
        <Container m={3}>
          <Route path="/" exact>
            <Landing />
          </Route>
          <Route path="/login" exact>
            <Login />
          </Route>
          <PrivateRoute path="/dashboard" component={Dashboard} />
        </Container>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
