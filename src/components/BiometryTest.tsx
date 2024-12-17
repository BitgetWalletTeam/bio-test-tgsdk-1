"use client";
import React, { useState, useEffect } from "react";
import { initBiometryManager, on } from "@telegram-apps/sdk";
import { useBiometry } from "@/provider/biometryProvider";

const BiometryPasswordManager = () => {
  const {
    authenticate,
    updateToken,
    requestAccess,
    granted,
    requested,
    isAvailable,
    supportAuth,
    supportOpenSetting,
    supportRequestAccess,
    supportUpdateToken,
    openSetting,
    tokenSaved,
    biometryType,
  } = useBiometry();

  const [password, setPassword] = useState("");
  const [savedPassword, setSavedPassword] = useState("");
  const [value, setvalue] = useState<any>();

  // 保存密码到安全存储
  const savePasswordWithBiometry = async () => {
    if (!isAvailable) {
      alert("生物识别功能不可用！");
      return;
    }

    if (!requested) {
      const request = await requestAccess();
      alert("生物识别未授权,打开弹框设置");
      if (request) {
        saveToken();
      }
      //   await openSetting();
      return;
    }
    saveToken();
  };

  const saveToken = async () => {
    if (!password) {
      alert("请输入密码！");
      return;
    }
    try {
      // 使用生物识别保存密码
      const isSaved = await updateToken(password);
      if (isSaved) {
        alert("保存成功");

        const token = await authenticate();
        if (token) {
          alert("验证成功");
        } else {
          await updateToken("");
          alert("验证失败");
        }
      }
    } catch (error) {
      alert("开启失败");
      console.error("保存密码失败:", error);
    }
  };

  // 使用生物识别读取密码
  const readPasswordWithBiometry = async () => {
    console.log(123, "123");
    alert("123");
    if (!isAvailable) {
      alert("生物识别功能不可用！");
      return;
    }
    if (!requested) {
      alert("生物识别未授权,打开弹框设置");
      await requestAccess();
      return;
    }
    alert("进入验证，拿去密22钥");

    const result = await authenticate();
    if (result !== undefined) {
      alert(result);
    } else {
      alert("指纹识别返回空");
    }

    setvalue(result);

    console.log("12223");

    alert("error");

    //   (await biometryManager).openSettings();
    //   alert("生物识别未开启，正在打开设置...");
    return;
  };

  return (
    <div className="p-5">
      <h2>生物识别密码管理</h2>

      {!isAvailable ? (
        <p>生物识别功能不可用，请检查设备设置。</p>
      ) : (
        <>
          {!granted && <p>生物识别未授权，请在设置中开启。</p>}

          {/* 保存密码 */}
          <div className="mb-4">
            <input
              type="password"
              placeholder="请输入要保存的密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={savePasswordWithBiometry}>保存密码</button>
          </div>

          {/* 读取密码 */}
          <div className="mb-4">
            <button onClick={readPasswordWithBiometry}>
              通过生物识别读取密码
            </button>
            {savedPassword && <p>读取到的密码: {savedPassword}</p>}
          </div>
        </>
      )}
      <div>'granted:' {granted ? 1 : 0}</div>
      <div>'request:' {requested ? 1 : 0}</div>
      <div>'value:' {value}</div>
      <div>'supportAuth:' {supportAuth ? 1 : 0}</div>
      <div>'supportOpenSetting:' {supportOpenSetting ? 1 : 0}</div>
      <div>'supportRequestAccess:' {supportRequestAccess ? 1 : 0}</div>
      <div>'supportUpdateToken:' {supportUpdateToken ? 1 : 0}</div>
      <div>'tokenSaved:' {tokenSaved ? 1 : 0}</div>
      <div>'biometryType:' {biometryType}</div>
    </div>
  );
};

export default BiometryPasswordManager;
