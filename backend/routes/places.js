const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, type } = req.query;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    console.log('Requesting places with params:', { location: `${lat},${lng}`, radius: 5000, type });

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params: {
        location: `${lat},${lng}`,
        radius: 10000,
        type: type,
        key: apiKey,
      },
    });

    
    console.log('Google Places API Response:', response.data);

    res.json(response.data);
  } catch (error) {
    
    console.error('Error fetching places:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error fetching places' });
  }
});

module.exports = router;
