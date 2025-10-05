// src/pages/admin/AddProducts.tsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import { createProduct } from "../../redux/slices/productSlice";
import { fetchCategories } from "../../redux/slices/categorySlice";
import { toast } from "react-toastify";
import { FaPlusCircle, FaTimesCircle, FaImage } from "react-icons/fa"; // Added FaTimesCircle and FaImage for better UX

const AddProducts: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories } = useSelector((state: RootState) => state.categories);

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [warranty, setWarranty] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [shippingRegions, setShippingRegions] = useState("Kenya");
  const [freeShipping, setFreeShipping] = useState(true);
  const [images, setImages] = useState<File[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [taxPercentage, setTaxPercentage] = useState(16); // 🇰🇪 Kenya VAT

  const [isFlashSale, setIsFlashSale] = useState(false);
  const [isTopTrending, setIsTopTrending] = useState(false);
  const [isBestDeals, setIsBestDeals] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);

  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setImages(Array.from(e.target.files));
  };

  const handleImageRemove = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleColorAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value.trim()) {
      e.preventDefault(); // Prevent form submission
      const newColor = e.currentTarget.value.trim().toLowerCase();
      if (!colors.includes(newColor)) {
        setColors([...colors, newColor]);
        e.currentTarget.value = "";
      } else {
        toast.warn(`Color "${newColor}" is already added.`);
      }
    }
  };

  const handleColorRemove = (color: string) => {
    setColors(colors.filter((c) => c !== color));
  };

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
    fd.append("discountPrice", discountPrice || "0");
    fd.append("stock", stock);
    fd.append("description", description);
    fd.append("visibility", visibility);
    fd.append("freeShipping", freeShipping.toString());
    fd.append("warranty", warranty || "No warranty provided");
    fd.append("taxPercentage", taxPercentage.toString());
    fd.append("colors", JSON.stringify(colors));

    // Shipping regions
    const regions = shippingRegions
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);
    fd.append("shippingRegions", JSON.stringify(regions));

    // Sections mapping
    const sections: string[] = [];
    if (isFlashSale) sections.push("FlashSales");
    if (isTopTrending) sections.push("TopTrending");
    if (isBestDeals) sections.push("BestDeals");
    if (isNewArrival) sections.push("NewArrivals");
    fd.append("sections", JSON.stringify(sections));

    // SEO
    const seo = { title: seoTitle, description: seoDescription, keywords: seoKeywords };
    fd.append("seo", JSON.stringify(seo));

    images.forEach((image) => fd.append("images", image));

    try {
      await dispatch(createProduct(fd)).unwrap();
      toast.success("✅ Product added successfully!");

      setName("");
      setBrand("");
      setCategory("");
      setPrice("");
      setDiscountPrice("");
      setStock("");
      setDescription("");
      setWarranty("");
      setImages([]);
      setColors([]);
      setSeoTitle("");
      setSeoDescription("");
      setSeoKeywords("");
      setIsFlashSale(false);
      setIsTopTrending(false);
      setIsBestDeals(false);
      setIsNewArrival(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to add product");
    }
  };

  // Common input styling
  const inputStyle = "w-full border border-gray-300 rounded-lg p-3 mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out";
  const labelStyle = "font-semibold text-gray-700 block mb-1";
  const sectionTitleStyle = "text-xl font-bold text-gray-800 border-b pb-2 mb-4 col-span-2";

  return (
    <div className="p-8 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <div className="bg-white shadow-2xl rounded-xl p-8">
        <h1 className="text-3xl font-extrabold text-blue-700 mb-8 flex items-center gap-3">
          <FaPlusCircle className="text-blue-500" /> Add New Product
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">

          {/* === Basic Information Section === */}
          <h2 className={sectionTitleStyle}>General Details 🛒</h2>

          {/* Name - Full width */}
          <div className="lg:col-span-3">
            <label className={labelStyle}>Product Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputStyle}
              placeholder="e.g. HP EliteBook 840 G6"
              required
            />
          </div>

          {/* Brand */}
          <div>
            <label className={labelStyle}>Brand</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className={inputStyle}
              placeholder="e.g. HP, Lenovo"
            />
          </div>

          {/* Category */}
          <div>
            <label className={labelStyle}>Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`${inputStyle} appearance-none bg-white`}
              required
            >
              <option value="">Select Category</option>
              {categories?.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Visibility */}
          <div>
            <label className={labelStyle}>Visibility</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className={`${inputStyle} appearance-none bg-white`}
            >
              <option value="public">Public (Visible to everyone)</option>
              <option value="private">Private (Only viewable by link)</option>
              <option value="hidden">Hidden (Draft/Offline)</option>
            </select>
          </div>

          {/* Description - Full width */}
          <div className="lg:col-span-3">
            <label className={labelStyle}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className={inputStyle}
              placeholder="Provide a detailed description of the product features and benefits."
            />
          </div>

          {/* === Pricing & Inventory Section === */}
          <h2 className={sectionTitleStyle}>Pricing & Inventory 💰</h2>

          {/* Price */}
          <div>
            <label className={labelStyle}>Price (KSh) *</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={inputStyle}
              placeholder="0.00"
              min="0"
              required
            />
          </div>

          {/* Discount Price */}
          <div>
            <label className={labelStyle}>Discount Price (KSh)</label>
            <input
              type="number"
              value={discountPrice}
              onChange={(e) => setDiscountPrice(e.target.value)}
              className={inputStyle}
              placeholder="0.00 (Optional)"
              min="0"
            />
          </div>

          {/* Stock */}
          <div>
            <label className={labelStyle}>Stock *</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className={inputStyle}
              placeholder="Quantity in stock"
              min="0"
              required
            />
          </div>
          
          {/* Tax */}
          <div>
            <label className={labelStyle}>Tax Percentage (%)</label>
            <input
              type="number"
              value={taxPercentage}
              onChange={(e) => setTaxPercentage(Number(e.target.value))}
              className={inputStyle}
              min={0}
              max={100}
            />
            <p className="text-sm text-gray-500 mt-1">Default 16% VAT (Kenya)</p>
          </div>
          
          {/* Warranty */}
          <div className="md:col-span-2">
            <label className={labelStyle}>Warranty</label>
            <input
              type="text"
              value={warranty}
              onChange={(e) => setWarranty(e.target.value)}
              className={inputStyle}
              placeholder="e.g. 1 year manufacturer warranty"
            />
          </div>

          {/* === Variants (Colors) === */}
          <h2 className={sectionTitleStyle}>Product Variants & Options 🎨</h2>

          <div className="lg:col-span-3">
            <label className={labelStyle}>Available Colours</label>
            <input
              type="text"
              placeholder="Type color name and press Enter (e.g. red, blue, black)"
              onKeyDown={handleColorAdd}
              className={inputStyle}
            />
            <div className="flex flex-wrap gap-2 mt-3 p-2 border border-dashed border-gray-300 rounded-lg min-h-[40px] bg-gray-50">
              {colors.length === 0 && <p className="text-gray-500 text-sm italic">No colors added yet.</p>}
              {colors.map((color) => (
                <span
                  key={color}
                  className="bg-blue-100 text-blue-800 px-3 py-1 text-sm font-medium rounded-full flex items-center gap-2 transition hover:bg-blue-200"
                >
                  {color}
                  <button
                    type="button"
                    onClick={() => handleColorRemove(color)}
                    className="text-blue-500 hover:text-red-600 transition"
                    title={`Remove ${color}`}
                  >
                    <FaTimesCircle className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* === Shipping & Logistics === */}
          <h2 className={sectionTitleStyle}>Shipping & Logistics 🚚</h2>
          
          {/* Shipping Regions */}
          <div className="md:col-span-2">
            <label className={labelStyle}>Shipping Regions (Comma Separated)</label>
            <input
              type="text"
              value={shippingRegions}
              onChange={(e) => setShippingRegions(e.target.value)}
              className={inputStyle}
              placeholder="e.g. Kenya, Uganda, Tanzania"
            />
            <p className="text-sm text-gray-500 mt-1">Separate multiple regions with a comma.</p>
          </div>

          {/* Free Shipping Checkbox */}
          <div className="flex items-center pt-8">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={freeShipping} 
                onChange={(e) => setFreeShipping(e.target.checked)} 
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="font-semibold text-gray-700">Offer Free Shipping</span>
            </label>
          </div>

          {/* === Product Sections/Tags === */}
          <h2 className={sectionTitleStyle}>Website Sections 🏷️</h2>

          <div className="lg:col-span-3 flex flex-wrap gap-x-8 gap-y-4">
            <label className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition cursor-pointer">
              <input type="checkbox" checked={isFlashSale} onChange={(e) => setIsFlashSale(e.target.checked)} className="form-checkbox h-5 w-5 text-indigo-600 rounded" />
              <span className="font-medium">Flash Sale</span>
            </label>
            <label className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition cursor-pointer">
              <input type="checkbox" checked={isTopTrending} onChange={(e) => setIsTopTrending(e.target.checked)} className="form-checkbox h-5 w-5 text-indigo-600 rounded" />
              <span className="font-medium">Top Trending</span>
            </label>
            <label className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition cursor-pointer">
              <input type="checkbox" checked={isBestDeals} onChange={(e) => setIsBestDeals(e.target.checked)} className="form-checkbox h-5 w-5 text-indigo-600 rounded" />
              <span className="font-medium">Best Deals</span>
            </label>
            <label className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition cursor-pointer">
              <input type="checkbox" checked={isNewArrival} onChange={(e) => setIsNewArrival(e.target.checked)} className="form-checkbox h-5 w-5 text-indigo-600 rounded" />
              <span className="font-medium">New Arrivals</span>
            </label>
          </div>

          {/* === SEO Section === */}
          <h2 className={sectionTitleStyle}>SEO Settings 🔍</h2>

          <div className="lg:col-span-3 space-y-4">
            <div>
              <label className={labelStyle}>SEO Title</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Meta Title for search engines"
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelStyle}>SEO Keywords (Comma Separated)</label>
              <input
                type="text"
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                placeholder="e.g. laptop, hp elitebook, core i5"
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelStyle}>SEO Description</label>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Meta Description for search snippets"
                rows={3}
                className={inputStyle}
              />
            </div>
          </div>

          {/* === Images Section === */}
          <h2 className={sectionTitleStyle}>Product Images 🖼️</h2>

          <div className="lg:col-span-3">
            <label className={labelStyle} htmlFor="product-images">Upload Images</label>
            <div className="border border-dashed border-gray-400 p-6 rounded-lg bg-gray-50 hover:border-blue-500 transition duration-150">
              <input
                id="product-images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden" // Hide the default input
              />
              <label htmlFor="product-images" className="flex flex-col items-center justify-center cursor-pointer">
                <FaImage className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-gray-600 font-medium">Click to upload or drag & drop</p>
                <p className="text-sm text-gray-500 mt-1">PNG, JPG, up to 10 files.</p>
              </label>
            </div>
          </div>
          
          {/* Image Preview */}
          {images.length > 0 && (
            <div className="lg:col-span-3 mt-4">
              <h3 className="font-medium text-gray-700 mb-3">Image Preview ({images.length} files)</h3>
              <div className="flex flex-wrap gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative w-32 h-32 border border-gray-300 rounded-lg overflow-hidden shadow-md">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleImageRemove(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition"
                      title="Remove image"
                    >
                      <FaTimesCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* Submit */}
          <div className="lg:col-span-3 text-center pt-8">
            <button
              type="submit"
              className="bg-blue-600 text-white py-3 px-10 rounded-full font-bold text-lg shadow-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
            >
              <FaPlusCircle className="inline mr-2" /> Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProducts;