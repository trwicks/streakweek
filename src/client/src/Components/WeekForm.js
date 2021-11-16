import React, { useState, useEffect } from "react";
import { render } from "react-dom";
import { Formik, Form, Field, FieldArray } from "formik";
import Grid from "@material-ui/core/Grid";

import {
  Button,
  LinearProgress,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Typography,
  Paper,
} from "@material-ui/core";
import MuiTextField from "@material-ui/core/TextField";
import {
  fieldToTextField,
  TextField,
  TextFieldProps,
  Select,
  Switch,
} from "formik-material-ui";
import {
  //       TimePicker,
  DatePicker,
  //       DateTimePicker,
} from "formik-material-ui-pickers";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import {
  Autocomplete,
  //       ToggleButtonGroup,
  //       AutocompleteRenderInputParams,
} from "formik-material-ui-lab";
import Box from "@material-ui/core/Box";
import ToggleButton from "@material-ui/lab/ToggleButton";
// import FormatAlignLeftIcon from '@material-ui/icons/FormatAlignLeft';
// import FormatAlignCenterIcon from '@material-ui/icons/FormatAlignCenter';
// import FormatAlignRightIcon from '@material-ui/icons/FormatAlignRight';
// import FormatAlignJustifyIcon from '@material-ui/icons/FormatAlignJustify';
import axios from "axios";
import { Link, Redirect } from "react-router-dom";

import { useAuth } from "../context/auth";
import URL from "../utils/getUrl";
import moment from "moment";

const WeekForm = ({ handleDataUpdate }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const { token, userId } = useAuth();
  const [mostRecentWeek, setMostRecentWeek] = useState(null);

  useEffect(async () => {
    const myHeaders = new Headers();

    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token}`);

    const weekResp = await axios.get(`${URL}/weeks?User_eq=${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (weekResp.data.length === 0) {
      setMostRecentWeek({
        StreakWeek: 0,
      });
      setIsLoading(false);
    } else {
      const latestWeek = weekResp.data.sort((a, b) => a.id < b.id)[0];
      setMostRecentWeek(latestWeek);

      // TODO: move streak types to db relation object

      setIsLoading(false);
    }
  }, []);

  return (
    <Formik
      initialValues={{
        StartDate: new Date(),
      }}
      validate={(values) => {
        const errors = {};
        return errors;
      }}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          const payload = values;

          // Create week if it does not exist

          const weekResp = await axios.post(
            `${URL}/weeks/`,
            {
              WeekStartDate: values.StartDate,
              StreakWeek: mostRecentWeek.StreakWeek + 1,
              User: userId,
              Current: true,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const week = weekResp.data;
          handleDataUpdate();
        } catch (error) {
          console.log(error.response);
          setIsError(error.response.statusText);
        }
      }}
    >
      {({ values, submitForm, isSubmitting, errors, setValues }) => (
        <Box justifyContent="center" display="flex">
          <Box
            component={Paper}
            p={3}
            m={3}
            justifyContent="center"
            width="90%"
          >
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <Form>
                <Field
                  component={DatePicker}
                  name="date"
                  label="Start Date"
                  helperText="Please select a start date for the week"
                />
                {isError && (
                  <Typography component="h2">
                    <Box textAlign="center" p={2}>
                      {isError}
                    </Box>
                  </Typography>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                  onClick={submitForm}
                >
                  Submit
                </Button>
              </Form>
            </MuiPickersUtilsProvider>
          </Box>
        </Box>
      )}
    </Formik>
  );
};

export default WeekForm;
