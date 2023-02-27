import React from "react";

export default function Startlist(props) {
  console.log(props);
  var friendlist = [
    {
      name: "dsa",
      status: "left 7 min ago"
    },
    {
      name: "Aiden Chavez",
      status: "online"
    },
    {
      name: "Mike Thomas",
      status: "left 8 min ago"
    },
    {
      name: "Christian Kelly",
      status: "left 10 hours ago"
    },
    {
      name: "Monica Ward",
      status: "online"
    },
    {
      name: "dsa",
      status: "left 7 min ago"
    },
    {
      name: "Aiden Chavez",
      status: "online"
    },
    {
      name: "Mike Thomas",
      status: "left 8 min ago"
    },
    {
      name: "Dean Henry",
      status: " offline since Oct 28 "
    }
  ];

  let userImage;
  return (
    <div className="startList">
      <div className="input-group">
        <div className="input-group-prepend">
          <input type="text" className="form-control" placeholder="Search..." />
          <span className="input-group-text">
            <i className="fa fa-search"></i>
          </span>
        </div>
      </div>
      <ul className="list-unstyled chat-list mt-2 mb-0">
        {friendlist.map((e, i) => {
          return (
            <li className="clearfix">
              <img
                src={
                  userImage
                    ? `http://localhost:3001/${userImage}`
                    : `https://bootdey.com/img/Content/avatar/avatar${
                        i + 1
                      }.png`
                }
                alt="avatar"
                style={{ aspectRatio: "1 / 1" }}
              />
              <div className="about">
                <div className="name text-dark">{e.name}</div>
                {/* <div className="status"> <i className="fa fa-circle offline"></i> {e.status} </div>                                             */}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
