import axios from 'axios';
import socket from '../utils/socket';

export function checkLogin(u) {
    return (dispatch) => {
        dispatch({ type: "LOADING_TRUE" });
        axios.post(`${process.env.REACT_APP_API_URL}/check-login`, u).then((res) => {
            dispatch({ type: "LOADING_FALSE" });
            // alert(JSON.stringify(res.data));
            if (res.data.status === "ok") {
                dispatch({ type: "LOGIN_USER", payload: { ...(res.data.data), ...(res.data.token), socket: socket } });
            } else {
                alert("credential are not correct");
            }
        });
    };
}

export function validateUser(t) {
    return (dispatch) => {
        dispatch({ type: "LOADING_TRUE" });
        axios.get(`${process.env.REACT_APP_API_URL}/validate`, { headers: { "Content-Type": "application/json", "Authorization": `bearer ${t}` } },).then((res) => {
            dispatch({ type: "LOADING_FALSE" });
            if (res.data.status === "ok") {
                dispatch({ type: "VALIDATE_USER", payload: { ...(res.data.data), token: t, socket: socket } });
            } else if (res.data === "token expired") {
                console.log(res.data);
            } else {
                alert("credential are not correct");
            }
        });
    };
}

export function updateDetails(uup, userState) {
    return (dispatch) => {
        dispatch({ type: "LOADING_TRUE" });
        axios.post(`${process.env.REACT_APP_API_URL}/update-user`, uup).then((res) => {
            dispatch({ type: "LOADING_FALSE" });
            if (res.data.status === "success") {
                userState.uname = uup.uname;
                userState.uusername = uup.uusername;
                dispatch({ type: "UPDATE_DETAILS", payload: { ...(userState) } });
            } else {
                alert("Error in update profile");
            }
        });
    };
}
