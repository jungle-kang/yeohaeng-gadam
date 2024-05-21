import React from "react";

export default function Cursor({ color, x, y }) {
  return (
    <svg
      style={{
        position: "absolute",
        pointerEvents: "none",
        transform: `translateX(${x}px) translateY(${y}px)`,
        zIndex: 10,
        transition: "all 0.2s",
      }}
      // width="24"
      // height="36"
      width="36"
      height="54"
      viewBox="0 0 24 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
        fill={color}
      />
    </svg>
  );
}