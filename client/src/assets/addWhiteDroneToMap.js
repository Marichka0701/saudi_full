import selectedWhiteDrone from "../constants/images/selected-white-drone.png";
import {dronesHistoryActions} from "../store/slices/dronesHistorySlice";
import whiteDrone from "../constants/images/white-drone.png";
import {createRoot} from "react-dom/client";
import ModalSensor from "../components/ModalSensor/ModalSensor";
import mapboxgl from "mapbox-gl";
import React from "react";

export const addWhiteDroneToMap = (map, dispatch) => {
    const addDroneToMap = () => {
        const placementTime = new Date().toISOString();

        const saudiLatitude = 24.57 + Math.random() * (24.51 - 24.57);
        const saudiLongitude = 46.91 + Math.random() * (46.85 - 46.91);

        const radius = Math.random() * 0.11;

        const pointAroundAbuDabi = (angle) => {
            const newLatitude = saudiLatitude + Math.cos(angle) * radius;
            const newLongitude = saudiLongitude + Math.sin(angle) * radius;

            return {
                'type': 'Point',
                'coordinates': [newLongitude, newLatitude]
            };
        }

        const droneId = `white_drone_${Math.random().toString(36).substring(7)}`;

        map.on('click', droneId, (e) => {
            const layers = map.getStyle().layers;
            layers.forEach((layer) => {
                if (layer.id.endsWith('_circle')) {
                    map.removeLayer(layer.id);
                }
            });

            const features = map.queryRenderedFeatures(e.point, {layers: [droneId]});
            if (!features.length) {
                return;
            }

            const droneImageName = `white_drone_${Math.random()}`;
            map.loadImage(selectedWhiteDrone, (error, image) => {
                if (error)
                    throw error;

                map.addImage(droneImageName, image);
                map.addLayer({
                    'id': droneId + '_circle',
                    'source': droneId,
                    'type': 'symbol',
                    'layout': {
                        'icon-image': droneImageName,
                        'icon-size': 0.5,
                    },
                });
            });

            const popupContent = document.createElement('div');

            const root = createRoot(popupContent);
            root.render(
                <div className={'modal'}>
                    <h3 className={'modal-title'}>Mavic JS</h3>
                    <p className={'modal-drone-id'}>{droneId}</p>
                    <div className={'modal-content'}>
                        <div className={'modal-content-left'}>
                            <p className={'modal-description'}>Yaw angel - <span>{(Math.random() * 360).toFixed(1)}°</span></p>
                            <p className={'modal-description'}>Velocity - <span>{(Math.random() * 20).toFixed(1)}m/s</span></p>
                            <p className={'modal-description'}>Frequency - <span>{(Math.random() * 5).toFixed(1)}GHz</span></p>
                        </div>
                        <div className={'modal-content-right'}>
                            <p className={'modal-description'}>Height - <span>{((Math.random() * (500 - 100 + 1)) + 100).toFixed(1)}m</span></p>
                            <p className={'modal-description'}>Distance - <span>{(Math.random() * 600).toFixed(1)}m</span></p>
                            <p className={'modal-description'}>Arrival <span>--</span></p>
                        </div>
                    </div>
                </div>);

            const popup = new mapboxgl.Popup({offset: 25})
                .setDOMContent(popupContent)
                .setLngLat(features[0].geometry.coordinates)
                .addTo(map)

            dispatch(dronesHistoryActions.setSelectedDroneId(droneId));
        });

        dispatch(dronesHistoryActions.setWhiteDrones({
            type: 'white',
            droneId,
            startPosition: [saudiLongitude, saudiLatitude],
            placementTime,
        }));

        map.addSource(droneId, {
            'type': 'geojson',
            'data': pointAroundAbuDabi(0)
        });

        map.loadImage(whiteDrone, (error, image) => {
            if (error)
                throw error;

            map.addImage(droneId, image);
            map.addLayer({
                'id': droneId,
                'source': droneId,
                'type': 'symbol',
                'layout': {
                    'icon-image': droneId,
                    'icon-size': 0.5,
                },
            });
        });

        const animateMarker = (timestamp) => {
            map.getSource(droneId)?.setData(pointAroundAbuDabi(timestamp / 20000));

            requestAnimationFrame(animateMarker);
        }

        animateMarker(0);

        const randomTimeout = Math.random() * (120000 - 80000) + 80000;
        setTimeout(() => {
            const endTime = new Date().toISOString();

            dispatch(dronesHistoryActions.removeWhiteDrones(droneId));
            dispatch(dronesHistoryActions.setPastDrones({
                type: 'white',
                droneId,
                startPosition: [saudiLongitude, saudiLatitude],
                placementTime,
                droneName: 'Mavic JS',
                maxHeight: Math.floor(300 + Math.random() * (700 - 300)),
                minHeight: Math.floor(100 + Math.random() * (400 - 100)),
                endTime,
            }));

            if (map.getLayer(droneId + '_border')) {
                map.removeLayer(droneId + '_border');
            }

            if (map.getLayer(droneId)) {
                map.removeLayer(droneId);
            }

            if (map.getLayer(droneId + '_circle')) {
                map.removeLayer(droneId + '_circle');
            }

            if (map.getSource(droneId)) {
                map.removeSource(droneId);
            }

            addDroneToMap();
        }, randomTimeout);
    };

    map.on('style.load', () => {
        for (let i = 0; i < 4; i++) {
            addDroneToMap();
        }
    });
};