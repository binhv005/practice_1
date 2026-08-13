const benefits = [
  {
    icon: "🤝",
    title: "Chia sẻ dễ dàng",
    description: "Đăng món đồ bạn không còn sử dụng chỉ trong vài bước.",
  },
  {
    icon: "📍",
    title: "Kết nối gần bạn",
    description: "Tìm những món đồ đang được chia sẻ trong khu vực của bạn.",
  },
  {
    icon: "💛",
    title: "Lan tỏa giá trị",
    description:
      "Một món đồ được trao đi có thể tạo ra giá trị cho người khác.",
  },
];

function TrustSection() {
  return (
    <section className="mt-14 sm:mt-16">
      <div
        className="
        grid
        grid-cols-1
        gap-4
        rounded-3xl
        border
        border-gray-200
        bg-white
        p-5
        sm:grid-cols-3
        sm:p-7
      "
      >
        {benefits.map((item) => (
          <div key={item.title} className="flex gap-4">
            <div
              className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-yellow-50
              text-xl
            "
            >
              {item.icon}
            </div>

            <div>
              <h3 className="font-bold text-gray-900">{item.title}</h3>

              <p
                className="
                mt-1
                text-sm
                leading-relaxed
                text-gray-500
              "
              >
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TrustSection;
