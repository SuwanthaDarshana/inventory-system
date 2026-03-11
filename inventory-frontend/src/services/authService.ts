import api from "../api/api";

const login = async (email: string, password: string) => {
  const res = await api.post("/login", {
    email,
    password,
  });

  localStorage.setItem("token", res.data.token);

  return res.data;
};

const logout = () => {
  localStorage.removeItem("token");
};

const getToken = () => {
  return localStorage.getItem("token");
};

const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

export default {
  login,
  logout,
  getToken,
  isAuthenticated,
};