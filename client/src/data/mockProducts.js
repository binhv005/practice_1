const mockProducts = [
  {
    id: 1,
    title: "Samsung Galaxy A56",
    description: "Điện thoại còn sử dụng tốt",
    category: "Điện thoại",

    images: ["https://example.com/samsung.jpg"],

    address: {
      province: "TP. Hồ Chí Minh",
      ward: "Phường Linh Chiểu",
    },

    featured: true,
    interestCount: 12,
  },

  {
    id: 2,
    title: "Laptop Lenovo ThinkPad",
    description: "Laptop dùng cho sinh viên",
    category: "Laptop",

    images: ["https://example.com/thinkpad.jpg"],

    address: {
      province: "TP. Hồ Chí Minh",
      ward: "Phường Linh Chiểu",
    },

    featured: false,
    interestCount: 8,
  },

  {
    id: 3,
    title: "Áo khoác",
    description: "Áo khoác còn mới",
    category: "Thời trang",

    images: ["https://example.com/aokhoac.jpg"],

    address: {
      province: "TP. Hồ Chí Minh",
      ward: "Phường Thủ Đức",
    },

    featured: false,
    interestCount: 4,
  },
];

export default mockProducts;
