import { h, Component, render, RenderableProps } from "preact";
import * as _ from "lodash";
import Axios from "axios";
import { createPortal } from "preact/compat";
import { useState, useEffect } from "preact/hooks";
import { INSTA_IFAME_ID, INSTA_IFRAME_URL } from "../../ultis/constant";
import { signin, verifyToken } from "./actionVeryfiToken";
import Spin from "../../components/Spin/Spin";
import "./styles.scss";

export interface AppBakeryProps {
  clientId: string;
  instaIdProps: string;
  onDestroy: () => void;
}

function AppBakery({ clientId, instaIdProps, onDestroy }: AppBakeryProps) {
  // === USESTATE === //
  const [isVerify, setIsVerify] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [isOpenModal, setOpenModal] = useState(false);
  const [isPostMessageDone, setPostMessageDone] = useState(false);
  const [instaId, setInstaId] = useState(instaIdProps);

  const instaFeedData = () => (window as any).InstafeedHubTokens || {};

  // === HANDLE === //
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setPostMessageDone(false);
    onDestroy();
  };

  const verifyTokenAndLogin = async () => {
    if (!instaFeedData() || _.isEmpty(instaFeedData())) {
      return setVerifyError("Oop! InstafeedHubTokens could not Empty.");
    }
    setIsVerify(true);

    const { accessToken } = instaFeedData();
    if (!accessToken) {
      const msg = await signin(instaFeedData());
      if (typeof msg === "string" && !!msg) {
        setVerifyError(msg);
      }
      if (typeof msg === "object") {
        //  === update lai bien window de nhung component khac su dung luon === //
        (window as any).InstafeedHubTokens = {
          ...(window as any).InstafeedHubTokens,
          ...msg,
        };
      }
    } else {
      const verifyRes = await verifyToken(instaFeedData());
      if (typeof verifyRes === "string" && !!verifyRes) {
        setVerifyError(verifyRes);
      }
      if (typeof verifyRes === "object") {
        //  === update lai bien window de nhung component khac su dung luon === //
        (window as any).InstafeedHubTokens = {
          ...(window as any).InstafeedHubTokens,
          ...verifyRes,
        };
      }
    }

    setIsVerify(false);
    return;
  };

  const handlePostMessage = () => {
    const iframeWeb = document.getElementById(INSTA_IFAME_ID) as any;
    if (!iframeWeb) return;
    const wn = iframeWeb.contentWindow;
    let payloadData = instaFeedData();
    if (!!instaId) {
      payloadData = {
        ...instaFeedData(),
        args: {
          id: instaId,
        },
      };
    }

    wn.postMessage({ type: "LOGIN", payload: payloadData }, INSTA_IFRAME_URL);

    setPostMessageDone(true);
  };

  const onIframeLoaded = () => {
    if (isPostMessageDone) return;
    handlePostMessage();
  };

  async function handleReceiveFromIframe(event) {
    if (
      (window as any).InstafeedHubClientIdActive !== clientId ||
      !event.data.type
    ) {
      return;
    }
    if (
      !event.data.type.includes("CREATE-ITEM") &&
      !event.data.type.includes("UPDATE-ITEM")
    ) {
      return;
    }

    if (event.data.payload.status.includes("success")) {
      const bodyFormData = new FormData();
      bodyFormData.append("instaId", event.data.payload.id);
      bodyFormData.append("instaTitle", event.data.payload.title);
      bodyFormData.append("widgetID", clientId);
      bodyFormData.append("action", "save_instagram_widget");
      const config = {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      };
      try {
        const aaa = await Axios.post(
          (window as any).ajaxurl,
          bodyFormData,
          config
        );
        // setInstaId(event.data.payload.id);
        // setinstaTitle(event.data.payload.title);
        window.postMessage(
          {
            type: "FE_INSTA_BACKERY_DATA",
            payload: {
              id: event.data.payload.id,
              title: event.data.payload.title,
            },
          },
          location.origin
        );
      } catch (error) {
        console.log({ error });
      }

      setTimeout(() => {
        handleCloseModal();
      }, 500);
    }
    return;
  }

  // === HANDLE === //
  const handleClickBtnConnect = (e?: any) => {
    if (e) e.preventDefault();
    (window as any).InstafeedHubClientIdActive = clientId;
    handleOpenModal();
    verifyTokenAndLogin();
  };

  // === USER EFFECT === //
  useEffect(() => {
    //
    handleClickBtnConnect();
    window.addEventListener("message", handleReceiveFromIframe);
    return () => {
      window.removeEventListener("message", handleReceiveFromIframe);
    };
  }, []);

  const renderLoading = () => {
    return <Spin />;
  };

  const renderError = () => {
    return (
      <p
        className="wilBlogError"
        style={{
          padding: 30,
          fontSize: 22,
        }}
      >
        {verifyError}
      </p>
    );
  };

  const renderIframe = () => {
    if (isVerify) return renderLoading();
    if (!!verifyError) return renderError();
    return (
      <iframe
        onLoad={onIframeLoaded}
        id={INSTA_IFAME_ID}
        src={INSTA_IFRAME_URL}
        frameBorder="0"
      />
    );
  };

  const modalContainer = document.querySelector("#modals");
  const renderModal = () => {
    return createPortal(
      <div className="wilMyModalContainer">
        <div className="wilMyModal__btnClose" onClick={handleCloseModal}>
          &times;
        </div>
        <div className="wilApp__modalContent">{renderIframe()}</div>
      </div>,
      modalContainer
    );
  };

  return <div className="wilAppBakery">{isOpenModal && renderModal()}</div>;
}

export default AppBakery;
