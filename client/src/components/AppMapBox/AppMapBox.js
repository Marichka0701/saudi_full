import React, {useEffect, useState, useRef} from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {useDispatch, useSelector} from 'react-redux';

import './AppMapBox.scss';
import './NavigationControl.scss';
import selectedWhiteDrone from '../../constants/images/selected-white-drone.png';
import selectedBlackDrone from '../../constants/images/selected-black-drone.png';
import ShowFilter from '../ShowFilter/ShowFilter';
import {addSensorToMap} from "../../assets/addSensorToMap";
import {addWhiteDroneToMap} from "../../assets/addWhiteDroneToMap";
import {addBlackDroneToMap} from "../../assets/addBlackDroneToMap";

const AppMapBox = ({selectedOption}) => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedSensor, setSelectedSensor] = useState({});
    const [whiteDronesChecked, setWhiteDronesChecked] = useState(true);
    const [blackDronesChecked, setBlackDronesChecked] = useState(true);
    const [radarsChecked, setRadarsChecked] = useState(true);
    const mapRef = useRef(null);

    const [radarsLoaded, setRadarsLoaded] = useState(false);

    const dispatch = useDispatch();
    const {selectedDroneId, selectedDroneType} = useSelector(state => state.dronesHistory);

    useEffect(() => {
        if (mapRef.current && selectedDroneId && selectedDroneType) {
            const layers = mapRef.current.getStyle().layers;
            layers.forEach((layer) => {
                if (layer.id.endsWith('_circle')) {
                    mapRef.current.removeLayer(layer.id);
                }
            });

            let droneImageName;
            droneImageName = selectedDroneType === 'white' ? `white_drone_${selectedDroneId}` : `black_drone_${selectedDroneId}`;

            mapRef.current.loadImage(selectedDroneType === 'white' ? selectedWhiteDrone : selectedBlackDrone, (error, image) => {
                if (error)
                    throw error;

                mapRef.current.addImage(droneImageName, image);
                mapRef.current.addLayer({
                    'id': selectedDroneId + '_circle',
                    'source': selectedDroneId,
                    'type': 'symbol',
                    'layout': {
                        'icon-image': droneImageName,
                        'icon-size': 0.5,
                    },
                });
            });
        }
    }, [selectedDroneId, selectedDroneType]);

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

        addSensorToMap(map, radarsLoaded, radarsChecked, setModalIsOpen, setSelectedSensor, setRadarsLoaded);

        addWhiteDroneToMap(map, dispatch);
        addBlackDroneToMap(map, dispatch);
    }, []);

    useEffect(() => {
        const map = mapRef.current;

        addSensorToMap(map, radarsLoaded, radarsChecked, setModalIsOpen, setSelectedSensor, setRadarsLoaded);
    }, [radarsChecked])

    useEffect(() => {
        if (!!mapRef.current && whiteDronesChecked) {
            setTimeout(() => {
                const map = mapRef.current;
                const droneLayers = map.getStyle().layers.filter(layer => layer.id.startsWith('white_drone_'));
                for (const layer of droneLayers) {
                    map.setLayoutProperty(layer.id, 'visibility', 'visible');
                }
            }, 200)
        } else {
            const map = mapRef.current;
            const droneLayers = map.getStyle().layers.filter(layer => layer.id.startsWith('white_drone_'));
            for (const layer of droneLayers) {
                map.setLayoutProperty(layer.id, 'visibility', 'none');
            }
        }

        if (!!mapRef.current && blackDronesChecked) {
            setTimeout(() => {
                const map = mapRef.current;
                const droneLayers = map.getStyle().layers.filter(layer => layer.id.startsWith('black_drone_'));
                for (const layer of droneLayers) {
                    map.setLayoutProperty(layer.id, 'visibility', 'visible');
                }
            }, 200)
        } else {
            const map = mapRef.current;
            const droneLayers = map.getStyle().layers.filter(layer => layer.id.startsWith('black_drone_'));
            for (const layer of droneLayers) {
                map.setLayoutProperty(layer.id, 'visibility', 'none');
            }
        }
    }, [mapRef.current, whiteDronesChecked, blackDronesChecked]);

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

export default React.memo(AppMapBox);
