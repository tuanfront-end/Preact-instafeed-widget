import { h, render } from "preact";
import App from "./src/containers/App/app";
import AppBakery from "./src/containers/App/appBakery";
import "./styles.scss";

const fakeData = {
  "instagram-feed-11": {
    buttonID: "id1",
    instagramID: "sffsefs",
    widgetID: "wg1",
    instagramTitle: "wg1",
  },
  "instagram-feed-12": {
    buttonID: "id2",
    instagramID: "fseffe",
    widgetID: "wg2",
    instagramTitle: "wg2",
  },
};

// (window as any).instafeedHubElements = fakeData;
const node = document.createElement("div");
node.id = "modals";
document.body.appendChild(node);

// === widget === //
function init(widgetID?: string) {
  const instafeedHubElements: Record<
    string,
    {
      buttonID: string;
      instagramID: string;
      widgetID: string;
      instagramTitle: string;
    }
  > = (window as any).instafeedHubElements;

  const elements = Object.values(instafeedHubElements || {});
  elements.forEach((element) => {
    const item = document.querySelector(`#${element.buttonID}`);
    if (!item) return;

    render(
      <App
        clientId={element.widgetID}
        instaTitleProps={element.instagramTitle}
        instaIdProps={element.instagramID}
      />,
      item
    );
  });
}
init();

window.addEventListener("message", (e) => {
  if (e.origin !== location.origin) return;
  if (e.data.type === "ADD_INSTA_WIDGET") {
    init(e.data.payload.widgetID);
  }
  if (e.data.type === "DELETE_INSTA_WIDGET") {
    init();
  }
});

// === initBakery === //
function initBakery(instaID?: string, instaTitle?: string) {
  const wrap = document.querySelector("#vc_ui-panel-edit-element");
  const rootInit = document.querySelector("#wilElementInstaBakery");
  if (!rootInit) {
    const root = document.createElement("div");
    root.id = "wilElementInstaBakery";
    wrap.appendChild(root);
  }
  const handleDestroy = () => {
    render(null, document.querySelector("#wilElementInstaBakery"));
  };
  render(
    <AppBakery
      onDestroy={handleDestroy}
      clientId="elementInstaBakery"
      instaIdProps={instaID || ""}
    />,
    document.querySelector("#wilElementInstaBakery")
  );
}

window.addEventListener("message", (e) => {
  if (e.origin !== location.origin) return;
  if (e.data.type && e.data.type.includes("ADD_INSTA_BAKERY")) {
    initBakery(e.data.payload.instaID, e.data.payload.instaTitle);
  }
  if (e.data.type === "DELETE_INSTA_BAKERY") {
    console.log("DELETE_INSTA_BAKERY");
  }
});

// === initElementor === //
function initElementor(instaID?: string, instaTitle?: string) {
  const wrap = document.body;
  const rootInit = document.querySelector("#wilElementInstaElementor");
  if (!rootInit) {
    const root = document.createElement("div");
    root.id = "wilElementInstaElementor";
    wrap.appendChild(root);
  }
  const handleDestroy = () => {
    render(null, document.querySelector("#wilElementInstaElementor"));
  };
  render(
    <AppBakery
      onDestroy={handleDestroy}
      clientId="elementInstaBakery"
      instaIdProps={instaID || ""}
    />,
    document.querySelector("#wilElementInstaElementor")
  );
}

window.addEventListener("message", (e) => {
  if (e.origin !== location.origin) return;
  if (e.data.type && e.data.type.includes("ADD_INSTA_ELEMENTOR")) {
    initElementor(e.data.payload.instaID, e.data.payload.instaTitle);
  }
  if (e.data.type === "DELETE_INSTA_ELEMENTOR") {
    console.log("DELETE_INSTA_ELEMENTOR");
  }
});
