import { ArrowLeft, MoreVertical } from "lucide-react";

function ChatHeader({ conversation, onBack }) {
  const name =
    conversation?.fullname ||
    conversation?.name ||
    "Người dùng";

  const avatar = conversation?.avatar || "";

  const avatarLetter = (name || "U").charAt(0).toUpperCase();

  const avatarClass =
    conversation?.avatarClass || "bg-[#ffba00] text-[#1a1c1c]";

  const isOnline =
    conversation?.online ?? (conversation?.status === "active" || false);

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-4 bg-white shadow-sm z-20 shrink-0">
      <div className="flex items-center gap-3">
        {/* Mobile back */}
        <button
          type="button"
          onClick={onBack}
          className="
            md:hidden
            p-2
            -ml-2
            rounded-full
            hover:bg-[#eeeeee]
            transition
          "
          aria-label="Quay lại"
        >
          <ArrowLeft size={24} />
        </button>

        {/* Avatar */}
        <div className="relative w-10 h-10 shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-full h-full rounded-full object-cover bg-[#e8e8e8]"
            />
          ) : (
            <div
              className={`
                w-full
                h-full
                rounded-full
                flex
                items-center
                justify-center
                font-bold
                ${avatarClass}
              `}
            >
              {avatarLetter}
            </div>
          )}

          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          )}
        </div>

        {/* User info */}
        <div className="flex flex-col min-w-0">
          <h2 className="text-base font-semibold truncate">
            {name}
          </h2>

          <span className="text-xs text-green-600 mt-1">
            {isOnline ? "Đang hoạt động" : "Không hoạt động"}
          </span>
        </div>
      </div>
    </header>
  );
}

export default ChatHeader;
