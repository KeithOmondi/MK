import React, { useState, useEffect, useMemo, type ChangeEvent, type InputHTMLAttributes } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import { createProduct } from "../../redux/slices/productSlice";
import { fetchCategories } from "../../redux/slices/categorySlice";
import { toast } from "react-toastify";
import {
    FaPlusCircle,
    FaTimesCircle,
    FaSave,
    FaTags,
    FaRulerCombined,
    FaTruck,
    FaShieldAlt,
    FaDollarSign
} from "react-icons/fa";
import { MdViewAgenda, MdClose } from "react-icons/md";

// ======================================================
// 🧩 TYPES
// ======================================================

// 1. State Types (string values from form inputs)
interface DimensionsState { length: string; width: string; height: string; }
interface VariantState { 
    name: string; 
    value: string; 
    price?: string; 
    stock?: string; 
}
// 2. Payload Types (numeric/final values before JSON.stringify)
interface VariantPayload {
    name: string;
    value: string;
    price?: number; // Converted to number
    stock?: number; // Converted to number
}

// Helper for constant sections
const ALLOWED_SECTIONS = ["FlashSales", "BestDeals", "NewArrivals", "TopTrending"] as const;
type AllowedSection = (typeof ALLOWED_SECTIONS)[number];

// ======================================================
// 🧰 HELPERS
// ======================================================

