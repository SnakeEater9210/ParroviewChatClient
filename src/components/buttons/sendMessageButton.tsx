import Button from "../Button";
import sendMessage from "../../assets/sendMessage.svg";

interface SendMessageButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function SendMessageButton({
  onClick,
  disabled = false,
  className = "",
}: SendMessageButtonProps) {
  return (
    <Button
      type="submit"
      icon={sendMessage}
      onClick={onClick}
      disabled={disabled}
      className={className}
    />
  );
}
