import { Truck, Recycle, Gift } from "lucide-react";

const iconMap = {
  recycling: Recycle,
  shipping: Truck,
  gift: Gift,
};

const colorMap = {
  recycling: {
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
  },

  shipping: {
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },

  gift: {
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
};

function FloatingInfoCard({
  type = "gift",
  title,
  subtitle,
  value,
  position = "",
  animationDuration = "4s",
  reverse = false,
}) {
  const Icon = iconMap[type] || Gift;
  const colors = colorMap[type] || colorMap.gift;

  return (
    <div
      className={`
        floating-info-card
        absolute
        z-30

        flex
        items-center
        gap-3

        w-max

        rounded-xl
        bg-white

        p-3
        lg:p-4

        shadow-xl

        ${position}
      `}
      style={{
        animationDuration: animationDuration,
        animationDirection: reverse ? "reverse" : "normal",
      }}
    >
      {/* ICON */}
      <div
        className={`
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center

          rounded-full

          ${colors.iconBg}
          ${colors.iconColor}
        `}
      >
        <Icon size={20} strokeWidth={1.8} />
      </div>

      {/* CONTENT */}
      <div className="flex flex-col">
        {value && (
          <span className="text-sm font-bold leading-tight text-gray-900">
            {value}
          </span>
        )}

        {title && (
          <span className="text-sm font-bold leading-tight text-gray-900">
            {title}
          </span>
        )}

        {subtitle && (
          <span className="mt-0.5 whitespace-nowrap text-xs leading-4 text-gray-500">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}

export default FloatingInfoCard;
