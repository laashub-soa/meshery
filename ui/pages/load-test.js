import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { NoSsr } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import LoadTestTimerDialog from '../components/load-test-timer-dialog';
import MesheryChart from '../components/MesheryChart';
import Snackbar from '@material-ui/core/Snackbar';
import MesherySnackbarWrapper from '../components/MesherySnackbarWrapper';
import dataFetch from '../lib/data-fetch';


const styles = theme => ({
  root: {
    padding: theme.spacing(10),
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(1),
  },
  margin: {
    margin: theme.spacing(1),
  },
  chartTitle: {
    textAlign: 'center',
  }
});

class LoadTest extends React.Component {
  state = {
    timerDialogOpen: false,
    url: '',
    qps: 0,
    c: 0,
    t: 1,

    urlError: false,
    result: {},

    showSnackbar: false,
    snackbarVariant: '',
    snackbarMessage: '',
  };

  handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    this.setState({ showSnackbar: false });
  };

  handleChange = name => event => {
    if (name === 'url' && event.target.value !== ''){
      this.setState({urlError: false});
    }
    this.setState({ [name]: event.target.value });
  };

  handleSubmit = () => {

    const { url } = this.state;
    if (url === ''){
      this.setState({urlError: true})
      return;
    }
    this.submitLoadTest()
    this.setState({timerDialogOpen: true});
  }

  submitLoadTest = () => {
    const {url, qps, c, t} = this.state;
    const data = {
      url,
      qps,
      c,
      t
    }
    const params = Object.keys(data).map((key) => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
    }).join('&');
    console.log(`data to be submitted for load test: ${params}`);
    let self = this;
    dataFetch('/api/load-test', { 
      credentials: 'same-origin',
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: params
    }, result => {
      if (typeof result !== 'undefined'){
        this.setState({result, timerDialogOpen: false, showSnackbar: true, snackbarVariant: 'success', snackbarMessage: 'Load test ran successfully!'});
      }
    }, self.handleError);
  }

  handleError = error => {
    this.setState({timerDialogOpen: false });
    this.setState({showSnackbar: true, snackbarVariant: 'error', snackbarMessage: `Load test did not run successfully with msg: ${error}`});
  }

  handleTimerDialogClose = () => {
    this.setState({timerDialogOpen: false});
  }

  render() {
    const { classes } = this.props;
    const { timerDialogOpen, qps, url, t, c, result, urlError, showSnackbar, snackbarVariant, snackbarMessage } = this.state;

    return (
      <NoSsr>
      <React.Fragment>
      <div className={classes.root}>
      <Grid container spacing={5}>
        <Grid item xs={12}>
          <TextField
            required
            id="url"
            name="url"
            label="URL for the load test"
            type="url"
            autoFocus
            fullWidth
            value={url}
            error={urlError}
            onChange={this.handleChange('url')}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            required
            id="c"
            name="c"
            label="Concurrent requests"
            type="number"
            fullWidth
            value={c}
            defaultValue={0}
            inputProps={{ min: "0", step: "1" }}
            onChange={this.handleChange('c')}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            required
            id="qps"
            name="qps"
            label="Queries per second"
            type="number"
            fullWidth
            value={qps}
            defaultValue={0}
            inputProps={{ min: "0", step: "1" }}
            onChange={this.handleChange('qps')}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            required
            id="t"
            name="t"
            label="Duration in minutes"
            type="number"
            fullWidth
            value={t}
            defaultValue={1}
            inputProps={{ min: "1", step: "1" }}
            onChange={this.handleChange('t')}
          />
        </Grid>
      </Grid>
      <React.Fragment>
        <div className={classes.buttons}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={this.handleSubmit}
            className={classes.button}
          >
           Submit
          </Button>
        </div>
      </React.Fragment>
      </div>
    </React.Fragment>
    
    <LoadTestTimerDialog open={timerDialogOpen} 
      t={t}
      onClose={this.handleTimerDialogClose} 
      countDownComplete={this.handleTimerDialogClose} />

    <Typography variant="h6" gutterBottom className={classes.chartTitle}>
        Results
      </Typography>
    <MesheryChart data={result} />    
    
    <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={showSnackbar}
          autoHideDuration={6000}
          onClose={this.handleSnackbarClose}
        >
        <MesherySnackbarWrapper 
          variant={snackbarVariant}
          message={snackbarMessage}
          onClose={this.handleSnackbarClose}
          />
      </Snackbar>
      </NoSsr>
    );
  }
}

LoadTest.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LoadTest);