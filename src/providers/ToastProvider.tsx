"use client";

import { ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const ToastProvider = ({ children }: { children: ReactNode }) => (
  <>
    {children}
    <ToastContainer pauseOnHover={true} closeOnClick={true} />
  </>
);

export default ToastProvider;
