import React, {useEffect, useState} from 'react';

import styles from './DroneInfo.module.scss';
import whiteDroneInfo from '../../constants/images/white-drone-info.svg';
import blackDroneInfo from '../../constants/images/black-drone-info.svg';
import {useDispatch, useSelector} from "react-redux";
import {dronesHistoryActions} from "../../store/slices/dronesHistorySlice";

const DroneInfo = ({drone, type}) => {
    const {selectedDroneId} = useSelector(state => state.dronesHistory);

    const dispatch = useDispatch();

    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        if (drone?.placementTime) {
            const startTime = new Date(drone.placementTime).getTime();

            if (!isNaN(startTime)) {
                const intervalId = setInterval(() => {
                    const currentTime = new Date().getTime();
                    const timeDifference = currentTime - startTime;
                    setElapsedTime(Math.floor(timeDifference / 1000));
                }, 1000);

                return () => {
                    clearInterval(intervalId);
                };
            }
        }
    }, [drone]);

    const formatElapsedTime = (elapsedTime) => {
        let seconds = Math.floor(elapsedTime % 60);
        let minutes = Math.floor((elapsedTime / 60) % 60);
        let hours = Math.floor(elapsedTime / 3600);

        return `${hours > 0 ? hours + 'h ' : ''}${minutes > 0 ? minutes + 'm ' : ''}${seconds}s`;
    };

    return (
        <div
            onClick={() => {
                    dispatch(dronesHistoryActions.setSelectedDroneId(drone?.droneId));
                    dispatch(dronesHistoryActions.setSelectedDroneType(type));
            }}
            className={`${styles.droneInfo} ${selectedDroneId === drone?.droneId ? styles.active : ''}`}
        >
            <div className={styles.droneInfo_titleContainer}>
                <img src={type === 'white' ? whiteDroneInfo : blackDroneInfo} alt="drone icon"/>
                <div className={styles.droneInfo_titleContainer_title}>
                    <h3>{drone?.droneId}</h3>
                    <p>{type === 'white' ? 'Mavic JS' : 'Unknown'}</p>
                </div>
            </div>

            <div className={styles.droneInfo_info}>
                <div className={styles.droneInfo_info_session}>
                    <p className={styles.subtitle}>Session:</p>
                    <p className={styles.info}>{formatElapsedTime(elapsedTime)}</p>
                </div>

                <div className={styles.droneInfo_info_onlineFrom}>
                    <p className={styles.subtitle}>Online from:</p>
                    <p className={styles.info}>{new Date(drone?.placementTime).toLocaleTimeString()}</p>
                </div>

                <div className={styles.droneInfo_info_startedGps}>
                    <p className={styles.subtitle}>Started GPS:</p>
                    {
                        drone.startPosition &&
                        <p className={styles.info}>{drone?.startPosition[0]?.toFixed(6)}, {drone?.startPosition[1]?.toFixed(6)}</p>
                    }
                </div>
            </div>
        </div>
    );
};

export default DroneInfo;