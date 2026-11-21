import axios from "axios";


const apiURl = 'http://localhost:3000'

const instance = axios.create({
    baseURL: apiURl
})

export default instance
