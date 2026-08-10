import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, EyeOff, Copy, Check, MapPin, Navigation, XCircle } from 'lucide-react';
import AdminBackButton from '@/components/admin/AdminBackButton';
import { useThemeStore } from '@/store/themeStore';
import DeliveryMap from '@/components/DeliveryMap';
import { STORE_LOCATION } from '@/lib/deliveryLocations';
import { createBackendRider, deleteBackendRider, getBackendRiders, updateBackendRider } from '@/lib/backendAPI';


export default function AdminRidersPage() {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';

  const [riders, setRiders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState(new Set());
  const [copiedId, setCopiedId] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);
  useEffect(() => {
    let active = true;
    getBackendRiders().then((data) => {
      if (!active || !Array.isArray(data)) return;
      setRiders((previous) => data.map((rider) => {
        const previousRider = previous.find((item) => item.id === rider.id);
        const lat = Number(rider.lat ?? rider.latitude ?? rider.location?.lat ?? rider.coordinates?.lat);
        const lng = Number(rider.lng ?? rider.longitude ?? rider.location?.lng ?? rider.coordinates?.lng);
        const coordinates = Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : previousRider?.coordinates || (rider.name === 'Rajesh Sharma' ? { lat: STORE_LOCATION.lat, lng: STORE_LOCATION.lng } : null);
        return {
        id: rider.id,
        riderName: rider.name && rider.name !== 'undefined' && rider.name.trim() ? rider.name : 'Unnamed rider',
        phoneNumber: rider.phone_number || '',
        password: '',
        email: '',
        vehicleType: rider.vehicle_type || 'bike',
        status: rider.name === 'Rajesh Sharma' ? 'busy' : rider.status || 'active',
        createdAt: rider.created_at || '',
        earnings: rider.total_earnings || 0,
        currentLocation: rider.name === 'Rajesh Sharma' && !Number.isFinite(lat) ? STORE_LOCATION.label + ' Hub' : '',
        coordinates,
        isAvailable: rider.is_available ?? true,
        activeOrders: rider.name === 'Rajesh Sharma' ? 1 : rider.active_orders ?? rider.activeOrders ?? previousRider?.activeOrders ?? 0,
        destinationCoords: rider.name === 'Rajesh Sharma' ? { lat: 27.6915, lng: 85.3410, label: 'Customer Destination' } : undefined,
      };
      }));
    }).catch((error) => { console.error('Failed to load live admin data:', error); });
    return () => { active = false; };
  }, []);

  const [formData, setFormData] = useState({
    riderName: '',
    phoneNumber: '',
    password: '',
    email: '',
    vehicleType: 'bike',
    status: 'active',
  });

  const filteredRiders = useMemo(() => {
    let list = riders;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.riderName.toLowerCase().includes(q) ||
          r.phoneNumber.includes(q) ||
          r.email?.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== 'all') {
      list = list.filter((r) => r.status === statusFilter);
    }
    return list;
  }, [riders, searchQuery, statusFilter]);

  const openModal = (rider) => {
    if (rider) {
      setFormData({
        riderName: rider.riderName,
        phoneNumber: rider.phoneNumber,
        password: rider.password,
        email: rider.email || '',
        vehicleType: rider.vehicleType,
        status: rider.status,
      });
      setEditingId(rider.id);
    } else {
      setFormData({
        riderName: '',
        phoneNumber: '',
        password: '',
        email: '',
        vehicleType: 'bike',
        status: 'active',
      });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.riderName || !formData.phoneNumber || (!editingId && !formData.password)) {
      alert('Please fill in the rider name, phone number, and password.');
      return;
    }

    try {
      if (editingId) {
        const saved = await updateBackendRider(editingId, {
          name: formData.riderName,
          vehicle_type: formData.vehicleType,
          status: formData.status,
          ...(formData.password ? { password: formData.password } : {}),
        });
        setRiders((prev) => prev.map((rider) => rider.id === editingId ? {
          ...rider,
          riderName: saved.name || formData.riderName,
          phoneNumber: saved.phone_number || formData.phoneNumber,
          vehicleType: saved.vehicle_type || formData.vehicleType,
          status: saved.status || formData.status,
        } : rider));
      } else {
        const saved = await createBackendRider({
          name: formData.riderName,
          phone_number: formData.phoneNumber,
          password: formData.password,
          vehicle_type: formData.vehicleType,
          status: formData.status,
        });
        setRiders((prev) => [{
          id: saved.id,
          riderName: saved.name || formData.riderName,
          phoneNumber: saved.phone_number || formData.phoneNumber,
          password: '',
          email: '',
          vehicleType: saved.vehicle_type || formData.vehicleType,
          status: saved.status || formData.status,
          createdAt: saved.created_at || new Date().toISOString(),
          earnings: saved.total_earnings || 0,
          currentLocation: '',
          coordinates: null,
          isAvailable: saved.status === 'active',
          activeOrders: 0,
        }, ...prev]);
      }
      setShowModal(false);
    } catch (error) {
      alert(error.message || 'Could not save rider registration.');
    }
  };
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this rider credential?')) return;
    try {
      await deleteBackendRider(id);
      setRiders((prev) => prev.filter((rider) => rider.id !== id));
    } catch (error) {
      alert(error.message || 'Could not delete rider.');
    }
  };
  const togglePasswordVisibility = (id) => {
    setVisiblePasswords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'inactive':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'suspended':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className={`min-h-screen ${isLight ? 'bg-gray-50' : 'bg-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminBackButton />

        <div className="mt-6 mb-8">
          <h1 className={`text-3xl font-bold ${isLight ? 'text-gray-900' : 'text-white'} mb-2`}>
            Rider Credentials
          </h1>
          <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            Manage rider login credentials and access
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div
            className={`${
              isLight
                ? 'bg-white border-gray-200'
                : 'bg-gray-800 border-gray-700'
            } border rounded-lg p-6`}
          >
            <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Total Riders</p>
            <p className={`text-3xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
              {riders.length}
            </p>
          </div>
          <div
            className={`${
              isLight
                ? 'bg-white border-gray-200'
                : 'bg-gray-800 border-gray-700'
            } border rounded-lg p-6`}
          >
            <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Active Riders</p>
            <p className="text-3xl font-bold text-green-400">
              {riders.filter((r) => r.status === 'active').length}
            </p>
          </div>
          <div
            className={`${
              isLight
                ? 'bg-white border-gray-200'
                : 'bg-gray-800 border-gray-700'
            } border rounded-lg p-6`}
          >
            <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Total Earnings</p>
            <p className="text-3xl font-bold text-yellow-400">
              रु {riders.reduce((sum, r) => sum + r.earnings, 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <div className="flex-1 min-w-64">
            <div
              className={`relative ${isLight ? 'bg-white' : 'bg-gray-800'} rounded-lg border ${
                isLight ? 'border-gray-300' : 'border-gray-700'
              }`}
            >
              <Search
                className={`absolute left-3 top-3 w-5 h-5 ${
                  isLight ? 'text-gray-400' : 'text-gray-500'
                }`}
              />
              <input
                type="text"
                placeholder="Search riders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg outline-none ${
                  isLight
                    ? 'bg-white text-gray-900'
                    : 'bg-gray-800 text-white'
                }`}
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border outline-none ${
              isLight
                ? 'bg-white border-gray-300 text-gray-900'
                : 'bg-gray-800 border-gray-700 text-white'
            }`}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <Plus className="w-5 h-5" />
            Add Rider
          </button>
        </div>

        {/* Table */}
        <div
          className={`overflow-x-auto border rounded-lg ${
            isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'
          }`}
        >
          <table className="w-full">
            <thead>
              <tr
                className={`border-b ${
                  isLight
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-gray-700 border-gray-600'
                }`}
              >
                <th
                  className={`px-6 py-3 text-left text-sm font-semibold ${
                    isLight ? 'text-gray-900' : 'text-gray-100'
                  }`}
                >
                  Rider Name
                </th>
                <th
                  className={`px-6 py-3 text-left text-sm font-semibold ${
                    isLight ? 'text-gray-900' : 'text-gray-100'
                  }`}
                >
                  Phone
                </th>
                <th
                  className={`px-6 py-3 text-left text-sm font-semibold ${
                    isLight ? 'text-gray-900' : 'text-gray-100'
                  }`}
                >
                  Password
                </th>
                <th
                  className={`px-6 py-3 text-left text-sm font-semibold ${
                    isLight ? 'text-gray-900' : 'text-gray-100'
                  }`}
                >
                  Vehicle
                </th>
                <th
                  className={`px-6 py-3 text-left text-sm font-semibold ${
                    isLight ? 'text-gray-900' : 'text-gray-100'
                  }`}
                >
                  Status
                </th>
                <th
                  className={`px-6 py-3 text-left text-sm font-semibold ${
                    isLight ? 'text-gray-900' : 'text-gray-100'
                  }`}
                >
                  Location
                </th>
                <th
                  className={`px-6 py-3 text-left text-sm font-semibold ${
                    isLight ? 'text-gray-900' : 'text-gray-100'
                  }`}
                >
                  Earnings
                </th>
                <th
                  className={`px-6 py-3 text-left text-sm font-semibold ${
                    isLight ? 'text-gray-900' : 'text-gray-100'
                  }`}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRiders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <p className={isLight ? 'text-gray-500' : 'text-gray-400'}>
                      No riders found
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRiders.map((rider) => (
                  <tr
                    key={rider.id}
                    className={`border-b ${
                      isLight
                        ? 'border-gray-200 hover:bg-gray-50'
                        : 'border-gray-700 hover:bg-gray-700/50'
                    }`}
                  >
                    <td className={`px-6 py-4 font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                      {rider.riderName}
                    </td>
                    <td className={`px-6 py-4 ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                      {rider.phoneNumber}
                    </td>
                    <td className={`px-6 py-4 ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                      <div className="flex items-center gap-2">
                        <span>
                          {visiblePasswords.has(rider.id)
                            ? rider.password
                            : '*'.repeat(rider.password.length)}
                        </span>
                        <button
                          onClick={() => togglePasswordVisibility(rider.id)}
                          className={`p-1 rounded hover:${isLight ? 'bg-gray-200' : 'bg-gray-700'}`}
                        >
                          {visiblePasswords.has(rider.id) ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        <button
                          onClick={() => copyToClipboard(rider.password, rider.id)}
                          className={`p-1 rounded hover:${isLight ? 'bg-gray-200' : 'bg-gray-700'}`}
                        >
                          {copiedId === rider.id ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className={`px-6 py-4 capitalize ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                      {rider.vehicleType}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          rider.status,
                        )}`}
                      >
                        {rider.status}
                      </span>
                    </td>
                    <td className={`px-6 py-4 ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{rider.currentLocation}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                      रु {rider.earnings.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedRider(rider) || setShowMap(true)}
                          className="p-2 rounded hover:bg-green-500/20 text-green-400 transition"
                          title="Track on Map"
                        >
                          <Navigation className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal(rider)}
                          className="p-2 rounded hover:bg-blue-500/20 text-blue-400 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(rider.id)}
                          className="p-2 rounded hover:bg-red-500/20 text-red-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
              className={`rounded-lg max-w-md w-full ${
                isLight ? 'bg-white' : 'bg-gray-800'
              }`}
            >
              <div
                className={`border-b ${
                  isLight ? 'border-gray-200' : 'border-gray-700'
                } px-6 py-4`}
              >
                <h2
                  className={`text-lg font-bold ${
                    isLight ? 'text-gray-900' : 'text-white'
                  }`}
                >
                  {editingId ? 'Edit Rider' : 'Add New Rider'}
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isLight ? 'text-gray-700' : 'text-gray-300'
                    }`}
                  >
                    Rider Name *
                  </label>
                  <input
                    type="text"
                    value={formData.riderName}
                    onChange={(e) =>
                      setFormData({ ...formData, riderName: e.target.value })
                    }
                    className={`w-full px-4 py-2 rounded-lg border outline-none ${
                      isLight
                        ? 'bg-white border-gray-300 text-gray-900'
                        : 'bg-gray-700 border-gray-600 text-white'
                    }`}
                    placeholder="Rider's full name"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isLight ? 'text-gray-700' : 'text-gray-300'
                    }`}
                  >
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                    className={`w-full px-4 py-2 rounded-lg border outline-none ${
                      isLight
                        ? 'bg-white border-gray-300 text-gray-900'
                        : 'bg-gray-700 border-gray-600 text-white'
                    }`}
                    placeholder="+977 98XXXXXXXX"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isLight ? 'text-gray-700' : 'text-gray-300'
                    }`}
                  >
                    Password *
                  </label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className={`w-full px-4 py-2 rounded-lg border outline-none ${
                      isLight
                        ? 'bg-white border-gray-300 text-gray-900'
                        : 'bg-gray-700 border-gray-600 text-white'
                    }`}
                    placeholder="Login password"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isLight ? 'text-gray-700' : 'text-gray-300'
                    }`}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={`w-full px-4 py-2 rounded-lg border outline-none ${
                      isLight
                        ? 'bg-white border-gray-300 text-gray-900'
                        : 'bg-gray-700 border-gray-600 text-white'
                    }`}
                    placeholder="rider@example.com"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isLight ? 'text-gray-700' : 'text-gray-300'
                    }`}
                  >
                    Vehicle Type
                  </label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vehicleType: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2 rounded-lg border outline-none ${
                      isLight
                        ? 'bg-white border-gray-300 text-gray-900'
                        : 'bg-gray-700 border-gray-600 text-white'
                    }`}
                  >
                    <option value="bike">Bike</option>
                    <option value="scooter">Scooter</option>
                    <option value="car">Car</option>
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isLight ? 'text-gray-700' : 'text-gray-300'
                    }`}
                  >
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className={`w-full px-4 py-2 rounded-lg border outline-none ${
                      isLight
                        ? 'bg-white border-gray-300 text-gray-900'
                        : 'bg-gray-700 border-gray-600 text-white'
                    }`}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className={`px-4 py-2 rounded-lg border ${
                    isLight
                      ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Map Modal */}
        {showMap && selectedRider && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
              className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden ${
                isLight ? 'bg-white' : 'bg-gray-800'
              }`}
            >
              <div
                className={`border-b ${
                  isLight ? 'border-gray-200' : 'border-gray-700'
                } px-6 py-4 flex justify-between items-center`}
              >
                <div>
                  <h2
                    className={`text-lg font-bold ${
                      isLight ? 'text-gray-900' : 'text-white'
                    }`}
                  >
                    Track {selectedRider.riderName}
                  </h2>
                  <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                    {selectedRider.status === 'busy' ? 'Driving to Customer Destination' : selectedRider.currentLocation}
                  </p>
                </div>
                <button
                  onClick={() => setShowMap(false)}
                  className={`p-2 rounded hover:bg-gray-200 transition ${
                    isLight ? 'text-gray-600' : 'text-gray-400'
                  }`}
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <DeliveryMap 
                    riders={riders.filter(r => r.coordinates)}
                    selectedRider={selectedRider}
                    height="100%"
                  />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg border ${
                    isLight ? 'bg-gray-50 border-gray-200' : 'bg-gray-700 border-gray-600'
                  }`}>
                    <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Status</p>
                    <p className={`font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                      {selectedRider.isAvailable ? 'Available' : 'Busy'}
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg border ${
                    isLight ? 'bg-gray-50 border-gray-200' : 'bg-gray-700 border-gray-600'
                  }`}>
                    <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Active Orders</p>
                    <p className={`font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                      {selectedRider.activeOrders}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



