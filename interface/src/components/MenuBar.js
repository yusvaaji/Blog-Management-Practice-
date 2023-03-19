import React from "react";
import { AiFillAccountBook } from "react-icons/ai";

const MenuBar = ({loginHandler}) => {


  const logoutHandler = () =>{
    localStorage.clear()
    loginHandler(false)
}
  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container">
        <a className="navbar-brand logo" href="#">
          <AiFillAccountBook className="me-2" />
          Final Project Blog Management
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <a className="nav-link" href="/posts">
                Post
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/Users">
                Users
              </a>
            </li>
          </ul>

          <ul className="ms-auto">
            <button
              onClick={() => logoutHandler()}
              className="btn btn-sm btn-danger"
            >
              Logout
            </button>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default MenuBar;
