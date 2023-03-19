import React, { useState, useEffect } from "react";
import axios from "axios";
// React Hooks : React Lifecycle akan berjalan ketika component di execute
// REact Hooks : useState, useEffect

import { Link } from "react-router-dom";
import NowLoading from "../../components/NowLoading";

const User = () => {
  const [users, setUsers] = useState([]);
  const URL = "http://localhost:4300/api";

  const getUsers = async () => {
    try {
      let temp = await axios({
        url: `${URL}/users`,
        method: "GET",
      });
      console.log(temp.data);
      setUsers(temp.data);
    } catch (err) {
      alert(err);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div className="container">
      <div className="row text-center">
        <h3 className="">Users Page</h3>
        <p>Registered User</p>
        <hr />
      </div>
      {/* <button
                className="btn btn-sm btn-outline-success my-3"
                onClick={getProductHandler}
            >
                GET PRODUCTS
            </button> */}
      <div className="row">
        <div className="col-8 p-2">
          <div className="float-start">
            <h3>Users List</h3>
          </div>
          <div className="float-end">
            <Link className="btn btn-sm btn-success" to="/Users/create">
              Create Product
            </Link>
          </div>
        </div>
        <div className="col-8">
          <table className="table table-bordered border-dark">
            <thead>
              <tr>
                <th>User</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length !== 0 ? (
                users.map((user) => {
                  const { id, username, email, password, image } = user;
                  return (
                    <tr key={id}>
                      <td>
                        <div className="row">
                          <div className="col-3">
                            <img className="img-fluid" src={image} />
                            <h3 className="text-success">{username}</h3>
                          </div>
                          <div className="col-9">
                            <h3 className="text-success">{email}</h3>
                            <h5 className="text-primary">{password}</h5>
                            <small className="badge bg-success">
                              {username}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-danger">
                          Remove
                        </button>
                        <button className="btn btn-sm btn-info">Edit</button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <NowLoading />
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default User;
