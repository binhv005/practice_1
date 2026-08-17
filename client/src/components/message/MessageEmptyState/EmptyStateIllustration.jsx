import FloatingIcon from "./FloatingIcon";

function EmptyStateIllustration() {
  return (
    <div className="w-full max-w-[320px] mb-8 relative">
      {/* Glow background */}
      <div
        className="
          absolute
          -inset-6
          rounded-full
          bg-[#ffdea6]
          opacity-30
          blur-3xl
          animate-pulse-slow
        "
      />

      {/* Decorative circle */}
      <div
        className="
          absolute
          inset-[10%]
          rounded-full
          bg-[#ffba00]/10
          animate-float-slow
        "
      />

      {/* Illustration */}
      <img
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsWfMTaKvFqh969aWFJy_RW1jeedCLEjGns6xhHvHWX2X12o3-xQwh52TrtxJfwiCHznonYHi-5ZITetuwlAs91QILFxLAfvP9tjP3ccTooMmtupYADfQRsXxvmX9HPRmWYyE8wcdxdqZUudYxNZFy-Ccj-H2rscZKLT1mConnE2omLVNG4UoUSK3n7tTYDdTRxsx5EFDpvvqlrkUsRPKKCZaqkLnbTRzeDzo17Y2iCiXDo7n2mt1_ELAx93WoxpczzQ"
        alt="Không có cuộc trò chuyện"
        className="
          relative
          z-10
          w-full
          h-auto
          object-contain
          drop-shadow-md
          mix-blend-multiply
          animate-image-float
        "
      />

      {/* Floating chat icon */}
      <FloatingIcon
        icon="chat_bubble"
        delay="0s"
        className="
          top-[8%]
          right-[-8%]
          text-[#ffba00]
          opacity-80
        "
      />

      {/* Floating forum icon */}
      <FloatingIcon
        icon="forum"
        delay="1.2s"
        className="
          bottom-[18%]
          left-[-8%]
          text-[#60de8a]
          opacity-70
        "
      />

      {/* Floating message icon */}
      <FloatingIcon
        icon="mail"
        delay="2.4s"
        className="
          top-[45%]
          right-[-15%]
          text-[#ffbb0c]
          opacity-60
        "
      />

      {/* Floating favorite icon */}
      <FloatingIcon
        icon="favorite"
        delay="3.2s"
        className="
          top-[15%]
          left-[-12%]
          text-[#ffba00]
          opacity-50
        "
      />
    </div>
  );
}

export default EmptyStateIllustration;
