import React, {useEffect, useState} from 'react';

import styles from "../ModalSensor/ModalSensor.module.scss";

const DroneInfoModal = ({droneId, whiteDrones}) => {
    const [drone, setDrone] = useState(null);

    useEffect(() => {
        setDrone(whiteDrones.find(drone => drone.droneId === droneId));
    }, [droneId]);

    console.log('hello from ');

    return(
        <div className={styles.droneInfoModal}>
            <div>
                <h3>Mavic JS</h3>
                <p>{drone?.droneId}</p>
            </div>
        </div>
    );
}

export default DroneInfoModal;