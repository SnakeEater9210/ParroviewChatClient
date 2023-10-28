// @ts-nocheck
import { useState, useEffect, useRef } from "react";

interface TextAreaProps {
  placeholder?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  value?: string;
  shouldSetBorderColour?: boolean;
  onFocus?: () => void;
  centerAlignPlaceholder?: boolean;
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export default function TextArea({
  placeholder,
  onChange,
  value,
  shouldSetBorderColour,
  onFocus,
  centerAlignPlaceholder,
  onKeyDown,
}: TextAreaProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [height, setHeight] = useState("3rem"); // set initial height
  const textAreaRef = useRef(null);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [window.innerWidth]);

  useEffect(() => {
    setHeight(`${textAreaRef.current?.scrollHeight}px`);
  }, [value]);

  const handleInput = (e) => {
    if (e.target.value !== "") {
      setHeight(`${e.target.scrollHeight}px`);
    } else {
      setHeight("3rem"); // return to initial height when all text is removed
    }
  };

  const styleObj = {
    borderColor: `${shouldSetBorderColour ? "#FC9C16" : "initial"}`,
    height: `${
      isMobile
        ? parseInt(height) > window.innerHeight * 0.2
          ? window.innerHeight * 0.2
          : height
        : height
    }`,
    overflowY: `${
      isMobile
        ? parseInt(height) > window.innerHeight * 0.2
          ? "scroll"
          : "hidden"
        : "hidden"
    }`,
  };

  return (
    <textarea
      ref={textAreaRef}
      className={`${
        isMobile ? "overflow-y-scroll" : "resize-none"
      } w-full resize-none border rounded ${
        centerAlignPlaceholder
          ? "placeholder-red-300 text-center"
          : "placeholder-gray-400"
      }`}
      placeholder={placeholder}
      onKeyDown={onKeyDown}
      value={value ? value : ""}
      onChange={onChange}
      onInput={handleInput}
      onFocus={onFocus}
      style={styleObj}
    ></textarea>
  );
}
