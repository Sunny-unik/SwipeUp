import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { checkLogin, validateUser } from "../actions/userAction";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import "./css/loginSignup.css";

export default function Login() {
  const [otp, setotp] = useState("");
  const [password, setpassword] = useState("");
  const [email, setemail] = useState("");
  const [newpassword, setnewpassword] = useState("");
  const [confirmpassword, setconfirmpassword] = useState("");
  const [randomotp, setrandomotp] = useState("");

  const reduxUser = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const Auth = () => dispatch(checkLogin({ email, password }));

  useEffect(() => {
    const localToken = localStorage.getItem("token");
    if (reduxUser) {
      navigate("/chats");
    } else if (!!localToken) {
      dispatch(validateUser(localToken));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduxUser]);

  function forgottologin() {
    let Login = document.getElementById("login");
    Login.style.display = "block";
    let forgot = document.getElementById("forgotcredentials");
    forgot.style.display = "none";
  }

  function forgotpass() {
    if (email === "") {
      alert("first enter your email");
    } else {
      var random = Math.floor(Math.random() * 1000000 + 1);
      setrandomotp(random);
      axios
        .post(`${process.env.REACT_APP_API_URL}/send-otp-email`, {
          email,
          otp: random
        })
        .then((res) => {
          if (res.data.status === "ok") {
            alert("otp sent to your email");
            var forgotpass = document.getElementById("login");
            forgotpass.style.display = "none";
            var forgotpass2 = document.getElementById("forgotcredentials");
            forgotpass2.style.display = "block";
          } else {
            alert("this email or username are not registered");
          }
        });
    }
  }
  function otppassword() {
    // let s = { otp }
    console.log(otp, randomotp.toString());
    if (otp === randomotp.toString()) {
      alert("you have to create new password");
      let logotp = document.getElementById("forgotcredentials");
      logotp.style.display = "none";
      let logotp2 = document.getElementById("loginpass");
      logotp2.style.display = "block";
    } else {
      alert("! incorrect otp ");
      let logotp = document.getElementById("forgotcredentials");
      logotp.style.display = "none";
      let logotp2 = document.getElementById("login");
      logotp2.style.display = "block";
    }
  }
  function otplogin() {
    if (
      newpassword === confirmpassword &&
      confirmpassword.trim().length >= 8 &&
      confirmpassword.trim().length <= 16
    ) {
      axios
        .post(`${process.env.REACT_APP_API_URL}/update-password`, {
          email,
          newpassword
        })
        .then((res) => {
          alert(res.data.data);
        });
      let changepass = document.getElementById("loginpass");
      changepass.style.display = "none";
      let login = document.getElementById("login");
      login.style.display = "block";
      // props.history.push("/");
    } else {
      alert(
        "check your confirm password it's length must between 8to16 letters and should same in both textbox"
      );
    }
  }
  function cancellog() {
    let changepass = document.getElementById("loginpass");
    changepass.style.display = "none";
    let login = document.getElementById("login");
    login.style.display = "block";
  }

  return (
    <main>
      <div className="layout">
        {/* <!-- Start of Sign In --> */}
        <div className="main order-md-1">
          <div className="start">
            <div className="container">
              <div className="col-md-12">
                {/* login page */}
                <div className="content" id="login">
                  <h1>Sign in to SwipeUp</h1>
                  <form>
                    <p>by using your credentials</p>
                    <div className="form-group">
                      <input
                        onChange={(e) => setemail(e.target.value)}
                        name="email"
                        value={email}
                        type="text"
                        id="inputUsername"
                        className="form-control"
                        placeholder="Enter Email Address or Username"
                        required
                      />
                      <button type="button" className="btn icon">
                        <i className="fa fa-vcard"></i>
                      </button>
                    </div>
                    <div className="form-group">
                      <input
                        name="password"
                        value={password}
                        onChange={(e) => setpassword(e.target.value)}
                        type="password"
                        id="inputPassword"
                        className="form-control"
                        placeholder="Enter Password"
                        required
                      />
                      <button type="button" className="btn icon">
                        <i className="fa fa-lock"></i>
                      </button>
                    </div>
                    <button className="btn button" type="button" onClick={Auth}>
                      Sign In
                    </button>
                    <br />
                    <br />
                    <span
                      id="forgotlink"
                      className="text-primary"
                      onClick={forgotpass}
                      style={{ cursor: "pointer" }}
                    >
                      {" "}
                      Forgot Password ?
                    </span>
                    <br />
                    <br />
                    <div className="callout">
                      <span>
                        Don't have account?{" "}
                        <NavLink to="/createAccount" className="text-primary">
                          Create Account
                        </NavLink>
                      </span>
                    </div>
                  </form>
                </div>
                <div className="content" id="forgotcredentials">
                  <h1>Forgot Credentials</h1>
                  <form action="">
                    <div className="form-group">
                      <input
                        name="otplogin"
                        className="form-control"
                        value={otp}
                        onChange={(e) => setotp(e.target.value)}
                        type="number"
                        placeholder="Enter otp sent to your mail address"
                      />{" "}
                      <br />
                      <br />
                      <button className="btn icon">
                        <i className="fa fa-key"></i>
                      </button>
                    </div>
                    <button
                      className="text-primary btn btn-link"
                      type="reset"
                      onClick={forgottologin}
                    >
                      {" "}
                      Back to Signin{" "}
                    </button>
                    <br />
                    <br />
                    <button
                      className="btn button"
                      onClick={otppassword}
                      type="reset"
                    >
                      {" "}
                      Submit{" "}
                    </button>
                  </form>
                </div>
                {/* set password page */}
                <div
                  data-aos="flip-left"
                  data-aos-once="true"
                  data-aos-duration="1000"
                  className="col-md-5 col-lg-4 text-center content"
                  id="loginpass"
                >
                  <form action="" className="my-0">
                    <h1>Recreate Password</h1>
                    <p>Please fill new password for login your account.</p>
                    <div className="form-group">
                      <input
                        className="form-control m-2"
                        type="password"
                        value={newpassword}
                        onChange={(e) => setnewpassword(e.target.value)}
                        placeholder="new password"
                        name="newpassword"
                        id="newpassword"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <input
                        className="form-control m-2"
                        type="password"
                        value={confirmpassword}
                        onChange={(e) => setconfirmpassword(e.target.value)}
                        placeholder="confirm password"
                        name="confirmpassword"
                        id="confirmpassword"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      className="btn button p-2 m-2 d-inline-block "
                      onClick={cancellog}
                    >
                      {" "}
                      Cancel{" "}
                    </button>
                    <button
                      type="button"
                      className="submitnpass btn button p-2 m-2 d-inline-block"
                      onClick={otplogin}
                    >
                      {" "}
                      Submit{" "}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* <!-- End of Sign In -->
            <!-- Start of Sidebar --> */}
        <div className="aside order-md-2">
          <div className="container">
            <div className="col-md-12">
              <div className="preference">
                <h2>Hello, Friend!</h2>
                <p>
                  Enter your personal details and start your journey with
                  SwipeUp today.
                </p>
                <NavLink className="btn button" to="/createAccount">
                  Sign up
                </NavLink>
              </div>
            </div>
          </div>
        </div>
        {/* <!-- End of Sidebar --> */}
      </div>
      {/* <!-- Layout --> */}
    </main>
  );
}
