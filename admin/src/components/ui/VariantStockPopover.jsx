const VariantStockPopover = ({ variants }) => {
  return (
    <div className="
      absolute z-50 hidden group-hover:block
      bg-white border rounded-xl shadow-xl
      p-4 w-[320px]
      top-full left-0 mt-2
    ">
      {variants.map((variant) => (
        <div key={variant._id} className="mb-4 last:mb-0">
          {/* COLOR */}
          <div className="font-semibold text-sm text-gray-800 mb-2">
            Color: {variant.color}
          </div>

          {/* TABLE */}
          <table className="w-full text-xs border rounded-lg overflow-hidden">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-1 text-left">Size</th>
                <th className="p-1 text-right">Price</th>
                <th className="p-1 text-right">MRP</th>
                <th className="p-1 text-right">Stock</th>
              </tr>
            </thead>

            <tbody>
              {variant.sizes.map((s) => (
                <tr key={s.sku} className="border-b last:border-none">
                  <td className="p-1">{s.size}</td>
                  <td className="p-1 text-right">₹{s.price}</td>
                  <td className="p-1 text-right text-gray-400 line-through">
                    ₹{s.mrp}
                  </td>
                  <td
                    className={`p-1 text-right font-medium ${
                      s.stock === 0
                        ? "text-red-600"
                        : s.stock <= 5
                        ? "text-orange-600"
                        : "text-green-600"
                    }`}
                  >
                    {s.stock}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default VariantStockPopover;
