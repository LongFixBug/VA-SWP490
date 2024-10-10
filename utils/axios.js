import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

 const baseURL = "http://192.168.1.3:3000";
//  const baseURL = "http://192.168.1.2:3000";


const createAxios = () => {
  const api = axios.create({
    baseURL: baseURL,
    timeout: 5000, // Thời gian chờ tối đa cho yêu cầu (ms)
    headers: {
      "Content-Type": "application/json; charset=utf-8", // Định dạng dữ liệu gửi đi
    },
  });

//   api.interceptors.request.use(
//     async (config) => {
//       const UserLoggedInData = await AsyncStorage.getItem("UserLoggedInData")
//       const parseUserData = JSON.parse(UserLoggedInData)
//       if (UserLoggedInData) {
//         config.headers['Authorization'] = `Bearer ${parseUserData.accessToken}` || `Bearer `;
//       }
//       return config;
//     },
//     (error) => {
//       return Promise.reject(error);
//     }
//   );

  const get = async (endpoint) => {
    try {
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      throw new Error(`GET request to ${endpoint} failed: ${error.message}`);
    }
  };

  const getWithData = async (endpoint, data) => {
    try {
      const response = await api.get(endpoint, data);
      return response.data;
    } catch (error) {
      throw new Error(`GET request to ${endpoint} failed: ${error.message}`);
    }
  };

  const getWithQuery = async (endpoint, query) => {
    try {
      const response = await api.get(endpoint, { params: query });
      return response.data;
    } catch (error) {
      throw new Error(`GET request to ${endpoint} with query ${JSON.stringify(query)} failed: ${error.message}`);
    }
  };

  const post = (endpoint, data) => {
    return api
      .post(endpoint, data)
      .then((response) => response.data)
      .catch((error) => {
        throw new Error(`POST request to ${endpoint} failed: ${error.message}`);
      });
  };

  const put = (endpoint, data) => {
    return api
      .put(endpoint, data)
      .then((response) => response.data)
      .catch((error) => {
        throw new Error(`PUT request to ${endpoint} failed: ${error.message}`);
      });
  };

  const postWithHeaders = (endpoint, data, customHeaders) => {
    return api
      .post(endpoint, data, {
        headers: {
          ...api.defaults.headers,
          ...customHeaders, // Thêm các headers tùy chỉnh ở đây
        },
      })
      .then((response) => response.data)
      .catch((error) => {
        throw new Error(`POST request to ${endpoint} failed: ${error.message}`);
      });
  };

  const putWithHeaders = (endpoint, data, customHeaders) => {
    return api
      .put(endpoint, data, {
        headers: {
          ...api.defaults.headers,
          ...customHeaders, // Thêm các headers tùy chỉnh ở đây
        },
      })
      .then((response) => response.data)
      .catch((error) => {
        throw new Error(`PUT request to ${endpoint} failed: ${error.message}`);
      });
  };

  return {
    get,
    getWithData,
    getWithQuery,
    post,
    postWithHeaders,
    put,
    putWithHeaders
  };
};

export default createAxios;
