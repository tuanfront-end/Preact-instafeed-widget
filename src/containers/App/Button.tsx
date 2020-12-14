import { h, Component, render, RenderableProps } from "preact";

interface ButtonProps {
  /** Any CSS color string, from names to hex codes to HSL, HSV or RGB(A) functions */
  color: string;
  /** Callback function which gets called when the user clicks on the button */
  onClick?: (ev: MouseEvent) => void;
  disalbe?: boolean;
  loading?: boolean;
}

function Button({
  color,
  onClick,
  disalbe = false,
  children,
  loading = false,
}: RenderableProps<ButtonProps>) {
  return (
    <button
      className="wilButton"
      style={{
        color: "white",
        background: color,
        padding: "1rem 2rem",
        border: 0,
        cursor: "pointer",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 4,
        width: "100%",
      }}
      onClick={(e) => {
        if (!loading && onClick) onClick(e);
      }}
      disabled={disalbe}
    >
      {children}
    </button>
  );
}

export default Button;
