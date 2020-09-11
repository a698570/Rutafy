import React from "react";
import {CSVLink} from "react-csv";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Map from "./Map"

function Route(props) {
    let route = props.route;
    let places = route['places'].map(p => (
        {
            name: p['name'],
            lat: p['location']['coordinates'][0],
            lng: p['location']['coordinates'][1],
            description: p['description'],
            municipality: p['municipality']
        }
    ))
    return (
        <Paper>
            <div>
                <Typography
                    style={{textTransform: "uppercase"}}
                    color="secondary"
                    gutterBottom
                >
                    {places.length > 4 ?
                        places[0]['name'] + ' - ' +
                        places[1]['name'] + ' - ' +
                        '... - ' +
                        places[places.length - 2]['name'] + ' - ' +
                        places[places.length - 1]['name'] :
                        places.map(p => p['name'] + ' - ')
                    }
                </Typography>
                <Typography variant="body2" gutterBottom>
                    Duration: {route['minutes']} minutes (>{Math.floor(route['minutes'] / 60)} hours)
                </Typography>
                <Map coordinates={places.map(p => ({lat: p['lat'], lng: p['lng']}))} zoom={7}/>

                {places.map(p => (
                    <div>
                        <Accordion>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon/>}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                <Typography variant="subtitle1" color="secondary" gutterBottom>
                                    {p['name']}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>

                                <Typography variant="body2" gutterBottom>
                                    Coordinates: {
                                    p['lat'] +
                                    ' , ' +
                                    p['lng']
                                }
                                    <br/><br/>
                                    {p['description']}
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    </div>
                ))}
                <CSVLink
                    data={places}
                    filename={route['id'] + '.csv'}
                >
                    Download CSV
                </CSVLink>
            </div>
        </Paper>
    )
}

export default Route
