import axios from "axios";

const urlEnv = process.env.apiUrl;

var PublicacionesAdmin = axios.create({
    baseURL: urlEnv,
    // withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

export default PublicacionesAdmin;
