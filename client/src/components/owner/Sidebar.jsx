import React, { useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import { assets } from "../../assets/data";
import { Link, NavLink, Outlet } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";

const Sidebar = () => {
  const { navigate, isOwner, user } = useAppContext();

  const navItems = [
    {
      path: "/owner",
      label: "Dashboard",
      icon: assets.dashboard,
    },
    {
      path: "/owner/add-product",
      label: "Add Product",
      icon: assets.squarePlus,
    },
    {
      path: "/owner/list-product",
      label: "List Product",
      icon: assets.list,
    },
    {
      path: "/",
      label: "Back to Home",
      icon: assets.house,
      isExternal: true,
    },
  ];

  useEffect(() => {
    if (!isOwner) {
      navigate("/");
    }
  }, [isOwner, navigate]);

  return (
    <div >
      <div className="mx-auto max-w-[1440px] flex flex-col md:flex-row">
        {/*Side Bar*/}
        <div className="max-md:flexCenter flex flex-col justify-between bg-primary sm:m-3 md:min-w-[20%] md:min-h-[97vh] rounded-xl shadow">
          <div className="flex flex-col gap-y-6 max-md:items-center md:flex-col md:pt-5">
            <div className="w-full flex justify-between md:flex-col">
              {/*logo*/}
              <div className="flex flex-1 p-3 lg:pl-12">
                <Link to={"/"} className="flex items-end">
                  <img
                    src={assets.logoImg}
                    alt="Agri-Mart Logo"
                    className="h-16 w-auto"
                  />
                  <span className="bold-24 relative top-1 right-2 text-green-700">
                    Agri-mart
                  </span>
                </Link>
              </div>
              <div className="md:hidden flex items-center gap-3 md:bg-primary rounded-b-xl p-2 pl-5 lg:pl-10 md:mt-10">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: {
                        width: "42px",
                        height: "42px",
                      },
                    },
                  }}
                />
                <div className="text-sm font-semibold text-gray-800 capitalize">
                  {user?.firstName} {user?.lastName}
                </div>
              </div>
            </div>
            <div className="flex md:flex-col md:gap-x-5 gap-y-8 md:mt-4">
              {navItems.map((link) => {
                if (link.isExternal) {
                  return (
                    <button
                      key={link.label}
                      onClick={() => navigate(link.path)}
                      className="flexStart gap-x-2 lg:pl-12 p-5 bold-13 sm:text-sm cursor-pointer h-10 rounded-xl hover:bg-secondary/5 transition-colors w-full text-left"
                    >
                      <img src={link.icon} alt={link.label} className="hidden md:block" width={18} />
                      <div>{link.label}</div>
                    </button>
                  );
                }
                return (
                  <NavLink
                    key={link.label}
                    to={link.path}
                    end={link.path === "/owner"}
                    className={({ isActive }) =>
                      isActive
                        ? "flexStart gap-x-2 p-5 lg:pl-12 bold-13 sm:text-sm cursor-pointer h-10 bg-secondary/10 max-md:border-b-4 md:border-r-4 border-secondary"
                        : "flexStart gap-x-2 lg:pl-12 p-5 bold-13 sm:text-sm cursor-pointer h-10 rounded-xl"
                    }
                  >
                    <img src={link.icon} alt={link.label} className="hidden md:block" width={18} />
                    <div>{link.label}</div>
                  </NavLink>
                );
              })}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3 md:bg-primary border-t border-slate-900/15 rounded-b-xl p-2 pl-5 lg:pl-10 md:mt-10">
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: {
                    width: "42px",
                    height: "42px",
                  },
                },
              }}
            />
            <div className="text-sm font-semibold text-gray-800 capitalize">
              {user?.firstName} {user?.lastName}
            </div>
          </div>
        </div>
        <Outlet/>
      </div>
    </div>
  );
};

export default Sidebar;
