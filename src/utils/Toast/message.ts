import { toast } from "react-toastify";

type ThemeType = "light" | "dark" | "colored";

export const showErrorToast = (
  message: string,
  autoClose: number | false = 3000,
  theme: ThemeType = "dark"
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
  theme: ThemeType = "dark"
) => {
  toast.warn(message, {
    position: "top-center",
    autoClose: autoClose,
    theme: theme,
  });
};

export const showSuccessToast = (
  message: string,
  autoClose: number | false = 3000,
  theme: ThemeType = "dark"
) => {
  toast.success(message, {
    position: "top-center",
    autoClose: autoClose,
    theme: theme,
  });
};
export const showLoadingToast = (message: string) => {
  toast.loading(message, {
    position: "top-center",
    toastId: "loadingToast",
  });
};
