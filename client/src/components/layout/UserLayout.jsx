import { Outlet } from "react-router-dom";
import UserHeader from "../user/UserHeader";

function UserLayout() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <UserHeader />

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default UserLayout;
