import React, {useEffect, useState} from "react";
import {withRouter} from "react-router-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";

function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')


    const login = () => {
        let searchParams = new URLSearchParams();

        searchParams.append('username', username);
        searchParams.append('password', password);

        fetch('http://localhost:8000/token',
            {
                method: 'POST',
                mode: 'cors',
                credentials: 'include',
                body: searchParams
            })
            .then(response => response.json())
            .then(data => {
                let storage = window.localStorage
                storage.setItem('token', data['access_token'])
            })
    }

    const signup = () => {
        let body = {email: username, password: password}

                fetch('http://localhost:8000/user',
            {
                method: 'POST',
                mode: 'cors',
                credentials: 'include',
                body: JSON.stringify(body)
            })
            .then(response => response.json())
            .then(() => login())
    }

    return (
        <React.Fragment>
            <CssBaseline/>
            <div>
                <Grid container justify="center">
                    <Grid
                        spacing={4}
                        alignItems="center"
                        justify="center"
                        container
                    >
                        <Grid item xs={12}>
                            <Paper>
                                <div>
                                    <Typography
                                        style={{textTransform: "uppercase"}}
                                        color="secondary"
                                        gutterBottom
                                    >
                                        Login
                                    </Typography>
                                    <form noValidate autoComplete="off">
                                        <TextField
                                            id="username"
                                            label="username"
                                            value={username}
                                            onChange={e => setUsername(e.target.value)}/>
                                        <TextField
                                            id="password"
                                            label="password"
                                            type="password"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}/>
                                    </form>
                                </div>
                                <div style={{display: "flex", justifyContent: "flex-end"}}>
                                    <Button
                                        color="primary"
                                        variant="contained"
                                        onClick={() => {
                                            login();
                                        }}
                                    >
                                        Login
                                    </Button>
                                    <Button
                                        color="primary"
                                        variant="contained"
                                        onClick={() => {
                                            signup();
                                        }}
                                    >
                                        Signup
                                    </Button>
                                </div>
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>
            </div>
        </React.Fragment>)
}

export default withRouter(Login);
