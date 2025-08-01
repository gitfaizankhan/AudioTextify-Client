import React, { useState } from "react";
import * as Yup from "yup";
import { Formik, Form } from "formik";
import { IoMdPersonAdd } from "react-icons/io";
import { FcGoogle } from "react-icons/fc";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import useGeneral from "../hooks/useGeneral";
import apis from "../utils/apis";
import httpAction from "../utils/httpAction";
import toast from "react-hot-toast";
import { loginWithGoogle } from "../utils/loginWithGoogle";

const Register = () => {
  const [visible, setVisible] = useState(false);
  const { navigate, loading, setLoading } = useGeneral();

  const initialState = {
    name: "",
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Must be a valid email")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Minimum 6 characters long")
      .required("Password is required"),
  });

  const submitHandler = async (values) => {
    const data = {
      url: apis().registerUser,
      method: "POST",
      body: { ...values },
    };
    setLoading(true);
    const result = await httpAction(data);
    setLoading(false);
    if (result?.success) {
      toast.success(result?.message);
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col items-center mb-6">
          <IoMdPersonAdd className="text-4xl text-violet-600" />
          <h2 className="text-2xl font-bold text-gray-800 mt-2">
            Create new account
          </h2>
          <p className="text-sm text-gray-500">Sign up to continue</p>
        </div>

        <Formik
          initialValues={initialState}
          validationSchema={validationSchema}
          onSubmit={submitHandler}
        >
          {({ handleBlur, handleChange, values, touched, errors }) => (
            <Form className="space-y-4">
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Full name"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.name}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.name && touched.name
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-300 focus:ring-violet-300"
                  }`}
                />
                {errors.name && touched.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.email}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.email && touched.email
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-300 focus:ring-violet-300"
                  }`}
                />
                {errors.email && touched.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              <div className="relative">
                <input
                  type={visible ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.password}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.password && touched.password
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-300 focus:ring-violet-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setVisible(!visible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {visible ? <FaEyeSlash /> : <FaEye />}
                </button>
                {errors.password && touched.password && (
                  <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 text-white rounded-md transition ${
                  loading
                    ? "bg-violet-300 cursor-not-allowed"
                    : "bg-violet-600 hover:bg-violet-700"
                }`}
              >
                {loading ? "Loading..." : "Sign up"}
              </button>

              <div className="flex items-center my-4">
                <hr className="flex-grow border-gray-300" />
                <span className="px-2 text-sm text-gray-500">OR</span>
                <hr className="flex-grow border-gray-300" />
              </div>

              <button
                type="button"
                onClick={loginWithGoogle}
                className="w-full py-2 border border-gray-300 rounded-md flex items-center justify-center gap-2 hover:bg-gray-50"
              >
                <FcGoogle className="text-xl" />
                <span className="text-sm text-gray-700">
                  Continue with Google
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full py-2 border border-gray-300 rounded-md flex items-center justify-center gap-2 hover:bg-gray-50 mt-2"
              >
                <FaArrowLeft />
                <span className="text-sm text-gray-700">Back to login</span>
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Register;
