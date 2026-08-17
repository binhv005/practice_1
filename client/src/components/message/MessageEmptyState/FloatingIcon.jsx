import { MessageCircle, MessagesSquare, Mail, Heart } from "lucide-react";

const iconMap = {
  chat_bubble: MessageCircle,
  forum: MessagesSquare,
  mail: Mail,
  favorite: Heart,
};

function FloatingIcon({
  icon,
  className = "",
  animation = "animate-float",
  delay = "0s",
}) {
  const IconComponent = iconMap[icon];

  if (!IconComponent) {
    console.warn(`FloatingIcon: icon "${icon}" không tồn tại.`);
    return null;
  }

  return (
    <div
      className={`
        absolute
        pointer-events-none
        ${animation}
        ${className}
      `}
      style={{
        animationDelay: delay,
      }}
    >
      <IconComponent
        className="
          w-[42px]
          h-[42px]
          md:w-[52px]
          md:h-[52px]
          drop-shadow-sm
        "
        strokeWidth={2}
      />
    </div>
  );
}

export default FloatingIcon;
