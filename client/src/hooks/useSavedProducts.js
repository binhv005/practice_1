import { useState, useCallback, useEffect } from "react";
import {
  saveProduct as saveProductAPI,
  unsaveProduct as unsaveProductAPI,
  checkProductSaved as checkProductSavedAPI,
  getSavedProducts as getSavedProductsAPI,
} from "../api/savedProductApi";

/**
 * Hook để quản lý saved products
 */
export const useSavedProducts = () => {
  const [savedProductIds, setSavedProductIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  /**
   * Load danh sách sản phẩm đã lưu khi component mount
   */
  useEffect(() => {
    const loadSavedProducts = async () => {
      try {
        // Kiểm tra đăng nhập
        const savedUser = localStorage.getItem("user");
        if (!savedUser) {
          setInitialized(true);
          return;
        }

        setLoading(true);

        const response = await getSavedProductsAPI();
        const products = response.products || [];

        // Lấy danh sách IDs
        const ids = products.map((p) => p._id).filter(Boolean);
        setSavedProductIds(new Set(ids));

        setInitialized(true);
      } catch (error) {
        console.error("Load saved products error:", error);
        setInitialized(true);
      } finally {
        setLoading(false);
      }
    };

    loadSavedProducts();
  }, []);

  /**
   * Kiểm tra sản phẩm đã được lưu chưa
   */
  const checkSaved = useCallback(async (productId) => {
    try {
      const response = await checkProductSavedAPI(productId);
      return response.isSaved || false;
    } catch (error) {
      console.error("Check saved error:", error);
      return false;
    }
  }, []);

  /**
   * Toggle save/unsave sản phẩm
   */
  const toggleSave = useCallback(
    async (productId) => {
      try {
        setLoading(true);

        const isSaved = savedProductIds.has(productId);

        if (isSaved) {
          // Unsave
          const response = await unsaveProductAPI(productId);

          if (response.success) {
            setSavedProductIds((prev) => {
              const next = new Set(prev);
              next.delete(productId);
              return next;
            });
            return false;
          }
        } else {
          // Save
          const response = await saveProductAPI(productId);

          if (response.success) {
            setSavedProductIds((prev) => new Set(prev).add(productId));
            return true;
          }
        }
      } catch (error) {
        console.error("Toggle save error:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [savedProductIds],
  );

  /**
   * Lưu sản phẩm
   */
  const saveProduct = useCallback(
    async (productId) => {
      try {
        setLoading(true);

        const response = await saveProductAPI(productId);

        if (response.success) {
          setSavedProductIds((prev) => new Set(prev).add(productId));
          return true;
        }

        return false;
      } catch (error) {
        console.error("Save product error:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Bỏ lưu sản phẩm
   */
  const unsaveProduct = useCallback(
    async (productId) => {
      try {
        setLoading(true);

        const response = await unsaveProductAPI(productId);

        if (response.success) {
          setSavedProductIds((prev) => {
            const next = new Set(prev);
            next.delete(productId);
            return next;
          });
          return true;
        }

        return false;
      } catch (error) {
        console.error("Unsave product error:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Kiểm tra sản phẩm có trong danh sách đã lưu không
   */
  const isSaved = useCallback(
    (productId) => {
      return savedProductIds.has(productId);
    },
    [savedProductIds],
  );

  return {
    savedProductIds,
    loading,
    initialized,
    checkSaved,
    toggleSave,
    saveProduct,
    unsaveProduct,
    isSaved,
  };
};

export default useSavedProducts;
