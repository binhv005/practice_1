import { useEffect, useRef, useState } from "react";

function CommunityStats() {
  const stats = [
    {
      value: 1250,
      label: "Sản phẩm được chia sẻ",
      //   icon: "📦",
    },
    {
      value: 3480,
      label: "Lượt trao tặng",
      //   icon: "🤝",
    },
    {
      value: 850,
      label: "Người tham gia",
      //   icon: "👥",
    },
  ];

  const [counts, setCounts] = useState(stats.map(() => 0));

  // Theo dõi phần CommunityStats có xuất hiện trên màn hình hay chưa
  const sectionRef = useRef(null);

  // Đảm bảo animation chỉ chạy 1 lần
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        // Khi CommunityStats xuất hiện trên màn hình
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const duration = 1800;
          const startTime = performance.now();

          const animate = (currentTime) => {
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // Hiệu ứng chạy chậm dần khi gần tới số cuối
            const easeOut = 1 - Math.pow(1 - progress, 3);

            setCounts(stats.map((stat) => Math.floor(stat.value * easeOut)));

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);

          // Không cần theo dõi nữa
          observer.disconnect();
        }
      },
      {
        // Phải nhìn thấy khoảng 25% component mới chạy
        threshold: 0.25,
      },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, [hasAnimated]);

  return (
    <section ref={sectionRef} className="mt-12">
      <div
        className="
          relative
          overflow-hidden
          rounded-3xl
          border
          border-[#f6d66b]
          bg-gradient-to-br
          from-[#fffdf5]
          via-[#fff8df]
          to-[#ffefb0]
          px-5
          py-8
          sm:px-8
          sm:py-9
        "
      >
        {/* Background decoration */}
        <div
          className="
            pointer-events-none
            absolute
            -right-20
            -top-20
            h-48
            w-48
            rounded-full
            bg-[#ffba00]/15
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-24
            -left-16
            h-48
            w-48
            rounded-full
            bg-white/70
          "
        />

        {/* Header */}
        <div className="relative text-center">
          {/* <div
            className="
              mx-auto
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              bg-[#ffba00]
              text-xl
              shadow-sm
            "
          >
            🤝
          </div> */}

          <h2 className="mt-3 text-xl font-bold text-gray-900 sm:text-2xl">
            Cộng đồng đang cùng nhau chia sẻ
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500">
            Mỗi món đồ được trao đi là một hành động nhỏ tạo nên giá trị lớn cho
            cộng đồng.
          </p>
        </div>

        {/* Stats */}
        <div
          className="
            relative
            mt-8
            grid
            grid-cols-1
            gap-3
            sm:grid-cols-3
          "
        >
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="
                group
                rounded-2xl
                border
                border-[#f3df9d]
                bg-white/80
                px-5
                py-5
                text-center
                shadow-sm
                backdrop-blur-sm
                transition
                duration-200
                hover:-translate-y-1
                hover:border-[#ffba00]
                hover:bg-white
                hover:shadow-md
              "
            >
              {/* Icon */}
              {/* <div
                className="
                  mx-auto
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#fff3c4]
                  text-xl
                  transition
                  group-hover:bg-[#ffba00]
                "
              >
                {stat.icon}
              </div> */}

              {/* Number */}
              <p
                className="
                  mt-3
                  text-3xl
                  font-extrabold
                  tracking-tight
                  text-[#d99a00]
                  sm:text-4xl
                "
              >
                {counts[index].toLocaleString("vi-VN")}+
              </p>

              {/* Label */}
              <p className="mt-1 text-sm font-medium text-gray-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom message */}
        <div
          className="
            relative
            mx-auto
            mt-7
            flex
            w-fit
            items-center
            gap-2
            rounded-full
            border
            border-[#f3d477]
            bg-white/70
            px-4
            py-2
            text-xs
            font-medium
            text-gray-600
          "
        >
          {/* <span className="text-[#ffba00]">✨</span> */}

          <span>Cùng nhau tạo nên một cộng đồng tốt đẹp hơn</span>
        </div>
      </div>
    </section>
  );
}

export default CommunityStats;
