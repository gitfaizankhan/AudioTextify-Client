import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { MdOutlineUpdate } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";
import useGeneral from "../hooks/useGeneral";
import apis from "../utils/apis";
import httpAction from "../utils/httpAction";
import toast from "react-hot-toast";

const NewPassword = () => {
  const { navigate, loading, setLoading } = useGeneral();

  const initialState = { password: "" };

  const validationSchema = Yup.object({
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const submitHandler = async (values) => {
    const data = {
      url: apis().upadtePassword,
      method: "POST",
      body: { password: values.password },
    };
    try {
      setLoading(true);
      const result = await httpAction(data);
      if (result?.status) {
        toast.success(result?.message);
        navigate("/login");
      } else {
        toast.error(result?.message || "Something went wrong");
      }
    } catch (error) {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-2 mb-4 text-xl font-semibold text-blue-600">
          <MdOutlineUpdate size={24} />
          <span>Change Password</span>
        </div>

        <p className="text-sm text-gray-500 mb-6">Create a new password</p>

        <Formik
          initialValues={initialState}
          validationSchema={validationSchema}
          onSubmit={submitHandler}
        >
          {({ handleChange, handleBlur, values, errors, touched }) => (
            <Form className="space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.password}
                  className={`mt-1 block w-full px-3 py-2 border text-sm rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                    errors.password && touched.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  placeholder="Enter new password"
                />
                {errors.password && touched.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                  disabled={loading}
                >
                  {loading && (
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                      ></path>
                    </svg>
                  )}
                  <span>Change Password</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100 transition"
                >
                  <IoArrowBack size={18} />
                  Back to Login
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default NewPassword;
