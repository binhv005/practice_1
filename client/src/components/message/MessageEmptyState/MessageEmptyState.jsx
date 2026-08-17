import { ArrowRight, Headphones, ShieldCheck } from "lucide-react";

import { useNavigate } from "react-router-dom";

import EmptyStateIllustration from "./EmptyStateIllustration";

function MessageEmptyState() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div
      className="
        relative
        w-full
        h-full
        min-h-[600px]
        flex
        items-center
        justify-center
        overflow-hidden
        bg-[#f9f9f9]
        px-4
        py-12
      "
    >
      {/* ========================================= */}
      {/* DECORATIVE BACKGROUND                     */}
      {/* ========================================= */}

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Circle 1 */}
        <div
          className="
            absolute
            w-[220px]
            h-[220px]
            rounded-full
            bg-[#61de8a]/10
            blur-2xl
            -top-20
            left-[10%]
            animate-background-float
          "
        />

        {/* Circle 2 */}
        <div
          className="
            absolute
            w-[300px]
            h-[300px]
            rounded-full
            bg-[#ffba00]/10
            blur-3xl
            bottom-[-120px]
            right-[5%]
            animate-background-float-reverse
          "
        />

        {/* Circle 3 */}
        <div
          className="
            absolute
            w-[140px]
            h-[140px]
            rounded-full
            bg-[#ffdea6]/20
            blur-2xl
            top-[35%]
            right-[20%]
            animate-pulse-slow
          "
        />

        {/* Decorative dotted line */}
        <div
          className="
            absolute
            top-[20%]
            right-[10%]
            w-20
            h-20
            border-t-2
            border-dashed
            border-[#ffba00]/20
            rounded-full
            rotate-45
          "
        />

        <div
          className="
            absolute
            bottom-[20%]
            left-[8%]
            w-16
            h-16
            border-b-2
            border-dashed
            border-[#60de8a]/20
            rounded-full
            -rotate-45
          "
        />
      </div>

      {/* ========================================= */}
      {/* MAIN CONTENT                              */}
      {/* ========================================= */}

      <div
        className="
          relative
          z-10
          flex
          flex-col
          items-center
          text-center
          w-full
          max-w-[560px]
          px-6
          py-8
          md:px-12
          md:py-12
        "
      >
        {/* ========================================= */}
        {/* ILLUSTRATION                              */}
        {/* ========================================= */}

        <EmptyStateIllustration />

        {/* ========================================= */}
        {/* TEXT                                      */}
        {/* ========================================= */}

        <div className="flex flex-col gap-3 mb-8">
          <h2
            className="
              text-2xl
              md:text-3xl
              font-bold
              tracking-tight
              text-[#1a1c1c]
            "
          >
            Bạn chưa có cuộc trò chuyện nào!
          </h2>

          <p
            className="
              text-base
              md:text-lg
              leading-7
              text-[#504532]
              max-w-[460px]
              mx-auto
            "
          >
            Trải nghiệm chat để làm rõ thông tin về mặt hàng trước khi bắt đầu
            thực hiện mua bán.
          </p>
        </div>

        {/* ========================================= */}
        {/* BUTTON                                    */}
        {/* ========================================= */}

        <button
          type="button"
          onClick={handleGoHome}
          className="
            group
            relative
            inline-flex
            items-center
            justify-center
            gap-2
            w-full
            sm:w-auto
            min-w-[190px]
            px-7
            py-3.5
            rounded-full
            bg-[#ffba00]
            text-[#271900]
            font-semibold
            shadow-md
            overflow-hidden
            transition-all
            duration-300
            hover:bg-[#ffcb3d]
            hover:shadow-lg
            hover:-translate-y-0.5
            active:translate-y-0
          "
        >
          <span className="relative z-10 flex items-center gap-2">
            Về trang chủ
            <ArrowRight
              size={20}
              strokeWidth={2}
              className="
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            />
          </span>

          {/* Shimmer */}
          <span
            className="
              absolute
              inset-0
              bg-white/25
              -skew-x-12
              -translate-x-full
              group-hover:animate-shimmer
            "
          />
        </button>

        {/* ========================================= */}
        {/* TRUST INDICATORS                          */}
        {/* ========================================= */}

        <div
          className="
            mt-8
            pt-6
            border-t
            border-[#eeeeee]
            w-full
            flex
            flex-col
            sm:flex-row
            items-center
            justify-center
            gap-4
            text-sm
            text-[#837560]
          "
        >
          {/* Safe transaction */}
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} strokeWidth={2} className="text-[#60de8a]" />

            <span>Giao dịch an toàn</span>
          </div>

          <span
            className="
              hidden
              sm:block
              w-1
              h-1
              rounded-full
              bg-[#dadada]
            "
          />

          {/* Support */}
          <div className="flex items-center gap-2">
            <Headphones size={18} strokeWidth={2} className="text-[#ffba00]" />

            <span>Hỗ trợ 24/7</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessageEmptyState;
