import React from "react";
import mapboxgl from "mapbox-gl";
import {createRoot} from "react-dom/client";

import ModalSensor from "../components/ModalSensor/ModalSensor";
import {geoJson} from "../constants/coordinatesSensor";
import sensor from "../constants/images/sensor.svg";

export const addSensorToMap = (map, radarsLoaded, radarsChecked, setModalIsOpen, setSelectedSensor, setRadarsLoaded) => {
    const markers = geoJson.features;

    for (const marker of markers) {
        const el = document.createElement('div');
        el.style.backgroundImage = `url(${sensor})`;

        if (radarsChecked) {
            el.className = 'marker';

            if (!radarsLoaded) {
                el.addEventListener('mouseenter', () => {
                    setModalIsOpen(true);
                    setSelectedSensor(marker.properties.message);
                });

                el.addEventListener('mouseleave', () => {
                    setModalIsOpen(false);
                    setSelectedSensor(marker.properties.message);
                });

                const popupContent = document.createElement('div');

                const root = createRoot(popupContent);
                root.render(<ModalSensor selectedSensor={marker.properties.message}/>);

                const popup = new mapboxgl.Popup({offset: 25}).setDOMContent(popupContent);

                new mapboxgl.Marker(el)
                    .setLngLat(marker.geometry.coordinates)
                    .addTo(map)
                    .setPopup(popup);

                setRadarsLoaded(true);
            }
        }
    }

    const element = document.getElementsByClassName('marker');
    if (radarsLoaded) {
        for (const item of element) {
            if (!radarsChecked) {
                item.style.display = 'none';
            } else {
                item.style.display = 'block';
            }
        }
    }
}