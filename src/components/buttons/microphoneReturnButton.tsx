// @ts-nocheck
import Button from "../Button";
import microphoneReturn from "../../assets/microphoneReturn.svg";

interface MicrophoneReturnButtonProps {
  onClick?: () => void;
}

export default function MicrophoneReturnButton({
  onClick,
}: MicrophoneReturnButtonProps) {
  return <Button type="button" icon={microphoneReturn} onClick={onClick} />;
}
