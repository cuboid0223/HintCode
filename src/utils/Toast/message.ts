import { toast } from "react-toastify";

export const showErrorToast = (
  message: string,
  autoClose: number | false = 3000,
  theme: "light" | "dark" | "colored" = "dark"
) => {
  toast.error(message, {
    position: "top-center",
    autoClose: autoClose,
    theme: theme,
  });
};

export const showWarningToast = (
  message: string,
  autoClose: number | false = 3000,
  theme: "light" | "dark" | "colored" = "dark"
) => {
  toast.warn(message, {
    position: "top-center",
    autoClose: autoClose,
    theme: theme,
  });
};
