import React, {useEffect, useState} from "react";
import {withRouter} from "react-router-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";

function Profile() {
    const [logged, setLogged] = useState(false)
    const [categories, setCategories] = useState([])
    const [newCategories, setNewCategories] = useState([])
    const [allCategories, setAllCategories] = useState([])

    useEffect(() => {
        let token = localStorage.getItem('token')
        if (token) {
            setLogged(true)
        } else {
            setLogged(false)
        }
    }, [])

    useEffect(() => {
        let user = localStorage.getItem('user')
        if (user) {
            let categories = JSON.parse(user)['categories']
            setCategories(categories)
        } else {
            setCategories([])
        }
    }, [])

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

    const addCategories = () => {
        let token = window.localStorage['token']
        fetch('http://localhost:8000/user/categories',
            {
                method: 'POST',
                mode: 'cors',
                credentials: 'include',
                body: JSON.stringify(newCategories),
                headers: {'Authorization': 'Bearer ' + token}
            })
            .then(response => {
                if (response.ok) {
                    response.json().then(user => {
                        setCategories(user['categories'])
                        localStorage.setItem('user', JSON.stringify(user))
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
                                <Typography
                                    style={{textTransform: "uppercase"}}
                                    color="secondary"
                                    gutterBottom
                                >
                                    Profile
                                </Typography>
                                {logged !== true ?
                                    (<Typography
                                        variant="body1"
                                        gutterBottom
                                    >
                                        Please, log in to view your profile
                                    </Typography>)
                                    :
                                    <div>
                                        <Typography
                                            variant="body1"
                                            gutterBottom
                                        >
                                            Your categories: {categories.map(c => (c + ', '))}
                                        </Typography>
                                        <Paper>
                                            <div>
                                                <Typography
                                                    color="secondary"
                                                    variant="subtitle1"
                                                    gutterBottom
                                                >
                                                    Add new categories
                                                </Typography>
                                                <form noValidate autoComplete="off">
                                                    <TextField
                                                        id="categories"
                                                        label="Add category"
                                                        select
                                                        value={allCategories.length > 0 ? allCategories[0] : ''}
                                                        onChange={e => setNewCategories(newCategories.concat(e.target.value))}>
                                                        {allCategories.map(option => (
                                                            <MenuItem key={option} value={option}>
                                                                {option}
                                                            </MenuItem>
                                                        ))}
                                                    </TextField>
                                                </form>
                                                <Typography variant="body2" gutterBottom>
                                                    New categories: {newCategories.map(c => c + ', ')}
                                                </Typography>
                                            </div>
                                            <div style={{display: "flex", justifyContent: "flex-end"}}>
                                                <Button
                                                    color="primary"
                                                    variant="contained"
                                                    onClick={() => {
                                                        addCategories();
                                                    }}
                                                >
                                                    Add
                                                </Button>
                                            </div>
                                        </Paper>
                                    </div>
                                }
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>
            </div>
        </React.Fragment>)
}

export default withRouter(Profile);
