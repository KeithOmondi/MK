import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import { createProduct } from "../../redux/slices/productSlice";
import { fetchCategories } from "../../redux/slices/categorySlice";
import { toast } from "react-toastify";
import { FaPlusCircle, FaTimesCircle, FaImage } from "react-icons/fa";

const ALLOWED_SECTIONS = ["FlashSales", "BestDeals", "NewArrivals", "TopTrending"];

// SKU generator
const generateSKU = (name: string, categoryName?: string) => {
  const prefix = "MK";
  const catCode = categoryName?.substring(0, 2).toUpperCase() || "XX";
  const nameCode = name.replace(/\s+/g, "").substring(0, 5).toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${catCode}-${nameCode}-${random}`;
};

const AddProducts: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories } = useSelector((state: RootState) => state.categories);

  // === State ===
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [price, setPrice] = useState("");
  const [discountValue, setDiscountValue] = useState("");
  const [discountType, setDiscountType] = useState("none");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [warranty, setWarranty] = useState("");
  const [weight, setWeight] = useState("");
  const [dimensions, setDimensions] = useState({ length: "", width: "", height: "" });
  const [fragility, setFragility] = useState("low");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("5000");
  const [warehouseLocation, setWarehouseLocation] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [shippingRegions, setShippingRegions] = useState("Kenya");
  const [images, setImages] = useState<File[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [taxRate, setTaxRate] = useState(16);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [generatedSKU, setGeneratedSKU] = useState("");

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (name && categoryName) setGeneratedSKU(generateSKU(name, categoryName));
  }, [name, categoryName]);

  // === Image Handling ===
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setImages(Array.from(e.target.files));
  };

  const handleImageRemove = (index: number) =>
    setImages(images.filter((_, i) => i !== index));

  // === Sections ===
  const handleSectionToggle = (section: string) => {
    setSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  // === Submit ===
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price || !category) {
      toast.error("Please fill in all required fields");
      return;
    }

    const fd = new FormData();
    fd.append("name", name);
    fd.append("brand", brand);
    fd.append("category", category);
    fd.append("price", price);
    fd.append("stock", stock || "0");
    fd.append("description", description);
    fd.append("warranty", warranty);
    fd.append("weight", weight);
    fd.append(
      "dimensions",
      JSON.stringify({
        length: Number(dimensions.length) || 0,
        width: Number(dimensions.width) || 0,
        height: Number(dimensions.height) || 0,
      })
    );
    fd.append("fragility", fragility);
    fd.append("deliveryTime", deliveryTime);
    fd.append("freeShippingThreshold", freeShippingThreshold);
    fd.append("warehouseLocation", warehouseLocation);
    fd.append("visibility", visibility);
    fd.append("taxRate", taxRate.toString());
    fd.append("discountType", discountType);
    fd.append("discountValue", discountValue || "0");
    fd.append("sku", generatedSKU);

    const regions = shippingRegions
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);
    fd.append("shippingRegions", JSON.stringify(regions));

    fd.append("sections", JSON.stringify(sections));

    fd.append(
      "seo",
      JSON.stringify({
        title: seoTitle,
        description: seoDescription,
        keywords: seoKeywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
      })
    );

    images.forEach((image) => fd.append("images", image));

    try {
      await dispatch(createProduct(fd)).unwrap();
      toast.success("✅ Product added successfully!");
      resetForm();
    } catch (error: any) {
      toast.error(error?.message || "Failed to add product");
    }
  };

  const resetForm = () => {
    setName("");
    setBrand("");
    setCategory("");
    setCategoryName("");
    setPrice("");
    setDiscountValue("");
    setDiscountType("none");
    setStock("");
    setDescription("");
    setWarranty("");
    setWeight("");
    setDimensions({ length: "", width: "", height: "" });
    setFragility("low");
    setDeliveryTime("");
    setFreeShippingThreshold("5000");
    setWarehouseLocation("");
    setVisibility("private");
    setShippingRegions("Kenya");
    setImages([]);
    setSections([]);
    setSeoTitle("");
    setSeoDescription("");
    setSeoKeywords("");
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
      <h1 className="text-2xl font-semibold mb-4">Add New Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Info */}
        <div>
          <label className="block font-medium">Product Name *</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Category */}
        <div>
          <label className="block font-medium">Category *</label>
          <select
            className="w-full border p-2 rounded"
            value={category}
            onChange={(e) => {
              const selected = categories.find((c) => c._id === e.target.value);
              setCategory(e.target.value);
              setCategoryName(selected?.name || "");
            }}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Price *</label>
            <input
              type="number"
              className="w-full border p-2 rounded"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-medium">Discount Value</label>
            <input
              type="number"
              className="w-full border p-2 rounded"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium">Description *</label>
          <textarea
            className="w-full border p-2 rounded"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Sections */}
        <div>
          <label className="block font-medium">Assign to Sections</label>
          <div className="flex gap-3 flex-wrap">
            {ALLOWED_SECTIONS.map((section) => (
              <label key={section} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={sections.includes(section)}
                  onChange={() => handleSectionToggle(section)}
                />
                {section}
              </label>
            ))}
          </div>
        </div>

        {/* SEO */}
        <div className="mt-4 border-t pt-4">
          <h2 className="font-semibold mb-2">SEO Settings</h2>
          <input
            type="text"
            className="w-full border p-2 rounded mb-2"
            placeholder="SEO Title"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
          />
          <textarea
            className="w-full border p-2 rounded mb-2"
            placeholder="SEO Description"
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
          />
          <input
            type="text"
            className="w-full border p-2 rounded"
            placeholder="Keywords (comma-separated)"
            value={seoKeywords}
            onChange={(e) => setSeoKeywords(e.target.value)}
          />
        </div>

        {/* Images */}
        <div>
          <label className="block font-medium">Upload Images</label>
          <input type="file" multiple accept="image/*" onChange={handleImageChange} />
          <div className="flex gap-2 flex-wrap mt-2">
            {images.map((img, i) => (
              <div key={i} className="relative w-24 h-24 border rounded overflow-hidden">
                <img
                  src={URL.createObjectURL(img)}
                  alt={`preview-${i}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleImageRemove(i)}
                  className="absolute top-1 right-1 bg-white text-red-600 rounded-full"
                >
                  <FaTimesCircle />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
        >
          <FaPlusCircle /> Add Product
        </button>
      </form>
    </div>
  );
};

export default AddProducts;
