import * as React from "react";
import ReactMapGL, { Marker, Popup } from "react-map-gl";
import { useEffect, useState } from "react";

import { Room, Star } from "@material-ui/icons";
import axios from "axios";
import "./App.css";
import { format } from "timeago.js";
import Register from "./compontents/Register"
import Login from "./compontents/Login";

function App() {
  const myStorage = window.localStorage;
  const [currentUser, setCurrentUser] = useState(myStorage.getItem("user"));
  const [pins, setPins] = useState([]);
  const [currentPlaceId, setCurrentPlaceId] = useState(null);
  const [newPlace, setNewPlace] = useState(null);
  const [title, setTitle] = useState(null);
  const [desc, setDesc] = useState(null);
  const [rating, setRating] = useState(0);
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [viewport, setViewport] = useState({
    width: "100vw",
    height: "100vh",
    latitude: 46,
    longitude: 60,
    zoom: 3,
  });

  const [images, setImages] = useState([]);

  useEffect(() => {
    const getPins = async () => {
      try {
        const res = await axios.get(process.env.REACT_APP_BASE_URL + "/pins");
        setPins(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getPins();
  }, [])

  const handleMarkerClick = (id, lat, long) => {
    setCurrentPlaceId(id);
    setViewport({
      ...viewport,
      latitude: lat,
      longitude: long
    });
  }

  const handleAddClick = (e) => {
    e.preventDefault();
    const [longitude, latitude] = e.lngLat;
    setNewPlace({
      lat: latitude,
      long: longitude,
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("username", currentUser);
    formData.append("title", title);
    formData.append("desc", desc);
    formData.append("rating", rating);

    // Convert lat and long to integers before appending to FormData
    formData.append("lat", parseInt(newPlace.lat, 10));
    formData.append("long", parseInt(newPlace.long, 10));

    // Append each image file
    images.forEach((image, index) => {
      formData.append(`images`, image);
    });

    try {
      const res = await axios.post(process.env.REACT_APP_BASE_URL + "/pins", formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
        });
      setPins([...pins, res.data]);
      setNewPlace(null);
    } catch (err) {
      console.error("Error while posting pin:", err);
    }
  };

  const handleImageUpload = (e) => {
    const files = e.target.files;
    const newImages = Array.from(files);
    setImages(newImages);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    myStorage.removeItem("user");
  };

  return (
    <div className="App">
      <ReactMapGL
        {...viewport}
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        onViewportChange={(viewport) => setViewport(viewport)}
        onDblClick={currentUser && handleAddClick}
        transitionDuration="200"
      >
        {pins.map(p => (
          <>
            <Marker
              latitude={p.lat}
              longitude={p.long}
              offsetLeft={-viewport.zoom * 3.5}
              offsetTop={-viewport.zoom * 7}>
              <Room
                style={{
                  fontSize: viewport.zoom * 7,
                  color: p.username === currentUser ? "red" : "slateblue",
                  cursor: "pointer"
                }}
                onClick={() => handleMarkerClick(p._id, p.lat, p.long)}
              />
            </Marker>
            {p._id === currentPlaceId &&
              <Popup
                latitude={p.lat}
                longitude={p.long}
                closeButton={true}
                closeOnClick={false}
                anchor="left"
                onClose={() => setCurrentPlaceId(null)}
              >
                <div className="card">
                  <label>Place</label>
                  <h4 className="place">{p.title}</h4>
                  <label>Review</label>
                  <p className="desc">{p.desc}</p>
                  <label>Rating</label>
                  <div className="stars">
                    {Array.from({ length: p.rating }).map((_, index) => (
                      <Star key={index} className="star" />
                    ))}
                  </div>
                  { p.images.length>0 &&
                    <div>
                      <label> Images </label>
                      <div className="image">
                      {p.images.map((image, index) => (
                      <img key={index} src={`${process.env.REACT_APP_BASE_URL.replace('/api', '')}` + image} alt={`Image ${index}`} />
                      ))}
                      </div>
                    </div>
                  }
                  <label>Information</label>
                  <span className="username">Created by <b>{p.username}</b></span>
                  <span className="date">{format(p.createdAt)}</span>
                </div>

              </Popup>
            }
          </>
        ))}
        {newPlace && (
          <Popup
            latitude={newPlace.lat}
            longitude={newPlace.long}
            closeButton={true}
            closeOnClick={false}
            anchor="left"
            onClose={() => setNewPlace(null)}
          > <div>
              <form onSubmit={handleSubmit}>
                <label> Title </label>
                <input placeholder="Enter a title "
                  onChange={(e) => setTitle(e.target.value)}
                />
                <label> Review </label>
                <textarea placeholder="A breif about this place "
                  onChange={(e) => setDesc(e.target.value)}
                />
                <label>Images</label>
                <input type="file" name='images' multiple
                  onChange={(e) => handleImageUpload(e)} />
                <label> Rating </label>
                <select
                  onChange={(e) => setRating(e.target.value)}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
                <button type="submit" className="submitButton"> Add Pin </button>
              </form>
            </div>
          </Popup>
        )}
        {currentUser ? (
          <button className="button logout" onClick={handleLogout}>Log out</button>
        ) : (
          <div className="buttons">
            <button className="button login" onClick={() => {
              setShowLogin(true);
              setShowRegister(false);
              setCurrentPlaceId(null);
            }
            }>Log in</button>
            <button className="button register" onClick={() => {
              setShowRegister(true);
              setShowLogin(false);
              setCurrentPlaceId(null);
            }
            } >Register</button>
          </div>)}

        {showRegister && <Register setShowRegister={setShowRegister} />}
        {showLogin && <Login setShowLogin={setShowLogin} myStorage={myStorage} setCurrentUser={setCurrentUser} />}
      </ReactMapGL>

    </div>
  );
}

export default App;