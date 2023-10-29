import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    pastDrones: [],
    dronesHistory: [],
    whiteDrones: [],
    blackDrones: [],
    selectedDroneId: null,
    selectedDroneType: null,
}

const dronesHistorySlice = createSlice({
    name: 'dronesHistorySlice',
    initialState,
    reducers: {
        setWhiteDrones: (state, action) => {
            state.whiteDrones.push(action.payload);
        },
        removeWhiteDrones: (state, action) => {
            state.whiteDrones = state.whiteDrones.filter((drone) => drone.droneId !== action.payload);
        },

        setBlackDrones: (state, action) => {
            state.blackDrones.push(action.payload);
        },
        removeBlackDrones: (state, action) => {
            state.blackDrones = state.blackDrones.filter((drone) => drone.droneId !== action.payload);
        },

        setPastDrones: (state, action) => {
            if (state.pastDrones.length > 50) {
                state.pastDrones.shift();
            }
            state.pastDrones.push(action.payload);
        },
        addDroneToHistory: (state, action) => {
            state.dronesHistory.push(action.payload);
        },

        setSelectedDroneId: (state, action) => {
            state.selectedDroneId = action.payload;
        },
        setSelectedDroneType: (state, action) => {
            state.selectedDroneType = action.payload;
        }
    },
});

const {actions, reducer: dronesHistoryReducer} = dronesHistorySlice;

const dronesHistoryActions = {
    ...actions,
}

export {
    dronesHistoryActions,
    dronesHistoryReducer,
}




