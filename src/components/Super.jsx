import React, { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import apis from "../utils/apis";
import httpAction from "../utils/httpAction";

const Super = () => {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const access = async () => {
      const data = {
        url: apis().getAccess,
      };
      setLoading(true);
      const result = await httpAction(data);
      if (result?.status) {
        setLoading(false);
        setIsAuth(true);
      } else {
        setLoading(false);
      }
    };
    access();
  }, []);

  if (loading) {
    return <span>wait...</span>;
  }
  if (!isAuth) {
    return <Navigate to="/login" />;
  } else {
    return <Outlet />;
  }
};

export default Super;
