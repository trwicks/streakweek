import React, { useState, useEffect } from "react";
import { Formik, Field } from "formik";
import Grid from "@material-ui/core/Grid";

import {
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
} from "@material-ui/core";
import MuiTextField from "@material-ui/core/TextField";
import { TextField, Select, Switch } from "formik-material-ui";
import {
  Autocomplete,
  //       ToggleButtonGroup,
  //       AutocompleteRenderInputParams,
} from "formik-material-ui-lab";
import Box from "@material-ui/core/Box";
import axios from "axios";

import { useAuth } from "../context/auth";
import URL from "../utils/getUrl";
import moment from "moment";

const weekday = new Array(7);
weekday[0] = "Sunday";
weekday[1] = "Monday";
weekday[2] = "Tuesday";
weekday[3] = "Wednesday";
weekday[4] = "Thursday";
weekday[5] = "Friday";
weekday[6] = "Saturday";

const streakTypes = [
  "Study",
  "Exercise",
  "Dodge",
  "Social",
  "Mindfulness",
  "Creative",
  "Administration",
  "Other",
];

const ActivityForm = ({
  week,
  editValues,
  handleEdits,
  handleShowActivityButton,
}) => {
  // const { token, userId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [days, setDays] = useState([]);
  const [everyday, setEveryDay] = useState(false);

  const { token } = useAuth();

  useEffect(async () => {
    const myHeaders = new Headers();

    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token}`);

    if (editValues.id) {
      const activitiesResp = await axios.get(
        `${URL}/activities?activity_set_eq=${editValues.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const activities = activitiesResp.data;
      const daysOfTheWeek = activities.map((a) => {
        const theDay = new Date(a.Day);
        return weekday[theDay.getDay()];
      });
      setDays(daysOfTheWeek);
      if (activities.length === 7) {
        setEveryDay(true);
      } else {
        // TODO:
      }
    }
  }, []);

  return isLoading ? (
    <p> Loading </p>
  ) : (
    <Formik
      initialValues={{
        id: editValues.id || "",
        name: editValues.Name || "",
        description: editValues.Description || "",
        days: days || [],
        everyday: true,
        streakType: editValues.Type || "Other",
      }}
      validate={(values) => {
        const errors = {};
        return errors;
      }}
      onSubmit={async (values, { setSubmitting }) => {
        // const myHeaders = new Headers();

        // myHeaders.append('Content-Type', 'application/json');
        // myHeaders.append('Authorization', `Bearer ${token}`);
        setSubmitting(true);
        if (values.id) {
          const streakResp = await axios.put(
            `${URL}/activity-sets/${editValues.id}`,
            {
              weeks: [week.id],
              Name: values.name,
              Description: values.description,
              Type: values.streakType,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const streakObj = streakResp.data;
          console.log(streakObj);
          let day = moment(values.StartDate);
          values.days.map((d) => {});
          setSubmitting(false);
          handleEdits(editValues.id);
        } else {
          const streakResp = await axios.post(
            `${URL}/activity-sets/`,
            {
              weeks: [week.id],
              Name: values.name,
              Description: values.description,
              Type: values.streakType,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const streakObj = streakResp.data;
          if (values.everyday) {
            let day = moment(values.StartDate);
            for (let i = 0; i <= 6; i++) {
              const actResp = await axios.post(
                `${URL}/activities/`,
                {
                  Day: day,
                  activity_set: streakObj.id,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              const actData = actResp.data;
              day = day.add(1, "days");
            }
          } else {
            // Add in only the days selected
          }
          setSubmitting(false);
          handleShowActivityButton();
        }
      }}
    >
      {({ values, submitForm, isSubmitting, touched, errors, setValues }) => (
        <Box margin={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box
                display="flex"
                alignItems="justify"
                mx="auto"
                variant="outlined"
              >
                <Box p={1}>
                  <Field
                    component={TextField}
                    name={`name`}
                    type="text"
                    label="Streak Name"
                    helperText="Please enter a name for the streak, e.g. no fappgin"
                  />
                </Box>
                <Box p={1}>
                  <Field
                    component={TextField}
                    name={`description`}
                    type="text"
                    label="Streak Description"
                    helperText="Please select a type for the streak, e.g. Study"
                  />
                </Box>
                <Box margin={1}>
                  <Field
                    name={`streakType`}
                    //multiple
                    component={Autocomplete}
                    options={streakTypes}
                    getOptionLabel={(option) => option}
                    style={{ width: 300 }}
                    renderInput={(params) => (
                      <MuiTextField
                        {...params}
                        error={
                          touched["autocomplete"] && !!errors["autocomplete"]
                        }
                        helperText={
                          touched["autocomplete"] && errors["autocomplete"]
                        }
                        label="Streak Type"
                        variant="outlined"
                      />
                    )}
                  />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box
                display="flex"
                alignItems="justify"
                mx="auto"
                variant="outlined"
              >
                <Box margin={1} display="flex" justifyContent="center">
                  <FormControlLabel
                    control={
                      <Field
                        component={Switch}
                        type="checkbox"
                        name={`everyday`}
                      />
                    }
                    label="Duration - Everyday"
                  />
                </Box>
                {!values.everyday && (
                  <FormControl>
                    <InputLabel shrink={true} htmlFor="tags">
                      Days of the Week
                    </InputLabel>
                    <Field
                      component={Select}
                      type="text"
                      name={`days`}
                      multiple={true}
                      inputProps={{ name: `days`, id: `days` }}
                    >
                      <MenuItem value="monday">Monday</MenuItem>
                      <MenuItem value="tuesday">Tuesday</MenuItem>
                      <MenuItem value="wednesday">Wednesday</MenuItem>
                      <MenuItem value="thursday">Thursday</MenuItem>
                      <MenuItem value="friday">Friday</MenuItem>
                      <MenuItem value="saturday">Saturday</MenuItem>
                      <MenuItem value="sunday">Sunday</MenuItem>
                    </Field>
                  </FormControl>
                )}
              </Box>
            </Grid>
            <Box margin={2} justifyContent="center" display="flex">
              <Button
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                onClick={submitForm}
                mr={2}
              >
                Submit
              </Button>
              <Button
                color="secondary"
                variant="contained"
                onClick={() => {
                  if (editValues.id) {
                    handleEdits(editValues.id);
                  } else {
                    handleShowActivityButton();
                  }
                }}
              >
                Cancel
              </Button>
            </Box>
          </Grid>
        </Box>
      )}
    </Formik>
  );
};

export default ActivityForm;
