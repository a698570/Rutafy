import GoogleMapReact from "google-map-react";
import Marker from "./Marker";
import React from "react";

function Map({coordinates, zoom}) {
    return (
        <div style={{height: '50vh', width: '100%'}}>
            <GoogleMapReact
                center={coordinates[0]}
                zoom={zoom}>
                {coordinates.map(c => (
                    <Marker
                        lat={c.lat}
                        lng={c.lng}
                    />
                ))}

            </GoogleMapReact>
        </div>
    )
}

export default Map;
