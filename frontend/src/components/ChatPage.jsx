/* eslint-disable eqeqeq */
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AOS from "aos";
import Picker from "emoji-picker-react";
import Loading from "./Loading";
import { updateDetails, validateUser } from "../actions/userAction";
import RegexHelper from "../helpers/RegexHelper";

export default function ChatPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  useEffect(() => {
    if (!user) {
      const localToken = localStorage.getItem("token");
      !localToken ? navigate("/login") : dispatch(validateUser(localToken));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  console.log(user);

  const userId = user?._id;
  const userName = user?.uname;
  const userUserName = user?.uusername;
  const userPassword = user?.upassword;
  const userEmail = user?.uemail;
  const userToken = user?.token;
  userToken && localStorage.setItem("token", userToken);
  const userSocket = user?.socket;
  let userImage = user?.profile;
  console.log(userSocket);

  const [uname, setuname] = useState(userName);
  const [uemail, setuemail] = useState(userEmail);
  const [oldpassword, setoldpassword] = useState("");
  const [newpassword, setnewpassword] = useState("");
  const [reenternewpassword, setreenternewpassword] = useState("");
  const [uusername, setuusername] = useState(userUserName);
  const [friend, setfriend] = useState("");
  var profile;
  // eslint-disable-next-line no-unused-vars
  const [uploadPercentage, setuploadPercentage] = useState("");
  const [message, setmessage] = useState("");

  function setValue(e) {
    e.target.name === "Uname" && setuname(e.target.value);
    e.target.name === "Uemail" && setuemail(e.target.value);
    e.target.name === "oldpassword" && setoldpassword(e.target.value);
    e.target.name === "newpassword" && setnewpassword(e.target.value);
    e.target.name === "re-enter-new-password" &&
      setreenternewpassword(e.target.value);
    e.target.name === "Uusername" && setuusername(e.target.value);
    e.target.name === "friend" && setfriend(e.target.value);
    e.target.name === "message" && setmessage(e.target.value);
  }

  function setProfile(e) {
    profile = e.target.files[0];
    console.log(profile);
  }

  function updateProfile() {
    if (profile != undefined) {
      var formData = new FormData();
      formData.append("_id", userId);
      formData.append("profile", profile);
      console.log(profile);
      axios
        .post(`${process.env.REACT_APP_API_URL}/update-profile`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: function (progressEvent) {
            console.log("file Uploading Progresss.......");
            console.log(progressEvent);
            setuploadPercentage(
              parseInt(
                Math.round((progressEvent.loaded / progressEvent.total) * 100)
              )
            );
            // setfileInProgress(progressEvent.fileName)
          }
        })
        .then((res) => {
          alert(res.data.data);
          userImage = profile;
        })
        .catch((res) => {
          alert("Some issue occur while updating your profile");
        });
    } else {
      alert("please choose profile");
    }
  }

  function changePassword() {
    if (userPassword === oldpassword) {
      var isvalid = true;
      //validate for password
      if (!RegexHelper("password").test(newpassword)) {
        alert(
          "Password should have 1 lowercase letter, 1 uppercase letter, 1 number, 1 special character and be at least 8 characters long"
        );
        isvalid = false;
      }
      if (isvalid === true) {
        if (newpassword === reenternewpassword) {
          axios
            .post(`${process.env.REACT_APP_API_URL}/update-password`, {
              userId,
              reenternewpassword
            })
            .then((res) => {
              alert(res.data.data);
              setoldpassword("");
              setnewpassword("");
              setreenternewpassword("");
            })
            .catch((res) => {
              alert("Password not changed :( ");
            });
        } else {
          alert("New password not match with re-enter new password");
        }
      }
    } else {
      alert("Old password is incorrect");
    }
  }

  let allUsers;
  axios
    .get(`${process.env.REACT_APP_API_URL}/list-account`)
    .then((res) => (allUsers = res.data.data));

  function addFriend() {
    if (friend != "") {
      if (friend != userUserName) {
        axios
          .post(`${process.env.REACT_APP_API_URL}/search-for-user`, { friend })
          .then((res) => {
            if (res.data.data.length > 0) {
              axios
                .post(`${process.env.REACT_APP_API_URL}/get-notif`, myUsername)
                .then((res) => {
                  if (res.data.data[0].friends) {
                    if (res.data.data[0].friends.length >= 1) {
                      var forUnique = res.data.data[0].friends.map((a) => {
                        return a.name;
                      });
                      var status = forUnique.some((elem) => elem === friend);
                      if (status == true) {
                        alert("you cant send friend request again");
                      } else {
                        let uid = allUsers.filter(
                          (u) => u.uusername === friend
                        );
                        console.log(uid);
                        var addfrnd = { uid, userUserName };
                        axios
                          .post(
                            `${process.env.REACT_APP_API_URL}/add-friend`,
                            addfrnd
                          )
                          .then((res) => {
                            alert(res.data.data);
                            setfriend("");
                          });
                      }
                    }
                  } else {
                    let uid = allUsers.filter((u) => u.uusername === friend);
                    let addfrnd = { uid, userUserName };
                    axios
                      .post(
                        `${process.env.REACT_APP_API_URL}/add-friend`,
                        addfrnd
                      )
                      .then((res) => {
                        alert(res.data.data);
                        setfriend("");
                      });
                  }
                });
            } else {
              alert("User not found. Please enter correct username.");
            }
          });
      } else {
        alert("You can't send you a request. 🥱");
      }
    } else {
      alert("enter frnd's username");
    }
  }

  function accept(friendReq) {
    // console.log(friendReq);
    let acceptFrnd = { friendReq, userUserName };
    // console.log(acceptFrnd);
    axios
      .post(`${process.env.REACT_APP_API_URL}/accept-request`, acceptFrnd)
      .then((res) => {
        if (res.data.status == "ok") {
          alert(res.data.data);
        }
      });
  }

  function decline(mine, frnd) {
    axios
      .post(`${process.env.REACT_APP_API_URL}/unfriend-or-decline`, {
        mine,
        frnd
      })
      .then((res) => {
        if (res.data.status === "ok") {
          alert(res.data.data);
        }
      });
  }

  function unfriend(mine, frnd, e) {
    axios
      .post(`${process.env.REACT_APP_API_URL}/unfriend-or-decline`, {
        mine,
        frnd
      })
      .then((res) => {
        if (res.data.status == "ok") {
          alert(res.data.data);
          setchatUsername("");
        }
      });
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  let myUsername = { userUserName };

  // notifications
  const [notification, setnotification] = useState([]);
  useEffect(() => {
    // setInterval(() => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/get-notif`, myUsername)
      .then((res) => {
        if (res.data.status == "ok") {
          if (res.data.data[0].friends) {
            var notifs = res.data.data[0].friends.filter(function (s) {
              var recieve = s.recieved == true;
              var status = s.status == false;
              return recieve && status;
            });
            // console.log(notifs);
            setnotification(notifs);
          }
        }
      });
    // }, 2000);
  }, [myUsername]);

  var mainnotif = notification.map((S, i) => {
    return (
      <span
        key={S.name}
        className="filterNotifications all latest notification"
        data-toggle="list"
      >
        <img
          className="avatar-md m-1"
          height="73px"
          width="73px"
          data-toggle="tooltip"
          data-placement="top"
          src={
            S.userImage
              ? `${process.env.REACT_APP_API_URL + "/" + S.userImage}`
              : `https://bootdey.com/img/Content/avatar/avatar${i + 1}.png`
          }
          alt="avatar"
        />
        {/* <div className="status">
          <i className="material-icons online">fiber_manual_record</i>
        </div> */}
        <div className="data">
          <p
            className="m-1 px-2"
            style={{ minHeight: "73px", overflow: "hidden" }}
          >
            {S.name}, has sent you a friend request.
          </p>
          <div className="reqButtons">
            <button
              className="btn btn-success button col-sm-5 py-2"
              onClick={() => {
                accept(S.name);
              }}
            >
              Accept
            </button>{" "}
            &nbsp; &nbsp;
            <button
              className="btn button btn-danger col-sm-5 py-2"
              onClick={() => {
                decline(myUsername.userUserName, S.name);
              }}
            >
              Decline
            </button>
          </div>
        </div>
      </span>
    );
  });

  // Friend list
  const [friendlist, setfriendlist] = useState([]);
  const [loadingFriendlist, setloadingFriendlist] = useState(undefined);
  useEffect(() => {
    // setInterval(() => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/myFriends`, myUsername)
      .then((res) => {
        if (res.data.status == "ok") {
          if (res.data.data[0].friends) {
            var friends = res.data.data[0].friends.filter(function (s) {
              var status = s.status == true;
              return status;
            });
            setfriendlist(friends);
            setloadingFriendlist(true);
          }
        } else {
          setloadingFriendlist(false);
        }
      });
    // }, 2000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friendlist.length]);

  // eslint-disable-next-line no-unused-vars
  const [fname, setfname] = useState([]);
  const [chatName, setchatName] = useState("");
  const [chatProfile, setchatProfile] = useState("");
  const [chatUsername, setchatUsername] = useState("");
  const [sortedMergeMessages, setsortedMergeMessages] = useState([]);
  const [messageList, setmessageList] = useState([]);
  const [messageList2, setmessageList2] = useState([]);
  // const [refreshId, setrefreshId] = useState();

  function openChat(fData) {
    setmessage("");
    // console.log(refreshId);
    // clearInterval(refreshId);
    axios
      .post(`${process.env.REACT_APP_API_URL}/friendData/?id=` + fData)
      .then((res) => {
        if (res.data.status === "ok") {
          setfname(res.data.data);
          setchatName(res.data.data[0].uname);
          setchatUsername(res.data.data[0].uusername);
          setchatProfile(res.data.data[0].profile);
          console.log(res.data.data);
          // console.log(chatName, fname, chatUsername, chatProfile);
        }
      });

    // setrefreshId(
    //   setInterval(() => {
    // show friend msg
    axios
      .post(`${process.env.REACT_APP_API_URL}/messages2`, { fData })
      .then((res) => {
        if (res.data.status == "ok") {
          var chat2 = res.data.data.filter(function (s) {
            var friend2 = s.friendUsername === myUsername.userUserName;
            return friend2;
          });
          // console.log(chat2);
          setmessageList2(chat2);
        } else {
          setmessageList2([]);
        }
      });

    // Show My Messages
    axios
      .post(`${process.env.REACT_APP_API_URL}/messages1`, myUsername)
      .then((res) => {
        if (res.data.status == "ok") {
          var chat = res.data.data.filter(function (s) {
            var friend = s.friendUsername === fData;
            return friend;
          });
          setmessageList(chat);
        } else {
          setmessageList([]);
        }
      });
    //   }, 300)
    // );
  }

  useEffect(() => {
    var mergeMessages = [...messageList2, ...messageList];
    // console.log(mergeMessages);
    function msgSort(a, b) {
      var frst = new Date(a.dateTime);
      var scnd = new Date(b.dateTime);
      return frst - scnd;
    }
    // console.log(mergeMessages);
    setsortedMergeMessages(mergeMessages.sort(msgSort));
    // console.log(sortedMergeMessages);
  }, [messageList, messageList2]);

  // auto scroll messages
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "nearest"
    });
  }, [sortedMergeMessages.length]);

  // send messages
  function sendMessage(friendUsername) {
    if (message !== "") {
      var today = new Date();
      var date =
        today.getDate() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getFullYear();
      var time =
        today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      var dateTime = today;
      var messageid = Math.random();

      var sendMessage = {
        userUserName,
        friendUsername,
        message,
        time,
        date,
        dateTime,
        messageid
      };
      axios
        .post(`${process.env.REACT_APP_API_URL}/send-message`, sendMessage)
        .then((res) => {
          // alert(res.data.data);
        });
      setmessage("");
    }
  }

  // emoji picker
  const [showPicker, setShowPicker] = useState(false);
  const onEmojiClick = (event, emojiObject) => {
    setmessage((prevInput) => prevInput + emojiObject.emoji);
    setShowPicker(false);
  };

  // delete a message
  function deleteMsg(id) {
    axios
      .post(`${process.env.REACT_APP_API_URL}/delete-a-message`, { id })
      .then((res) => {
        // alert(res.data.data);
      });
  }

  // delete chat history
  function deleteHistory(mine, frnd) {
    axios
      .post(`${process.env.REACT_APP_API_URL}/delete-all-message`, {
        mine,
        frnd
      })
      .then((res) => {
        // alert(res.data.data);
      });
  }

  function setIconEvents() {
    document
      .querySelector(".profilebtn")
      ?.addEventListener("click", function (e) {
        document
          .querySelectorAll(".App-header span.btn")
          .forEach((ele) => ele.classList.remove("active"));
        e.currentTarget.classList.add("active");
        document.querySelector(".startList").style.display = "none";
        document.querySelector(".addfriends").style.display = "none";
        document.querySelector(".profileTab").style.display = "";
      });

    document
      .querySelector(".addFrined")
      ?.addEventListener("click", function (e) {
        document
          .querySelectorAll(".App-header span.btn")
          .forEach((ele) => ele.classList.remove("active"));
        e.currentTarget.classList.add("active");
        document.querySelector(".startList").style.display = "none";
        document.querySelector(".profileTab").style.display = "none";
        document.querySelector(".addfriends").style.display = "";
      });

    document
      .querySelector(".peopleList")
      ?.addEventListener("click", function (e) {
        document
          .querySelectorAll(".App-header span.btn")
          ?.forEach((ele) => ele.classList.remove("active"));
        e.currentTarget.classList.add("active");
        document.querySelector(".profileTab").style.display = "none";
        document.querySelector(".addfriends").style.display = "none";
        document.querySelector(".startList").style.display = "";
      });

    document
      .querySelector(".App-header > h3.p-1")
      ?.addEventListener("click", function () {
        document.querySelector(".startScreen").classList.remove("d-none");
        document.querySelector("div.chat").classList.add("d-none");
        document
          .querySelector(".peopleList.btn ")
          .dispatchEvent(new Event("click"));
      });

    document.querySelectorAll(".App-header span.btn ").forEach((elem) => {
      elem.addEventListener("mouseenter", function (e) {
        document.querySelector(".App-header div.flex-grow1 ").textContent =
          elem.getAttribute("name");
      });
      elem.addEventListener("mouseleave", function (e) {
        document.querySelector(".App-header div.flex-grow1 ").textContent = "";
      });
    });

    document.querySelectorAll(".chat-list li.clearfix").forEach((ele) => {
      ele.addEventListener("click", function (e) {
        document
          .querySelectorAll(".chat-list li.clearfix")
          .forEach((elem) => elem.classList.remove("active"));
        e.target.classList.add("active");
        document.querySelector(".startScreen").classList.add("d-none");
        document.querySelector("div.chat").classList.remove("d-none");
        document.querySelector("div.chat-history > ul") &&
          (document.querySelector("div.chat-history > ul").scrollTop =
            document.querySelector("div.chat-history > ul").scrollHeight);
      });
    });
  }

  return (
    <div className="container-fluid">
      <div className="row clearfix">
        <div className="col-lg-12">
          <div className="card chat-app h-100">
            {/* leftbar */}
            <div className="people-list" id="plist">
              {/* data-aos="flip-left" data-aos-once='true' data-aos-duration="300" */}
              <div className="startList">
                {/* <div className="input-group"><div className="input-group-prepend"><input type="text" className="form-control" placeholder="Search..." />
                    <span className="input-group-text btn btn-light rounded"><i className="fa fa-search"></i></span></div></div> */}
                <ul className="list-unstyled chat-list mt-2 mb-0">
                  {loadingFriendlist === undefined && <Loading />}
                  {friendlist.length > 0 ? (
                    friendlist.map((e, i) => {
                      return (
                        <li
                          className="clearfix"
                          dataName={e.name}
                          onClick={() => {
                            openChat(e.name);
                          }}
                        >
                          <img
                            src={
                              userImage
                                ? `${
                                    process.env.REACT_APP_API_URL +
                                    "/" +
                                    userImage
                                  }`
                                : `defaultProfile.jpg`
                            }
                            alt="avatar"
                            style={{ aspectRatio: "1 / 1" }}
                          />
                          <div className="about">
                            <div className="name text-dark">{e.name}</div>
                            {/* <div className="status"> <i className="fa fa-circle offline"></i> {e.status} </div> */}
                          </div>
                        </li>
                      );
                    })
                  ) : (
                    <li className="clearfix">
                      <div className="text-center name">
                        Your friend list is empty, start chatting to friends by
                        sending them friend requests.
                      </div>
                    </li>
                  )}
                </ul>
              </div>
              <div
                className="profileTab"
                style={{
                  display: "none",
                  overflowY: "auto",
                  height: "85vh",
                  overflowX: "hidden"
                }}
              >
                <div
                  className="tab-pane active show px-1"
                  id="settings"
                  style={{ marginTop: "-6px" }}
                >
                  <div className="profile">
                    <h2 className="w-100 text-secondary text-right">
                      <u> -Profile</u>
                    </h2>
                    <div className="text-center w-100 d-flex justify-content-center align-items-center">
                      <img
                        className="avatar-xl"
                        alt="avatar"
                        style={{ height: "140px", width: "140px" }}
                        src={
                          userImage
                            ? `${
                                process.env.REACT_APP_API_URL + "/" + userImage
                              }`
                            : "defaultProfile.jpg"
                        }
                      />
                    </div>
                    <h2 className="text-center text-dark">{userName}</h2>
                    <h5 className="text-center text-dark">{userUserName}</h5>
                  </div>
                  <h2 className="w-100 text-secondary text-right">
                    <u> -Settings</u>
                  </h2>
                  <details
                    className="text-primary"
                    style={{
                      marginTop: "2rem",
                      fontSize: "1.2rem",
                      fontWeight: "bold"
                    }}
                  >
                    <summary style={{ fontSize: ".9em" }}>
                      Update your profile details
                    </summary>
                    <form>
                      <div className="upload">
                        {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                        <img
                          className="avatar-xl mt-2"
                          height="55px"
                          width="55px"
                          alt="image"
                          src={
                            userImage
                              ? `${
                                  process.env.REACT_APP_API_URL +
                                  "/" +
                                  userImage
                                }`
                              : "defaultProfile.jpg"
                          }
                        />
                        <div className="column">
                          <input
                            type="file"
                            accept="image/png,image/jpg,image/jpeg"
                            className="rounded btn btn-light w-75 ml-1"
                            onChange={(e) => {
                              setProfile(e);
                            }}
                            style={{ overflow: "hidden" }}
                          />
                          {/* <span className="btn btn-primary w-50 m-1 bg-primary" >Upload</span> */}
                          <div className="text-center">
                            <button
                              type="button"
                              onClick={updateProfile}
                              className="btn bg-success btn-success w-50 "
                            >
                              Set
                            </button>
                          </div>
                        </div>
                        <small className="text-secondary">
                          For best results, use an image at least 256px by 256px
                          in either .jpg or .png format!
                        </small>
                      </div>
                      <div className="parent">
                        <div className="field">
                          <label htmlFor="Name">Name </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Name"
                            name="Uname"
                            value={uname}
                            onChange={(e) => {
                              setValue(e);
                            }}
                            required
                          />
                        </div>
                        <div className="field">
                          <label htmlFor="username">Username </label>
                          <input
                            type="text"
                            name="Uusername"
                            className="form-control"
                            id="username"
                            placeholder="Username"
                            value={uusername}
                            onChange={(e) => {
                              setValue(e);
                            }}
                          />
                        </div>
                      </div>
                      <div className="field">
                        <label htmlFor="email">Email </label>
                        <input
                          type="email"
                          name="Uemail"
                          className="form-control"
                          id="email"
                          placeholder="Enter your email address"
                          required
                          disabled
                          value={uemail}
                          onChange={(e) => {
                            setValue(e);
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        className="btn button w-100 mt-2"
                        onClick={(e) => {
                          dispatch(updateDetails({ uname, uusername }, user));
                        }}
                      >
                        Apply Changes
                      </button>
                    </form>
                  </details>
                  <details
                    className="text-primary"
                    style={{
                      marginTop: "2rem",
                      fontSize: "1.2rem",
                      fontWeight: "bold"
                    }}
                  >
                    <summary style={{ fontSize: ".9em" }}>
                      Change Password
                    </summary>
                    <form>
                      <div className="field">
                        <label htmlFor="password">Old Password</label>
                        <input
                          type="password"
                          name="oldpassword"
                          className="form-control"
                          id="password"
                          placeholder="Enter current password"
                          required
                          value={oldpassword}
                          onChange={(e) => {
                            setValue(e);
                          }}
                        />
                      </div>
                      <div className="field">
                        <label htmlFor="password">New Password</label>
                        <input
                          type="password"
                          name="newpassword"
                          className="form-control"
                          id="password"
                          placeholder="Enter new password"
                          required
                          value={newpassword}
                          onChange={(e) => {
                            setValue(e);
                          }}
                        />
                      </div>
                      <div className="field">
                        <label htmlFor="password">Re-enter New Password</label>
                        <input
                          type="password"
                          name="re-enter-new-password"
                          className="form-control"
                          id="password"
                          placeholder="Enter again new password"
                          required
                          value={reenternewpassword}
                          onChange={(e) => {
                            setValue(e);
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        className="btn button w-100 mt-2"
                        onClick={changePassword}
                      >
                        Change Password
                      </button>
                    </form>
                  </details>
                </div>
              </div>
              <div
                className="addfriends tab-pane fade"
                style={{ display: "none", opacity: 1 }}
              >
                <div className="search">
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <input
                        name="friend"
                        value={friend}
                        onChange={(e) => {
                          setValue(e);
                        }}
                        type="text"
                        className="form-control"
                        required
                        id="user notice"
                        placeholder="Username to add friends..."
                      />
                      <button
                        className="btn rounded bg-light create"
                        type="button"
                        onClick={addFriend}
                      >
                        <i className="fa fa-user-plus"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="notifications">
                  <h2 className="my-3 text-dark">Friend requests</h2>
                  {mainnotif.length != 0 && (
                    <ul
                      style={{ overflowY: "auto" }}
                      className="list-group"
                      id="alerts"
                      role="tablist"
                    >
                      {mainnotif}
                    </ul>
                  )}
                  {mainnotif.length == 0 && (
                    <div
                      className="list-group m-auto"
                      id="alerts"
                      role="tablist"
                      style={{
                        fontFamily: "Seoge UI",
                        fontSize: "20px",
                        fontWeight: "400",
                        display: "flex",
                        justifyContent: "center",
                        flexDirection: "column",
                        alignItems: "center"
                      }}
                    >
                      <p style={{ textAlign: "center" }}>
                        No one sends you a friend request :({" "}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {setIconEvents()}
            </div>
            {/* End of leftbar */}

            <div
              className="startScreen"
              style={{ overflow: "hidden", height: "min-content" }}
            >
              <img
                className="bg-secondary w-100"
                src="/robot.gif"
                alt="hey :-)"
                style={{ height: "93vh" }}
              />
            </div>

            <div div className="chat d-none">
              <div className="chat-header clearfix">
                <div className="row">
                  <div className="col-lg-6">
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <a
                      // eslint-disable-next-line no-script-url
                      href="javascript:void(0);"
                      data-toggle="modal"
                      data-target="#view_info"
                    >
                      <img
                        src={
                          userImage
                            ? `${
                                process.env.REACT_APP_API_URL + "/" + userImage
                              }`
                            : "defaultProfile.jpg"
                        }
                        alt="avatar"
                      />
                    </a>
                    <div className="chat-about">
                      <h5 className="mb-0 text-dark">{chatName}</h5>
                      <small>{chatUsername}</small>
                    </div>
                  </div>
                  <div className="col-lg-6 hidden-sm text-right">
                    <div className="dropdown">
                      <button
                        className="btn btn-outline-warning"
                        type="button"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        &nbsp;<i className="fa fa-ellipsis-v"></i>&nbsp;
                      </button>
                      <div
                        className="dropdown-menu dropdown-menu-right"
                        aria-labelledby="dropdownMenuButton"
                      >
                        <button
                          onClick={() => {
                            deleteHistory(
                              myUsername.userUserName,
                              chatUsername
                            );
                          }}
                          className="dropdown-item"
                        >
                          <i className="fa fa-trash"></i>&nbsp; Clear Chat
                          History
                        </button>
                        <button
                          onClick={(e) => {
                            unfriend(myUsername.userUserName, chatUsername, e);
                          }}
                          className="dropdown-item"
                        >
                          <i className="fas fa-user-slash"></i>&nbsp; Unfriend{" "}
                          {chatUsername}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="chat-history">
                {console.log(sortedMergeMessages)}
                {sortedMergeMessages.length != 0 && (
                  <>
                    <ul className="m-b-0">
                      {(() => {
                        return sortedMergeMessages.map((s) => {
                          return (
                            <li className="clearfix">
                              <div
                                className={
                                  s.friendUsername == myUsername.userUserName
                                    ? "message-data"
                                    : "message-data text-right"
                                }
                                style={{ minWidth: "64px" }}
                              >
                                {/* {console.log(`${process.env.REACT_APP_API_URL + '/' + chatProfile}`)} */}
                                {s.friendUsername ==
                                  myUsername.userUserName && (
                                  <img
                                    src={
                                      chatProfile
                                        ? `${
                                            process.env.REACT_APP_API_URL +
                                            "/" +
                                            chatProfile
                                          }`
                                        : `defaultProfile.jpg`
                                    }
                                    alt="avatar"
                                  />
                                )}
                                <span className="message-data-time">
                                  {s.time}&nbsp;{s.date}
                                </span>
                              </div>
                              <div
                                className={
                                  s.friendUsername == myUsername.userUserName
                                    ? "message other-message"
                                    : "message my-message float-right"
                                }
                              >
                                <div className="dropdown">
                                  <div
                                    className="dropdown-menu"
                                    aria-labelledby="dropdownMenuButton"
                                  >
                                    <span
                                      className="dropdown-item"
                                      style={{ cursor: "pointer" }}
                                      onClick={() => {
                                        deleteMsg(s.messageid);
                                      }}
                                    >
                                      <i className="fa fa-trash"></i> delete
                                    </span>
                                  </div>
                                  <span
                                    className="dropdown-toggle"
                                    type="button"
                                    id="dropdownMenuButton"
                                    data-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                  >
                                    {s.message.split("\n").map((str) => (
                                      <p
                                        className={
                                          s.message.split("\n").length > 1
                                            ? ""
                                            : "d-inline"
                                        }
                                      >
                                        {str}
                                      </p>
                                    ))}
                                  </span>
                                </div>
                              </div>
                            </li>
                          );
                        });
                      })()}
                    </ul>
                    <div ref={messagesEndRef}></div>
                    <div
                      className="picker-container"
                      style={{
                        position: "relative",
                        width: "99%",
                        bottom: "13em",
                        left: "0.2em",
                        overflowX: "hidden"
                      }}
                    >
                      {showPicker && (
                        <Picker
                          pickerStyle={{ width: "100%", height: "30vh" }}
                          onEmojiClick={onEmojiClick}
                        />
                      )}
                    </div>
                  </>
                )}
                {sortedMergeMessages.length == 0 && (
                  <div className="col-md-12">
                    <div className="no-messages">
                      {/* <i className="material-icons md-48">forum</i> */}
                      <p className="text-center">
                        Seems people are shy to start the chat. Break the ice
                        send the first message.
                      </p>
                    </div>
                    <div
                      className="picker-container"
                      style={{ position: "relative", width: "100%" }}
                    >
                      {showPicker && (
                        <Picker
                          pickerStyle={{ width: "100%", height: "30vh" }}
                          onEmojiClick={onEmojiClick}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="chat-message clearfix">
                <div className="input-group mb-0 bg-light">
                  <div className="input-group-prepend border w-100 rounded">
                    <div
                      className="input-group-text btn btn-warning emoticons"
                      onClick={() => setShowPicker((val) => !val)}
                    >
                      <i className="fa fa-smile"></i>
                    </div>
                    <textarea
                      style={{ resize: "none" }}
                      name="message"
                      value={message}
                      onChange={(e) => {
                        setValue(e);
                      }}
                      className="form-control m-0 p-3"
                      placeholder="Type messages here..."
                      rows={1}
                      defaultValue={""}
                    />
                    <span
                      onClick={() => {
                        sendMessage(chatUsername);
                      }}
                      className="input-group-text btn btn-success send"
                    >
                      <i className="fa fa-paper-plane"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
AOS.init();
