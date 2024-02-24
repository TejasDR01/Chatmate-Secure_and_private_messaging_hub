import axios from "axios";

const API = axios.create({ baseURL:"https://chatmate-secure-and-private-messaging-hub.vercel.app/" });

API.interceptors.request.use((req) => {
    const localdata = localStorage.getItem("profile");
    if(localdata){
        req.headers.authorization = `Bearer ${JSON.parse(localdata).token}`;
    }
    return req;
});

export const getChats = () => API.get("/chats");
export const Signin = (data) => API.post("/signin", data);
export const Signup = (data) => API.post("/signup", data);
