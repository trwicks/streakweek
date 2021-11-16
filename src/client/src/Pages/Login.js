import React, { useState } from "react";
import { render } from "react-dom";
import { Formik, Form, Field } from "formik";
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
// import {
//       TimePicker,
//       DatePicker,
//       DateTimePicker,
// } from 'formik-material-ui-pickers';
// import {MuiPickersUtilsProvider} from '@material-ui/pickers';
// import DateFnsUtils from '@date-io/date-fns';
// import {
//       Autocomplete,
//       ToggleButtonGroup,
//       AutocompleteRenderInputParams,
// } from 'formik-material-ui-lab';
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

const Login = () => {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [isError, setIsError] = useState(false);
  const { setUserData } = useAuth();

  if (isLoggedIn) {
    return <Redirect to="/" />;
  }

  return (
    <Formik
      initialValues={{
        email: "",
        password: "",
      }}
      validate={(values) => {
        const errors = {};
        if (!values.email) {
          errors.email = "Required";
        } else if (
          !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)
        ) {
          errors.email = "Invalid email address";
        }
        return errors;
      }}
      onSubmit={async (values, { setSubmitting }) => {
        // setTimeout(() => {
        //     setSubmitting(false);
        //     alert(JSON.stringify(values, null, 2));
        // }, 500);
        try {
          const payload = {
            identifier: values.email,
            password: values.password,
          };
          const { data } = await axios.post(`${URL}/auth/local`, payload);
          setUserData(data);
          setLoggedIn(true);
        } catch (error) {
          console.log(error.response);
          setIsError(error.response.statusText);
        }
      }}
    >
      {({ submitForm, isSubmitting, touched, errors }) => (
        <Box justifyContent="center" display="flex">
          <Box
            component={Paper}
            p={3}
            m={3}
            justifyContent="center"
            width="50%"
          >
            <Typography component="h2">
              <Box textAlign="center" p={2}>
                Login
              </Box>
            </Typography>
            <Box justifyContent="center" display="flex">
              <Form>
                <Box margin={1}>
                  <Field
                    component={TextField}
                    name="email"
                    type="email"
                    label="Email"
                    helperText="Please Enter Email"
                  />
                </Box>
                <Box margin={1}>
                  <Field
                    component={TextField}
                    type="password"
                    label="Password"
                    name="password"
                  />
                </Box>
                {isError && (
                  <Box margin={1}>
                    <Typography component="h2">
                      <Box textAlign="center" p={2}>
                        {isError}
                      </Box>
                    </Typography>
                  </Box>
                )}
                <Box margin={1}>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting}
                    onClick={submitForm}
                  >
                    Submit
                  </Button>
                </Box>
              </Form>
            </Box>
          </Box>
        </Box>
      )}
    </Formik>
  );
};

export default Login;
