'use client'
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { type ReactElement, useContext, useState } from "react";

import useOutsideClick from "@/hooks/useOutsideClick";
import useSetNavActiveClass from "@/hooks/useSetNavActiveClass";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { UserDataProvider } from "@/contexts/UserData.context";
import { cn } from "@/utils";

export const NavBar = (): ReactElement => {
  const setDesktopClasses = useSetNavActiveClass({
    defaultClasses: "rounded-md px-3 py-2 text-sm font-medium text-white",
    activeClasses: "bg-gray-900",
    inactiveClasses: "hover:bg-gray-700 hover:text-white",
  });

  const setMobileClasses = useSetNavActiveClass({
    defaultClasses: "block rounded-md px-3 py-2 text-base font-medium",
    activeClasses: "bg-gray-900 text-white",
    inactiveClasses: "text-gray-300 hover:bg-gray-700 hover:text-white",
  });

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const dropdownRef = React.useRef(null);
  const handleMenuOpen = () => {
    setIsMenuOpen((prev) => !prev);
  };
  const navigate = useRouter();
  useOutsideClick(dropdownRef, () => setIsMenuOpen(true));

  const contextData = useContext(UserDataProvider);
  console.log("contextData:", contextData);

  const HndleMobileDropdown = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const handleLogOut = () => {
    try {
      fetch("api/users/sign-out", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }).then((response) => {
        if (response.ok) {
          localStorage.removeItem("accessToken");
          contextData?.setUserData(null);
          navigate.push("/");
        } else {
          throw new Error("Not authorized");
        }
      });
    } catch (error) {
      console.error("Cannot log out:", error as { message: string });
    }
  };
  return (
    <nav className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              onClick={HndleMobileDropdown}
              type="button"
              className={cn(
                "relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-hidden focus:ring-inset",
                isMobileMenuOpen ? "bg-gray-700 text-white" : ""
              )}
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="absolute -inset-0.5"></span>
              <span className="sr-only">Open main menu</span>
              <svg
                className="block size-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
                data-slot="icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
              <svg
                className="hidden size-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
                data-slot="icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                <Link
                  href={"/"}
                  className={setDesktopClasses("/")}
                  aria-current="page"
                >
                  Home
                </Link>
                {!contextData?.userData && (
                  <>
                    <Link
                      href={"/sign-in"}
                      className={setDesktopClasses("/sign-in")}
                    >
                      Login
                    </Link>
                    <Link
                      href={"/sign-up"}
                      className={setDesktopClasses("/sign-up")}
                    >
                      Registration
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {/* Profile dropdown */}
            {contextData?.userData && (
              <>
                <button
                  type="button"
                  className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden cursor-pointer"
                >
                  <span className="absolute -inset-1.5"></span>
                  <span className="sr-only">View notifications</span>
                  <svg
                    className="size-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                    />
                  </svg>
                </button>
                <div className="relative ml-3">
                  <div>
                    <button
                      onClick={handleMenuOpen}
                      ref={dropdownRef}
                      type="button"
                      className="relative flex rounded-full bg-gray-800 text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden  cursor-pointer"
                      id="user-menu-button"
                      aria-expanded="false"
                      aria-haspopup="true"
                    >
                      <span className="absolute -inset-1.5"></span>
                      <span className="sr-only">Open user menu</span>
                      <img
                        className="size-8 rounded-full"
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        alt=""
                      />
                    </button>
                  </div>
                  {isMenuOpen && (
                    <div
                      className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 ring-1 shadow-lg ring-black/5 focus:outline-hidden"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu-button"
                    >
                      <Link
                        // @Todo add route /user/id
                        href="/user/id"
                        className="block px-4 py-2 text-sm text-gray-700"
                        role="menuitem"
                        id="user-menu-item-0"
                      >
                        Your Profile
                      </Link>
                      <Link
                        // @Todo add route settings/id
                        href="/user/settings/id"
                        className="block px-4 py-2 text-sm text-gray-700"
                        role="menuitem"
                        id="user-menu-item-1"
                      >
                        Settings
                      </Link>
                      <button
                        onClick={handleLogOut}
                        className="block px-4 py-2 text-sm text-gray-700 cursor-pointer"
                        role="menuitem"
                        id="user-menu-item-2"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className={cn(
        "sm:hidden",
        isMobileMenuOpen ? "block" : "hidden",
        "transition-all duration-200 ease-in-out",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
      )} 
      id="mobile-menu"
      data-state={isMobileMenuOpen ? "open" : "closed"}
      data-side="bottom"
      >
        <div className="space-y-1 px-2 pt-2 pb-3">
          <Link
            href={"/"}
            className={setMobileClasses("/")}
            aria-current="page"
          >
            Home
          </Link>
          {!contextData?.userData && (
            <>
              <Link
                href={"/sign-in"}
                className={setMobileClasses("/sign-in")}
              >
                Login
              </Link>
              <Link
                href={"/sign-up"}
                className={setMobileClasses("/sign-up")}
              >
                Registration
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
