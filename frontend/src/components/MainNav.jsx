import React from "react";
import ChatPage from "./ChatPage";
import Login from "./Login";
import Signup from "./Signup";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

export default function MainNav(props) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  function logout() {
    localStorage.removeItem("token");
    dispatch({ type: "LOGOUT_USER" });
    // props.history.push("/");
  }

  return (
    <div id="mainWrapper">
      <Router>
        {user && (
          <div className="App-header d-flex">
            <h3 className="p-1">
              <i>SwipeUp</i>
            </h3>
            <div
              className="flex-grow1 w-100 text-right px-2 py-1"
              style={{ fontSize: "x-large" }}
            ></div>
            <span
              className="peopleList active btn btn-outline-primary m-auto"
              name="Friend List"
            >
              <i className="fa fa-list" aria-hidden="true"></i>
            </span>
            &nbsp;
            <span
              className="addFrined btn btn-outline-success m-auto"
              name="Add Friend"
            >
              <i className="fa fa-user-plus" aria-hidden="true"></i>
            </span>
            &nbsp;
            <span
              className="profilebtn btn btn-outline-info m-auto"
              name="Settings"
            >
              <i className="fa fa-cog" aria-hidden="true"></i>
            </span>
            &nbsp;
            <div className="iconInfo text-dark profileText border border-grey py-2 px-3 d-none"></div>
            {/* <span className="btn btn-outline-light m-auto"><i className="fa fa-moon" ></i></span>&nbsp; */}
            <NavLink
              className="text-white font-weight-bold m-auto"
              onClick={logout}
              style={{ textDecoration: "none" }}
              to="/login"
            >
              <span className="btn btn-outline-danger" name="Logout">
                <i className="fa fa-sign-out" aria-hidden="true"></i>
              </span>
            </NavLink>
          </div>
        )}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<ChatPage />} />
        </Routes>
      </Router>
    </div>
  );
}
