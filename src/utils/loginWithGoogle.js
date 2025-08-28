export const loginWithGoogle = () => {
  const baseUrl = process.env.REACT_APP_BASE_URL;
  window.location.href = `${baseUrl}auth/google`;
};
