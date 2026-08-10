function App() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      {/* Khung chứa card */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden max-w-sm w-full p-6 border border-slate-200">
        {/* Tiêu đề test */}
        <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold mb-1">
          Kiểm tra Tailwind CSS
        </div>

        <h2 className="text-xl font-bold text-slate-800 mb-2">
          MacBook Air M4 (Test Card)
        </h2>

        <p className="text-slate-600 text-sm mb-4">
          Nếu bạn nhìn thấy giao diện có bo góc, đổ bóng, màu sắc và căn chỉnh
          đẹp mắt như một chiếc thẻ thực thụ, tức là Tailwind đã hoạt động thành
          công! 🚀
        </p>

        {/* Nút bấm test hiệu ứng hover */}
        <button className="w-full bg-indigo-600 text-white font-medium py-2.5 px-4 rounded-xl hover:bg-indigo-700 transition duration-200 shadow-sm">
          Xác nhận thành công
        </button>
      </div>
    </div>
  );
}

export default App;
