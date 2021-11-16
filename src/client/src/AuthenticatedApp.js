import { Container } from "@material-ui/core";
import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Dashboard from "./Pages/Dashboard";
import Nav from "./Components/Nav";

import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";

function AuthenticatedApp() {
  return (
    <Router>
      <Nav />
      <Container m={3}>
        <Route path="/" exact component={Dashboard} />\
      </Container>
    </Router>
  );
}

export default AuthenticatedApp;
