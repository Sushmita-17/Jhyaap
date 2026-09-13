-- Delivery fees management table
-- Allows admin to control delivery fees per area

CREATE TABLE IF NOT EXISTS public.delivery_fees (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  area_name TEXT UNIQUE NOT NULL,
  city TEXT NOT NULL,
  zone TEXT NOT NULL,
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  eta_minutes INTEGER NOT NULL DEFAULT 30,
  lat NUMERIC(10,6),
  lng NUMERIC(10,6),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_delivery_fees_area_name ON public.delivery_fees(area_name);
CREATE INDEX IF NOT EXISTS idx_delivery_fees_city ON public.delivery_fees(city);
CREATE INDEX IF NOT EXISTS idx_delivery_fees_zone ON public.delivery_fees(zone);
CREATE INDEX IF NOT EXISTS idx_delivery_fees_active ON public.delivery_fees(is_active);

-- Insert initial delivery fees from existing hardcoded data
INSERT INTO public.delivery_fees (area_name, city, zone, delivery_fee, eta_minutes, lat, lng) VALUES
-- Kathmandu — Zone A (core) - 80 NPR, 35 min
('Thamel', 'Kathmandu', 'A', 80, 35, 27.7154, 85.3123),
('New Baneshwor', 'Kathmandu', 'A', 80, 35, 27.6889, 85.3375),
('Putalisadak', 'Kathmandu', 'A', 80, 35, 27.705, 85.319),
('Durbarmarg', 'Kathmandu', 'A', 80, 35, 27.712, 85.317),
('New Road', 'Kathmandu', 'A', 80, 35, 27.7045, 85.3108),
('Kamaladi', 'Kathmandu', 'A', 80, 35, 27.7098, 85.3165),
('Asan', 'Kathmandu', 'A', 80, 35, 27.7072, 85.3125),
('Maitighar', 'Kathmandu', 'A', 80, 35, 27.6935, 85.3205),
('Bhadrakali', 'Kathmandu', 'A', 80, 35, 27.698, 85.324),
('Bhotebahal', 'Kathmandu', 'A', 80, 35, 27.691, 85.318),
('Pakhnajol', 'Kathmandu', 'A', 80, 35, 27.718, 85.314),
('Jyatha', 'Kathmandu', 'A', 80, 35, 27.716, 85.309),
('Kichhen', 'Kathmandu', 'A', 80, 35, 27.713, 85.311),
('Indrachowk', 'Kathmandu', 'A', 80, 35, 27.708, 85.309),
('Ason', 'Kathmandu', 'A', 80, 35, 27.706, 85.311),
('Lazimpat', 'Kathmandu', 'A', 80, 35, 27.728, 85.322),
('Baluwatar', 'Kathmandu', 'A', 80, 35, 27.726, 85.329),
('Maharajgunj', 'Kathmandu', 'A', 80, 35, 27.736, 85.325),
('Naxal', 'Kathmandu', 'A', 80, 35, 27.72, 85.333),
('Sinamangal', 'Kathmandu', 'A', 80, 35, 27.698, 85.352),
('Chabahil', 'Kathmandu', 'A', 80, 35, 27.7215, 85.3482),
('Gaushala', 'Kathmandu', 'A', 80, 35, 27.7095, 85.3412),
('Gongabu', 'Kathmandu', 'A', 80, 35, 27.7355, 85.3155),
('Samakhusi', 'Kathmandu', 'A', 80, 35, 27.7298, 85.3085),
('Balaju', 'Kathmandu', 'A', 80, 35, 27.7342, 85.3012),
('Swayambhu', 'Kathmandu', 'A', 80, 35, 27.7145, 85.2905),
('Boudha', 'Kathmandu', 'A', 80, 35, 27.7215, 85.3625),
('Baneshwor', 'Kathmandu', 'A', 80, 35, 27.691, 85.341),
('Minbhawan', 'Kathmandu', 'A', 80, 35, 27.694, 85.335),
('Baneswor', 'Kathmandu', 'A', 80, 35, 27.689, 85.338),
('Tinkune', 'Kathmandu', 'A', 80, 35, 27.685, 85.328),
('Siphal', 'Kathmandu', 'A', 80, 35, 27.688, 85.345),
('Khusibu', 'Kathmandu', 'A', 80, 35, 27.732, 85.318),
('Naradevi', 'Kathmandu', 'A', 80, 35, 27.716, 85.324),
('Khalibari', 'Kathmandu', 'A', 80, 35, 27.719, 85.328),
('Sundhara', 'Kathmandu', 'A', 80, 35, 27.697, 85.322),
('Dillibazar', 'Kathmandu', 'A', 80, 35, 27.724, 85.335),
('Sanothimi', 'Kathmandu', 'A', 80, 35, 27.682, 85.376),
('Balkhu', 'Kathmandu', 'A', 80, 35, 27.682, 85.295),
('Satungal', 'Kathmandu', 'A', 80, 35, 27.705, 85.285),
('Koteshwor', 'Kathmandu', 'A', 80, 35, 27.678, 85.349),
('Jorpati', 'Kathmandu', 'A', 80, 35, 27.7165, 85.3655),
('Kapan', 'Kathmandu', 'A', 80, 35, 27.7245, 85.3515),
('Budhanilkantha', 'Kathmandu', 'A', 80, 35, 27.771, 85.361),
('Kalanki', 'Kathmandu', 'A', 80, 35, 27.6935, 85.2815),
('Kalimati', 'Kathmandu', 'A', 80, 35, 27.6985, 85.2985),
('Teku', 'Kathmandu', 'A', 80, 35, 27.6995, 85.3075),
('Tripureshwor', 'Kathmandu', 'A', 80, 35, 27.6925, 85.3125),
('Shankhamul', 'Kathmandu', 'A', 80, 35, 27.6865, 85.3265),
('Naagpokhari', 'Kathmandu', 'A', 80, 35, 27.723, 85.331),
('Mahankal', 'Kathmandu', 'A', 80, 35, 27.717, 85.338),
('Gyaneshwor', 'Kathmandu', 'A', 80, 35, 27.712, 85.328),
('Sukedhara', 'Kathmandu', 'A', 80, 35, 27.715, 85.342),
('Dhumbarahi', 'Kathmandu', 'A', 80, 35, 27.742, 85.338),
('Chundevi', 'Kathmandu', 'A', 80, 35, 27.738, 85.332),
('Maharajgunj Chok', 'Kathmandu', 'A', 80, 35, 27.735, 85.326),
('Narayanthan', 'Kathmandu', 'A', 80, 35, 27.718, 85.295),
('Kirtipur', 'Kathmandu', 'A', 80, 35, 27.678, 85.277),
('Macchegaun', 'Kathmandu', 'A', 80, 35, 27.665, 85.282),
('Panga', 'Kathmandu', 'A', 80, 35, 27.682, 85.272),
('Thapathali', 'Kathmandu', 'A', 80, 35, 27.685, 85.315),
('Balkot', 'Kathmandu', 'A', 80, 35, 27.695, 85.365),
('Gokarna', 'Kathmandu', 'A', 80, 35, 27.748, 85.375),
('Mulpani', 'Kathmandu', 'A', 80, 35, 27.728, 85.375),
('Tokha', 'Kathmandu', 'A', 80, 35, 27.755, 85.345),
('Dhapasi', 'Kathmandu', 'A', 80, 35, 27.745, 85.335),
('Goldhunga', 'Kathmandu', 'A', 80, 35, 27.765, 85.325),
('Ramkot', 'Kathmandu', 'A', 80, 35, 27.758, 85.305),
('Syuchatar', 'Kathmandu', 'A', 80, 35, 27.715, 85.275),
('Chandragiri', 'Kathmandu', 'A', 80, 35, 27.705, 85.265),
('Tinthana', 'Kathmandu', 'A', 80, 35, 27.725, 85.285),
('Naikap', 'Kathmandu', 'A', 80, 35, 27.735, 85.275),
('Thankot', 'Kathmandu', 'A', 80, 35, 27.695, 85.255),
('Nagarjun', 'Kathmandu', 'A', 80, 35, 27.745, 85.295),
('Jhor', 'Kathmandu', 'A', 80, 35, 27.755, 85.355),
('Sundarijal', 'Kathmandu', 'A', 80, 35, 27.765, 85.385),
('Mulkharka', 'Kathmandu', 'A', 80, 35, 27.775, 85.375),
('Sankhu', 'Kathmandu', 'A', 80, 35, 27.735, 85.395),
('Dharmasthali', 'Kathmandu', 'A', 80, 35, 27.748, 85.315),
('Manamaiju', 'Kathmandu', 'A', 80, 35, 27.742, 85.325),
('Mahankalchaur', 'Kathmandu', 'A', 80, 35, 27.718, 85.338),
('Bansbari', 'Kathmandu', 'A', 80, 35, 27.738, 85.345),
('Kuleshwor', 'Kathmandu', 'A', 80, 35, 27.685, 85.285),
('Soaltee Mode', 'Kathmandu', 'A', 80, 35, 27.695, 85.28),
('Nayabazar', 'Kathmandu', 'A', 80, 35, 27.67, 85.31),
-- Lalitpur — Zone C/D - 120/150 NPR, 55-90 min
('Satdobato', 'Lalitpur', 'C', 120, 60, 27.658, 85.325),
('Tikathali', 'Lalitpur', 'C', 120, 60, 27.665, 85.365),
('Pulchowk', 'Lalitpur', 'C', 120, 55, 27.6815, 85.3185),
('Jawalakhel', 'Lalitpur', 'C', 120, 55, 27.6725, 85.3145),
('Kupondole', 'Lalitpur', 'C', 120, 55, 27.6865, 85.3155),
('Sanepa', 'Lalitpur', 'C', 120, 55, 27.6785, 85.3115),
('Ekantakuna', 'Lalitpur', 'C', 120, 55, 27.6665, 85.3085),
('Lagankhel', 'Lalitpur', 'C', 120, 55, 27.6668, 85.3245),
('Kumaripati', 'Lalitpur', 'C', 120, 55, 27.6705, 85.3195),
('Imadol', 'Lalitpur', 'C', 120, 65, 27.6555, 85.3485),
('Lubhu', 'Lalitpur', 'C', 120, 65, 27.6485, 85.3385),
('Godawari', 'Lalitpur', 'D', 150, 90, 27.6125, 85.3815),
('Bungamati', 'Lalitpur', 'D', 150, 85, 27.6385, 85.3015),
('Harisiddhi', 'Lalitpur', 'D', 150, 85, 27.6315, 85.3315),
('Thaiba', 'Lalitpur', 'D', 150, 90, 27.6215, 85.3515),
('Lalitpur', 'Lalitpur', 'D', 150, 70, 27.6588, 85.3247),
('Patan', 'Lalitpur', 'D', 150, 70, 27.6766, 85.325),
('Dhobighat', 'Lalitpur', 'D', 150, 75, 27.6645, 85.2915),
('Nakhipot', 'Lalitpur', 'D', 150, 75, 27.6525, 85.3015),
('Chapagaun', 'Lalitpur', 'D', 150, 75, 27.645, 85.295),
('Bhaisepati', 'Lalitpur', 'D', 150, 75, 27.66, 85.31),
('Dhapakhel', 'Lalitpur', 'D', 150, 75, 27.655, 85.32),
('Khokana', 'Lalitpur', 'D', 150, 75, 27.635, 85.29),
-- Bhaktapur — Zone D - 150 NPR, 85-100 min
('Bhaktapur', 'Bhaktapur', 'D', 150, 90, 27.671, 85.4298),
('Madhyapur Thimi', 'Bhaktapur', 'D', 150, 85, 27.6785, 85.3845),
('Suryabinayak', 'Bhaktapur', 'D', 150, 95, 27.6515, 85.4215),
('Jagati', 'Bhaktapur', 'D', 150, 90, 27.6845, 85.4115),
('Kausaltar', 'Bhaktapur', 'D', 150, 85, 27.6915, 85.3715),
('Balkot', 'Bhaktapur', 'D', 150, 90, 27.6655, 85.3915),
('Sallaghari', 'Bhaktapur', 'D', 150, 95, 27.6585, 85.4015),
('Changunarayan', 'Bhaktapur', 'D', 150, 100, 27.7155, 85.4285),
('Sirutar', 'Bhaktapur', 'D', 150, 95, 27.6485, 85.4185),
('Bode', 'Bhaktapur', 'D', 150, 90, 27.675, 85.395),
('Siddhapur', 'Bhaktapur', 'D', 150, 90, 27.68, 85.42),
('Tatopati', 'Bhaktapur', 'D', 150, 90, 27.672, 85.432),
('Byasi', 'Bhaktapur', 'D', 150, 90, 27.665, 85.415),
('Gatthaghar', 'Bhaktapur', 'D', 150, 90, 27.66, 85.405),
('Kamalbinayak', 'Bhaktapur', 'D', 150, 90, 27.668, 85.425),
('Nagarikot', 'Bhaktapur', 'D', 150, 90, 27.655, 85.41)
ON CONFLICT (area_name) DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_delivery_fees_updated_at
    BEFORE UPDATE ON public.delivery_fees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.delivery_fees TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
