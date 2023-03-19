import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "./App.css";

// React Router Dom
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Components
import MenuBar from "./components/MenuBar";
// Pages
// import PostR from "./components/Post";
import PostR from "./views/Posts/Post";

import { UserIndex, UserCreate, UserHome } from "./views/Users";
import Login from "./views/Login";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const loginHandler = (data) => {
    setIsLoggedIn(data);
  };

  useEffect(() => {
    if (localStorage.getItem("access_token")) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <BrowserRouter>
      <div className="container-fluid">
        {isLoggedIn ? (
          <>
            <MenuBar loginHandler={loginHandler} />
            <Routes>
              <Route path="/" element={<PostR></PostR>}></Route>
              <Route path="posts" element={<PostR></PostR>}></Route>
              <Route path="Users" element={<UserHome />}>
                <Route path="" element={<UserIndex></UserIndex>}></Route>
                <Route
                  path="Create"
                  element={<UserCreate></UserCreate>}
                ></Route>
              </Route>
            </Routes>
          </>
        ) : (
          <Login isLoggedIn={isLoggedIn} loginHandler={loginHandler}></Login>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
