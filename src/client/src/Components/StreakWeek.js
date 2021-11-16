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
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import LinearProgress from "@material-ui/core/LinearProgress";
import CircularProgress from "@material-ui/core/CircularProgress";

import URL from "../utils/getUrl";
import WeekForm from "./WeekForm";
import ActivityForm from "./ActivityForm";
import axios from "axios";
import { useAuth } from "../context/auth";

const useStyles = makeStyles((theme) => ({
  table: {
    minWidth: 300,
  },
}));

const WeekData = ({ data, classes, handleDataUpdate }) => {
  const [addStreak, setAddStreak] = useState(false);
  const [edits, setEdits] = useState([]);
  const { token } = useAuth();

  const handleShowActivityButton = () => {
    setAddStreak(!addStreak);
  };

  const handleEdits = (activity, modify) => {
    if (modify === "add") {
      setEdits([...edits, activity]);
    } else {
      const newArr = edits.filter((a) => activity != a);
      setEdits(newArr);
    }
    handleDataUpdate();
  };

  useEffect(() => {
    handleDataUpdate();
  }, [addStreak]);

  return (
    <>
      {data.week.id ? (
        <Box component={Paper} m={3}>
          <Box textAlign="center" p={2} display="flex" justifyContent="Left">
            <Typography>Week Streak {data.week.StreakWeek + 1}</Typography>
          </Box>
          <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Activity Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Streak</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(data.activitySets).map((activity) => {
                  const complete = data.activitySets[activity].filter(
                    (a) => a.Complete
                  );
                  const progress =
                    (complete.length / data.activitySets[activity].length) *
                    100;

                  if (edits.includes(activity)) {
                    return (
                      <TableRow>
                        <TableCell
                          style={{ paddingBottom: 0, paddingTop: 0 }}
                          colSpan={6}
                        >
                          <ActivityForm
                            width="100%"
                            week={{ ...data.week }}
                            handleEdits={handleEdits}
                            editValues={
                              data.activitySets[activity][0].activity_set
                            }
                            handleShowActivityButton={handleShowActivityButton}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  } else {
                    return (
                      <TableRow key={activity}>
                        <TableCell component="th" scope="row">
                          {data.activitySets[activity][0].activity_set.Name}
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {data.activitySets[activity][0].activity_set.Type}
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {
                            data.activitySets[activity][0].activity_set
                              .Description
                          }
                        </TableCell>
                        <TableCell align="left">
                          {complete.length} /{" "}
                          {data.activitySets[activity].length}
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                          />
                        </TableCell>
                        <TableCell align="left">
                          <Button
                            color="primary"
                            variant="outlined"
                            onClick={async () => {
                              await handleEdits(activity, "add");
                              handleDataUpdate();
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            color="secondary"
                            variant="outlined"
                            onClick={async () => {
                              const activities = await axios.get(
                                `${URL}/activities?activity_set_eq=${data.activitySets[activity][0].activity_set.id}`,
                                {
                                  headers: {
                                    Authorization: `Bearer ${token}`,
                                  },
                                }
                              );
                              activities.data.map(async (a) => {
                                await axios.delete(
                                  `${URL}/activities/${a.id}`,
                                  {
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                    },
                                  }
                                );
                              });
                              await axios.delete(
                                `${URL}/activity-sets/${data.activitySets[activity][0].activity_set.id}`,
                                {
                                  headers: {
                                    Authorization: `Bearer ${token}`,
                                  },
                                }
                              );
                              handleDataUpdate();
                            }}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  }
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <Box textAlign="center" p={2} display="flex" justifyContent="Left">
            {addStreak ? (
              <ActivityForm
                week={{ ...data.week }}
                editValues={{}}
                handleShowActivityButton={handleShowActivityButton}
              />
            ) : (
              <Button
                color="secondary"
                variant="outlined"
                onClick={() => setAddStreak(!addStreak)}
              >
                Add a Streak
              </Button>
            )}
          </Box>
        </Box>
      ) : (
        <Box
          component={Paper}
          m={1}
          display="flex"
          justifyContent="left"
          alignContent="center"
          flexDirection="column"
        >
          <Box m={1}>
            <Typography>Create a Streak Week</Typography>
          </Box>
          <WeekForm handleDataUpdate={handleDataUpdate} />
        </Box>
      )}
    </>
  );
};

const Streaks = ({ isModified, handleDataUpdate, data, loading }) => {
  const classes = useStyles();

  return (
    <Container>
      {loading ? (
        <CircularProgress />
      ) : (
        <WeekData data={data} classes handleDataUpdate={handleDataUpdate} />
      )}
    </Container>
  );
};

export default Streaks;
