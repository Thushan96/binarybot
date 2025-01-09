import React from "react";
import SideNavbar from "../components/sideNavbar";
import TopBar from "../components/topBar";
import Dashboard from "../dashboard/page";

const Main = () => {
  return (
    <div>
    <TopBar />
    <SideNavbar />
    <div className="pl-60 pt-16">
      <Dashboard/>
    </div>
  </div>
  );
};

export default Main;