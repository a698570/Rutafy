import React, {useEffect, useState} from "react";
import {withRouter} from "react-router-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Api from "./Api";

function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [logged, setLogged] = useState(false)
    const [validCredentials, setValidCredentials] = useState(true)

    useEffect(() => {
        let token = localStorage.getItem('token')
        if (token) {
            setLogged(true)
        } else {
            setLogged(false)
        }
    }, [])

    const login = () => {
        let searchParams = new URLSearchParams();

        searchParams.append('username', username);
        searchParams.append('password', password);

        fetch(Api + '/token',
            {
                method: 'POST',
                mode: 'cors',
                credentials: 'include',
                body: searchParams
            })
            .then(response => {
                if (response.ok) {
                    setValidCredentials(true)
                    response.json().then(data => {
                        localStorage.setItem('token', data['access_token'])
                        setLogged(true)
                        getUser()
                    })
                } else {
                    setValidCredentials(false)
                }
            })
    }

    const signup = () => {
        let body = {email: username, password: password}

        fetch(Api + '/user',
            {
                method: 'POST',
                mode: 'cors',
                credentials: 'include',
                body: JSON.stringify(body)
            })
            .then(response => {
                if (response.ok) {
                    login()
                } else {
                    setValidCredentials(false)
                }
            })
    }

    const getUser = () => {
        let token = window.localStorage['token']
        fetch(Api + '/user',
            {
                method: 'GET',
                mode: 'cors',
                credentials: 'include',
                headers: {'Authorization': 'Bearer ' + token}
            })
            .then(result => result.json())
            .then(data => localStorage.setItem('user', JSON.stringify(data)))
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setLogged(false)
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
                                </div>
                                {logged !== true ?
                                    (
                                        <div>
                                            <div>
                                                <form noValidate autoComplete="off">
                                                    <TextField
                                                        id="email"
                                                        label="Email"
                                                        value={username}
                                                        onChange={e => setUsername(e.target.value)}/>
                                                    <TextField
                                                        id="password"
                                                        label="Password"
                                                        type="password"
                                                        value={password}
                                                        onChange={e => setPassword(e.target.value)}/>
                                                </form>
                                            </div>
                                            {validCredentials !== true ? (
                                                    <Typography
                                                        style={{textTransform: "uppercase"}}
                                                        gutterBottom
                                                    >
                                                        Invalid credentials
                                                    </Typography>)
                                                : null}
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
                                        </div>) :
                                    (<div>
                                        <Typography
                                            variant="body1"
                                            gutterBottom
                                        >
                                            You are logged in.
                                        </Typography>
                                        <div style={{display: "flex", justifyContent: "flex-end"}}>
                                            <Button
                                                color="primary"
                                                variant="contained"
                                                onClick={() => {
                                                    logout();
                                                }}
                                            >
                                                Logout
                                            </Button>
                                        </div>
                                    </div>)
                                }
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>
            </div>
        </React.Fragment>)
}

export default withRouter(Login);
