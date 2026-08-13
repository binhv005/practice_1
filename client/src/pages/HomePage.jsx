import { useEffect, useState } from "react";
import UserHeader from "../components/user/UserHeader";
import CategorySlider from "../components/user/CategorySlider";
import RecommendedProducts from "../components/user/RecommendedProducts";
import UserFooter from "../components/user/UserFooter";
import UserProductDetailModal from "../components/user/UserProductDetailModal";
import CommunityStats from "../components/user/CommunityStats";
import ProductCard from "../components/products/ProductCard";
import ProductCreateModal from "../components/products/ProductCreateModal";
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
} from "lucide-react";
import {
  getProducts,
  createProduct,
  uploadProductImages,
} from "../api/productApi";

import { getCategories } from "../api/categoryApi";

function HomePage() {
  const [keyword, setKeyword] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  const [savedProducts, setSavedProducts] = useState(new Set());

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [showCreateForm, setShowCreateForm] = useState(false);

  const [loading, setLoading] = useState(false);

  const [products, setProducts] = useState([]);

  // Category dùng cho CategorySlider
  const categories = [
    { name: "Tất cả", icon: "▦" },
    { name: "Điện thoại", icon: "📱" },
    { name: "Laptop", icon: "💻" },
    { name: "Đồ điện tử", icon: "🎧" },
    { name: "Đồ gia dụng", icon: "🏠" },
    { name: "Thời trang", icon: "👕" },
    { name: "Sách", icon: "📚" },
    { name: "Đồ dùng học tập", icon: "✏️" },
    { name: "Khác", icon: "•••" },
  ];

  const [productCategories, setProductCategories] = useState([]);

  const [filters, setFilters] = useState({
    keyword: "",
    category: "",
    status: "giving",
    ward: "",
  });

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

  const userAddress = {
    province: "TP. Hồ Chí Minh",
    ward: "Linh Chiểu",
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);

      const response = await getProducts({
        status: "giving",
      });

      const result = response?.data?.data || [];

      setProducts(result);
    } catch (error) {
      console.error("Load products error:", error);

      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

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

  const filteredProducts = products.filter((product) => {
    const categoryName =
      typeof product.category === "object"
        ? product.category?.name
        : product.category;

    return selectedCategory === "Tất cả" || categoryName === selectedCategory;
  });

  const handleSearch = async ({ keyword, ward }) => {
    try {
      setLoading(true);

      const searchKeyword = keyword?.trim() || "";

      const searchFilters = {
        keyword: searchKeyword,
        status: "giving",
      };

      if (ward?.trim()) {
        searchFilters.ward = ward.trim();
      }

      const response = await getProducts(searchFilters);

      const result = response?.data?.data || [];

      setProducts(result);

      setFilters((prev) => ({
        ...prev,
        keyword: searchKeyword,
        ward: ward?.trim() || "",
        status: "giving",
      }));
    } catch (error) {
      console.error("Search products error:", error);

      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleToggleSave = (productId) => {
    setSavedProducts((prev) => {
      const next = new Set(prev);

      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }

      return next;
    });
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseDetail = () => {
    setSelectedProduct(null);
  };

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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) {
      return;
    }

    // Tối đa 10 ảnh
    const limitedFiles = files.slice(0, 10);

    setSelectedImages(limitedFiles);

    const previews = limitedFiles.map((file) => URL.createObjectURL(file));

    setPreviewImages(previews);
  };

  const handleUploadImages = async () => {
    if (selectedImages.length === 0) {
      alert("Vui lòng chọn ít nhất 1 ảnh");
      return;
    }

    try {
      setUploading(true);

      const response = await uploadProductImages(selectedImages);

      console.log("Upload response:", response);

      // Backend trả về:
      // response.data.data.imageUrls
      const uploadedImages = response?.data?.data?.imageUrls || [];

      console.log("Uploaded image URLs:", uploadedImages);

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

      const productData = {
        title: productForm.title.trim(),

        description: productForm.description.trim(),

        category: productForm.category,

        // Đảm bảo luôn gửi array
        images: productForm.images,

        status: "giving",

        address: {
          province: productForm.address.province,
          ward: productForm.address.ward,
        },
      };

      console.log("========== CREATE PRODUCT ==========");
      console.log("Product data:", productData);
      console.log("Images:", productData.images);
      console.log("Images is array:", Array.isArray(productData.images));
      console.log("Category:", productData.category);
      console.log("Address:", productData.address);

      const response = await createProduct(productData);

      console.log("Create product response:", response.data);

      alert("Đăng tin thành công!");

      handleCloseCreateForm();

      await loadProducts();
    } catch (error) {
      console.error("Create product error:", error);

      console.error("Backend response:", error?.response?.data);

      console.error("Backend message:", error?.response?.data?.message);

      alert(error?.response?.data?.message || "Đăng tin thất bại!");
    } finally {
      setCreating(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-[#fafafa]">
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

      <main className="mx-auto w-full max-w-[1440px] px-4 pb-20 sm:px-6 lg:px-8">
        <section className="pt-10">
          <div className="mb-6">
            <h2 className="text-xl font-bold leading-7 text-gray-900">
              Khám phá danh mục
            </h2>

            <p className="mt-2 text-sm leading-5 text-gray-500">
              Tìm những món đồ phù hợp với nhu cầu của bạn
            </p>
          </div>

          <CategorySlider
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </section>

        <section className="mt-14">
          <div
            className="
              mb-7
              flex
              flex-col
              gap-3
              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >
            <div>
              <h2 className="text-xl font-bold leading-7 text-gray-900">
                {selectedCategory === "Tất cả"
                  ? "Tin đăng mới"
                  : selectedCategory}
              </h2>

              <p className="mt-2 text-sm leading-5 text-gray-500">
                {loading
                  ? "Đang tải sản phẩm..."
                  : `${filteredProducts.length} sản phẩm được tìm thấy`}
              </p>
            </div>

            {selectedCategory !== "Tất cả" && (
              <button
                type="button"
                onClick={() => setSelectedCategory("Tất cả")}
                className="
                  self-start
                  rounded-lg
                  px-3
                  py-2
                  text-sm
                  font-medium
                  text-gray-500
                  transition
                  hover:bg-gray-100
                  hover:text-gray-900
                  sm:self-auto
                "
              >
                Xem tất cả
              </button>
            )}
          </div>

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
                    isSaved={savedProducts.has(productId)}
                    onSave={handleToggleSave}
                    onClick={() => handleProductClick(product)}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState />
          )}
        </section>

        <RecommendedProducts products={products} userAddress={userAddress} />
        <CommunityStats />
      </main>

      <UserFooter />

      {selectedProduct && (
        <UserProductDetailModal
          product={selectedProduct}
          onClose={handleCloseDetail}
          isSaved={savedProducts.has(selectedProduct._id || selectedProduct.id)}
          onSave={() =>
            handleToggleSave(selectedProduct._id || selectedProduct.id)
          }
        />
      )}

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
