import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bookmark, Heart, MapPin } from "lucide-react";
import { getSavedProducts, unsaveProduct } from "../api/savedProductApi";

function SavedProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    loadSavedProducts();
  }, [page]);

  const loadSavedProducts = async () => {
    try {
      setLoading(true);
      const response = await getSavedProducts(page, 12);

      if (response.success) {
        setProducts(response.products || []);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error("Load saved products error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (productId, event) => {
    event.stopPropagation();

    try {
      const response = await unsaveProduct(productId);

      if (response.success) {
        // Remove product from list
        setProducts((prev) => prev.filter((p) => p._id !== productId));
      }
    } catch (error) {
      console.error("Unsave product error:", error);
      alert("Không thể bỏ lưu sản phẩm");
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  if (loading && page === 1) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-[#ffba00] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <button
              onClick={() => navigate("/")}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition"
              aria-label="Quay lại"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Tin đã lưu
              </h1>
              <p className="text-sm text-gray-500">
                {pagination?.total || 0} sản phẩm
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
              <Bookmark size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có tin đã lưu
            </h3>
            <p className="text-gray-500 mb-6">
              Lưu các sản phẩm yêu thích để xem lại sau
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-[#ffba00] text-gray-900 font-medium rounded-lg hover:bg-[#e6a800] transition"
            >
              Khám phá sản phẩm
            </button>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  onClick={() => handleProductClick(product._id)}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden group"
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Không có ảnh
                      </div>
                    )}

                    {/* Unsave Button */}
                    <button
                      onClick={(e) => handleUnsave(product._id, e)}
                      className="absolute top-2 right-2 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm transition"
                      aria-label="Bỏ lưu"
                    >
                      <Bookmark
                        size={20}
                        className="text-[#ffba00] fill-[#ffba00]"
                      />
                    </button>

                    {/* Status Badge */}
                    {product.status && product.status !== "giving" && (
                      <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-gray-900/80 text-white text-xs font-medium">
                        {product.status === "given"
                          ? "Đã tặng"
                          : product.status === "processing"
                            ? "Đang xử lý"
                            : "Đã ẩn"}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.title}
                    </h3>

                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <MapPin size={16} />
                      <span className="truncate">{product.address?.ward}</span>
                    </div>

                    {product.category && (
                      <div className="inline-block px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-600">
                        {product.category.name}
                      </div>
                    )}

                    {product.interestCount > 0 && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                        <Heart size={14} />
                        <span>{product.interestCount} quan tâm</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Trước
                </button>

                <span className="text-sm text-gray-600">
                  Trang {page} / {pagination.totalPages}
                </span>

                <button
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={!pagination.hasMore}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SavedProductsPage;
