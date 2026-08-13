import { useEffect, useState } from "react";

import ProductFilter from "../components/products/ProductFilter";
import ProductTable from "../components/products/ProductTable";
import ProductCard from "../components/products/ProductCard";
import ProductCreateModal from "../components/products/ProductCreateModal";
import ProductDetailModal from "../components/products/ProductDetailModal";

import {
  getProducts,
  createProduct,
  uploadProductImages,
  getProductById,
  updateProduct,
  hideProduct,
} from "../api/productApi";

import { getCategories } from "../api/categoryApi";

function AdminProductPage() {
  // PRODUCTS

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [viewMode, setViewMode] = useState("grid");

  // FILTER

  const [filters, setFilters] = useState({
    keyword: "",
    category: "",
    status: "",
    ward: "",
  });

  // CREATE PRODUCT

  const [showCreateForm, setShowCreateForm] = useState(false);

  const [productForm, setProductForm] = useState({
    title: "",
    description: "",
    category: "",
    images: [],
    address: {
      province: "",
      district: "",
    },
  });

  // IMAGE

  const [selectedImages, setSelectedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);

  // DETAIL

  const [showDetail, setShowDetail] = useState(false);
  const [detailProduct, setDetailProduct] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [updatingFeaturedId, setUpdatingFeaturedId] = useState(null);
  const [hidingId, setHidingId] = useState(null);

  // GET CATEGORIES

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();

        setCategories(response.data.data);
      } catch (error) {
        console.error("Get categories error:", error);
      }
    };

    fetchCategories();
  }, []);

  // GET PRODUCTS

  const fetchProducts = async () => {
    try {
      const response = await getProducts(filters);

      setProducts(response.data.data);
    } catch (error) {
      console.error("Get products error:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  // STATUS

  const getStatusLabel = (status) => {
    switch (status) {
      case "giving":
        return "Đang cho";

      case "processing":
        return "Đang giao dịch";

      case "given":
        return "Đã cho";

      case "hidden":
        return "Đã ẩn";

      default:
        return status || "Không xác định";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "giving":
        return "bg-green-50 text-green-700 border-green-100";

      case "processing":
        return "bg-amber-50 text-amber-700 border-amber-100";

      case "given":
        return "bg-blue-50 text-blue-700 border-blue-100";

      case "hidden":
        return "bg-gray-100 text-gray-500 border-gray-200";

      default:
        return "bg-gray-100 text-gray-500 border-gray-200";
    }
  };

  // FORM

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProductForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;

    setProductForm((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
  };

  // IMAGE

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) {
      return;
    }

    if (files.length > 10) {
      alert("Chỉ được chọn tối đa 10 ảnh");
      return;
    }

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        alert(`File ${file.name} không phải là ảnh`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert(`Ảnh ${file.name} vượt quá 5MB`);
        return;
      }
    }

    setSelectedImages(files);

    const previews = files.map((file) => URL.createObjectURL(file));

    setPreviewImages(previews);

    setProductForm((prev) => ({
      ...prev,
      images: [],
    }));
  };

  const handleUploadImages = async () => {
    if (selectedImages.length === 0) {
      alert("Vui lòng chọn ít nhất một ảnh");
      return;
    }

    try {
      setUploading(true);

      const response = await uploadProductImages(selectedImages);

      console.log("Upload images response:", response.data);

      const imageUrls = response.data.data.imageUrls;

      setProductForm((prev) => ({
        ...prev,
        images: imageUrls,
      }));

      alert(`Upload thành công ${imageUrls.length} ảnh`);
    } catch (error) {
      console.error("Upload images error:", error);

      alert(error.response?.data?.message || "Upload ảnh thất bại");
    } finally {
      setUploading(false);
    }
  };

  // RESET

  const resetForm = () => {
    setProductForm({
      title: "",
      description: "",
      category: "",
      images: [],
      address: {
        province: "",
        district: "",
      },
    });

    setSelectedImages([]);
    setPreviewImages([]);

    const fileInput = document.getElementById("product-images");

    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleCloseCreateForm = () => {
    if (creating || uploading) {
      return;
    }

    resetForm();
    setShowCreateForm(false);
  };

  // CREATE

  const handleCreateProduct = async (e) => {
    e.preventDefault();

    if (!productForm.title.trim()) {
      alert("Vui lòng nhập tên sản phẩm");
      return;
    }

    if (!productForm.description.trim()) {
      alert("Vui lòng nhập mô tả sản phẩm");
      return;
    }

    if (productForm.images.length === 0) {
      alert("Vui lòng upload ảnh sản phẩm");
      return;
    }

    if (!productForm.category) {
      alert("Vui lòng chọn danh mục");
      return;
    }

    if (!productForm.address.ward.trim()) {
      alert("Vui lòng nhập phường");
      return;
    }

    try {
      setCreating(true);

      console.log("Product data:", productForm);

      const response = await createProduct(productForm);

      console.log("Create product response:", response.data);

      alert("Đăng tin thành công");

      resetForm();
      setShowCreateForm(false);

      await fetchProducts();
    } catch (error) {
      console.error("Create product error:", error);

      alert(error.response?.data?.message || "Không thể thêm sản phẩm");
    } finally {
      setCreating(false);
    }
  };

  // DETAIL

  const handleProductClick = async (product) => {
    try {
      setLoadingDetail(true);
      setShowDetail(true);
      setDetailProduct(null);

      const response = await getProductById(product._id);

      setDetailProduct(response.data.data);
    } catch (error) {
      console.error("Get product detail error:", error);

      alert(
        error.response?.data?.message || "Không thể lấy thông tin sản phẩm",
      );

      setShowDetail(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  // FEATURED

  const handleToggleFeatured = async (product) => {
    if (!product) {
      return;
    }

    try {
      setUpdatingFeaturedId(product._id);

      const newFeatured = !product.featured;

      await updateProduct(product._id, {
        featured: newFeatured,
      });

      setProducts((prevProducts) =>
        prevProducts.map((item) =>
          item._id === product._id
            ? {
                ...item,
                featured: newFeatured,
              }
            : item,
        ),
      );

      // Nếu sản phẩm đang mở trong Detail Modal
      setDetailProduct((prev) => {
        if (!prev || prev._id !== product._id) {
          return prev;
        }

        return {
          ...prev,
          featured: newFeatured,
        };
      });

      alert(
        newFeatured
          ? "Đã đánh dấu sản phẩm nổi bật"
          : "Đã bỏ đánh dấu sản phẩm nổi bật",
      );
    } catch (error) {
      console.error("Update featured error:", error);

      alert(
        error.response?.data?.message ||
          "Không thể cập nhật trạng thái nổi bật",
      );
    } finally {
      setUpdatingFeaturedId(null);
    }
  };

  // HIDE

  const handleHideProduct = async (product) => {
    if (!product) {
      return;
    }

    if (product.status === "processing") {
      alert("Sản phẩm đang có giao dịch phát sinh, không thể ẩn trực tiếp");
      return;
    }

    if (product.status === "hidden") {
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc muốn ẩn sản phẩm "${product.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setHidingId(product._id);

      await hideProduct(product._id);

      setProducts((prevProducts) =>
        prevProducts.map((item) =>
          item._id === product._id
            ? {
                ...item,
                status: "hidden",
              }
            : item,
        ),
      );

      // Nếu sản phẩm đang mở trong Detail Modal
      setDetailProduct((prev) => {
        if (!prev || prev._id !== product._id) {
          return prev;
        }

        return {
          ...prev,
          status: "hidden",
        };
      });

      alert("Cập nhật thành công, thông báo đã được gửi cho chủ bài viết");
    } catch (error) {
      console.error("Hide product error:", error);

      alert(error.response?.data?.message || "Không thể ẩn sản phẩm");
    } finally {
      setHidingId(null);
    }
  };

  // RENDER

  return (
    <div
      className="
    min-h-screen
    bg-gradient-to-br
    from-[#fffdf5]
    via-[#faf9f5]
    to-[#f4f6f8]
  "
    >
      {/* PAGE HEADER */}
      <header
        className="
    border-b border-yellow-100
    bg-gradient-to-r
    from-[#fff8df]
    via-[#fffaf0]
    to-white
  "
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* LEFT - Page information */}
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <span>Quản trị</span>
                <span>/</span>
                <span className="text-gray-600">Sản phẩm</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Quản lý sản phẩm
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Quản lý các tin đăng và sản phẩm trên hệ thống.
              </p>
            </div>

            {/* RIGHT - Admin actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Notification */}
              <button
                type="button"
                className="
            relative
            w-11 h-11
            flex items-center justify-center
            rounded-xl
            text-gray-600
            hover:text-[#d99d00]
            hover:bg-[#fff7df]
            transition
          "
                title="Thông báo"
              >
                {/* Bell icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 0 1-5.714 0
              M18 8.25a6 6 0 0 0-12 0c0 7.007-3 7.007-3 9.75
              h18c0-2.743-3-2.743-3-9.75
              M13.73 21a2 2 0 0 1-3.46 0"
                  />
                </svg>

                {/* Notification badge */}
                <span
                  className="
              absolute
              top-2
              right-2
              min-w-[16px]
              h-4
              px-1
              rounded-full
              bg-red-500
              text-white
              text-[10px]
              font-bold
              flex items-center justify-center
              border-2 border-white
            "
                >
                  3
                </span>
              </button>

              {/* Message */}
              <button
                type="button"
                className="
            relative
            w-11 h-11
            flex items-center justify-center
            rounded-xl
            text-gray-600
            hover:text-[#d99d00]
            hover:bg-[#fff7df]
            transition
          "
                title="Tin nhắn"
              >
                {/* Message icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 9.75h6.75
              M8.625 13.5h4.5
              M21 12c0 4.556-4.03 8.25-9 8.25
              a9.76 9.76 0 0 1-3.807-.763L3 20.25l1.267-3.8
              A8.178 8.178 0 0 1 3 12
              c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                  />
                </svg>

                {/* Message badge */}
                <span
                  className="
              absolute
              top-2
              right-2
              w-2
              h-2
              rounded-full
              bg-red-500
              border-2 border-white
            "
                />
              </button>

              {/* Divider */}
              <div className="hidden sm:block w-px h-9 bg-yellow-200 mx-1" />

              {/* Admin information */}
              <div className="flex items-center gap-3">
                {/* Name + role */}
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-gray-900 leading-5">
                    Bình Võ
                  </p>

                  <p className="text-xs text-gray-500">Administrator</p>
                </div>

                {/* Avatar */}
                <button
                  type="button"
                  className="
              w-11 h-11
              rounded-full
              bg-[#ffba00]
              hover:bg-[#eaaa00]
              flex items-center justify-center
              text-gray-900
              font-bold
              text-sm
              shadow-sm
              ring-2 ring-white
              transition
            "
                  title="Tài khoản"
                >
                  BV
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* MAIN */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        {/* FILTER */}
        <ProductFilter
          filters={filters}
          setFilters={setFilters}
          categories={categories}
        />

        {/* TOOLBAR */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">
                Danh sách sản phẩm
              </h2>

              <span className="px-2 py-0.5 rounded-md bg-yellow-100 text-gray-600 text-xs font-semibold">
                {products.length}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Các tin đăng hiện có trên hệ thống
            </p>
          </div>

          {/* VIEW SWITCH */}
          <div className="inline-flex self-start sm:self-auto p-1 bg-white border border-gray-200 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`
                inline-flex
                items-center
                gap-2
                h-8
                px-3
                rounded-lg
                text-xs
                sm:text-sm
                font-semibold
                transition
                ${
                  viewMode === "grid"
                    ? "bg-[#fff3d1] text-gray-900"
                    : "text-gray-500 hover:bg-gray-50"
                }
              `}
            >
              <span>▦</span>
              Lưới
            </button>

            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`
                inline-flex
                items-center
                gap-2
                h-8
                px-3
                rounded-lg
                text-xs
                sm:text-sm
                font-semibold
                transition
                ${
                  viewMode === "table"
                    ? "bg-[#fff3d1] text-gray-900"
                    : "text-gray-500 hover:bg-gray-50"
                }
              `}
            >
              <span>☷</span>
              Danh sách
            </button>
          </div>
        </div>

        {/* PRODUCTS */}
        {products.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl py-16 px-5 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#fff3d1] flex items-center justify-center text-2xl">
              📦
            </div>

            <h3 className="mt-4 font-bold text-gray-900">Chưa có sản phẩm</h3>

            <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
              Không tìm thấy sản phẩm phù hợp. Thử thay đổi bộ lọc hoặc đăng một
              tin mới.
            </p>

            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="
                mt-5
                h-10
                px-5
                rounded-xl
                bg-[#ffba00]
                hover:bg-[#eaaa00]
                text-gray-900
                text-sm
                font-bold
                transition
              "
            >
              + Đăng tin mới
            </button>
          </div>
        ) : (
          <>
            {/* GRID */}
            {viewMode === "grid" && (
              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  lg:grid-cols-3
                  xl:grid-cols-4
                  gap-4
                "
              >
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onClick={() => handleProductClick(product)}
                    getStatusLabel={getStatusLabel}
                    getStatusClass={getStatusClass}
                  />
                ))}
              </div>
            )}

            {/* TABLE */}
            {viewMode === "table" && (
              <ProductTable
                products={products}
                onProductClick={handleProductClick}
                onToggleFeatured={handleToggleFeatured}
                onHideProduct={handleHideProduct}
                updatingFeaturedId={updatingFeaturedId}
                hidingId={hidingId}
              />
            )}
          </>
        )}
      </main>
      {/* CREATE MODAL */}
      {showCreateForm && (
        <ProductCreateModal
          productForm={productForm}
          categories={categories}
          selectedImages={selectedImages}
          previewImages={previewImages}
          uploading={uploading}
          creating={creating}
          handleChange={handleChange}
          handleAddressChange={handleAddressChange}
          handleImageChange={handleImageChange}
          handleUploadImages={handleUploadImages}
          handleCreateProduct={handleCreateProduct}
          handleCloseCreateForm={handleCloseCreateForm}
        />
      )}
      {/* DETAIL MODAL */}
      {showDetail && (
        <ProductDetailModal
          detailProduct={detailProduct}
          loadingDetail={loadingDetail}
          updatingFeatured={detailProduct?._id === updatingFeaturedId}
          hiding={detailProduct?._id === hidingId}
          getStatusLabel={getStatusLabel}
          getStatusClass={getStatusClass}
          handleToggleFeatured={() => handleToggleFeatured(detailProduct)}
          handleHideProduct={() => handleHideProduct(detailProduct)}
          onClose={() => setShowDetail(false)}
        />
      )}
    </div>
  );
}

export default AdminProductPage;
