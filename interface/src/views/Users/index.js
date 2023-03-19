import React from "react";
import {Outlet} from 'react-router-dom'

import Create from "./Create";
import Home from "./User";


const User = () => {
    return (
      <div className='container'> 
         <Outlet />
      </div>
    )
  }



export { Home as UserIndex, User as UserHome, Create as UserCreate };
