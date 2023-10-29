import React, {useEffect, useState} from 'react';

import styles from './HistoryItem.module.scss';
import whiteDrone from '../../../constants/images/white-drone-info.svg'
import blackDrone from '../../../constants/images/black-drone-info.svg'
import {getFlightDuration} from "../../../constants/getFlightDuration";
import DetailedDroneInfo from "../../DetailedDroneInfo/DetailedDroneInfo";

const HistoryItem = ({drone}) => {
    const [modalIsOpen, setModalIsOpen] = useState(false);

    return (
        <>
            <div
                onClick={() => setModalIsOpen(true)}
                className={styles.historyItem}
            >
                <div className={styles.historyItem_droneIcon}>
                    <img src={drone.type === 'white' ? whiteDrone : blackDrone} alt="drone icon"/>
                </div>

                <div className={styles.historyItem_info}>
                    <div className={styles.historyItem_info_left}>
                        <p>{`${new Date(drone?.placementTime).toLocaleDateString()}, ${new Date(drone?.placementTime).toLocaleTimeString()}`}</p>
                        <p>{drone?.droneId}</p>
                    </div>

                    <div className={styles.historyItem_info_right}>
                        <p>{getFlightDuration(drone?.placementTime, drone?.endTime)}</p>
                    </div>
                </div>
            </div>

            {modalIsOpen && <DetailedDroneInfo drone={drone} setModalIsOpen={setModalIsOpen}/>}
        </>
    );
};

export default HistoryItem;