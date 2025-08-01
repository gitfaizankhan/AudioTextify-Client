import toast from "react-hot-toast";

const httpAction = async (data) => {
  try {
    const response = await fetch(data.url, {
      method: data.method ? data.method : "GET",
      body: data.body ? JSON.stringify(data.body) : null,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      const status = response.status;
      const error = new Error(result?.message);
      error.status = status;
      throw error;
    }

    return result;
  } catch (error) {
    error?.status !== 403 && toast.error(error.message);
    console.log(error.message)
  }
};

export default httpAction;
