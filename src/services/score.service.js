import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "http://localhost:5000/api/";

const getAllScores = () => {
    return axios.get(API_URL + "score", { headers: authHeader() });
}

const ScoreService = {
 getAllScores,
}

export default ScoreService;