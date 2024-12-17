"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { initBiometryManager, on, type BiometryManager } from "@telegram-apps/sdk";

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
  authenticate: () => Promise<string | undefined>;
  updateToken: (token: string) => Promise<boolean>;
  requestAccess: () => Promise<boolean>;
  openSetting: () => Promise<void>;
}

const BiometryContext = createContext<BiometryContextType | null>(null);

// Provider component
export const BiometryProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [biometryManager, setBiometryManager] = useState<null | BiometryManager>(null);
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
    // removeListener();
    const removeBiometryAuthRequestListeners = on(
      "biometry_auth_requested",
      ({ status, token }) => {
        console.log("Biometry authentication request complete:", status, token);
      }
    );

    const removeBiometryInfoListeners = on(
      "biometry_info_received",
      (result) => {
        if (result.available) {
          const {
            available,
            access_requested,
            access_granted,
            device_id,
            token_saved,
            type,
          } = result;
          console.log(
            "Biometry settings were received:",
            available,
            access_requested,
            access_granted,
            device_id,
            token_saved,
            type
          );
        } else {
          console.log("Biometry settings were received:", result.available);
        }
      }
    );
      return ()=>{
        removeBiometryAuthRequestListeners()
        removeBiometryInfoListeners()
      }
  }, []);

  useEffect(() => {
    const initializeBiometry = async () => {
      try {
        const [bm] = initBiometryManager();
        const bmInstance = await bm
        // bmInstance.on("change:available", (value: boolean) => {
        //   alert(value);
        //   console.log(value);
        // });
        setBiometryManager(bmInstance);
        setBiometryType(bmInstance.biometryType);
        setSupportAuth(bmInstance.supports("auth"));
        setSupportOpenSetting(bmInstance.supports("openSettings"));
        setSupportUpdateToken(bmInstance.supports("requestAccess"));
        setSetRequested(bmInstance.supports("updateToken"));
        setTokenSaved(bmInstance.tokenSaved);
        setIsAvailable(bmInstance.available);
        setGranted(bmInstance.accessGranted);
        setRequested(bmInstance.accessRequested);

        const handleAccessChange = (value: boolean) => {
          console.log(123123);

          setGranted(value);
        };
        console.log(
          bmInstance.on("change:accessGranted", handleAccessChange),
          "123"
        );

        bmInstance.on("change:accessGranted", handleAccessChange);
      } catch (error) {
        console.error("BiometryManager 初始化失败:", error);
      }
    };

    initializeBiometry();


  }, []);

  // Authenticate method
  const authenticate = async (): Promise<string | undefined> => {
    if (!(biometryManager)) return undefined;
    try {
      const result = await biometryManager.authenticate({
        reason: "请通过生物识别验证",
      });

      return result; // Return the authentication token
    } catch (error) {
      alert("openerror");
      console.error("Biometry authentication failed:", error);
      return undefined;
    }
  };

  // Update token method
  const updateToken = async (token: string): Promise<boolean> => {
    if (!biometryManager) {
      alert("wrong");
      return false;
    }

    try {
      const result = await biometryManager.updateToken({ token });
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
    if (biometryManager) {
      const request = await biometryManager.requestAccess();
      return request;
    }else{
      return false
    }
  };
  const openSetting = async () => {
    if (biometryManager) {
      const opening = await biometryManager.openSettings();
      return opening;
    }
  };

  const clearToken = async (): Promise<boolean> => {
    if (!biometryManager) return false;
    try {
      await biometryManager.updateToken();
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
