import axios from "axios";

export const getGeocode = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: "lat and lon are required" });
    }

    const { data } = await axios.get("https://nominatim.openstreetmap.org/reverse", {
      params: {
        format: "json",
        lat,
        lon,
        addressdetails: 1,
      },
      headers: {
        "User-Agent": "YourAppName/1.0 (your@email.com)" // required by Nominatim
      }
    });

    res.json(data);
  } catch (error) {
    console.error("Geocode error:", error.message);
    res.status(500).json({ error: "Geocoding failed" });
  }
};
