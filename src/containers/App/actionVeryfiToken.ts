import Axios from "axios";
import handleError from "../../ultis/handleError";

const customAxios = Axios.create({
  baseURL: "https://instafeedhub.com/wp-json/instafeedhub/v1",
});

const hanldePostAjaxAccesstockenToServer = async (data: {
  accessToken: string;
  refreshToken: string;
}) => {
  // === ko su dung customAxios ...
  const bodyFormData = new FormData();
  bodyFormData.append("accessToken", data.accessToken);
  bodyFormData.append("refreshToken", data.refreshToken);
  bodyFormData.append("action", "instafeedhub_save_tokens");

  const config = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
  await Axios.post((window as any).ajaxurl, bodyFormData, config);
};

const hanldePostAjaxForRenewToken = async (data = {}) => {
  // === ko su dung customAxios ...
  const bodyFormData = new FormData();
  // bodyFormData.append('accessToken', data.accessToken);
  // bodyFormData.append('refreshToken', data.refreshToken);
  bodyFormData.append("action", "instafeedhub_get_access_tokens");

  const config = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
  const res = await Axios.post((window as any).ajaxurl, bodyFormData, config);
  return res;
};

const getTimeStampModules9 = () => {
  // lay timestap + 1 ngay roi chia cho 9 lay phan nguyen
  const d = new Date();
  const nextDay = d.getTime() + 1000 * 60 * 60 * 24;
  const modulus = nextDay - (nextDay % 9);
  return modulus;
};

async function signin(data) {
  try {
    const response = await customAxios.post("/wp-customer/signin ", {
      ...data,
      variation: "instafeedhub",
      createdAt: getTimeStampModules9(),
    });

    if (response.status === 200) {
      hanldePostAjaxAccesstockenToServer(response.data);
      return response.data;
    } else {
      return response.status + " - Some went error!";
    }
  } catch (error) {
    return handleError(error) || " Some went error!";
  }
}

async function verifyToken(data) {
  try {
    const resVerifyToken = await customAxios.post("/verify-token", {
      ...data,
      variation: "instafeedhub",
    });
    if (resVerifyToken.status === 200) {
      // return resVerifyToken.data.data;
      return {};
    }
    return JSON.stringify(resVerifyToken.data);
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        try {
          const ajaxRes = await hanldePostAjaxForRenewToken(data);
          if (ajaxRes.data.success) {
            return ajaxRes.data.data;
          } else {
            if (!ajaxRes.data.data.error) {
              return JSON.stringify(ajaxRes.data.data);
            }
            if (typeof ajaxRes.data.data.error.msg === "string") {
              return ajaxRes.data.data.error.msg;
            }
            return JSON.stringify(ajaxRes.data.data.error);
          }
        } catch (error) {
          return handleError(error);
        }
      }
    }

    return handleError(error);
  }

  return;
}

export { signin, verifyToken };
