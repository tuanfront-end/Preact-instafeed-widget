import { h, Component, render, RenderableProps } from "preact";
import * as _ from "lodash";
import Axios from "axios";
import Button from "./Button";
import Modal from "./Modal";
import { createPortal } from "preact/compat";
import { useState, useEffect } from "preact/hooks";
import { INSTA_IFAME_ID, INSTA_IFRAME_URL } from "../../ultis/constant";
import { signin, verifyToken } from "./actionVeryfiToken";
import "./styles.scss";
import Spin from "../../components/Spin/Spin";
import InstaIconSvg from "./InstaIconSvg";

export interface AppProps {
  clientId: string;
  instaIdProps: string;
  instaTitleProps: string;
}

function App({ clientId, instaIdProps, instaTitleProps }: AppProps) {
  // === USESTATE === //
  const [isVerify, setIsVerify] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [isOpenModal, setOpenModal] = useState(false);
  const [isPostMessageDone, setPostMessageDone] = useState(false);

  const [instaId, setInstaId] = useState(instaIdProps);
  const [instaTitle, setinstaTitle] = useState(instaTitleProps);

  const instaFeedData = () => (window as any).InstafeedHubTokens || {};

  useEffect(() => {}, []);

  // === HANDLE === //
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setPostMessageDone(false);
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
        setInstaId(event.data.payload.id);
        setinstaTitle(event.data.payload.title);
      } catch (error) {
        console.log({ error });
      }

      setTimeout(() => {
        handleCloseModal();
      }, 500);
    }
    return;
  }

  // === USER EFFECT === //
  useEffect(() => {
    //
    window.addEventListener("message", handleReceiveFromIframe);
    return () => {
      window.removeEventListener("message", handleReceiveFromIframe);
    };
  }, []);

  // === HANDLE === //
  const handleClickBtnConnect = (e: any) => {
    if (e) e.preventDefault();
    (window as any).InstafeedHubClientIdActive = clientId;
    handleOpenModal();
    verifyTokenAndLogin();
  };

  const renderLoading = () => {
    return <Spin />;
  };

  const renderError = () => {
    return <p className="wilBlogError">{verifyError}</p>;
  };

  const modalContainer = document.querySelector("#modals");

  const renderModal = () => {
    return createPortal(
      <Modal onClose={handleCloseModal}>
        <div className="wilApp__modalContent">
          <iframe
            onLoad={onIframeLoaded}
            id={INSTA_IFAME_ID}
            src={INSTA_IFRAME_URL}
            frameBorder="0"
          />
        </div>
      </Modal>,
      modalContainer
    );
  };

  return (
    <div className="wilApp">
      <Button
        loading={isVerify}
        disalbe={isVerify}
        color="green"
        onClick={handleClickBtnConnect}
      >
        <div style={{ marginBottom: 4 }}>
          <InstaIconSvg />
        </div>
        {instaId ? instaTitle || "Click to edit" : `Connect to Instagram`}
        {instaId && ` (${instaId})`}
      </Button>
      {isVerify && renderLoading()}
      {!!verifyError && !isVerify && renderError()}
      {isOpenModal && !isVerify && !verifyError && renderModal()}
    </div>
  );
}

export default App;
