// @ts-nocheck
import Button from "../Button";
import close from "../../assets/close.svg";

interface CloseButtonProps {
  onClick?: () => void;
}

export default function CloseButton({ onClick }: CloseButtonProps) {
  return <Button type="button" icon={close} onClick={onClick} />;
}