// Simplified SKU generator for client-side display
const generateSKU = (name: string, categoryName?: string) => {
    const prefix = "MK";
    const catCode = categoryName?.substring(0, 3).toUpperCase() || "GEN";
    const nameCode = name.replace(/\s+/g, "").substring(0, 5).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${catCode}-${nameCode}-${random}`;
};

// ======================================================
// ⚛️ MAIN COMPONENT
// ======================================================

const AddProducts: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { categories } = useSelector((state: RootState) => state.categories);

    // === State (Synchronized with Backend Fields) ===
    const [name, setName] = useState("");
    const [brand, setBrand] = useState("");
    const [category, setCategory] = useState("");
    const [categoryName, setCategoryName] = useState("");
    const [price, setPrice] = useState("");
    const [discountValue, setDiscountValue] = useState("");
    const [discountType, setDiscountType] = useState("none");
    const [stock, setStock] = useState("");
    const [description, setDescription] = useState("");
    const [returnPolicy, setReturnPolicy] = useState("30 days free return");
    const [warranty, setWarranty] = useState("");
    const [weight, setWeight] = useState("");
    const [dimensions, setDimensions] = useState<DimensionsState>({ length: "", width: "", height: "" });
    const [fragility, setFragility] = useState("low");
    const [deliveryTime, setDeliveryTime] = useState("");
    const [freeShippingThreshold, setFreeShippingThreshold] = useState("5000");
    const [warehouseLocation, setWarehouseLocation] = useState("");
    const [visibility, setVisibility] = useState("private");
    const [shippingRegions, setShippingRegions] = useState("Kenya");
    const [images, setImages] = useState<File[]>([]);
    const [sections, setSections] = useState<AllowedSection[]>([]); // Use the type alias
    const [taxRate] = useState(16);
    const [barcode, setBarcode] = useState("");
    const [tags, setTags] = useState("");
    const [seoTitle, setSeoTitle] = useState("");
    const [seoDescription, setSeoDescription] = useState("");
    const [seoKeywords, setSeoKeywords] = useState("");
    const [variants, setVariants] = useState<VariantState[]>([]);
    const [newVariantName, setNewVariantName] = useState("");
    const [newVariantValue, setNewVariantValue] = useState("");
    const [newVariantPrice, setNewVariantPrice] = useState("");
    const [newVariantStock, setNewVariantStock] = useState("");
    const [currentSKU, setCurrentSKU] = useState(""); // Renamed from generatedSKU to avoid conflict

    // === Effects & Memo ===
    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    useEffect(() => {
        if (name || categoryName) setCurrentSKU(generateSKU(name, categoryName));
    }, [name, categoryName]);

    const totalVariantStock = useMemo(() => {
        return variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    }, [variants]);

    // === Handlers ===
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            // Only take up to 5 images total
            const newFiles = Array.from(e.target.files).slice(0, 5 - images.length);
            setImages((prev) => [...prev, ...newFiles]);
            e.target.value = ""; // Reset file input
        }
    };

    const handleImageRemove = (index: number) =>
        setImages(images.filter((_, i) => i !== index));

    const handleAddVariant = () => {
        if (newVariantName && newVariantValue) {
            setVariants((prev) => [
                ...prev,
                {
                    name: newVariantName.trim(),
                    value: newVariantValue.trim(),
                    price: newVariantPrice || undefined,
                    stock: newVariantStock || undefined,
                },
            ]);
            setNewVariantName("");
            setNewVariantValue("");
            setNewVariantPrice("");
            setNewVariantStock("");
        } else {
            toast.error("Variant Name and Value are required.");
        }
    };

    const handleRemoveVariant = (index: number) =>
        setVariants(variants.filter((_, i) => i !== index));

    const handleSectionToggle = (section: AllowedSection) => {
        setSections((prev) =>
            prev.includes(section)
                ? prev.filter((s) => s !== section)
                : [...prev, section]
        );
    };

    const resetForm = () => {
        setName(""); setBrand(""); setCategory(""); setCategoryName(""); setPrice(""); setDiscountValue("");
        setDiscountType("none"); setStock(""); setDescription(""); setWarranty(""); setWeight("");
        setDimensions({ length: "", width: "", height: "" }); setFragility("low"); setDeliveryTime("");
        setFreeShippingThreshold("5000"); setWarehouseLocation(""); setVisibility("private");
        setShippingRegions("Kenya"); setImages([]); setSections([]); setSeoTitle(""); setSeoDescription("");
        setSeoKeywords(""); setBarcode(""); setTags(""); setVariants([]); setCurrentSKU("");
    };

    // === Submit & Form Data Preparation ===
   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price || !category || !description) {
        toast.error("Please fill required fields (Name, Price, Category, Description).");
        return;
    }

    // Prepare numeric/JSON-safe payload
    const variantsPayload: VariantPayload[] = variants.map(v => ({
        name: v.name,
        value: v.value,
        price: Number(v.price) > 0 ? Number(v.price) : undefined,
        stock: Number(v.stock) > 0 ? Number(v.stock) : undefined,
    }));

    const payload = {
        name,
        brand,
        category,
        description,
        warranty,
        returnPolicy,
        barcode,
        sku: currentSKU,
        price,
        stock: variants.length > 0 ? totalVariantStock : Number(stock) || 0,
        discountType,
        discountValue: discountValue || "0",
        taxPercentage: taxRate,
        weight: weight || "0",
        fragility,
        deliveryTime,
        warehouseLocation,
        visibility,
        dimensions: {
            length: Number(dimensions.length) || 0,
            width: Number(dimensions.width) || 0,
            height: Number(dimensions.height) || 0,
        },
        shippingRegions: shippingRegions.split(",").map(r => r.trim()).filter(Boolean),
        sections,
        variants: variantsPayload,
        tags: tags.split(",").map(k => k.trim()).filter(Boolean),
        seo: {
            title: seoTitle,
            description: seoDescription,
            keywords: seoKeywords.split(",").map(k => k.trim()).filter(Boolean),
        },
        images, // File[] array
    };

    // Helper: Convert payload to FormData
    const buildFormData = (payload: any) => {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (Array.isArray(value)) {
            value.forEach((item, idx) => {
                if (item instanceof File) {
                    formData.append("images", item); // all files under "images"
                } else if (typeof item === "object") {
                    formData.append(`${key}[${idx}]`, JSON.stringify(item));
                } else {
                    formData.append(`${key}[]`, String(item));
                }
            });
        } else if (value instanceof File) {
            formData.append(key, value);
        } else if (typeof value === "object") {
            formData.append(key, JSON.stringify(value)); // 🔹 stringify objects
        } else {
            formData.append(key, String(value)); // 🔹 ensure strings
        }
    });

    return formData;
};


    const formData = buildFormData(payload);

    try {
        await dispatch(createProduct(formData)).unwrap(); // ensure thunk handles FormData
        toast.success("✅ Product added successfully!");
        resetForm();
    } catch (error: any) {
        const errorMessage = error?.message || error?.response?.data?.message || "Failed to add product.";
        toast.error(errorMessage);
    }
};
;


    // --- Render ---
    return (
        <div className="max-w-6xl mx-auto p-4 lg:p-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
                <FaPlusCircle className="inline-block text-indigo-600 mr-3" />
                Create New Product Listing
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* SECTION 1: CORE PRODUCT INFO & PRICING */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-xl font-bold text-indigo-700 mb-4 border-b pb-2">Basic Details</h2>
                        
                        {/* Name and Category */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField label="Product Name *" value={name} onValueChange={setName} required />
                            <div>
                                <Label required>Category *</Label>
                                <select
                                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                                    value={category}
                                    onChange={(e) => {
                                        const selected = categories.find((c: any) => c._id === e.target.value);
                                        setCategory(e.target.value);
                                        setCategoryName(selected?.name || "");
                                    }}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat: any) => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Brand, Barcode, SKU */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <InputField label="Brand / Manufacturer" value={brand} onValueChange={setBrand} />
                            <InputField label="Barcode (ISBN/EAN)" value={barcode} onValueChange={setBarcode} />
                            <div>
                                <Label>SKU (Auto-Generated)</Label>
                                <div className="bg-gray-100 p-2.5 rounded-lg text-sm font-mono text-gray-600 border border-gray-300 truncate h-11 flex items-center">
                                    {currentSKU || "MK-GEN-NAME-XXXX"}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <Label required>Description *</Label>
                            <textarea
                                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                                rows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>

                        {/* Tags (Keywords) */}
                        <InputField
                            label={<><FaTags className="inline mr-1 text-indigo-500"/> Tags (Comma-separated)</>}
                            value={tags}
                            onValueChange={setTags}
                            placeholder="e.g., electronics, smartphone, 5G"
                        />
                    </div>

                    {/* Pricing Card */}
                    <div className="lg:col-span-1 bg-indigo-50/70 p-5 rounded-xl shadow-inner border border-indigo-200 space-y-4 h-fit">
                        <h2 className="text-lg font-bold text-indigo-800 flex items-center gap-2"><FaDollarSign/> Pricing & Inventory</h2>
                        <InputField label="Base Price *" type="number" value={price} onValueChange={setPrice} required prefix="KSh" min="0"/>

                        {/* Discount */}
                        <div className="flex gap-2">
                            <div className="w-1/3">
                                <Label>Discount Type</Label>
                                <select
                                    className="w-full border border-gray-300 p-2.5 rounded-lg text-sm"
                                    value={discountType}
                                    onChange={(e) => setDiscountType(e.target.value)}
                                >
                                    <option value="none">None</option>
                                    <option value="percentage">%</option>
                                    <option value="fixed">Fixed (KSh)</option>
                                </select>
                            </div>
                            <div className="w-2/3">
                                <InputField label="Discount Value" type="number" value={discountValue} onValueChange={setDiscountValue} disabled={discountType === 'none'} min="0"/>
                            </div>
                        </div>

                        {/* Stock */}
                        <div>
                            <Label>Stock Quantity</Label>
                            <input
                                type="number"
                                className={`w-full border p-2.5 rounded-lg transition duration-150 ${variants.length > 0 ? 'bg-gray-200 cursor-not-allowed' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                                value={variants.length > 0 ? totalVariantStock : stock}
                                onChange={(e) => setStock(e.target.value)}
                                placeholder="0"
                                disabled={variants.length > 0}
                                min="0"
                            />
                            {variants.length > 0 && (
                                <p className="text-xs text-indigo-600 mt-1">Total stock calculated from variants: {totalVariantStock}</p>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 mt-3 border-t pt-3">Tax Rate: {taxRate}% (Default)</p>
                    </div>
                </div>

                {/* SECTION 2: PRODUCT VARIANTS (Advanced) */}
                <VariantManager
                    variants={variants}
                    newVariantState={{ newVariantName, setNewVariantName, newVariantValue, setNewVariantValue, newVariantPrice, setNewVariantPrice, newVariantStock, setNewVariantStock }}
                    onAddVariant={handleAddVariant}
                    onRemoveVariant={handleRemoveVariant}
                />

                {/* SECTION 3: MEDIA AND CATEGORIZATION */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    
                    {/* Images Upload - Moved logic into dedicated component for clarity */}
                    <ImageUploader
                        images={images}
                        onImageChange={handleImageChange}
                        onImageRemove={handleImageRemove}
                    />

                    {/* Categorization & Visibility */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-indigo-700 mb-4 border-b pb-2">Display & Visibility</h2>

                        {/* Visibility */}
                        <div>
                            <Label>Visibility Status</Label>
                            <select
                                className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                value={visibility}
                                onChange={(e) => setVisibility(e.target.value)}
                            >
                                <option value="public">Public (Visible on site)</option>
                                <option value="private">Private (Hidden/Draft)</option>
                            </select>
                        </div>

                        {/* Sections */}
                        <div>
                            <Label>Homepage Sections</Label>
                            <div className="flex gap-2 flex-wrap p-2 border border-gray-300 rounded-lg">
                                {ALLOWED_SECTIONS.map((section) => (
                                    <button
                                        key={section}
                                        type="button"
                                        onClick={() => handleSectionToggle(section)}
                                        className={`px-3 py-1 text-sm font-medium rounded-full transition ${
                                            sections.includes(section)
                                                ? "bg-indigo-600 text-white shadow-md"
                                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                        }`}
                                    >
                                        {section}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* SEO */}
                        <div className="pt-2 border-t mt-4">
                            <h3 className="font-semibold text-gray-800 mb-2">SEO Metadata</h3>
                            <InputField placeholder="SEO Title" value={seoTitle} onValueChange={setSeoTitle} />
                            <textarea
                                className="w-full border border-gray-300 p-2.5 rounded-lg mt-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="SEO Description"
                                rows={2}
                                value={seoDescription}
                                onChange={(e) => setSeoDescription(e.target.value)}
                            />
                            <InputField placeholder="Keywords (comma-separated)" value={seoKeywords} onValueChange={setSeoKeywords} className="mt-2" />
                        </div>
                    </div>
                </div>

                {/* SECTION 4: SHIPPING & LOGISTICS */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h2 className="text-xl font-bold text-indigo-700 mb-4 border-b pb-2 flex items-center gap-2"><FaTruck/> Shipping & Logistics</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Physical Dimensions */}
                        <div className="lg:col-span-2">
                            <Label><FaRulerCombined className="inline mr-1 text-indigo-500"/> Dimensions (cm)</Label>
                            <div className="flex gap-2">
                                <InputField placeholder="Length" type="number" value={dimensions.length} onValueChange={(v) => setDimensions({...dimensions, length: v})} min="0" />
                                <InputField placeholder="Width" type="number" value={dimensions.width} onValueChange={(v) => setDimensions({...dimensions, width: v})} min="0" />
                                <InputField placeholder="Height" type="number" value={dimensions.height} onValueChange={(v) => setDimensions({...dimensions, height: v})} min="0" />
                            </div>
                        </div>

                        {/* Weight */}
                        <InputField label="Weight (kg)" type="number" value={weight} onValueChange={setWeight} prefix="kg" min="0" />

                        {/* Fragility */}
                        <div>
                            <Label>Fragility</Label>
                            <select className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500" value={fragility} onChange={(e) => setFragility(e.target.value)}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <InputField label="Delivery Time (e.g., 2-3 days)" value={deliveryTime} onValueChange={setDeliveryTime} />
                        <InputField label="Free Shipping Threshold" type="number" value={freeShippingThreshold} onValueChange={setFreeShippingThreshold} prefix="KSh" min="0" />
                        <InputField label="Warehouse Location" value={warehouseLocation} onValueChange={setWarehouseLocation} placeholder="e.g., Nairobi Central" />
                    </div>

                    {/* Shipping Regions */}
                    <InputField
                        label="Shipping Regions (Comma-separated)"
                        value={shippingRegions}
                        onValueChange={setShippingRegions}
                        className="mt-4"
                        placeholder="e.g., Kenya, Uganda, Tanzania"
                    />
                </div>

                {/* SECTION 5: POLICIES */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h2 className="text-xl font-bold text-indigo-700 mb-4 border-b pb-2 flex items-center gap-2"><FaShieldAlt/> Policies & Guarantees</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Warranty Period (e.g., 1 year or None)" value={warranty} onValueChange={setWarranty} />
                        <InputField label="Return Policy" value={returnPolicy} onValueChange={setReturnPolicy} placeholder="e.g., 30 days free return" />
                    </div>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="text-center pt-4">
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold text-lg shadow-lg shadow-indigo-500/50 flex items-center gap-2 justify-center mx-auto hover:bg-indigo-700 transition duration-200"
                    >
                        <FaSave /> Save & Submit Product
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProducts;

// ======================================================
// 🎨 HELPER COMPONENTS
// ======================================================

const Label: React.FC<{ children: React.ReactNode, required?: boolean }> = ({ children, required = false }) => (
    <label className="block text-sm font-medium text-gray-700 mb-1">
        {children} {required && <span className="text-red-500">*</span>}
    </label>
);

// InputField Component (corrected props interface for better type safety)
interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: React.ReactNode;
    value: string;
    onValueChange: (value: string) => void;
    required?: boolean;
    prefix?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, value, onValueChange, required, prefix, ...props }) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onValueChange(e.target.value);
    };

    return (
        <div>
            {label && <Label required={required}>{label}</Label>}
            <div className={`flex rounded-lg shadow-sm border ${label ? 'mt-0' : ''}`}>
                {prefix && (
                    <span className="inline-flex items-center px-3 rounded-l-md border-r border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        {prefix}
                    </span>
                )}
                <input
                    className={`block w-full p-2.5 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 border-gray-300 ${prefix ? 'rounded-l-none border-l-0' : ''}`}
                    value={value}
                    onChange={handleChange}
                    required={required}
                    {...props}
                />
            </div>
        </div>
    );
};

// ImageUploader Component (Extracted from main render function)
interface ImageUploaderProps {
    images: File[];
    onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onImageRemove: (index: number) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onImageChange, onImageRemove }) => (
    <div className="space-y-4">
        <h2 className="text-xl font-bold text-indigo-700 mb-4 border-b pb-2">Product Images (Max 5)</h2>
        <input
            type="file"
            multiple
            accept="image/*"
            disabled={images.length >= 5}
            onChange={onImageChange}
            className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        <p className="text-sm text-gray-500 -mt-2">Upload up to 5 images. Current count: {images.length}</p>
        <div className="flex flex-wrap gap-4">
            {images.map((img, idx) => (
                <div key={idx} className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                    {/* Object.is checks for same file, preventing unnecessary re-renders/warnings */}
                    <img
                        src={URL.createObjectURL(img)}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                    />
                    <button
                        type="button"
                        onClick={() => onImageRemove(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-800 transition"
                    >
                        <MdClose size={18}/>
                    </button>
                </div>
            ))}
        </div>
    </div>
);


// VariantManager Component (corrected props interface for type safety)
interface VariantManagerProps {
    variants: VariantState[];
    newVariantState: {
        newVariantName: string; setNewVariantName: React.Dispatch<React.SetStateAction<string>>;
        newVariantValue: string; setNewVariantValue: React.Dispatch<React.SetStateAction<string>>;
        newVariantPrice: string; setNewVariantPrice: React.Dispatch<React.SetStateAction<string>>;
        newVariantStock: string; setNewVariantStock: React.Dispatch<React.SetStateAction<string>>;
    };
    onAddVariant: () => void;
    onRemoveVariant: (index: number) => void;
}

const VariantManager: React.FC<VariantManagerProps> = ({ variants, newVariantState, onAddVariant, onRemoveVariant }) => {
    const { newVariantName, setNewVariantName, newVariantValue, setNewVariantValue, newVariantPrice, setNewVariantPrice, newVariantStock, setNewVariantStock } = newVariantState;

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold text-indigo-700 mb-4 border-b pb-2 flex items-center gap-2"><MdViewAgenda/> Product Variants (Size, Color, etc.)</h2>

            <div className="space-y-4">
                {/* Variant Input Row */}
                <div className="grid grid-cols-5 gap-3 items-end">
                    <InputField label="Option Name" value={newVariantName} onValueChange={setNewVariantName} placeholder="e.g., Color" />
                    <InputField label="Option Value" value={newVariantValue} onValueChange={setNewVariantValue} placeholder="e.g., Red" />
                    <InputField label="Price Override" type="number" value={newVariantPrice} onValueChange={setNewVariantPrice} prefix="KSh" placeholder="Optional" min="0" />
                    <InputField label="Stock" type="number" value={newVariantStock} onValueChange={setNewVariantStock} placeholder="0" min="0" />
                    <button
                        type="button"
                        onClick={onAddVariant}
                        className="bg-green-600 text-white p-2.5 rounded-lg hover:bg-green-700 transition"
                    >
                        <FaPlusCircle className="inline mr-1" /> Add
                    </button>
                </div>

                {/* Variants List */}
                {variants.length > 0 && (
                    <div className="mt-4 border border-gray-200 rounded-lg p-3 max-h-60 overflow-y-auto">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Current Variants:</p>
                        {variants.map((variant, i) => (
                            <div key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded-md mb-1 text-sm border">
                                <span className="font-medium text-gray-800">{variant.name}: {variant.value}</span>
                                <span className="text-gray-600">
                                    Price: {variant.price ? `KSh ${variant.price}` : 'Base'} |
                                    Stock: {variant.stock || 0}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => onRemoveVariant(i)}
                                    className="text-red-500 hover:text-red-700 p-1 rounded-full"
                                >
                                    <FaTimesCircle size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {variants.length > 0 && (
                    <p className="text-sm text-indigo-600 font-medium">Note: Base Price/Stock will be ignored. Total stock is calculated from variants.</p>
                )}
            </div>
        </div>
    );
};