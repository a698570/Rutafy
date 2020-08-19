import React, {useEffect, useState} from "react";
import {withRouter} from "react-router-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Route from "./Route";

function Favourites() {
    const [logged, setLogged] = useState(false)
    const [routes, setRoutes] = useState([])

    useEffect(() => {
        let token = localStorage.getItem('token')
        if (token) {
            setLogged(true)
            fetch('http://localhost:8000/fav/routes',
                {
                    method: 'GET',
                    mode: 'cors',
                    credentials: 'include',
                    headers: {'Authorization': 'Bearer ' + token}
                })
                .then(response => response.ok ? response.json() : [])
                .then(data => setRoutes(data));
        } else {
            setLogged(false)
        }
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
                        {logged !== true ?
                            (<Typography
                                variant="body1"
                                gutterBottom
                            >
                                Please, log in to view your favourite routes
                            </Typography>)
                            :
                            routes.map(route => (
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
