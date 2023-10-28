// @ts-nocheck
import Button from "../Button";
import stopRecording from "../../assets/stopRecording.svg";

interface StopRecordingButtonProps {
  onClick?: () => void;
}

export default function StopRecordingButton({
  onClick,
}: StopRecordingButtonProps) {
  return <Button type="button" icon={stopRecording} onClick={onClick} />;
}
