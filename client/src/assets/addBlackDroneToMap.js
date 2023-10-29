import {dronesHistoryActions} from "../store/slices/dronesHistorySlice";
import selectedBlackDrone from "../constants/images/selected-black-drone.png";
import blackDrone from "../constants/images/black-drone.png";

export const addBlackDroneToMap = (map, dispatch) => {
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

        const droneId = `black_drone_${Math.random().toString(36).substring(7)}`;

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

            dispatch(dronesHistoryActions.setSelectedDroneId(droneId));

            const droneImageName = `black_drone_${Math.random()}`;
            map.loadImage(selectedBlackDrone, (error, image) => {
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

        });

        dispatch(dronesHistoryActions.setBlackDrones({
            type: 'black',
            droneId,
            startPosition: [saudiLongitude, saudiLatitude],
            placementTime,
        }));

        map.addSource(droneId, {
            'type': 'geojson',
            'data': pointAroundAbuDabi(0)
        });

        map.loadImage(blackDrone, (error, image) => {
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
        for (let i = 0; i < 3; i++) {
            addDroneToMap();
        }
    });
};
