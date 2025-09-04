import React from "react";
import { Link, useLocation } from "react-router-dom";

type Props = {};

const Breadcrumb = (props: Props) => {
  const location = useLocation(); //useLocation: returns an object with the current URL info. We're interested in location.pathname.

  //split current path into segments by / : Example: /admin/users/edit → ["admin", "users", "edit"] & Filters out empty strings
  const pathParts = location.pathname.split("/").filter((part) => part !== "");

  return (
    <nav className="flex items-center text-sm text-gray-500">
      <Link to="/admin" className="hover:text-pink-600">
        Admin
      </Link>
      {/* Dynamic Breadcrumbs: Iterates over each segment of the path.
       Constructs the full path up to that segment.
          Example: ["admin", "users", "edit"]
              index 0 → /admin
              index 1 → /admin/users
              index 2 → /admin/users/edit
        For a path like /admin/users/edit, "Admin" and "Users" are clickable links. "Edit" is plain text.*/}
      {pathParts.map((part, index) => {
        const to = `/${pathParts.slice(0, index + 1).join("/")}`;
        return (
          <span key={to} className="flex items-center">
            <span className="mx-2">/</span>
            {index === pathParts.length - 1 ? (
              <span className="text-gray-700 font-medium">
                {part.charAt(0).toUpperCase() + part.slice(1)}
              </span>
            ) : (
              <Link to={to} className="hover:text-pink-600">
                {part.charAt(0).toUpperCase() + part.slice(1)}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
