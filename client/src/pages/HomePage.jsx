import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";

import UserHeader from "../components/user/UserHeader";
import CategorySlider from "../components/user/CategorySlider";
import RecommendedProducts from "../components/user/RecommendedProducts";
import UserFooter from "../components/user/UserFooter";
import UserProductDetailModal from "../components/user/UserProductDetailModal";
import CommunityStats from "../components/user/CommunityStats";
import ProductCard from "../components/products/ProductCard";
import HeroSection from "../components/user/HeroSection";
import ProductCreateModal from "../components/products/ProductCreateModal";
import { useSavedProducts } from "../hooks/useSavedProducts";

import {
  LayoutGrid,
  Smartphone,
  Laptop,
  Headphones,
  Home,
  Shirt,
  BookOpen,
  Pencil,
  MoreHorizontal,
  MessageCircle,
} from "lucide-react";

import {
  getProducts,
  createProduct,
  uploadProductImages,
} from "../api/productApi";

import { getCategories } from "../api/categoryApi";

function HomePage() {
  const navigate = useNavigate();

  // =========================================================
  // SAVED PRODUCTS HOOK
  // =========================================================

  const { toggleSave, isSaved } = useSavedProducts();

  // =========================================================
  // BASIC STATE
  // =========================================================

  const [keyword, setKeyword] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [showCreateForm, setShowCreateForm] = useState(false);

  const [loading, setLoading] = useState(false);

  const [products, setProducts] = useState([]);

  const [productCategories, setProductCategories] = useState([]);

  // =========================================================
  // FILTERS
  // =========================================================

  const [filters, setFilters] = useState({
    keyword: "",
    category: "",
    status: "giving",
    ward: "",
  });

  // =========================================================
  // CREATE PRODUCT FORM
  // =========================================================

  const [productForm, setProductForm] = useState({
    title: "",
    description: "",
    category: "",
    images: [],
    address: {
      province: "TP. Hồ Chí Minh",
      ward: "",
    },
  });

  const [selectedImages, setSelectedImages] = useState([]);

  const [previewImages, setPreviewImages] = useState([]);

  const [uploading, setUploading] = useState(false);

  const [creating, setCreating] = useState(false);

  // =========================================================
  // USER ADDRESS
  // =========================================================

  const userAddress = {
    province: "TP. Hồ Chí Minh",
    ward: "Linh Chiểu",
  };

  // =========================================================
  // CATEGORY CONFIG
  // =========================================================

  const categories = useMemo(
    () => [
      {
        name: "Tất cả",
        icon: LayoutGrid,
      },
      {
        name: "Điện thoại",
        icon: Smartphone,
      },
      {
        name: "Laptop",
        icon: Laptop,
      },
      {
        name: "Đồ điện tử",
        icon: Headphones,
      },
      {
        name: "Đồ gia dụng",
        icon: Home,
      },
      {
        name: "Thời trang",
        icon: Shirt,
      },
      {
        name: "Sách",
        icon: BookOpen,
      },
      {
        name: "Đồ dùng học tập",
        icon: Pencil,
      },
      {
        name: "Khác",
        icon: MoreHorizontal,
      },
    ],
    [],
  );

  // =========================================================
  // LOAD PRODUCTS
  // =========================================================

  const loadProducts = useCallback(async (customFilters = {}) => {
    try {
      setLoading(true);

      const requestFilters = {
        status: "giving",
        ...customFilters,
      };

      const response = await getProducts(requestFilters);

      const result = response?.data?.data || [];

      setProducts(result);

      return result;
    } catch (error) {
      console.error("Load products error:", error);

      setProducts([]);

      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // =========================================================
  // LOAD CATEGORIES
  // =========================================================

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getCategories();

        const result = response?.data?.data || [];

        setProductCategories(result);
      } catch (error) {
        console.error("Load categories error:", error);

        setProductCategories([]);
      }
    };

    loadCategories();
  }, []);

  // =========================================================
  // FILTER PRODUCTS BY CATEGORY
  // =========================================================

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "Tất cả") {
      return products;
    }

    return products.filter((product) => {
      const categoryName =
        typeof product.category === "object"
          ? product.category?.name
          : product.category;

      return categoryName === selectedCategory;
    });
  }, [products, selectedCategory]);

  // =========================================================
  // SEARCH
  // =========================================================

  const handleSearch = async ({ keyword: searchKeyword, ward }) => {
    try {
      setLoading(true);

      const normalizedKeyword = searchKeyword?.trim() || "";

      const normalizedWard = ward?.trim() || "";

      const searchFilters = {
        status: "giving",
        keyword: normalizedKeyword,
      };

      if (normalizedWard) {
        searchFilters.ward = normalizedWard;
      }

      const result = await loadProducts(searchFilters);

      setProducts(result);

      setKeyword(normalizedKeyword);

      setFilters((prev) => ({
        ...prev,
        keyword: normalizedKeyword,
        ward: normalizedWard,
        status: "giving",
      }));
    } catch (error) {
      console.error("Search products error:", error);

      setProducts([]);
    }
  };

  // =========================================================
  // CATEGORY CHANGE
  // =========================================================

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // =========================================================
  // CLEAR CATEGORY
  // =========================================================

  const handleClearCategory = () => {
    setSelectedCategory("Tất cả");
  };

  // =========================================================
  // SAVE / UNSAVE PRODUCT
  // =========================================================

  const handleToggleSave = async (productId) => {
    if (!productId) {
      return;
    }

    // Kiểm tra đăng nhập
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      alert("Vui lòng đăng nhập để lưu sản phẩm");
      navigate("/login");
      return;
    }

    try {
      await toggleSave(productId);
    } catch (error) {
      console.error("Toggle save error:", error);
      alert(error?.response?.data?.message || "Không thể lưu sản phẩm");
    }
  };

  // =========================================================
  // PRODUCT DETAIL
  // =========================================================

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseDetail = () => {
    setSelectedProduct(null);
  };

  // =========================================================
  // GO TO MESSAGE PAGE
  // =========================================================

  const handleOpenMessages = () => {
    navigate("/messages");
  };

  // =========================================================
  // CREATE PRODUCT FORM
  // =========================================================

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

  // =========================================================
  // IMAGE SELECT
  // =========================================================

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) {
      return;
    }

    const limitedFiles = files.slice(0, 10);

    setSelectedImages(limitedFiles);

    const previews = limitedFiles.map((file) => URL.createObjectURL(file));

    setPreviewImages(previews);
  };

  // =========================================================
  // UPLOAD IMAGES
  // =========================================================

  const handleUploadImages = async () => {
    if (selectedImages.length === 0) {
      alert("Vui lòng chọn ít nhất 1 ảnh");
      return;
    }

    try {
      setUploading(true);

      const response = await uploadProductImages(selectedImages);

      const uploadedImages = response?.data?.data?.imageUrls || [];

      if (uploadedImages.length === 0) {
        alert("Upload ảnh thất bại: không nhận được URL ảnh");
        return;
      }

      setProductForm((prev) => ({
        ...prev,
        images: uploadedImages,
      }));

      alert(`Upload thành công ${uploadedImages.length} ảnh!`);
    } catch (error) {
      console.error("Upload images error:", error);

      alert(error?.response?.data?.message || "Upload ảnh thất bại!");
    } finally {
      setUploading(false);
    }
  };

  // =========================================================
  // CREATE PRODUCT
  // =========================================================

  const handleCreateProduct = async (e) => {
    e.preventDefault();

    if (!productForm.title.trim()) {
      alert("Vui lòng nhập tên sản phẩm");
      return;
    }

    if (!productForm.category) {
      alert("Vui lòng chọn danh mục");
      return;
    }

    if (!productForm.description.trim()) {
      alert("Vui lòng nhập mô tả sản phẩm");
      return;
    }

    if (!Array.isArray(productForm.images) || productForm.images.length === 0) {
      alert("Vui lòng upload ít nhất 1 ảnh");
      return;
    }

    try {
      setCreating(true);

      const savedUser = localStorage.getItem("user");
      let loggedInUserId = null;
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          loggedInUserId = parsed?._id || parsed?.id;
        } catch (err) {
          console.error("Parse user error:", err);
        }
      }

      const productData = {
        title: productForm.title.trim(),
        description: productForm.description.trim(),
        category: productForm.category,
        images: productForm.images,
        giver: loggedInUserId || undefined,
        status: "giving",
        address: {
          province: productForm.address.province,
          ward: productForm.address.ward,
        },
      };

      const response = await createProduct(productData);

      console.log("Create product response:", response?.data);

      alert("Đăng tin thành công!");

      handleCloseCreateForm();

      // Reset về tất cả sau khi đăng
      setSelectedCategory("Tất cả");

      // Reload danh sách
      await loadProducts({
        status: "giving",

        keyword: filters.keyword,

        ...(filters.ward
          ? {
              ward: filters.ward,
            }
          : {}),
      });
    } catch (error) {
      console.error("Create product error:", error);

      console.error("Backend response:", error?.response?.data);

      alert(error?.response?.data?.message || "Đăng tin thất bại!");
    } finally {
      setCreating(false);
    }
  };

  // =========================================================
  // CLOSE CREATE FORM
  // =========================================================

  const handleCloseCreateForm = () => {
    if (creating || uploading) {
      return;
    }

    setShowCreateForm(false);

    setProductForm({
      title: "",
      description: "",
      category: "",
      images: [],
      address: {
        province: "TP. Hồ Chí Minh",
        ward: "",
      },
    });

    setSelectedImages([]);

    setPreviewImages([]);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fffdf7] via-[#fafafa] to-[#fffaf0]">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <UserHeader
        keyword={keyword}
        setKeyword={setKeyword}
        selectedWard={filters.ward}
        setSelectedWard={(ward) => {
          setFilters((prev) => ({
            ...prev,
            ward,
          }));
        }}
        onSearch={handleSearch}
        onCreatePost={() => setShowCreateForm(true)}
      />

      {/* =====================================================
          HERO
      ===================================================== */}

      <HeroSection />

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto w-full max-w-[1440px] px-4 pb-20 sm:px-6 lg:px-8">
        {/* ===================================================
            QUICK ACTIONS
        =================================================== */}

        <section className="pt-6 sm:pt-8">
          <div
            className="
              flex
              flex-col
              gap-3
              rounded-2xl
              border
              border-yellow-100
              bg-white
              p-4
              shadow-[0_4px_20px_rgba(0,0,0,0.03)]
              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:p-5
            "
          >
            <div>
              <h2 className="font-bold text-gray-900">Cộng đồng cho tặng</h2>

              <p className="mt-1 text-sm text-gray-500">
                Trao đi những món đồ bạn không còn sử dụng.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenMessages}
              className="
                inline-flex
                h-10
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-gray-200
                bg-white
                px-4
                text-sm
                font-semibold
                text-gray-700
                transition
                hover:border-yellow-300
                hover:bg-yellow-50
                hover:text-gray-900
              "
            >
              <MessageCircle size={18} />
              Tin nhắn
            </button>
          </div>
        </section>

        {/* ===================================================
            CATEGORY
        =================================================== */}

        <section className="pt-8 sm:pt-10">
          <div
            className="
              rounded-2xl
              border
              border-yellow-100/80
              bg-white
              p-5
              shadow-[0_4px_20px_rgba(0,0,0,0.03)]
              sm:p-6
            "
          >
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 rounded-full bg-[#ffba00]" />

                <div>
                  <h2 className="text-xl font-bold leading-7 text-gray-900">
                    Khám phá danh mục
                  </h2>

                  <p className="mt-1 text-sm leading-5 text-gray-500">
                    Tìm những món đồ phù hợp với nhu cầu của bạn
                  </p>
                </div>
              </div>
            </div>

            <CategorySlider
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>
        </section>

        {/* ===================================================
            PRODUCTS
        =================================================== */}

        <section className="mt-8 sm:mt-10">
          <div
            className="
              rounded-2xl
              border
              border-gray-100
              bg-white
              p-5
              shadow-[0_4px_20px_rgba(0,0,0,0.03)]
              sm:p-6
            "
          >
            {/* Header */}

            <div
              className="
                mb-7
                flex
                flex-col
                gap-4
                sm:flex-row
                sm:items-end
                sm:justify-between
              "
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 rounded-full bg-[#ffba00]" />

                <div>
                  <h2 className="text-xl font-bold leading-7 text-gray-900">
                    {selectedCategory === "Tất cả"
                      ? "Tin đăng mới"
                      : selectedCategory}
                  </h2>

                  <p className="mt-1 text-sm leading-5 text-gray-500">
                    {loading
                      ? "Đang tải sản phẩm..."
                      : `${filteredProducts.length} sản phẩm được tìm thấy`}
                  </p>
                </div>
              </div>

              {selectedCategory !== "Tất cả" && (
                <button
                  type="button"
                  onClick={handleClearCategory}
                  className="
                    self-start
                    rounded-lg
                    border
                    border-gray-200
                    bg-white
                    px-4
                    py-2
                    text-sm
                    font-medium
                    text-gray-600
                    transition
                    hover:border-yellow-300
                    hover:bg-yellow-50
                    hover:text-gray-900
                    sm:self-auto
                  "
                >
                  Xem tất cả
                </button>
              )}
            </div>

            {/* Product content */}

            {loading ? (
              <LoadingState />
            ) : filteredProducts.length > 0 ? (
              <div
                className="
                  grid
                  grid-cols-2
                  gap-x-4
                  gap-y-6
                  sm:grid-cols-3
                  sm:gap-x-5
                  lg:grid-cols-4
                  xl:grid-cols-5
                "
              >
                {filteredProducts.map((product) => {
                  const productId = product._id || product.id;

                  return (
                    <ProductCard
                      key={productId}
                      product={product}
                      isSaved={isSaved(productId)}
                      onSave={handleToggleSave}
                      onClick={() => handleProductClick(product)}
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
        </section>

        {/* ===================================================
            RECOMMENDED
        =================================================== */}

        <section
          className="
            mt-8
            rounded-2xl
            border
            border-yellow-100
            bg-white
            p-5
            shadow-[0_4px_20px_rgba(0,0,0,0.03)]
            sm:mt-10
            sm:p-6
          "
        >
          <RecommendedProducts
            products={products}
            userAddress={userAddress}
            onProductClick={handleProductClick}
            isSaved={isSaved}
            onSave={handleToggleSave}
          />
        </section>

        {/* ===================================================
            COMMUNITY STATS
        =================================================== */}

        <CommunityStats />
      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <UserFooter />

      {/* =====================================================
          PRODUCT DETAIL
      ===================================================== */}

      {selectedProduct && (
        <UserProductDetailModal
          product={selectedProduct}
          onClose={handleCloseDetail}
          isSaved={isSaved(selectedProduct._id || selectedProduct.id)}
          onSave={() =>
            handleToggleSave(selectedProduct._id || selectedProduct.id)
          }
        />
      )}

      {/* =====================================================
          CREATE PRODUCT
      ===================================================== */}

      {showCreateForm && (
        <ProductCreateModal
          productForm={productForm}
          categories={productCategories}
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
    </div>
  );
}

// ===========================================================
// LOADING STATE
// ===========================================================

function LoadingState() {
  return (
    <div
      className="
        flex
        min-h-[300px]
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        border-gray-100
        bg-white
      "
    >
      <div
        className="
          h-8
          w-8
          animate-spin
          rounded-full
          border-4
          border-gray-200
          border-t-[#ffba00]
        "
      />

      <p className="mt-4 text-sm text-gray-500">Đang tải sản phẩm...</p>
    </div>
  );
}

// ===========================================================
// EMPTY STATE
// ===========================================================

function EmptyState() {
  return (
    <div
      className="
        flex
        min-h-[300px]
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        border-dashed
        border-gray-200
        bg-white
        px-6
        text-center
      "
    >
      <div
        className="
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-full
          bg-yellow-50
          text-2xl
        "
      >
        🔍
      </div>

      <h3 className="mt-4 text-base font-bold text-gray-900">
        Không tìm thấy sản phẩm
      </h3>

      <p className="mt-1 max-w-md text-sm text-gray-500">
        Thử thay đổi từ khóa tìm kiếm hoặc chọn một khu vực khác.
      </p>
    </div>
  );
}

export default HomePage;
