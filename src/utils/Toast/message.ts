import { toast } from "react-toastify";

export const showErrorToast = (
  message: string,
  theme: "light" | "dark" | "colored" = "dark"
) => {
  toast.error(message, {
    position: "top-center",
    autoClose: 3000,
    theme: theme,
  });
};

export const showWarningToast = (
  message: string,
  theme: "light" | "dark" | "colored" = "dark"
) => {
  toast.warn(message, {
    position: "top-center",
    autoClose: 3000,
    theme: theme,
  });
};
