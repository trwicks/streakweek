// import HUE from '@material-ui/core/colors/HUE';

let URL;
if (process.env.REACT_APP_API_HOST && process.env.REACT_APP_API_PORT) {
  URL = `http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}`;
} else {
  URL = `http://localhost:1337`;
}

export default URL;
