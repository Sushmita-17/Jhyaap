import { useState, useMemo } from 'react';
import { Zap, Plus, X, Search, Upload } from 'lucide-react';
import { useCatalogStore } from '@/store/catalogStore';
import AdminBackButton from '@/components/admin/AdminBackButton';
import { useThemeStore } from '@/store/themeStore';

interface CustomFlashSaleProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  isCustom: boolean;
}

export default function AdminFlashSalePage() {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  
  const products = useCatalogStore((s) => s.products);
  const flashSaleProductIds = useCatalogStore((s) => s.flashSaleProductIds);
  const setFlashSaleProducts = useCatalogStore((s) => s.setFlashSaleProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomUpload, setShowCustomUpload] = useState(false);
  const [customProduct, setCustomProduct] = useState({ name: '', price: '', image: '' });

  const flashSaleProducts = products.filter(p => flashSaleProductIds.includes(p.id));
  const availableProducts = products.filter(p => !flashSaleProductIds.includes(p.id));
  
  // Get custom products from localStorage
  const customProducts = JSON.parse(localStorage.getItem('custom_flash_sale_products') || '{}');
  const customFlashSaleProducts = flashSaleProductIds
    .filter(id => id.startsWith('custom_flash_sale_'))
    .map(id => ({ id, ...customProducts[id], isCustom: true }));

  const allFlashSaleProducts = [...flashSaleProducts, ...customFlashSaleProducts];

  const filteredAvailable = useMemo(() => {
    if (!searchQuery.trim()) return availableProducts;
    const q = searchQuery.toLowerCase();
    return availableProducts.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    );
  }, [availableProducts, searchQuery]);

  const addToFlashSale = (productId: string) => {
    if (flashSaleProductIds.length >= 6) {
      alert('Maximum 6 flash sale products allowed');
      return;
    }
    setFlashSaleProducts([...flashSaleProductIds, productId]);
  };

  const removeFromFlashSale = (productId: string) => {
    setFlashSaleProducts(flashSaleProductIds.filter(id => id !== productId));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomProduct({ ...customProduct, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCustomProduct = () => {
    if (!customProduct.name || !customProduct.price || !customProduct.image) {
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
      image: customProduct.image,
      isCustom: true
    };
    localStorage.setItem('custom_flash_sale_products', JSON.stringify(customProductsData));
    setCustomProduct({ name: '', price: '', image: '' });
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
              <div key={product.id} className="relative group">
                <div className={`aspect-square rounded-lg overflow-hidden ${isLight ? 'bg-gray-100' : 'bg-[#0A0A0A]'}`}>
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <button
                  onClick={() => removeFromFlashSale(product.id)}
                  className="absolute -top-2 -right-2 flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors border-none cursor-pointer"
                  title="Remove from flash sale"
                >
                  <X className="h-3 w-3 md:h-4 md:w-4" />
                </button>
                <p className={`mt-2 text-[10px] md:text-xs font-medium truncate ${isLight ? 'text-gray-900' : 'text-white'}`}>{product.name}</p>
                <p className={`text-[10px] md:text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Rs {product.price.toLocaleString()}</p>
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
            <Upload className="h-3.5 w-3.5 md:h-4 md:w-4" />
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
            <div className="grid gap-4 md:grid-cols-3">
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
                <label className={`mb-2 block text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className={`input-field w-full focus:border-[#C9A84C]/50 text-sm ${
                    isLight 
                      ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                      : 'bg-[#0A0A0A]/50 border-white/10 text-white'
                  }`}
                />
              </div>
            </div>
            {customProduct.image && (
              <div className="mt-4">
                <img src={customProduct.image} alt="Preview" className="h-24 w-24 md:h-32 md:w-32 object-cover rounded-lg" />
              </div>
            )}
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
                  setCustomProduct({ name: '', price: '', image: '' });
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
        
        <div className="relative mb-4">
          <Search className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${isLight ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            className={`input-field w-full pl-12 focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 text-sm ${
              isLight 
                ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                : 'bg-[#0A0A0A]/50 border-white/10 text-white'
            }`}
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filteredAvailable.slice(0, 12).map((product) => (
            <div key={product.id} className="relative group">
              <div className={`aspect-square rounded-lg overflow-hidden ${isLight ? 'bg-gray-100' : 'bg-[#0A0A0A]'}`}>
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <button
                onClick={() => addToFlashSale(product.id)}
                className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-[#C9A84C] text-[#0D0D0D] hover:bg-[#A68B3D] transition-colors border-none cursor-pointer px-2 py-1 md:px-3 md:py-1.5 text-[10px] md:text-sm font-semibold"
                title="Add to flash sale"
              >
                <Plus className="h-2.5 w-2.5 md:h-3 md:w-3" />
                Add
              </button>
              <p className="mt-2 text-[10px] md:text-xs text-white font-medium truncate">{product.name}</p>
              <p className="text-[10px] md:text-xs text-gray-400">Rs {product.price.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {filteredAvailable.length === 0 && (
          <p className="text-gray-400 text-sm">No products available</p>
        )}
      </div>
    </div>
  );
}
