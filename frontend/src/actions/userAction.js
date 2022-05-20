import axios from 'axios';
import socket from '../utils/socket';

export function checkLogin(u) {
    console.log(u);
    return (dispatch) => {
        dispatch({ type: "LOADING_TRUE" });

        axios.post("http://localhost:3001/check-login", u).then((res) => {
            dispatch({ type: "LOADING_FALSE" })
            // alert(JSON.stringify(res.data));
            if (res.data.status === "ok") {
                dispatch({ type: "LOGIN_USER", payload: { ...(res.data.data), socket: socket } });
            } else {
                alert("credential are not correct");
            }
        })
    }
}
