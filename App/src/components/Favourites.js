import React, {useEffect, useState} from "react";
import {withRouter} from "react-router-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";

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
                        {routes.map(route => (
                            <Grid item xs={12} md={4}>
                                <Paper>
                                    <div>
                                        <Typography
                                            style={{textTransform: "uppercase"}}
                                            color="secondary"
                                            gutterBottom
                                        >
                                            {route['places'].length > 4 ?
                                                route['places'][0]['name'] + ' - ' +
                                                route['places'][1]['name'] + ' - ' +
                                                '... - ' +
                                                route['places'][route['places'].length - 2]['name'] + ' - ' +
                                                route['places'][route['places'].length - 1]['name'] :
                                                route['places'].map(p => p['name'] + ' - ')
                                            }
                                        </Typography>
                                        <Typography variant="body2" gutterBottom>
                                            Time: {route['minutes']}
                                        </Typography>
                                        <Typography variant="body2" gutterBottom>
                                            Places: {route['places'].map(p => p['name'] + ', ')}
                                        </Typography>
                                    </div>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </div>
        </React.Fragment>)
}

export default withRouter(Favourites);
