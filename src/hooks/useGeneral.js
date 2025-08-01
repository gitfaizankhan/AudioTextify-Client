import { useState } from "react";
import { useNavigate } from "react-router-dom";

const useGeneral = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  return {
    navigate,
    loading,
    setLoading,
  };
};

export default useGeneral;
