"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { initBiometryManager, on } from "@telegram-apps/sdk";

interface BiometryContextType {
  isAvailable: boolean;
  granted: boolean;
  requested: boolean;
  supportAuth: boolean;
  supportOpenSetting: boolean;
  supportUpdateToken: boolean;
  tokenSaved: boolean;
  supportRequestAccess: boolean;
  biometryType: string | undefined;
  clearToken: () => Promise<boolean>; // 添加清除 Token 方法
  authenticate: () => Promise<string | null>;
  updateToken: (token: string) => Promise<boolean>;
  requestAccess: () => Promise<boolean>;
  openSetting: () => Promise<void>;
}

const BiometryContext = createContext<BiometryContextType | null>(null);

// Provider component
export const BiometryProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [biometryManager, setBiometryManager] = useState<any>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [granted, setGranted] = useState(false);
  const [requested, setRequested] = useState(false);
  const [supportAuth, setSupportAuth] = useState(false);
  const [supportOpenSetting, setSupportOpenSetting] = useState(false);
  const [supportUpdateToken, setSupportUpdateToken] = useState(false);
  const [supportRequestAccess, setSetRequested] = useState(false);
  const [tokenSaved, setTokenSaved] = useState(false);
  const [biometryType, setBiometryType] = useState<string | undefined>("");
  const [onEvent, setOnEvent] = useState<any>();

  useEffect(() => {
    const removeListener = on("biometry_info_received", (payload) => {
      setOnEvent(onEvent);
      console.log("Viewport changed:", payload);
      alert(payload);
    });
    removeListener();
  }, []);

  useEffect(() => {
    const initializeBiometry = async () => {
      try {
        const [bm] = await initBiometryManager();
        // (await bm).on("change:available", (value: boolean) => {
        //   alert(value);
        //   console.log(value);
        // });
        setBiometryManager(bm);
        setBiometryType((await bm).biometryType);
        setSupportAuth((await bm).supports("auth"));
        setSupportOpenSetting((await bm).supports("openSettings"));
        setSupportUpdateToken((await bm).supports("requestAccess"));
        setSetRequested((await bm).supports("updateToken"));
        setTokenSaved((await bm).tokenSaved);
        setIsAvailable((await bm).available);
        setGranted((await bm).accessGranted);
        setRequested((await bm).accessRequested);

        const handleAccessChange = (value: boolean) => {
          console.log(123123);

          setGranted(value);
        };
        console.log(
          (await bm).on("change:accessGranted", handleAccessChange),
          "123"
        );

        (await bm).on("change:accessGranted", handleAccessChange);
      } catch (error) {
        console.error("BiometryManager 初始化失败:", error);
      }
    };

    initializeBiometry();
  }, []);

  // Authenticate method
  const authenticate = async (): Promise<string | null> => {
    if (!(await biometryManager)) return null;
    try {
      const result = await (
        await biometryManager
      ).authenticate({
        reason: "请通过生物识别验证",
      });

      return result; // Return the authentication token
    } catch (error) {
      alert("openerror");
      console.error("Biometry authentication failed:", error);
      return null;
    }
  };

  // Update token method
  const updateToken = async (token: string): Promise<boolean> => {
    if (!(await biometryManager)) {
      alert("wrong");
      return false;
    }

    try {
      const result = await (await biometryManager).updateToken({ token });
      if (result) {
        setTokenSaved(true);
      }
      alert(result);
      return result; // True if successful
    } catch (error) {
      console.error("Failed to update token:", error);
      return false;
    }
  };

  // Request access method
  const requestAccess = async () => {
    if (await biometryManager) {
      const request = await (await biometryManager).requestAccess();
      return request;
    }
  };
  const openSetting = async () => {
    if (await biometryManager) {
      const opening = await (await biometryManager).openSettings();
      return opening;
    }
  };

  const clearToken = async (): Promise<boolean> => {
    if (!(await biometryManager)) return false;
    try {
      await (await biometryManager).updateToken();
      setTokenSaved(false);
      return true; // 清除成功
    } catch (error) {
      console.error("清除 Token 失败:", error);
      return false;
    }
  };

  return (
    <BiometryContext.Provider
      value={{
        tokenSaved,
        biometryType,
        isAvailable,
        granted,
        requested,
        supportAuth,
        supportOpenSetting,
        supportRequestAccess,
        supportUpdateToken,
        clearToken,
        authenticate,
        updateToken,
        requestAccess,
        openSetting,
      }}
    >
      {children}
    </BiometryContext.Provider>
  );
};

// Custom hook to use biometry
export const useBiometry = () => {
  const context = useContext(BiometryContext);
  if (!context) {
    throw new Error("useBiometry must be used within a BiometryProvider");
  }
  return context;
};
