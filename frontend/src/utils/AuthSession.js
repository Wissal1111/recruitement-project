export const setSession = ({ accessToken, refreshToken, user }) => {
  if (accessToken != null) localStorage.setItem("accessToken", accessToken);
  if (refreshToken != null) localStorage.setItem("refreshToken", refreshToken);
  if (user != null) localStorage.setItem("user", JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

export const getSession = () => {
  const raw = localStorage.getItem("user");
  return {
    accessToken: localStorage.getItem("accessToken"),
    refreshToken: localStorage.getItem("refreshToken"),
    user: raw ? JSON.parse(raw) : null,
  };
};