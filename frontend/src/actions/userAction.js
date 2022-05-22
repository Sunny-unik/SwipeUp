import axios from 'axios';
import socket from '../utils/socket';

export function checkLogin(u) {
    return (dispatch) => {
        dispatch({ type: "LOADING_TRUE" });
        axios.post(`${process.env.REACT_APP_API_URL}/check-login`, u).then((res) => {
            dispatch({ type: "LOADING_FALSE" })
            // alert(JSON.stringify(res.data));
            if (res.data.status === "ok") {
                dispatch({ type: "LOGIN_USER", payload: { ...(res.data.data), ...(res.data.token) ,socket: socket } });
            } else {
                alert("credential are not correct");
            }
        })
    }
}

export function validateUser(t) {
    return (dispatch) => {
        dispatch({ type: "LOADING_TRUE" });
        axios.get(`${process.env.REACT_APP_API_URL}/validate`, {headers: {"Content-Type": "application/json","Authorization": `bearer ${t}`}},).then((res) => {
            dispatch({ type: "LOADING_FALSE" })
            if (res.data.status === "ok") { 
                dispatch({ type: "VALIDATE_USER", payload: { ...(res.data.data), token: t, socket: socket } });
            } else {
                alert("credential are not correct");
            }
        })
    }
}

export function updateProfile(uup) {
    console.log(uup);
    return (dispatch) => {
        dispatch({ type: "LOADING_TRUE" });
        axios.post(`${process.env.REACT_APP_API_URL}/update-user`, uup).then((res) => {
            dispatch({ type: "LOADING_FALSE" })
            // alert(JSON.stringify(res.data));
            if (res.data.status === "ok") {
                // localStorage.setItem("chat-app-current-user", {username:uup.uname});
                dispatch({ type: "UPDATE_PROFILE", payload: { ...(res.data.data), updatedState: uup, socket: socket } });
            } else {
                alert("Error in update profile");
            }
        })
    }
}

// export const updateProfile = (user) => async (dispatch, getState) => {
    // try {
    //   dispatch({ type: USER_UPDATE_REQUEST });
  
    //   const {
    //     userLogin: { userInfo },
    //   } = getState();
  
    //   const config = {
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: `Bearer ${userInfo.token}`,
    //     },
    //   };
  
//       const { data } = await axios.post("/api/users/profile", user, config);
  
//       dispatch({ type: USER_UPDATE_SUCCESS, payload: data });
  
//       dispatch({ type: USER_LOGIN_SUCCESS, payload: data });
  
//       localStorage.setItem("userInfo", JSON.stringify(data));
//     } catch (error) {
//       dispatch({
//         type: USER_UPDATE_FAIL,
//         payload:
//           error.response && error.response.data.message
//             ? error.response.data.message
//             : error.message,
//       });
//     }
//   };  