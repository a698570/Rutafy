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

function Search() {
    const [routes, setRoutes] = useState([])
    const [places, setPlaces] = useState([])
    const [minutes, setMinutes] = useState(120)
    const [categories, setCategories] = useState([])
    const [allCategories, setAllCategories] = useState([])
    const [allPlaces, setAllPlaces] = useState(
        ['Fuerte del Rapitán', 'Castillo de Loarre', 'Hotel San Ramón', 'Iglesia de San Sebastián'])

    useEffect(() => {
        fetch('http://localhost:8000/categories',
            {
                method: 'GET',
                mode: 'cors',
                credentials: 'include',
            })
            .then(response => response.json())
            .then(data => setAllCategories(data));
    }, [])

    useEffect(() => {
        fetch('http://localhost:8000/places/names',
            {
                method: 'GET',
                mode: 'cors',
                credentials: 'include',
            })
            .then(response => response.json())
            .then(data => setAllPlaces(data));
    }, [])

    const doSearch = () => {
        let searchParams = new URLSearchParams();

        searchParams.append('minutes', minutes.toString());
        categories.map(c => searchParams.append('categories', c));
        places.map(p => searchParams.append('places_names', p));

        fetch('http://localhost:8000/routes?' + searchParams.toString(),
            {
                method: 'GET',
                mode: 'cors',
                credentials: 'include',
            })
            .then(response => response.json())
            .then(data => setRoutes(data))
    }

    const makeFav = route_id => {
        let token = window.localStorage['token']
        fetch('http://localhost:8000/routes/' + route_id + '/fav',
            {
                method: 'POST',
                mode: 'cors',
                credentials: 'include',
                headers: {'Authorization': 'Bearer ' + token}
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
                                        Search route
                                    </Typography>
                                    <form noValidate autoComplete="off">
                                        <TextField
                                            id="minutes"
                                            label="Minutes"
                                            type="number"
                                            value={minutes}
                                            onChange={e => setMinutes(Number(e.target.value))}/>
                                        <TextField
                                            id="categories"
                                            label="Add category"
                                            select
                                            value={allCategories.length > 0 ? allCategories[0] : ''}
                                            onChange={e => setCategories(categories.concat(e.target.value))}>
                                            {allCategories.map(option => (
                                                <MenuItem key={option} value={option}>
                                                    {option}
                                                </MenuItem>
                                            ))}
                                        </TextField>
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
                                        Categories: {categories.map(c => c + ', ')}
                                    </Typography>
                                    <Typography variant="body2" gutterBottom>
                                        Places: {places.map(p => p + ', ')}
                                    </Typography>
                                </div>
                                <div style={{display: "flex", justifyContent: "flex-end"}}>
                                    <Button
                                        color="primary"
                                        variant="contained"
                                        onClick={() => {
                                            doSearch();
                                        }}
                                    >
                                        Search
                                    </Button>
                                </div>
                            </Paper>
                        </Grid>
                        {routes.map(route => (
                            <Grid item xs={12} md={6}>
                                <Paper>
                                    <Route route={route}/>
                                    <div style={{display: "flex", justifyContent: "flex-end"}}>
                                        <Button
                                            color="primary"
                                            variant="contained"
                                            onClick={() => makeFav(route['id'])}
                                        >
                                            Favorite
                                        </Button>
                                    </div>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </div>
        </React.Fragment>)
}

export default withRouter(Search);
