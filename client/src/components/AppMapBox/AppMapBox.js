import React, {useEffect, useState, useRef} from 'react';
import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './AppMapBox.scss';
import './NavigationControl.scss';
import {geoJson} from '../../constants/coordinatesSensor';
import ModalSensor from '../ModalSensor/ModalSensor';
import sensor from '../../constants/images/sensor.png';
import {useDispatch, useSelector} from 'react-redux';
import {dronesHistoryActions} from '../../store/slices/dronesHistorySlice';
import whiteDrone from '../../constants/images/white-drone.png';
import blackDrone from '../../constants/images/black-drone.png';
import selectedWhiteDrone from '../../constants/images/selected-white-drone.png';
import selectedBlackDrone from '../../constants/images/selected-black-drone.png';
import ShowFilter from '../ShowFilter/ShowFilter';

const AppMapBox = ({selectedOption}) => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedSensor, setSelectedSensor] = useState({});
    const [whiteDronesChecked, setWhiteDronesChecked] = useState(true);
    const [blackDronesChecked, setBlackDronesChecked] = useState(true);
    const [radarsChecked, setRadarsChecked] = useState(true);
    const mapRef = useRef(null);

    const [radarsLoaded, setRadarsLoaded] = useState(false);

    const dispatch = useDispatch();

    useEffect(() => {
        mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

        if (!mapRef.current) {
            mapRef.current = new mapboxgl.Map({
                container: 'map',
                style: process.env.REACT_APP_MAPBOX_STYLE,
                center: [process.env.REACT_APP_SAUDI_LONGITUDE, process.env.REACT_APP_SAUDI_LATITUDE],
                zoom: 10.85,
            });
            mapRef.current.addControl(new mapboxgl.NavigationControl({showCompass: false}), 'bottom-right');
        }

        const map = mapRef.current;

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

                    ReactDOM.render(<ModalSensor selectedSensor={marker.properties.message}/>, popupContent);

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

        const AddWhiteDronesToMap = () => {
            const addDroneToMap = () => {
                const placementTime = new Date();

                const saudiLatitude = 24.57 + Math.random() * (24.51 - 24.57); 
                const saudiLongitude = 46.91 + Math.random() * (46.85 - 46.91); 

                const radius = Math.random() * 0.11;

                const pointAroundAstana = (angle) => {
                    const newLatitude = saudiLatitude + Math.cos(angle) * radius;
                    const newLongitude = saudiLongitude + Math.sin(angle) * radius;

                    return {
                        'type': 'Point',
                        'coordinates': [newLongitude, newLatitude]
                    };
                }

                const droneId = `white_drone_${Math.random().toString(36).substring(7)}`;

                mapRef.current.on('click', droneId, (e) => {
                    const layers = mapRef.current.getStyle().layers;
                    layers.forEach((layer) => {
                        if (layer.id.endsWith('_circle')) {
                            mapRef.current.removeLayer(layer.id);
                        }
                    });

                    const features = mapRef.current.queryRenderedFeatures(e.point, {layers: [droneId]});
                    if (!features.length) {
                        return;
                    }

                    dispatch(dronesHistoryActions.setSelectedDroneId(droneId));

                    const droneImageName = `white_drone_${droneId}`;
                    mapRef.current.loadImage(selectedWhiteDrone, (error, image) => {
                        if (error)
                            throw error;

                        mapRef.current.addImage(droneImageName, image);
                        mapRef.current.addLayer({
                            'id': droneId + '_circle',
                            'source': droneId,
                            'type': 'symbol',
                            'layout': {
                                'icon-image': droneImageName,
                                'icon-size': 0.5,
                            },
                        });
                    });

                });

                dispatch(dronesHistoryActions.setWhiteDrones({
                    type: 'white',
                    droneId,
                    startPosition: [saudiLongitude, saudiLatitude],
                    placementTime,
                }));

                mapRef.current.addSource(droneId, {
                    'type': 'geojson',
                    'data': pointAroundAstana(0)
                });

                mapRef.current.loadImage(whiteDrone, (error, image) => {
                    if (error)
                        throw error;

                    mapRef.current.addImage(droneId, image);
                    mapRef.current.addLayer({
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
                    mapRef.current.getSource(droneId)?.setData(pointAroundAstana(timestamp / 20000));

                    requestAnimationFrame(animateMarker);
                }

                animateMarker(0);

                const randomTimeout = Math.random() * (80000 - 40000) + 40000;
                setTimeout(() => {
                    const endTime = new Date();

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

                    mapRef.current.removeLayer(droneId + '_border');
                    mapRef.current.removeLayer(droneId);
                    mapRef.current.removeLayer(droneId + '_circle');
                    mapRef.current.removeSource(droneId);

                    addDroneToMap();
                }, randomTimeout);
            };

            mapRef.current.on('style.load', () => {
                addDroneToMap();

                setInterval(addDroneToMap, Math.random() * (40000 - 80000) + 80000);
            });
        };

        if (whiteDronesChecked && mapRef.current) {
            setTimeout(() => {
            const map = mapRef.current;
            const droneLayers = map.getStyle().layers.filter(layer => layer.id.startsWith('white_drone_'));
                for (const layer of droneLayers) {
                    map.setLayoutProperty(layer.id, 'visibility', 'visible');
                }
            }, 100)
        } else {
            const map = mapRef.current;
            const droneLayers = map.getStyle().layers.filter(layer => layer.id.startsWith('white_drone_'));
            for (const layer of droneLayers) {
                map.setLayoutProperty(layer.id, 'visibility', 'none');
            }
        }

        const AddBlackDronesToMap = () => {
            if (!blackDronesChecked) {
                return;
            }

            const addDroneToMap = () => {
                const placementTime = new Date();

                const saudiLatitude = 24.57 + Math.random() * (24.51 - 24.57);
                const saudiLongitude = 46.91 + Math.random() * (46.85 - 46.91);

                const radius = Math.random() * 0.11;

                const pointAroundAstana = (angle) => {
                    const newLatitude = saudiLatitude + Math.cos(angle) * radius;
                    const newLongitude = saudiLongitude + Math.sin(angle) * radius;

                    return {
                        'type': 'Point',
                        'coordinates': [newLongitude, newLatitude]
                    };
                }

                const droneId = `black_drone_${Math.random().toString(36).substring(7)}`;

                mapRef.current.on('click', droneId, (e) => {
                    const layers = mapRef.current.getStyle().layers;
                    layers.forEach((layer) => {
                        if (layer.id.endsWith('_circle')) {
                            mapRef.current.removeLayer(layer.id);
                        }
                    });

                    const features = mapRef.current.queryRenderedFeatures(e.point, {layers: [droneId]});
                    if (!features.length) {
                        return;
                    }

                    dispatch(dronesHistoryActions.setSelectedDroneId(droneId));

                    const droneImageName = `black_drone_${droneId}`;
                    mapRef.current.loadImage(selectedBlackDrone, (error, image) => {
                        if (error)
                            throw error;

                        mapRef.current.addImage(droneImageName, image);
                        mapRef.current.addLayer({
                            'id': droneId + '_circle',
                            'source': droneId,
                            'type': 'symbol',
                            'layout': {
                                'icon-image': droneImageName,
                                'icon-size': 0.5,
                            },
                        });
                    });

                });

                dispatch(dronesHistoryActions.setBlackDrones({
                    type: 'black',
                    droneId,
                    startPosition: [saudiLongitude, saudiLatitude],
                    placementTime,
                }));

                mapRef.current.addSource(droneId, {
                    'type': 'geojson',
                    'data': pointAroundAstana(0)
                });

                mapRef.current.loadImage(blackDrone, (error, image) => {
                    if (error)
                        throw error;

                    mapRef.current.addImage(droneId, image);
                    mapRef.current.addLayer({
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
                    mapRef.current.getSource(droneId)?.setData(pointAroundAstana(timestamp / 20000));

                    requestAnimationFrame(animateMarker);
                }

                animateMarker(0);

                const randomTimeout = Math.random() * (80000 - 40000) + 40000;
                setTimeout(() => {
                    const endTime = new Date();

                    dispatch(dronesHistoryActions.removeBlackDrones(droneId));
                    dispatch(dronesHistoryActions.setPastDrones({
                        type: 'black',
                        droneId,
                        startPosition: [saudiLongitude, saudiLatitude],
                        placementTime,
                        droneName: 'Mavic JS',
                        maxHeight: Math.floor(300 + Math.random() * (700 - 300)),
                        minHeight: Math.floor(100 + Math.random() * (400 - 100)),
                        endTime,
                    }));

                    mapRef.current.removeLayer(droneId + '_border');
                    mapRef.current.removeLayer(droneId);
                    mapRef.current.removeLayer(droneId + '_circle');
                    mapRef.current.removeSource(droneId);

                    addDroneToMap();
                }, randomTimeout);
            };

            mapRef.current.on('style.load', () => {
                addDroneToMap();

                setInterval(addDroneToMap, Math.random() * (40000 - 80000) + 80000);
            });
        };

        if (blackDronesChecked && mapRef.current) {
            setTimeout(() => {
                const map = mapRef.current;
                const droneLayers = map.getStyle().layers.filter(layer => layer.id.startsWith('black_drone_'));
                for (const layer of droneLayers) {
                    map.setLayoutProperty(layer.id, 'visibility', 'visible');
                }
            }, 100)
        } else {
            const map = mapRef.current;
            const droneLayers = map.getStyle().layers.filter(layer => layer.id.startsWith('black_drone_'));
            for (const layer of droneLayers) {
                map.setLayoutProperty(layer.id, 'visibility', 'none');
            }
        }

        AddWhiteDronesToMap();
        AddBlackDronesToMap();
    }, [blackDronesChecked, whiteDronesChecked, radarsChecked]);

    return (
        <>
            <div style={{opacity: selectedOption === 'menu' ? '0' : '1'}} className={'appMap'} id={'map'}>
                <ShowFilter
                    blackDronesChecked={blackDronesChecked}
                    whiteDronesChecked={whiteDronesChecked}
                    radarsChecked={radarsChecked}
                    setBlackDronesChecked={setBlackDronesChecked}
                    setWhiteDronesChecked={setWhiteDronesChecked}
                    setRadarsChecked={setRadarsChecked}
                />
            </div>
        </>
    );
};

export default AppMapBox;

