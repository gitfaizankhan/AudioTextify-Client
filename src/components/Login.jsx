import React, { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FcGoogle } from "react-icons/fc";
import useGeneral from "../hooks/useGeneral";
import apis from "../utils/apis";
import httpAction from "../utils/httpAction";
import { loginWithGoogle } from "../utils/loginWithGoogle";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { navigate, loading, setLoading } = useGeneral();

  const initialState = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string().required("Email is required").email("Invalid email"),
    password: Yup.string().required("Password is required"),
  });

  const submitHandler = async (values) => {
    setLoading(true);
    const result = await httpAction({
      url: apis().loginUser,
      method: "POST",
      body: values,
    });
    setLoading(false);
    if (result?.success) {
      navigate("/profile");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-600 p-2 rounded-full">
            <div className="w-6 h-6 bg-white rounded-full" />
          </div>
        </div>
        <h2 className="text-center text-2xl font-bold text-gray-900 mb-6">
          Sign in to your account
        </h2>

        <Formik
          initialValues={initialState}
          validationSchema={validationSchema}
          onSubmit={submitHandler}
        >
          {({ errors, touched, handleChange, handleBlur, values }) => (
            <Form className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.email}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                {touched.email && errors.email && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.email}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.password}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                {touched.password && errors.password && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.password}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate("/password/forgot")}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition duration-150"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>

              <div className="relative flex items-center my-4">
                <div className="flex-grow border-t border-gray-300" />
                <span className="mx-2 text-gray-400 text-sm">
                  Or continue with
                </span>
                <div className="flex-grow border-t border-gray-300" />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={loginWithGoogle}
                  className="flex-1 flex items-center justify-center py-2 border rounded-md shadow-sm text-sm font-medium bg-white hover:bg-gray-50"
                >
                  <FcGoogle className="text-xl mr-2" />
                  Google
                </button>
              </div>
            </Form>
          )}
        </Formik>

        <p className=" pt-6 mt-6 text-center text-sm text-gray-500">
          Not a member?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-indigo-600 font-medium hover:underline"
          >
            Signup Here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
