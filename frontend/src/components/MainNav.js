import React from 'react'
import ChatPage from './ChatPage'
import Login from './Login'
import Signup from './Signup'
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

export default function MainNav(props) {

  const dispatch = useDispatch();
  const user = useSelector(state => state.user)

  function logout() {
    localStorage.removeItem('token')
    dispatch({ type: "LOGOUT_USER" });
    // props.history.push("/");
  }

  return (<div id='mainWrapper'>
    <Router>
      {user && <div class='App-header d-flex'>
        <h3 className='p-1'><i>SwipeUp</i></h3>
        <div className='flex-grow1 w-100 text-right px-2 py-1' style={{ fontSize: 'x-large' }}></div>
        <span className="peopleList active btn btn-outline-primary m-auto" name="Friend List"><i class="fa fa-list" aria-hidden="true"></i></span>&nbsp;
        <span className="addFrined btn btn-outline-success m-auto" name="Add Friend"><i class="fa fa-user-plus" aria-hidden='true'></i></span>&nbsp;
        <span className="profilebtn btn btn-outline-info m-auto" name="Settings"><i class="fa fa-cog" aria-hidden="true"></i></span>&nbsp;
        <div className='iconInfo text-dark profileText border border-grey py-2 px-3 d-none'></div>
        {/* <span class="btn btn-outline-light m-auto"><i class="fa fa-moon" ></i></span>&nbsp; */}
        <NavLink className='text-white font-weight-bold m-auto' onClick={logout} style={{ textDecoration: 'none' }} to="/">
          <span className='btn btn-outline-danger' name="Logout"><i class="fa fa-sign-out" aria-hidden="true"></i></span>
        </NavLink>
      </div>}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/createAccount" element={<Signup />} />
        <Route path="/chats" element={<ChatPage />} />
      </Routes>
    </Router>
  </div>
  )
}
