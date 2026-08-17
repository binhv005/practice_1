import { useEffect, useState } from "react";

import { Info } from "lucide-react";

function SystemToast({ message, show }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) {
      setVisible(false);
      return;
    }

    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, [show]);

  return (
    <div
      className={`
        absolute
        top-32
        left-1/2
        -translate-x-1/2
        z-30
        bg-[#2f3131]
        text-white
        px-6
        py-3
        rounded-full
        shadow-lg
        flex
        items-center
        gap-2
        transition-all
        duration-500
        pointer-events-none
        whitespace-nowrap
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"}
      `}
    >
      <Info size={20} className="text-red-400" />

      <span className="text-sm">{message}</span>
    </div>
  );
}

export default SystemToast;
