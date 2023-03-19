import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const Login = (props) => {
  const { isLoggedIn, loginHandler } = props;
  // const [loggedIn, setLoggedIn] = useState(isLoggedIn)
  const loginHandlerButton = () => {
    console.log("Login Handler");
    loginHandler(true);
  };
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const loginSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      let result = await axios({
        url: "http://localhost:4300/api/users/login",
        method: "POST",
        data: loginForm,
      });
      localStorage.setItem("access_token", result.data);
      // console.log(result.data)
      loginHandler(true);
    } catch (err) {
      Swal.fire("Login Failed", `Can't login, please try again`, "error");
    }
  };
  return (
    <div className="w-100 vh-100 d-flex justify-content-center align-items-center">
      <div className="shadow rounded p-3 w-50 border">
        <h3 className="text-center">Login</h3>
        <form>
          <div className="mb-3">
            <label>Email</label>
            <input
              onChange={(e) =>
                setLoginForm({
                  ...loginForm,
                  email: e.target.value,
                })
              }
              className="form-control"
              type="text"
            />
          </div>
          <div className="mb-3">
            <label>Password</label>
            <input
              onChange={(e) =>
                setLoginForm({
                  ...loginForm,
                  password: e.target.value,
                })
              }
              className="form-control"
              type="password"
            />
          </div>
          <div className="mb-3">
            <button
              onClick={loginSubmitHandler}
              // onClick={loginHandlerButton}
              className="btn w-100 btn-success"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
