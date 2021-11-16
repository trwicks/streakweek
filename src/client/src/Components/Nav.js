import React from "react";
import { Link as RouterLink } from "react-router-dom";
import Link from "@material-ui/core/Link";

import { Container } from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import { useAuth } from "../context/auth";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

const Nav = () => {
  const { user, token, unsetUserData } = useAuth();

  const classes = useStyles();

  const handleLogout = () => {
    unsetUserData();
  };

  return (
    <AppBar position="static">
      <Container>
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            Week Streak
          </Typography>
          <Button
            color="inherit"
            className={classes.menuButton}
            component={RouterLink}
            to="/dashboard"
          >
            Dashboard
          </Button>
          {!token ? (
            <Button
              color="inherit"
              className={classes.menuButton}
              component={RouterLink}
              to="/login"
            >
              Login
            </Button>
          ) : (
            <Button
              color="inherit"
              className={classes.menuButton}
              onClick={handleLogout}
            >
              {user} Logout
            </Button>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Nav;
