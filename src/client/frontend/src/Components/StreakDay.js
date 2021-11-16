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

import URL from "../utils/getUrl";
import moment from "moment";
import { Container } from "@material-ui/core";
const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
}));

const getData = async () => {
  const weekResponse = await fetch(`${URL}/weeks?Current=true`);
  const week = await weekResponse.json();
  const today = moment();
  const resp = await fetch(
    `${URL}/activities?Day=${today.format("YYYY-MM-DD")}`
  );
  const activities = await resp.json();
  return activities;
};

const StreakDay = () => {
  const classes = useStyles();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = React.useState([0]);

  useEffect(async () => {
    const data = await getData();
    setData(data);
    setLoading(false);
  }, []);

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  return (
    <div>
      {!loading && (
        <Box display="flex" justifyContent="center">
          <Typography component="div">
            <Box textAlign="center" m={2}>
              Streak Day
            </Box>
          </Typography>
          <List className={classes.root}>
            {data.map((value) => {
              const labelId = `checkbox-list-label-${value}`;
              console.log(value);
              return (
                <ListItem
                  key={value}
                  role={undefined}
                  dense
                  button
                  onClick={handleToggle(value)}
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={value}
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
    </div>
  );
};

export default StreakDay;
