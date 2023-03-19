import React, { useState } from "react";
import axios from "axios";

import Swal from 'sweetalert2'


import {useNavigate} from 'react-router-dom'

const Create = () => {
  const URL = "http://localhost:4300/api";
  const navigate = useNavigate()
  // Form
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState("");

  const addUser = async () => {
    try {
      let result = await axios({
        url: `${URL}/users/register`,
        method: "POST",
        data: {
          username,
          email: email,
          password: password,
          image: image,
        },
      });
      setUsername("");
      setEmail("");
      setPassword("");
      setImage("");

      Swal.fire(
        'Product created',
        'Product has been added to the list',
        'success'
      )

    navigate("/Users")
    } catch (err) {
      alert(err);
    }
  };
  const submitHandler = (e) => {
    e.preventDefault();
    addUser();
  };
  return (
    <>
      <div className="row">
        <div className="col-12 text-center p-2">
          <h3>Register User</h3>
        </div>
        <div className="col-12 form-submit">
          <form>
            <div className="mb-3">
              <label>UserName</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                className="form-control"
                placeholder="Input User Name"
              />
            </div>
            <div className="mb-3">
              <label>Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="text"
                className="form-control"
                placeholder="Input Email ex. ..@email.com"
              />
            </div>
            <div className="mb-3">
              <label>Author</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="form-control"
                placeholder="Password , Upper Case & Lower Case Comb"
              />
            </div>

            <div className="mb-3">
              <label>Image</label>
              <input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                type="text"
                className="form-control"
                placeholder="Input image's url"
              />
            </div>
            <div className="mb-3">
              <button className="btn btn-success w-100" onClick={submitHandler}>
                Submit Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Create;
