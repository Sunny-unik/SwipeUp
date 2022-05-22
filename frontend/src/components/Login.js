import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom';
import { checkLogin, validateUser } from '../actions/userAction';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import './css/loginSignup.css'

export default function Login() {

    const [otp, setotp] = useState("")
    const [users, setUsers] = useState([]);
    const [password, setpassword] = useState("");
    const [email, setemail] = useState("");
    const [newpassword, setnewpassword] = useState("")
    const [confirmpassword, setconfirmpassword] = useState("")
    const [randomotp, setrandomotp] = useState("")

    const reduxUser = useSelector(state => state.user);
    const navigate = useNavigate()
    const dispatch = useDispatch();

    useEffect(() => {
        let localToken = localStorage.getItem("token")
        if (reduxUser) {
            navigate("/chats")
        } else if (!!localToken) {
            dispatch(validateUser(localToken));
        }
    }, [reduxUser]);

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/list-account`).then((res) => {
            setUsers(res.data.data)
        })
    }, [])

    function setValue(e) {
        e.target.name === "otplogin" && setotp(e.target.value)
        e.target.name === "password" && setpassword(e.target.value);
        e.target.name === "email" && setemail(e.target.value);
        e.target.name === "newpassword" && setnewpassword(e.target.value)
        e.target.name === "confirmpassword" && setconfirmpassword(e.target.value)
    }

    function Auth() {
        dispatch(checkLogin({ email, password }));
    }

    function forgottologin() {
        let Login = document.getElementById('login');
        Login.style.display = "block";
        let forgot = document.getElementById('forgotcredentials');
        forgot.style.display = "none";
    }

    function forgotpass() {
        if (email === '') {
            alert("first enter your email")
        } else {
            var random = Math.floor((Math.random() * 1000000) + 1);
            setrandomotp(random);
            axios.post(`${process.env.REACT_APP_API_URL}/send-otp-email`, { email, otp: random }).then((res) => {
                if (res.data.status === "ok") {
                    alert("otp sent to your email");
                    var forgotpass = document.getElementById('login');
                    forgotpass.style.display = "none";
                    var forgotpass2 = document.getElementById('forgotcredentials');
                    forgotpass2.style.display = "block";
                }
                else {
                    alert("this email or username are not registered");
                }
            })
        }
    }
    function otppassword() {
        // let s = { otp }
        console.log(otp, randomotp.toString());
        if (otp === randomotp.toString()) {
            alert("you have to create new password")
            let logotp = document.getElementById('forgotcredentials');
            logotp.style.display = "none";
            let logotp2 = document.getElementById('loginpass');
            logotp2.style.display = "block"
        } else {
            alert("! incorrect otp ");
            let logotp = document.getElementById('forgotcredentials');
            logotp.style.display = "none";
            let logotp2 = document.getElementById('login');
            logotp2.style.display = "block"
        }
    }
    function otplogin() {
        if (newpassword === confirmpassword && confirmpassword != '' && confirmpassword.length >= 8 && confirmpassword.length <= 16) {
            axios.post(`${process.env.REACT_APP_API_URL}/update-password`, { email, newpassword }).then((res) => {
                alert(res.data.data)
            })
            let changepass = document.getElementById('loginpass');
            changepass.style.display = "none";
            let login = document.getElementById('login');
            login.style.display = "block"
            // props.history.push("/");
        }
        else { alert("check your confirm password it's length must between 8to16 letters and should same in both textbox") }
    }
    function cancellog() {
        let changepass = document.getElementById('loginpass');
        changepass.style.display = "none";
        let login = document.getElementById('login');
        login.style.display = "block";
    }

    return (<main>
        <div class="layout">
            {/* <!-- Start of Sign In --> */}
            <div class="main order-md-1">
                <div class="start">
                    <div class="container">
                        <div class="col-md-12">
                            {/* login page */}
                            <div class="content" id='login'>
                                <h1>Sign in to SwipeUp</h1>
                                <form method='' action=''>
                                    <p>by using your credentials</p>
                                    <div class="form-group">
                                        <input onChange={(e) => { setValue(e); }} name='email' value={email} type="text"
                                            id="inputUsername" className="form-control" placeholder="Enter Email Address or Username" required />
                                        <button class="btn icon"><i class="fa fa-vcard"></i></button>
                                    </div>
                                    <div class="form-group">
                                        <input name="password" value={password} onChange={(e) => { setValue(e); }} type="password"
                                            id="inputPassword" class="form-control" placeholder="Enter Password" required />
                                        <button class="btn icon"><i class="fa fa-lock"></i></button>
                                    </div>
                                    <button class="btn button" type='button' onClick={Auth}>Sign In</button><br /><br />
                                    <span id='forgotlink' class="text-primary" onClick={forgotpass} style={{ cursor: 'pointer' }}> Forgot Password ?</span><br /><br />
                                    <div class="callout">
                                        <span>Don't have account? <NavLink to="/createAccount" className="text-primary">Create Account</NavLink></span>
                                    </div>
                                </form>
                            </div>
                            <div className='content' id="forgotcredentials">
                                <h1>Forgot Credentials</h1>
                                <form action="">
                                    <div class="form-group">
                                        <input name="otplogin" className="form-control" value={otp} onChange={(e) => { setValue(e); }} type='number' placeholder="Enter otp sent to your mail address" /> <br /><br />
                                        <button className='btn icon'><i class="fa fa-key"></i></button>
                                    </div>
                                    <button class="text-primary btn btn-link" type='reset' onClick={forgottologin}> Back to Signin </button><br /><br />
                                    <button className='btn button' onClick={otppassword} type="reset" > Submit </button>
                                </form>
                            </div>
                            {/* set password page */}
                            <div data-aos="flip-left" data-aos-once='true' data-aos-duration="1000" class="col-md-5 col-lg-4" id="loginpass" className='text-center content'>
                                <form action='' className='my-0'>
                                    <h1>Recreate Password</h1>
                                    <p>Please fill new password for login your account.</p>
                                    <div class="form-group">
                                        <input class="form-control m-2" type="password" value={newpassword} onChange={(e) => { setValue(e); }} placeholder="new password" name="newpassword" id="newpassword" required />
                                    </div>
                                    <div class="form-group">
                                        <input class="form-control m-2" type="password" value={confirmpassword} onChange={(e) => { setValue(e); }} placeholder="confirm password" name="confirmpassword" id="confirmpassword" required />
                                    </div>
                                    <button type='button' className='btn button p-2 m-2 d-inline-block ' onClick={cancellog}> Cancel </button>
                                    <button type="button" class="submitnpass btn button p-2 m-2 d-inline-block" onClick={otplogin}> Submit </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* <!-- End of Sign In -->
            <!-- Start of Sidebar --> */}
            <div class="aside order-md-2">
                <div class="container">
                    <div class="col-md-12">
                        <div class="preference">
                            <h2>Hello, Friend!</h2>
                            <p>Enter your personal details and start your journey with SwipeUp today.</p>
                            <NavLink className='btn button' to="/createAccount">Sign up</NavLink>
                        </div>
                    </div>
                </div>
            </div>
            {/* <!-- End of Sidebar --> */}
        </div>
        {/* <!-- Layout --> */}
    </main>
    )
}
