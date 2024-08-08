import React, { useEffect, useState } from 'react';
import { GoogleMap, useLoadScript, Marker, Autocomplete } from '@react-google-maps/api';
import axios from 'axios';
import '../styles.css'; 

const mapContainerStyle = {
  width: '100vw',
  height: '100vh',
};

const libraries = ['places'];

const Map = ({ handleLogout }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [userData, setUserData] = useState(null);
  const [userLocation, setUserLocation] = useState({ lat: 0, lng: 0 });
  const [manualLocation, setManualLocation] = useState({ lat: '', lng: '' });
  const [isManual, setIsManual] = useState(false);
  const [places, setPlaces] = useState([]);
  const [placeType, setPlaceType] = useState('pharmacy');
  const [autocomplete, setAutocomplete] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          return;
        }
        const res = await axios.get('http://localhost:5000/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(res.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (!isManual && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          updateUserLocation(newLocation);
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
        }
      );
    }
  }, [isManual]);

  const updateUserLocation = async (newLocation) => {
    setUserLocation(newLocation);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
      await axios.post('http://localhost:5000/users/update-location', newLocation, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const newLocation = {
      lat: parseFloat(manualLocation.lat),
      lng: parseFloat(manualLocation.lng),
    };
    updateUserLocation(newLocation);
  };

  const findNearbyPlaces = async () => {
    try {
      const res = await axios.get('http://localhost:5000/places/nearby', {
        params: {
          lat: userLocation.lat,
          lng: userLocation.lng,
          type: placeType,
        },
      });

      const placesWithCoordinates = res.data.results.map(place => {
        const location = place.geometry.location;
        return {
          ...place,
          lat: typeof location.lat === 'function' ? location.lat() : location.lat,
          lng: typeof location.lng === 'function' ? location.lng() : location.lng,
        };
      });
      setPlaces(placesWithCoordinates);
    } catch (error) {
      console.error('Error fetching nearby places:', error);
    }
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const newLocation = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setUserLocation(userLocation); // Keep the user location
        setPlaces([newLocation]); // Mark the searched place
      }
    }
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps</div>;

  return (
    <div className="map-container">
      {userData && <div>Welcome, {userData.email}</div>}
      <button
        className="logout-button"
        onClick={() => {
          localStorage.removeItem('token');
          handleLogout();
        }}
      >
        Log Out
      </button>
      <button onClick={() => setIsManual(!isManual)}>
        {isManual ? 'Use Geolocation' : 'Enter Location Manually'}
      </button>
      {isManual && (
        <form onSubmit={handleManualSubmit}>
          <input
            type="number"
            value={manualLocation.lat}
            onChange={(e) => setManualLocation({ ...manualLocation, lat: e.target.value })}
            placeholder="Latitude"
            required
          />
          <input
            type="number"
            value={manualLocation.lng}
            onChange={(e) => setManualLocation({ ...manualLocation, lng: e.target.value })}
            placeholder="Longitude"
            required
          />
          <button type="submit">Update Location</button>
        </form>
      )}
      <div>
        <label htmlFor="placeType">Find nearby: </label>
        <select
          id="placeType"
          value={placeType}
          onChange={(e) => setPlaceType(e.target.value)}
        >
          <option value="pharmacy">Pharmacy</option>
          <option value="hospital">Hospital</option>
          <option value="restaurant">Restaurant</option>
          <option value="atm">ATM</option>
        </select>
        <button onClick={findNearbyPlaces}>Find Nearby {placeType}s</button>
      </div>
      <Autocomplete onLoad={(auto) => setAutocomplete(auto)} onPlaceChanged={onPlaceChanged}>
        <input type="text" placeholder="Search for a place" style={{ width: '400px' }} />
      </Autocomplete>
      <GoogleMap mapContainerStyle={mapContainerStyle} zoom={12} center={userLocation}>
        <Marker position={userLocation} icon="http://maps.google.com/mapfiles/ms/icons/red-dot.png" />
        {places.map((place, index) => (
          <Marker
            key={index}
            position={{ lat: place.lat, lng: place.lng }}
            icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
          />
        ))}
      </GoogleMap>
    </div>
  );
};

export default Map;
