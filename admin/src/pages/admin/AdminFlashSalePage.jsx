import { useState, useEffect } from 'react';
import { Zap, Plus, X, Upload } from 'lucide-react';
import { useCatalogStore } from '@/store/catalogStore';
import AdminBackButton from '@/components/admin/AdminBackButton';
import { useThemeStore } from '@/store/themeStore';

export default function AdminFlashSalePage() {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  
  const products = useCatalogStore((s) => s.products);
  const flashSaleProductIds = useCatalogStore((s) => s.flashSaleProductIds);
  const setFlashSaleProducts = useCatalogStore((s) => s.setFlashSaleProducts);
  const [showCustomUpload, setShowCustomUpload] = useState(false);
  const [customProduct, setCustomProduct] = useState({ name: '', price: '', startTime: '', endTime: '', image: '' });
  const [isUploading, setIsUploading] = useState(false);

  const flashSaleProducts = products.filter(p => flashSaleProductIds.includes(p.id));
  const availableProducts = []; // No products available to add
  
  // Get custom products from localStorage
  const customProducts = JSON.parse(localStorage.getItem('custom_flash_sale_products') || '{}');
  const customFlashSaleProducts = flashSaleProductIds
    .filter(id => id.startsWith('custom_flash_sale_'))
    .map(id => ({ 
      id, 
      ...customProducts[id], 
      startTime: customProducts[id]?.startTime || '',
      endTime: customProducts[id]?.endTime || '',
      isCustom: true 
    }));

  const allFlashSaleProducts = [...flashSaleProducts, ...customFlashSaleProducts];

  const addToFlashSale = (productId) => {
    if (flashSaleProductIds.length >= 6) {
      alert('Maximum 6 flash sale products allowed');
      return;
    }
    setFlashSaleProducts([...flashSaleProductIds, productId]);
  };

  const handleImageFile = async (file) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('http://127.0.0.1:8001/api/v1/products/upload-image', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + localStorage.getItem('nightowl_admin_token') },
        body: formData,
      });
      if (!response.ok) throw new Error('Upload request failed');
      const data = await response.json();
      setCustomProduct({ ...customProduct, image: data.url });
    } catch (err) {
      console.warn('Image upload failed, falling back to base64 encoding:', err);
      const reader = new FileReader();
      reader.onload = () => setCustomProduct({ ...customProduct, image: String(reader.result) });
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  // Clear all flash sale products on component mount
  useEffect(() => {
    setFlashSaleProducts([]);
    localStorage.removeItem('custom_flash_sale_products');
  }, []);

  const removeFromFlashSale = (productId) => {
    setFlashSaleProducts(flashSaleProductIds.filter(id => id !== productId));
  };

  const handleAddCustomProduct = () => {
    if (!customProduct.name || !customProduct.price || !customProduct.startTime || !customProduct.endTime) {
      alert('Please fill in all fields');
      return;
    }
    if (flashSaleProductIds.length >= 6) {
      alert('Maximum 6 flash sale products allowed');
      return;
    }
    const customId = `custom_flash_sale_${Date.now()}`;
    setFlashSaleProducts([...flashSaleProductIds, customId]);
    // Store custom product data in localStorage
    const customProductsData = JSON.parse(localStorage.getItem('custom_flash_sale_products') || '{}');
    customProductsData[customId] = {
      name: customProduct.name,
      price: Number(customProduct.price),
      startTime: customProduct.startTime,
      endTime: customProduct.endTime,
      image: customProduct.image || '',
      isCustom: true
    };
    localStorage.setItem('custom_flash_sale_products', JSON.stringify(customProductsData));
    setCustomProduct({ name: '', price: '', startTime: '', endTime: '', image: '' });
    setShowCustomUpload(false);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 animate-fade-in">
      <AdminBackButton />
      
      <div className={`panel flex flex-wrap items-center justify-between gap-6 border-[#C9A84C]/30 bg-gradient-to-r from-[#C9A84C]/15 via-[#C9A84C]/5 to-transparent p-6 shadow-xl shadow-[#C9A84C]/10 ${
        isLight ? 'border-gray-200' : ''
      }`}>
        <div>
          <h1 className={`font-display text-3xl font-bold tracking-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>Flash Sale Products</h1>
          <p className={`mt-2 text-sm ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>Manage products shown in Flash Sale section ({flashSaleProductIds.length}/6)</p>
        </div>
      </div>

      {/* Current Flash Sale Products */}
      <div className={`panel rounded-2xl border p-4 md:p-6 ${
        isLight 
          ? 'bg-white border-gray-200' 
          : 'bg-[#0D0D0D]/50 border-white/10'
      }`}>
        <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
          <Zap className="h-5 w-5 text-[#C9A84C]" />
          Current Flash Sale Products
        </h2>
        {allFlashSaleProducts.length === 0 ? (
          <p className={`text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>No flash sale products selected</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {allFlashSaleProducts.map((product) => (
              <div key={product.id} className={`relative group p-3 rounded-lg border ${
                isLight 
                  ? 'bg-gray-50 border-gray-200' 
                  : 'bg-[#0A0A0A]/50 border-white/10'
              }`}>
                <button
                  onClick={() => removeFromFlashSale(product.id)}
                  className="absolute -top-2 -right-2 flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors border-none cursor-pointer z-10"
                  title="Remove from flash sale"
                >
                  <X className="h-3 w-3 md:h-4 md:w-4" />
                </button>
                {product.image && (
                  <div className="aspect-square rounded-lg overflow-hidden mb-2">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <p className={`text-[10px] md:text-xs font-medium truncate ${isLight ? 'text-gray-900' : 'text-white'}`}>{product.name}</p>
                <p className={`text-[10px] md:text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Rs {product.price.toLocaleString()}</p>
                {product.startTime && product.endTime && (
                  <div className={`text-[8px] md:text-[10px] ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>
                    <p>{new Date(product.startTime).toLocaleDateString()} {new Date(product.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    <p>to {new Date(product.endTime).toLocaleDateString()} {new Date(product.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add to Flash Sale */}
      <div className={`panel rounded-2xl border p-4 md:p-6 ${
        isLight 
          ? 'bg-white border-gray-200' 
          : 'bg-[#0D0D0D]/50 border-white/10'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className={`text-lg font-semibold flex items-center gap-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
            <Plus className="h-5 w-5 text-[#C9A84C]" />
          </h2>
          <button
            onClick={() => setShowCustomUpload(!showCustomUpload)}
            className="flex items-center gap-2 rounded-lg bg-[#C9A84C]/20 text-[#C9A84C] px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm font-medium hover:bg-[#C9A84C]/30 transition-colors border-none cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Add Custom Product
          </button>
        </div>

        {showCustomUpload && (
          <div className={`mb-6 p-4 rounded-xl border ${
            isLight 
              ? 'bg-gray-50 border-gray-200' 
              : 'bg-[#0A0A0A]/50 border-white/10'
          }`}>
            <h3 className={`text-sm font-semibold mb-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>Add Custom Product</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={`mb-2 block text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>Product Name</label>
                <input
                  type="text"
                  value={customProduct.name}
                  onChange={(e) => setCustomProduct({ ...customProduct, name: e.target.value })}
                  placeholder="Enter product name"
                  className={`input-field w-full focus:border-[#C9A84C]/50 text-sm ${
                    isLight 
                      ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                      : 'bg-[#0A0A0A]/50 border-white/10 text-white'
                  }`}
                />
              </div>
              <div>
                <label className={`mb-2 block text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>Price (Rs)</label>
                <input
                  type="number"
                  value={customProduct.price}
                  onChange={(e) => setCustomProduct({ ...customProduct, price: e.target.value })}
                  placeholder="Enter price"
                  className={`input-field w-full focus:border-[#C9A84C]/50 text-sm ${
                    isLight 
                      ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                      : 'bg-[#0A0A0A]/50 border-white/10 text-white'
                  }`}
                />
              </div>
              <div>
                <label className={`mb-2 block text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>Start Time</label>
                <input
                  type="datetime-local"
                  value={customProduct.startTime}
                  onChange={(e) => setCustomProduct({ ...customProduct, startTime: e.target.value })}
                  className={`input-field w-full focus:border-[#C9A84C]/50 text-sm ${
                    isLight 
                      ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                      : 'bg-[#0A0A0A]/50 border-white/10 text-white'
                  }`}
                />
              </div>
              <div>
                <label className={`mb-2 block text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>End Time</label>
                <input
                  type="datetime-local"
                  value={customProduct.endTime}
                  onChange={(e) => setCustomProduct({ ...customProduct, endTime: e.target.value })}
                  className={`input-field w-full focus:border-[#C9A84C]/50 text-sm ${
                    isLight 
                      ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                      : 'bg-[#0A0A0A]/50 border-white/10 text-white'
                  }`}
                />
              </div>
              <div className="md:col-span-2">
                <label className={`mb-2 block text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>Product Image</label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                      isLight 
                        ? 'border-gray-300 hover:border-gray-400' 
                        : 'border-white/20 hover:border-white/30'
                    }`}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFile(e.target.files[0])}
                        disabled={isUploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Upload className={`mx-auto h-8 w-8 mb-2 ${isLight ? 'text-gray-400' : 'text-gray-500'}`} />
                      <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                        {isUploading ? 'Uploading...' : 'Click or drag image here'}
                      </p>
                    </div>
                  </div>
                  {customProduct.image && (
                    <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-[#C9A84C]/30">
                      <img src={customProduct.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleAddCustomProduct}
                className="btn-primary text-sm"
              >
                Add to Flash Sale
              </button>
              <button
                onClick={() => {
                  setShowCustomUpload(false);
                  setCustomProduct({ name: '', price: '', startTime: '', endTime: '', image: '' });
                }}
                className={`rounded-lg border px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm font-medium transition-colors border-none cursor-pointer ${
                  isLight 
                    ? 'border-gray-200 text-gray-900 hover:bg-gray-100' 
                    : 'border-white/10 text-white hover:bg-white/5'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


