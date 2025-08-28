const apis = () => {
  // use env variable
  const live = process.env.REACT_APP_BASE_URL;

  const list = {
    loginUser: `${live}users/login`,
    registerUser: `${live}users/register`,
    getUserProfile: `${live}users/current-user`,
    getAccess: `${live}users/access`,
    logout: `${live}users/logout`,
    forgetPassword: `${live}users/password/forget`,
    verifyOtp: `${live}users/otp/verify`,
    getOtpExpTime: `${live}users/otp/exp`,
    upadtePassword: `${live}users/password/update`,

    transcribeAudio: `${live}audio/transcribe`,
    getallfiles: `${live}audio/allfile`,
    modifyFileName: (id) => `${live}audio/modify/${id}`,
    deleteFile: (id) => `${live}audio/delete/${id}`,
  };

  return list;
};

export default apis;
