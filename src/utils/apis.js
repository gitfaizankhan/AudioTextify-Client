const apis = () => {
  const local = "http://localhost:8080/api/v1/";
  // const live = "https://user-google-auth-server.vercel.app/";

  const list = {
    loginUser: `${local}users/login`,
    registerUser: `${local}users/register`,
    getUserProfile: `${local}users/current-user`,
    getAccess: `${local}users/access`,
    logout: `${local}users/logout`,
    forgetPassword: `${local}users/password/forget`,
    verifyOtp: `${local}users/otp/verify`,
    getOtpExpTime: `${local}users/otp/exp`,
    upadtePassword: `${local}users/password/update`,

    transcribeAudio: `${local}audio/transcribe`,
    getallfiles: `${local}audio/allfile`,
    modifyFileName: (id) => `${local}audio/modify/${id}`,
    deleteFile: (id) => `${local}audio/delete/${id}`,
  };

  return list;
};

export default apis;
