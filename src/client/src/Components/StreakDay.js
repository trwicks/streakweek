import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";
import IconButton from "@material-ui/core/IconButton";
import CommentIcon from "@material-ui/icons/Comment";
import Paper from "@material-ui/core/Paper";
// import Card from '@material-ui/core/Card'; # TODO: change to card
import { useAuth } from "../context/auth";
import URL from "../utils/getUrl";
import moment from "moment";
import { Container } from "@material-ui/core";
const useStyles = makeStyles((theme) => ({
  list: {
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
}));

const getData = async (token) => {
  const myHeaders = new Headers();

  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${token}`);
  const weekResponse = await fetch(`${URL}/weeks?Current=true`, {
    headers: myHeaders,
  });
  const week = await weekResponse.json();
  const today = moment();
  const resp = await fetch(
    `${URL}/activities?Day=${today.format("YYYY-MM-DD")}`,
    { headers: myHeaders }
  );
  const activities = await resp.json();
  return activities;
};

const StreakDay = ({ update, isModified }) => {
  const classes = useStyles();
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = React.useState([0]);

  useEffect(async () => {
    const data = await getData(token);
    setData(data);
    setLoading(false);
  }, [isModified]);

  const handleToggle = (value) => async () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];
    const response = await fetch(`${URL}/activities/${value.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...value,
        Complete: !value.Complete,
      }),
    });
    const itemData = await response.json();
    const newArray = data.filter((item) => item.id !== itemData.id);
    setData([...newArray, itemData]);

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
    update();
  };

  return (
    <Box display="flex" justifyContent="center">
      {!loading && (
        <Box
          display="flex"
          justifyContent="center"
          component={Paper}
          m={3}
          flexDirection="column"
        >
          <Typography component="div">
            <Box textAlign="center" m={2}>
              Streak Day
            </Box>
          </Typography>
          <List className={classes.list}>
            {data.map((value) => {
              const labelId = `checkbox-list-label-${value}`;
              return (
                <ListItem
                  key={value.id}
                  role={undefined}
                  dense
                  button
                  onClick={handleToggle(value)}
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={value.Complete}
                      tabIndex={-1}
                      disableRipple
                      inputProps={{ "aria-labelledby": labelId }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    id={labelId}
                    primary={value.activity_set.Name}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="comments">
                      <CommentIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default StreakDay;
