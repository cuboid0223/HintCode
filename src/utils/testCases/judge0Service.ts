const JUDGE0_API_BASE = process.env.AWS_JUDGE0_URL; // Judge0 API URL
const SERVER_API_KEY = process.env.MY_JUDGE0_SERVER_API_KEY; // 你的 API Token

export const validateAuthToken = async () => {
  const url = `${JUDGE0_API_BASE}/authenticate`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Token": SERVER_API_KEY,
      },
    });

    if (response.ok) {
      console.log("API Token is valid");
      return true;
    } else if (response.status === 401) {
      console.error("Invalid API Token");
      return false;
    } else {
      console.error("Unexpected response:", response.status);
      return false;
    }
  } catch (error) {
    console.error("Failed to validate API Token:", error);
    return false;
  }
};
