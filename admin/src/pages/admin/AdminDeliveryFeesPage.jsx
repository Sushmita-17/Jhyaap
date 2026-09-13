import { useState, useEffect } from 'react';
import AdminBackButton from '@/components/admin/AdminBackButton';
import { useThemeStore } from '@/store/themeStore';
import { adminPath } from '@/lib/adminRoutes';

const API_BASE = import.meta.env.VITE_BACKEND_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001';

export default function AdminDeliveryFeesPage() {
  const { isLight } = useThemeStore();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingFee, setEditingFee] = useState(null);
  const [editForm, setEditForm] = useState({ delivery_fee: '', eta_minutes: '' });
  const [filterCity, setFilterCity] = useState('all');
  const [filterZone, setFilterZone] = useState('all');
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    fetchDeliveryFees();
  }, []);

  const fetchDeliveryFees = async () => {
    try {
      const token = localStorage.getItem('jhyaap_admin_token');
      const response = await fetch(`${API_BASE}/api/v1/delivery-fees`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFees(data.fees || []);
      }
    } catch (error) {
      console.error('Error fetching delivery fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (fee) => {
    setEditingFee(fee);
    setEditForm({ delivery_fee: fee.delivery_fee, eta_minutes: fee.eta_minutes });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('jhyaap_admin_token');
      const response = await fetch(`${API_BASE}/api/v1/delivery-fees/${editingFee.area_name}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          delivery_fee: parseFloat(editForm.delivery_fee),
          eta_minutes: parseInt(editForm.eta_minutes)
        })
      });

      if (response.ok) {
        setSaveMessage('Delivery fee updated successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
        setEditingFee(null);
        fetchDeliveryFees();
      } else {
        setSaveMessage('Failed to update delivery fee');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating delivery fee:', error);
      setSaveMessage('Error updating delivery fee');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleCancel = () => {
    setEditingFee(null);
    setEditForm({ delivery_fee: '', eta_minutes: '' });
  };

  const cities = [...new Set(fees.map(f => f.city))];
  const zones = [...new Set(fees.map(f => f.zone))];

  const filteredFees = fees.filter(fee => {
    if (filterCity !== 'all' && fee.city !== filterCity) return false;
    if (filterZone !== 'all' && fee.zone !== filterZone) return false;
    return true;
  });

  const getZoneColor = (zone) => {
    switch (zone) {
      case 'A': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'C': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'D': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isLight ? 'bg-gray-50' : 'bg-[#0A0A0A]'}`}>
        <div className="p-6">
          <p className={isLight ? 'text-gray-600' : 'text-gray-400'}>Loading delivery fees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isLight ? 'bg-gray-50' : 'bg-[#0A0A0A]'}`}>
      <div className="p-6 max-w-7xl mx-auto">
        <AdminBackButton to={adminPath('admin')} label="Back to Admin" className="mb-6" />

        <div className="mb-6">
          <h1 className={`font-display text-3xl font-bold tracking-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>
            Delivery Fees Management
          </h1>
          <p className={`mt-2 text-sm ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
            Manage delivery fees by area
          </p>
        </div>

        {saveMessage && (
          <div className={`mb-4 p-3 rounded-lg border ${
            saveMessage.includes('success') 
              ? 'bg-green-500/20 border-green-500/30 text-green-400' 
              : 'bg-red-500/20 border-red-500/30 text-red-400'
          }`}>
            {saveMessage}
          </div>
        )}

        {/* Filters */}
        <div className={`mb-6 p-4 rounded-lg border ${isLight ? 'bg-white border-gray-200' : 'bg-[#1A1A1A] border-[#2A2A2A]'}`}>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                City
              </label>
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className={`px-3 py-2 rounded-lg border text-sm ${
                  isLight 
                    ? 'bg-white border-gray-300 text-gray-900' 
                    : 'bg-[#0A0A0A] border-[#2A2A2A] text-white'
                }`}
              >
                <option value="all">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                Zone
              </label>
              <select
                value={filterZone}
                onChange={(e) => setFilterZone(e.target.value)}
                className={`px-3 py-2 rounded-lg border text-sm ${
                  isLight 
                    ? 'bg-white border-gray-300 text-gray-900' 
                    : 'bg-[#0A0A0A] border-[#2A2A2A] text-white'
                }`}
              >
                <option value="all">All Zones</option>
                {zones.map(zone => (
                  <option key={zone} value={zone}>Zone {zone}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Delivery Fees Table */}
        <div className={`rounded-lg border overflow-hidden ${isLight ? 'bg-white border-gray-200' : 'bg-[#1A1A1A] border-[#2A2A2A]'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isLight ? 'bg-gray-50' : 'bg-[#0A0A0A]'}>
                <tr>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                    Area
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                    City
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                    Zone
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                    Delivery Fee (NPR)
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                    ETA (min)
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-gray-200' : 'divide-[#2A2A2A]'}`}>
                {filteredFees.map((fee) => (
                  <tr key={fee.id}>
                    {editingFee?.id === fee.id ? (
                      <>
                        <td className="px-4 py-3">
                          <span className={`text-sm ${isLight ? 'text-gray-900' : 'text-white'}`}>
                            {fee.area_name}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm ${isLight ? 'text-gray-900' : 'text-white'}`}>
                            {fee.city}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getZoneColor(fee.zone)}`}>
                            Zone {fee.zone}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={editForm.delivery_fee}
                            onChange={(e) => setEditForm({ ...editForm, delivery_fee: e.target.value })}
                            className={`w-24 px-2 py-1 rounded border text-sm ${
                              isLight 
                                ? 'bg-white border-gray-300 text-gray-900' 
                                : 'bg-[#0A0A0A] border-[#2A2A2A] text-white'
                            }`}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={editForm.eta_minutes}
                            onChange={(e) => setEditForm({ ...editForm, eta_minutes: e.target.value })}
                            className={`w-20 px-2 py-1 rounded border text-sm ${
                              isLight 
                                ? 'bg-white border-gray-300 text-gray-900' 
                                : 'bg-[#0A0A0A] border-[#2A2A2A] text-white'
                            }`}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={handleSave}
                              className="px-3 py-1 rounded bg-green-500 text-white text-xs font-medium hover:bg-green-600"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancel}
                              className="px-3 py-1 rounded bg-gray-500 text-white text-xs font-medium hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>
                            {fee.area_name}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                            {fee.city}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getZoneColor(fee.zone)}`}>
                            Zone {fee.zone}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                            NPR {fee.delivery_fee.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                            {fee.eta_minutes} min
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleEdit(fee)}
                            className="px-3 py-1 rounded bg-[#C9A84C] text-[#0F0B08] text-xs font-medium hover:bg-[#b8973b]"
                          >
                            Edit
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className={`mt-6 p-4 rounded-lg border ${isLight ? 'bg-white border-gray-200' : 'bg-[#1A1A1A] border-[#2A2A2A]'}`}>
          <h3 className={`text-sm font-semibold mb-3 ${isLight ? 'text-gray-900' : 'text-white'}`}>
            Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Total Areas</p>
              <p className={`text-lg font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{fees.length}</p>
            </div>
            <div>
              <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Zone A Areas</p>
              <p className={`text-lg font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {fees.filter(f => f.zone === 'A').length}
              </p>
            </div>
            <div>
              <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Zone C Areas</p>
              <p className={`text-lg font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {fees.filter(f => f.zone === 'C').length}
              </p>
            </div>
            <div>
              <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Zone D Areas</p>
              <p className={`text-lg font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {fees.filter(f => f.zone === 'D').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
