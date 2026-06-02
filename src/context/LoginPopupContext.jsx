import React, { createContext, useContext, useState } from "react";

const LoginPopupContext = createContext(undefined);

export const LoginPopupProvider = ({ children }) => {
  const [loginPopupOpen, setLoginPopupOpen] = useState(false);
  const [afterLoginCallback, setAfterLoginCallback] = useState(null);

  const openLoginPopup = (callback) => {
    if (callback) {
      setAfterLoginCallback(() => callback); // store callback
    }
    setLoginPopupOpen(true);
  };

  const closeLoginPopup = () => {
    setLoginPopupOpen(false);
  };

  return (
    <LoginPopupContext.Provider
      value={{
        loginPopupOpen,
        openLoginPopup,
        closeLoginPopup,
        afterLoginCallback,
        setAfterLoginCallback,
      }}
    >
      {children}
    </LoginPopupContext.Provider>
  );
};

export const useLoginPopup = () => {
  const context = useContext(LoginPopupContext);

  if (!context) {
    throw new Error("useLoginPopup must be used within LoginPopupProvider");
  }

  return context;
};
