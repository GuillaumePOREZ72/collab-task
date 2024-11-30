import { FolderGit2 } from "lucide-react";
import React from "react";
import Navbar from "./Navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * Props for the Wrapper component.
 *
 * @prop {React.ReactNode} children - The content to be rendered within the
 *                                     Wrapper.
 */
type WrapperProps = {
  children: React.ReactNode;
};

/**
 * A component that wraps the children in a basic layout, including a
 * navigation bar and a centered container for the children.
 *
 * @param {React.ReactNode} children - The content to render inside the wrapper.
 *
 * @returns A JSX element containing the wrapper and the children.
 */
const Wrapper = ({ children }: WrapperProps) => {
  return (
    <div>
      <Navbar />
      <div className="p-5 md:px-[10%] mt-8 mb-10">
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnHover
          draggable
        />
        {children}
      </div>
    </div>
  );
};

export default Wrapper;
