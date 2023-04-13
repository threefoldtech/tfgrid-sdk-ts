import axios from "axios";

export const req = axios.create({
  baseURL: `${window.configs.APP_GRIDPROXY_URL}`,
});
