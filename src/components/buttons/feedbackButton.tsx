// @ts-nocheck
import Button from "../Button";
import feedback from "../../assets/feedback.svg";

interface FeedbackButtonProps {
  onClick?: () => void;
}

export default function FeedbackButton({ onClick }: FeedbackButtonProps) {
  return <Button type="button" icon={feedback} onClick={onClick} />;
}
