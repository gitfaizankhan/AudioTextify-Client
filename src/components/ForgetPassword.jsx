// Import necessary modules and components
import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup"; // For input validation
import toast from "react-hot-toast"; // For user feedback
import { FaArrowRotateRight } from "react-icons/fa6"; // Icon for the heading
import useGeneral from "../hooks/useGeneral"; // Custom hook for navigation and loading state
import apis from "../utils/apis"; // API endpoint helper
import httpAction from "../utils/httpAction"; // HTTP action handler
import { FaArrowLeft, FaPaperPlane } from "react-icons/fa";

const ForgetPassword = () => {
  // Destructure required functions from custom hook
  const { navigate, loading, setLoading } = useGeneral();

  // Define initial form state
  const initialState = {
    email: "",
  };

  // Define Yup validation schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Must be a valid email")
      .required("Email is required"),
  });

  // Handle form submission
  const submitHandler = async (values) => {
    const data = {
      url: apis().forgetPassword, // API endpoint
      method: "POST",
      body: { email: values.email }, // Payload
    };

    setLoading(true); // Start loader
    const result = await httpAction(data); // Make API request
    setLoading(false); // Stop loader

    // Handle response
    if (result?.success) {
      toast.success(result?.message); // Show success toast
      navigate("/otp/verify"); // Redirect to OTP verification page
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md mt-10">
      {/* Initialize Formik form */}
      <Formik
        initialValues={initialState}
        validationSchema={validationSchema}
        onSubmit={submitHandler}
      >
        {({ handleChange, handleBlur, values, touched, errors }) => (
          <Form className="space-y-6">
            {/* Heading section */}
            <div className="flex flex-col items-center gap-1">
              <FaArrowRotateRight className="text-2xl text-blue-600" />
              <p className="text-lg font-semibold">Find your account</p>
              <span className="text-sm text-gray-500">
                Enter your registered email
              </span>
            </div>

            {/* Email input field */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Registered Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 ${
                    touched.email && errors.email
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-300 focus:ring-blue-300"
                  }`}
                />
                {/* Email icon */}
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  @
                </span>
              </div>
              {/* Email validation error */}
              {touched.email && errors.email && (
                <div className="text-sm text-red-600 mt-1">{errors.email}</div>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-60"
            >
              {/* Show loader or button text */}
              {loading ? (
                <span className="loader-small" />
              ) : (
                <>
                  Send OTP
                  <FaPaperPlane className="text-sm" />
                </>
              )}
            </button>

            {/* Back to login button */}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-100 transition"
            >
              <FaArrowLeft className="text-sm" />
              Back to Login
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ForgetPassword;
