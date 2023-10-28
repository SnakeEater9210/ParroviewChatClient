interface ButtonProps {
  type?: string;
  icon?: string;
  onClick?: () => void;
  disabled: boolean;
  className: string;
  style?: React.CSSProperties;
}

export default function Button({
  type = "button",
  icon,
  onClick,
  disabled,
  className,
  style,
}: ButtonProps) {
  return (
    <button
      type={type as "button" | "submit" | "reset" | undefined}
      onClick={onClick}
      className={className}
      disabled={disabled}
      style={style}
    >
      <img src={icon} alt="Button Icon" />
    </button>
  );
}
