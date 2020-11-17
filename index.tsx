import { h, render } from "preact";
import App from "./src/containers/App/app";
import "./styles.scss";

const fakeData = {
  "instagram-feed-11": {
    buttonID: "id1",
    instagramID: "",
    widgetID: "wg1",
  },
  "instagram-feed-12": {
    buttonID: "id2",
    instagramID: "",
    widgetID: "wg2",
  },
};

// (window as any).instafeedHubElements = fakeData;
const node = document.createElement("div");
node.id = "modals";
document.body.appendChild(node);

function init(widgetID?: string) {
  const instafeedHubElements: Record<
    string,
    {
      buttonID: string;
      instagramID: string;
      widgetID: string;
    }
  > = (window as any).instafeedHubElements;

  const elements = Object.values(instafeedHubElements || {});

  elements.forEach((element) => {
    const item = document.querySelector(`#${element.buttonID}`);
    if (!item) return;
    render(
      <App clientId={element.widgetID} instaId={element.instagramID} />,
      item
    );
    // item.addEventListener("click", () => {
    //   item.classList.add("isClicked");
    //   render(<App clientId={element.widgetID} instaId={element.instagramID} />, item);
    // });
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
