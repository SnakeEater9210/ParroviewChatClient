// @ts-nocheck
import Button from "../Button";
import keyboard from "../../assets/keyboard.svg";

interface KeyboardButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  style?: any;
}

export default function KeyboardButton({
  onClick,
  disabled,
  style,
}: KeyboardButtonProps) {
  return (
    <Button
      type="button"
      icon={keyboard}
      disabled={disabled}
      onClick={onClick}
      style={style}
    />
  );
}
