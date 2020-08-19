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

function Favourites() {
    const [routes, setRoutes] = useState([])

    useEffect(() => {
        let token = window.localStorage['token']
        fetch('http://localhost:8000/fav/routes',
            {
                method: 'GET',
                mode: 'cors',
                credentials: 'include',
                headers: {'Authorization': 'Bearer ' + token}
            })
            .then(response => response.ok ? response.json() : [])
            .then(data => setRoutes(data));
    }, [])

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
                            <Typography
                                style={{textTransform: "uppercase"}}
                                color="secondary"
                                gutterBottom
                            >
                                Favourite routes
                            </Typography>
                        </Grid>
                        {routes.map(route => (
                            <Grid item xs={12} md={6}>
                                <Route route={route}/>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </div>
        </React.Fragment>)
}

export default withRouter(Favourites);
