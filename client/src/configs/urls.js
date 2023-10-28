const baseURL = process.env.REACT_APP_API_URL;

const api = '/api';

const endPoints = {
    api: {
        auth: `${baseURL}${api}/auth`,
    }
}

export {
    baseURL,
    endPoints,
}