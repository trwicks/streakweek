import React, { useEffect, useState } from "react";
import moment from "moment";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { Container } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Pagination from "@material-ui/lab/Pagination";
import { green, purple, red } from "@material-ui/core/colors";
import { createTheme, withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";

// import HUE from '@material-ui/core/colors/HUE';

let URL;
if (process.env.REACT_APP_API_HOST && process.env.REACT_APP_API_PORT) {
  console.log("ghere");
  URL = `http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}`;
} else {
  URL = `http://localhost:1337`;
}
console.log(
  `http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}`
);

const getData = async () => {
  const weekResponse = await fetch(`${URL}/weeks?Current=true`);
  const weekData = await weekResponse.json();
  const asSets = await fetch(`${URL}/activity-sets?weeks_eq=${weekData[0].id}`);
  const asSetData = await asSets.json();
  const startDate = moment(weekData[0].WeekStartDate);
  const currentDate = moment();
  const response = await fetch(`${URL}/activities?day=${currentDate}`);
  activities = response.json();
  // const activities = await fetch(`${URL}/activities?week_eq=${asSetData[0].id}`)

  // const allActivities = []
  // await Promise.all(promises).then(setActivities => {
  //     setActivities.map(a => {allActivities.push(...a)})
  // })

  // const displayData = {
  //     week: weekData,
  //     activitySets: asSetData,
  //     days: {}
  // }
};

const useStyles = makeStyles((theme) => ({
  table: {
    minWidth: 650,
  },
  doneButton: {
    margin: theme.spacing(1),
  },
}));

const Activity = ({ data }) => {
  const [done, setDone] = useState(data);
  console.log(data);

  const handleClick = async (e) => {
    e.preventDefault();
    const response = await fetch(`${URL}/activities/${data.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        Complete: !done,
      }),
    });
    const data = await response.json();

    setDone(!done);
  };

  return (
    <Button onClick={handleClick} color={done ? "primary" : "secondary"} mx={1}>
      {data.activity_set.Name} {done ? "Yes" : "No"}
    </Button>
  );
};

const WeekData = (data, classes) => {
  return (
    <div>
      <Typography component="div">
        <Box textAlign="center" m={2}>
          Week: {data.week.StreakWeek}
        </Box>
      </Typography>
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Day of the Week</TableCell>
              <TableCell>Activities</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(data.days).map((key) => (
              <TableRow key={key}>
                <TableCell component="th" scope="row">
                  {key}
                </TableCell>
                <TableCell align="right">
                  {data.days[key].map((activity) => (
                    <Activity data={activity} />
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

const Streaks = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [start, setStart] = useState(0);
  const classes = useStyles();
  const [total, setTotal] = useState(10);

  useEffect(async () => {
    const response = await fetch(`${URL}/activities/count`);
    const count = await response.json();
    setTotal(Math.round(count / 10));
    const data = await getData(start);
    setData(data);
    setLoading(false);
  }, []);

  const handleChange = async (event, value) => {
    setStart(value * 10 - 10);
    const data = await getData(start);
    setData(data);
    setLoading(false);
  };

  return (
    <Container>
      {loading ? <p>Loading...</p> : WeekData(data, classes)}
      <Pagination
        m={3}
        count={total}
        variant="outlined"
        color="secondary"
        onChange={handleChange}
      />
    </Container>
  );
};

export default Streaks;

// Array.from({length: 7}, async (_, i) => {
//     const date = moment(startDate).add(i, 'days').format('YYYY-MM-DD')
//     console.log(date)

//         displayData.days[date] = allActivities.filter(a => {
//             const at = moment(a.Day).format('YYYY-MM-DD')
//             return at == date
//         })

// })
// console.log(displayData)
// return displayData
