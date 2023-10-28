// @ts-nocheck
import Button from "../Button";
import microphonePrimary from "../../assets/microphonePrimary.svg";

interface MicrophoneButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  style?: any;
}

export default function MicrophoneButton({
  onClick,
  disabled,
  style,
}: MicrophoneButtonProps) {
  return (
    <Button
      type="button"
      icon={microphonePrimary}
      disabled={disabled}
      onClick={onClick}
      style={style}
    />
  );
}
