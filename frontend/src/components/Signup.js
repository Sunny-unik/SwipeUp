import React, { useState } from "react";
import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import axios from "axios";
import Login from "./Login";
import "./css/loginSignup.css";

export default function Signup() {
	const navigate = useNavigate();

	const [uname, setuname] = useState("");
	const [uemail, setuemail] = useState("");
	const [upassword, setupassword] = useState("");
	const [uusername, setuusername] = useState("");
	const [otp, setotp] = useState("");
	const [randomotp, setrandomotp] = useState("");

	function setValue(e) {
		e.target.name === "Uname" && setuname(e.target.value);
		e.target.name === "Uemail" && setuemail(e.target.value);
		e.target.name === "Upassword" && setupassword(e.target.value);
		e.target.name === "Uusername" && setuusername(e.target.value);
		e.target.name === "otp" && setotp(e.target.value);
	}

	function validate() {
		var isvalid = true;

		//*validate for Name
		if (uname === "" || uname === null) {
			isvalid = false;
			alert("please enter name");
			return false;
		}
		//*validate for email
		let emailregex =
			/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if (!emailregex.test(uemail)) {
			alert("Email is not valid");
			isvalid = false;
			return false;
		}
		//*validate for username
		if (uusername === "" || uusername === null || uusername == " ") {
			isvalid = false;
			alert("please enter username");
			return false;
		}
		// let userregex = /^[a-z0-9_\.]+$/;
		// if (!userregex.test(uusername)) {
		// 	alert("Usernames can only have: Lowercase Letters (a-z), Numbers (0-9), Dots (.), Underscores (_)");
		// 	isvalid = false;
		// }
		//*validate for password
		let passregex =
			/(?=(.*[0-9]))(?=.*[\!@#$%^&*()\\[\]{}\-_+=~`|:;"'<>,./?])(?=.*[a-z])(?=(.*[A-Z]))(?=(.*)).{8,}/;
		if (!passregex.test(upassword)) {
			alert(
				"Password should have 1 lowercase letter, 1 uppercase letter, 1 number, 1 special character and be at least 8 characters long"
			);
			isvalid = false;
			return false;
		}
		if (isvalid === true) {
			axios.post(`${process.env.REACT_APP_API_URL}/valid-username`, { uusername }).then((res) => {
				if (res.data.status === "ok") {
					axios.post(`${process.env.REACT_APP_API_URL}/valid-email`, { uemail }).then((res) => {
						if (res.data.status === "ok") {
							let random = Math.floor(Math.random() * 1000000 + 1);
							setrandomotp(random);
							axios
								.post(`${process.env.REACT_APP_API_URL}/send-user-otp`, { uemail, otp: random })
								.then((res) => {
									if (res.data.status === "ok") {
										alert("OTP sent to your mail id. Check your mail");
										document.getElementById("login").style.display = "none";
										document.getElementById("createotp").style.display = "block";
									}
								});
						} else {
							alert("Account already created with this email id");
							return false;
						}
					});
				} else {
					alert("This username already taken :(");
					return false;
				}
			});
		}
	}

	function otpcheck() {
		if (otp === randomotp.toString()) {
			let s = { uname, uemail, uusername, upassword };
			axios.post(`${process.env.REACT_APP_API_URL}/create-account`, s).then((res) => {
				if (res.data.status === "OK") {
					navigate("/");
				}
			});
		} else {
			alert("Incorrect otp ");
			setotp("");
		}
	}

	function goback() {
		document.getElementById("login").style.display = "block";
		document.getElementById("createotp").style.display = "none";
	}

	return (<main>
		<div className="layout">
			{/* <!-- Start of Sign Up --> */ }
			<div className="main order-md-2">
				<div className="start">
					<div className="container">
						<div className="col-md-12">
							<div className="content">
								<h1>Create Account</h1>
								<form className="signup" id="login">
									<p>by use your email for registration</p>
									<div className="form-parent">
										<div className="form-group mx-0">
											<button className="btn icon" type="button">
												<i className="fa fa-user"></i>
											</button>
											<input className="form-control" name="Uname" value={ uname } onChange={ (e) => { setValue(e); } }
												type="text" placeholder="Name" />
										</div>
										<div className="form-group mx-0">
											<button className="btn icon" type="button">
												<i className="fa fa-envelope"></i>
											</button>
											<input className="form-control" name="Uemail" value={ uemail } onChange={ (e) => { setValue(e); } }
												type="email" placeholder="Email" />
										</div>
										<div className="form-group mx-0">
											<button className="btn icon" type="button">
												<i className="fa fa-vcard"></i>
											</button>
											<input className="form-control lowercase" name="Uusername" value={ uusername } onChange={ (e) => setValue(e) }
												type="text" placeholder="Username" />
										</div>
										<div className="form-group mx-0">
											<button className="btn icon" type="button">
												<i className="fa fa-key"></i>
											</button>
											<input className="form-control" name="Upassword" value={ upassword } onChange={ (e) => setValue(e) }
												type="password" placeholder="Password" />
										</div>
									</div>
									<div className="form-group">
										<button className="btn button" type="button" onClick={ validate }>Sign up</button>
									</div>
									<div className="callout">
										<span id="createact">
											Already have an account?
											<NavLink exact to="/" className="btn btn-primary w-100">Sign in</NavLink>
										</span>
									</div>
								</form>

								<div id="createotp">
									<h2 className="m-0 mb-4">Enter OTP for Verfication</h2>
									<form action="" className="form-parent">
										<div className="form-group">
											<button type="button" className="btn icon">
												<i className="fa fa-envelope"></i>
											</button>
											<input className="form-control" name="otp" value={ otp } onChange={ (e) => setValue(e) }
												type="text" placeholder="Enter OTP " />
										</div>
										<div className="form-group">
											<button style={ { width: "42%" } } className="d-inline=block mr-3 btn button" type="button"
												onClick={ goback } >Edit-details</button>
											<button style={ { width: "42%" } } className="d-inline=block ml-3 btn button" type="button"
												onClick={ otpcheck }>Submit</button>
										</div>
									</form>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			{/* <!-- End of Sign Up -->
			<!-- Start of Sidebar --> */}
			<div className="aside order-md-1">
				<div className="container">
					<div className="col-md-12">
						<div className="preference">
							<h2>Welcome Back!</h2>
							<p>To keep connected with your friends please login with your personal info.</p>
							<NavLink exact to="/"><button className="btn button" type="button">Sign in</button></NavLink>
						</div>
					</div>
				</div>
			</div>

			{/* <!-- End of Sidebar --> */ }
		</div>
		<Routes>
			<Route path="/" exact component={ Login } />
		</Routes>
		{/* <!-- Layout --> */ }
	</main>);
}
