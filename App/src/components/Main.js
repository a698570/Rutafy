import React, { Component } from "react";
import withStyles from "@material-ui/styles/withStyles";
import { withRouter } from "react-router-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";

const backgroundShape = require("../images/shape.svg");

const styles = theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.grey["100"],
    overflow: "hidden",
    background: `url(${backgroundShape}) no-repeat`,
    backgroundSize: "cover",
    backgroundPosition: "0 400px",
    paddingBottom: 200
  },
  grid: {
    width: 1200,
    marginTop: 40,
    [theme.breakpoints.down("sm")]: {
      width: "calc(100% - 20px)"
    }
  },
  paper: {
    padding: theme.spacing(3),
    textAlign: "left",
    color: theme.palette.text.secondary
  },
  rangeLabel: {
    display: "flex",
    justifyContent: "space-between",
    paddingTop: theme.spacing(2)
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 32
  },
  outlinedButtom: {
    textTransform: "uppercase",
    margin: theme.spacing(1)
  },
  actionButtom: {
    textTransform: "uppercase",
    margin: theme.spacing(1),
    width: 152
  },
  blockCenter: {
    padding: theme.spacing(2),
    textAlign: "center"
  },
  block: {
    padding: theme.spacing(2)
  },
  box: {
    marginBottom: 40,
    height: 65
  },
  inlining: {
    display: "inline-block",
    marginRight: 10
  },
  buttonBar: {
    display: "flex"
  },
  alignRight: {
    display: "flex",
    justifyContent: "flex-end"
  },
  noBorder: {
    borderBottomStyle: "hidden"
  },
  loadingState: {
    opacity: 0.05
  },
  loadingMessage: {
    position: "absolute",
    top: "40%",
    left: "40%"
  }
});

class Main extends Component {

  render() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <CssBaseline />
        <div className={classes.root}>
          <Grid container justify="center">
            <Grid
              spacing={4}
              alignItems="center"
              justify="center"
              container
              className={classes.grid}
            >
              <Grid item xs={12} md={8}>
                <Paper className={classes.paper}>
                  <div className={classes.box}>
                    <Typography
                      style={{ textTransform: "uppercase" }}
                      color="secondary"
                      gutterBottom
                    >
                      Search routes
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Search touristic routes according to your insterests and time
                    </Typography>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      color="primary"
                      variant="contained"
                      className={classes.actionButtom}
                      href='#search'
                    >
                      Go
                    </Button>
                  </div>
                </Paper>
              </Grid>
              <Grid item xs={12} md={8}>
                <Paper className={classes.paper}>
                  <div className={classes.box}>
                    <Typography
                      style={{ textTransform: "uppercase" }}
                      color="secondary"
                      gutterBottom
                    >
                      Add
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Add a custom route to your favourites
                    </Typography>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      color="primary"
                      variant="contained"
                      className={classes.actionButtom}
                      href='#add'
                    >
                      Go
                    </Button>
                  </div>
                </Paper>
              </Grid>
              <Grid item xs={12} md={8}>
                <Paper className={classes.paper}>
                  <div className={classes.box}>
                    <Typography
                      style={{ textTransform: "uppercase" }}
                      color="secondary"
                      gutterBottom
                    >
                      Favourites
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Explore the routes that you marked as favourites
                    </Typography>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      color="primary"
                      variant="contained"
                      className={classes.actionButtom}
                      href='#favourites'
                    >
                      Go
                    </Button>
                  </div>
                </Paper>
              </Grid>
              <Grid item xs={12} md={8}>
                <Paper className={classes.paper}>
                  <div className={classes.box}>
                    <Typography
                      style={{ textTransform: "uppercase" }}
                      color="secondary"
                      gutterBottom
                    >
                      Profile
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Update your default search preferences
                    </Typography>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      color="primary"
                      variant="contained"
                      className={classes.actionButtom}
                      href='#profile'
                    >
                      Go
                    </Button>
                  </div>
                </Paper>
              </Grid>
              <Grid item xs={12} md={8}>
                <Paper className={classes.paper}>
                  <div className={classes.box}>
                    <Typography
                      style={{ textTransform: "uppercase" }}
                      color="secondary"
                      gutterBottom
                    >
                      Statistics
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      See statistics about your favourite routes
                    </Typography>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      color="primary"
                      variant="contained"
                      className={classes.actionButtom}
                      href='#stats'
                    >
                      Go
                    </Button>
                  </div>
                </Paper>
              </Grid>
              <Grid item xs={12} md={8}>
                <Paper className={classes.paper}>
                  <div className={classes.box}>
                    <Typography
                      style={{ textTransform: "uppercase" }}
                      color="secondary"
                      gutterBottom
                    >
                      Login
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Create an account, log to it or log out
                    </Typography>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      color="primary"
                      variant="contained"
                      className={classes.actionButtom}
                      href='#login'
                    >
                      Go
                    </Button>
                  </div>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </React.Fragment>
    );
  }
}

export default withRouter(withStyles(styles)(Main));
