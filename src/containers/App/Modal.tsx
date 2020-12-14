import { h, Component, render, RenderableProps } from "preact";

interface ModalProps {
  onClose: () => void;
}

export default function Modal({
  children,
  onClose,
}: RenderableProps<ModalProps>) {
  return (
    <div className="wilMyModalContainer">
      <div className="wilMyModal__btnClose" onClick={onClose}>
        &times;
      </div>
      {children}
    </div>
  );
}
