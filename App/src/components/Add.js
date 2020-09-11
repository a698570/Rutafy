import React, {useEffect, useState} from "react";
import {withRouter} from "react-router-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import Route from "./Route";
import Api from "./Api";

function Search() {
    const [logged, setLogged] = useState(false)
    const [route, setRoute] = useState(null)
    const [places, setPlaces] = useState([])
    const [allPlaces, setAllPlaces] = useState([])

    useEffect(() => {
        let token = localStorage.getItem('token')
        if (token) {
            setLogged(true)
        } else {
            setLogged(false)
        }
    }, [])

    useEffect(() => {
        fetch(Api + '/places/names',
            {
                method: 'GET',
                mode: 'cors',
                credentials: 'include',
            })
            .then(response => response.json())
            .then(data => setAllPlaces(data));
    }, [])

    const clear = () => {
        setPlaces([])
    }

    const addRoute = () => {
        let token = window.localStorage['token']
        fetch(Api + '/routes',
            {
                method: 'POST',
                mode: 'cors',
                credentials: 'include',
                headers: {'Authorization': 'Bearer ' + token},
                body: JSON.stringify(places)
            })
        .then(response => {
                if (response.ok) {
                    response.json().then(data => {
                        setRoute(data)
                    })
                }
            })
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
                                        Add route
                                    </Typography>
                                    <form noValidate autoComplete="off">
                                        <TextField
                                            id="places"
                                            label="Add place"
                                            select
                                            value={allPlaces.length > 0 ? allPlaces[0] : ''}
                                            onChange={e => setPlaces(places.concat(e.target.value))}>
                                            {allPlaces.map(option => (
                                                <MenuItem key={option} value={option}>
                                                    {option}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </form>
                                    <Typography variant="body2" gutterBottom>
                                        Places:
                                    </Typography>
                                    <ol>
                                        {places.map(p => <li>{p}</li>)}
                                    </ol>
                                </div>
                                <div style={{display: "flex", justifyContent: "flex-end"}}>
                                    <Button
                                        color="primary"
                                        variant="contained"
                                        onClick={() => {
                                            addRoute();
                                        }}
                                    >
                                        Add and fav
                                    </Button>
                                    <Button
                                        color="primary"
                                        variant="contained"
                                        onClick={() => {
                                            clear();
                                        }}
                                    >
                                        Clear
                                    </Button>
                                </div>
                            </Paper>
                        </Grid>
                        {logged !== true ? (
                                <Typography
                                    variant="body1"
                                    gutterBottom
                                >
                                    Please, log in to add routes.
                                </Typography>)
                            : null
                        }
                        {route !== null ?
                            <Grid item xs={12} md={6}>
                                <Typography variant="body2" gutterBottom>
                                    Last added route:
                                </Typography>
                                <Paper>
                                    <Route route={route}/>
                                </Paper>
                            </Grid>
                            : null}
                    </Grid>
                </Grid>
            </div>
        </React.Fragment>
    )
}

export default withRouter(Search);
