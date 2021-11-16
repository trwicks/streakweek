import { Container } from "@material-ui/core";
import React from "react";
import Dashboard from "./Pages/Dashboard";
import Nav from "./Components/Nav";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";

function App() {
  return (
    <div>
      <Nav />
      <Typography component="div">
        <Box textAlign="center" m={2}>
          <i>Success is measured in weeks. </i>
        </Box>
      </Typography>
      <Container>
        <Dashboard />
      </Container>
    </div>
  );
}

export default App;
