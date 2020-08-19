import React from "react";

import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Map from "./Map"

function Route(props) {
    let route = props.route;
    let coordinates = route['places'].map(p => (
        {
            lat: p['location']['coordinates'][0],
            lng: p['location']['coordinates'][1]
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
                    Duration: {route['minutes']} minutes (>{Math.floor(route['minutes'] / 60)} hours)
                </Typography>
                <Map coordinates={coordinates} zoom={7}/>

                {route['places'].map(p => (

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
                                    p['location']['coordinates'][0] +
                                    ' , ' +
                                    p['location']['coordinates'][1]
                                }
                                    <br/><br/>
                                    {p['description']}
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    </div>
                ))}
            </div>
        </Paper>
    )
}

export default Route
