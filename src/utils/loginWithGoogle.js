export const loginWithGoogle = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  window.location.href = `${baseUrl}auth/google`;
};
