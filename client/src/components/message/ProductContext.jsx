import { MapPin } from "lucide-react";

function ProductContext({ product, onReceive }) {
  if (!product) {
    return null;
  }

  const name = product.title || product.name || "Sản phẩm";

  const image =
    (Array.isArray(product.images) && product.images[0]) ||
    product.image ||
    product.imageUrl ||
    "";

  const location =
    typeof product.address === "object"
      ? [product.address?.ward, product.address?.province]
          .filter(Boolean)
          .join(", ")
      : product.address || product.location || "";

  return (
    <div
      className="
        bg-white
        px-4
        md:px-6
        py-3
        flex
        items-center
        justify-between
        gap-3
        shadow-[0_4px_12px_rgba(0,0,0,0.05)]
        z-10
        shrink-0
        border-b
        border-[#eeeeee]
      "
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-[#e8e8e8]">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-yellow-100 text-[#9a6700] font-bold text-sm">
              {(name || "P").charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-base font-semibold text-[#1a1c1c] truncate">
            {name}
          </span>

          {location && (
            <span className="text-xs text-[#837560] flex items-center gap-1 mt-0.5 truncate">
              <MapPin size={14} />
              {location}
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onReceive}
        className="
          ml-4
          shrink-0
          bg-black
          text-white
          px-4
          py-2
          rounded-full
          text-sm
          font-bold
          transition
          hover:scale-105
          active:scale-95
          shadow-sm
        "
      >
        Tôi muốn nhận
      </button>
    </div>
  );
}

export default ProductContext;
