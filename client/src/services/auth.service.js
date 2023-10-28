import {axiosService} from "./axios.service";
import {endPoints} from "../configs/urls";

const authService = {
    login: async (data) => {
        try {
            const res = await axiosService.post(endPoints.api.auth, data);
            localStorage.setItem("token", res.data);
            window.location = "/";
        } catch (error) {
            console.log(error)
            if (
                error.response &&
                error.response.status >= 400 &&
                error.response.status <= 500
            ) {
                throw new Error(error.response.data.message);
            }
        }
    },
}

export {
    authService,
}