import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { MdOutlineVerified } from "react-icons/md";
import Countdown from "react-countdown";
import useGeneral from "../hooks/useGeneral";
import apis from "../utils/apis";
import httpAction from "../utils/httpAction";
import toast from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa6";

const Verification = () => {
  const { navigate, loading, setLoading } = useGeneral();
  const [otpTime, setOtpTime] = useState(2 * 60 * 1000);
  const [user, setUser] = useState("");

  const initialState = {
    otp1: "",
    otp2: "",
    otp3: "",
    otp4: "",
    otp5: "",
    otp6: "",
  };

  const validationSchema = Yup.object(
    Object.fromEntries(
      Array.from({ length: 6 }).map((_, i) => [
        `otp${i + 1}`,
        Yup.string().required(),
      ])
    )
  );

  const otpInputs = ["otp1", "otp2", "otp3", "otp4", "otp5", "otp6"];

  const otpChangeHandler = (value, setFieldValue, item, index) => {
    setFieldValue(item, value);
    if (value && index >= 1 && index < 6) {
      const element = document.getElementById(`${index + 1}`);
      if (element) {
        setTimeout(() => element.focus(), 30);
      }
    }
  };

  const getOtpTime = async () => {
    setLoading(true);
    const result = await httpAction({ url: apis().getOtpExpTime });
    setLoading(false);
    if (result?.status) {
      setOtpTime(result.time);
      setUser(result.email);
    }
  };

  const submitHandler = async (values) => {
    const otp = Object.values(values).join("");
    setLoading(true);
    const result = await httpAction({
      url: apis().verifyOtp,
      method: "POST",
      body: { otp },
    });
    setLoading(false);
    if (result?.status) {
      toast.success(result.message);
      navigate("/password/change");
    }
  };

  const resendOtpHandler = async () => {
    setLoading(true);
    const result = await httpAction({
      url: apis().forgetPassword,
      method: "POST",
      body: { email: user },
    });
    setLoading(false);
    if (result?.status) {
      toast.success(result.message);
      getOtpTime();
    }
  };

  useEffect(() => {
    getOtpTime();
    setTimeout(() => {
      document.getElementById("1")?.focus();
    }, 100);
  }, []);

  return (
    <Formik
      initialValues={initialState}
      validationSchema={validationSchema}
      onSubmit={submitHandler}
    >
      {({
        values,
        handleChange,
        handleBlur,
        touched,
        errors,
        setFieldValue,
      }) => (
        <Form className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md mt-10">
          <div className="flex flex-col items-center text-center mb-6">
            <MdOutlineVerified className="text-3xl text-green-600 mb-1" />
            <p className="text-lg font-semibold">Verify OTP</p>
            <span className="text-sm text-gray-500">
              Enter the 6-digit OTP we just sent to your registered email
            </span>
          </div>

          <div className="flex justify-center gap-2 mb-4">
            {otpInputs.map((item, index) => (
              <input
                key={index}
                id={`${index + 1}`}
                name={item}
                value={values[item]}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  otpChangeHandler(val, setFieldValue, item, index + 1);
                }}
                onBlur={handleBlur}
                maxLength={1}
                type="text"
                className={`w-10 h-10 text-center border rounded-md text-lg outline-none ${
                  touched[item] && errors[item]
                    ? "border-red-500"
                    : "border-gray-300 focus:ring-2 focus:ring-blue-400"
                }`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={Object.values(values).some((v) => v === "") || loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-60 mb-2"
          >
            {loading ? <span className="loader-small" /> : <>Verify</>}
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-100 transition mb-3"
          >
            <FaArrowLeft className="text-sm" />
            Back to Login
          </button>

          <div className="text-center">
            {loading ? (
              <span className="loader-small mx-auto" />
            ) : (
              <Countdown
                date={Date.now() + otpTime}
                renderer={({ minutes, seconds, completed }) =>
                  completed ? (
                    <button
                      type="button"
                      onClick={resendOtpHandler}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Resend OTP
                    </button>
                  ) : (
                    <span className="text-sm text-gray-500">
                      Resend in {minutes}:
                      {seconds < 10 ? `0${seconds}` : seconds}
                    </span>
                  )
                }
              />
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default Verification;
