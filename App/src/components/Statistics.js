import React, {useEffect, useState} from "react";
import {withRouter} from "react-router-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Api from "./Api";
import SimpleLineChart from "./SimpleLineChart";

function Statistics() {
    const [logged, setLogged] = useState(false)
    const [statsCategories, setStatsCategories] = useState([])
    const [statsMunicipalities, setStatsMunicipalities] = useState([])

    useEffect(() => {
        let token = localStorage.getItem('token')
        if (token) {
            setLogged(true)
            fetch(Api + '/stats/categories',
                {
                    method: 'GET',
                    mode: 'cors',
                    credentials: 'include',
                    headers: {'Authorization': 'Bearer ' + token}
                })
                .then(response => response.ok ? response.json() : [])
                .then(data => {
                    const stats = data.map(i => ({name: i[0], count: i[1]}))
                    setStatsCategories(stats)
                });
            fetch(Api + '/stats/municipalities',
                {
                    method: 'GET',
                    mode: 'cors',
                    credentials: 'include',
                    headers: {'Authorization': 'Bearer ' + token}
                })
                .then(response => response.ok ? response.json() : [])
                .then(data => {
                    const stats = data.map(i => ({name: i[0], count: i[1]}))
                    setStatsMunicipalities(stats)
                });
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
                                Statistics
                            </Typography>
                        </Grid>
                        {logged !== true ?
                            (<Typography
                                variant="body1"
                                gutterBottom
                            >
                                Please, log in to view your statistics
                            </Typography>)
                            :
                            (<div>
                                <Typography
                                    variant="subtitle1"
                                    color="secondary"
                                    gutterBottom
                                >
                                    Most favourited categories
                                </Typography>
                                <SimpleLineChart data={statsCategories}/>
                                <Typography
                                    variant="subtitle1"
                                    color="secondary"
                                    gutterBottom
                                >
                                    Most favourited municipalities
                                </Typography>
                                <SimpleLineChart data={statsMunicipalities}/>
                            </div>)}
                    </Grid>
                </Grid>
            </div>
        </React.Fragment>)
}

export default withRouter(Statistics);
