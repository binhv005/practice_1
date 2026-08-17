export const conversations = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCuVitYJ0qiGZ3rD0x_DbeBuZHIIl4pIfAL6vtPG5iH7-yMSEsmQCgLcV7Zvo3knko8pswCA5j6mLJTWTj1Cmg0pHpgsZhlW_jS4fBkRWWYkdnMT7jCj3Onbt-ZWd4QKQ7VpmWL0n4F4W0x7OMKcf7tx0cndj5_lHLfTGCnD1V-_rK578ICUymMVxkSMwdMQ_WY2iOmGWObMl_q142SXpmLD291wqTZYa20jNVB4-TPC8srtFOPydOt",
    lastMessage: "Tuyệt quá! Khoảng 5h chiều...",
    time: "09:50",
    online: true,
    unread: 0,
    active: true,
  },
  {
    id: 2,
    name: "Trần Thị B",
    avatar: null,
    avatarLetter: "T",
    avatarClass: "bg-sky-100 text-sky-700",
    lastMessage: "Bạn có fix giá thêm không ạ?",
    time: "Hôm qua",
    online: false,
    unread: 0,
    active: false,
  },
  {
    id: 3,
    name: "Lê Văn C",
    avatar: null,
    avatarLetter: "L",
    avatarClass: "bg-pink-100 text-pink-700",
    lastMessage: "Cảm ơn bạn nhé!",
    time: "2 ngày trước",
    online: false,
    unread: 1,
    active: false,
  },
];

export const messages = [
  {
    id: 1,
    type: "system",
    content: "Hôm nay, 09:41",
  },

  {
    id: 2,
    sender: "other",
    type: "text",
    content:
      "Chào bạn, máy ảnh này còn hoạt động tốt không ạ? Mình qua lấy chiều nay được không?",
    time: "09:41",
  },

  {
    id: 3,
    sender: "me",
    type: "text",
    content:
      "Chào bạn, máy vẫn chụp ảnh bình thường nha. Flash hơi yếu chút xíu thôi.",
    time: "09:45",
    status: "seen",
  },

  {
    id: 4,
    sender: "me",
    type: "image",
    image:
      "https://lh3.googleusercontent.com/aida/AP1WRLvgrDQHHre3sWNBcQqMoBNTG37RlX9e9qwlH6xWpYV7yUTjUoXCrny8bTkO7pz8knbL5hrJlXl1Irg2c83I8A6QjXrdJYYDDplZGEjqK2x0RLDTaBRKXMEAKYdUXZy3Kx_shrtYos1gCtag0DgLJltWhkRipDornS0RaGjlDKrNJ2sxyiJjDmKFXHVau-C94lrVStiMXbzlddIs-_2rGE5iELkz5vqpKiwksAw7LNo0OjZs2vHJNIfMLg",
    alt: "Ảnh thực tế máy ảnh",
    time: "09:46",
    status: "seen",
  },

  {
    id: 5,
    sender: "other",
    type: "text",
    content: "Tuyệt quá! Khoảng 5h chiều mình ghé qua nhé.",
    time: "09:50",
  },

  {
    id: 6,
    sender: "me",
    type: "text",
    content: "Ok bạn nhé.",
    time: "09:52",
    status: "seen",
    seenText: "Đã xem lúc 09:52",
  },
];

export const currentProduct = {
  id: 1,
  name: "Máy ảnh Vintage",
  location: "Quận 1, TP. HCM",
  image:
    "https://lh3.googleusercontent.com/aida/AP1WRLvgrDQHHre3sWNBcQqMoBNTG37RlX9e9qwlH6xWpYV7yUTjUoXCrny8bTkO7pz8knbL5hrJlXl1Irg2c83I8A6QjXrdJYYDDplZGEjqK2x0RLDTaBRKXMEAKYdUXZy3Kx_shrtYos1gCtag0DgLJltWhkRipDornS0RaGjlDKrNJ2sxyiJjDmKFXHVau-C94lrVStiMXbzlddIs-_2rGE5iELkz5vqpKiwksAw7LNo0OjZs2vHJNIfMLg",
};
