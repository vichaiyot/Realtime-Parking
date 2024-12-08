import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, get } from "firebase/database";
import { getStorage } from 'firebase/storage';
import './App.css';
import car1Image from './img/car1.png';

function App() {
  const firebaseConfig = {
    apiKey: "AIzaSyBQjpw-E5-K6y60R3gD97moqdMaIMik",
    authDomain: "realtime-parking-bf00c.firebaseapp.com",
    databaseURL: "https://realtime-parking-bf00c-default-rtdb.firebaseio.com",
    projectId: "realtime-parking-bf00c",
    storageBucket: "realtime-parking-bf00c.firebasestorage.app",
    messagingSenderId: "310377636017",
    appId: "1:310377636017:web:8091cfbad496b2e4f08290",
    measurementId: "G-7260PMWZ8L"
  };

  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const storage = getStorage(app);

  const [currentSection, setCurrentSection] = useState('book');
  const [sensorStates, setSensorStates] = useState({
    D1: false,
    D2: false,
    D3: false,
    D4: false
  });
  const [user, setUser] = useState({
    profilePicture: 'https://www.fareastmarble.com/wp-content/uploads/2021/08/G30-Indian-Black-web-scaled.jpg'
  });
  const [exitVisible, setExitVisible] = useState(false);
  const [boxesDisabled, setBoxesDisabled] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    const sensorRef = ref(database, "/Sensors");
    onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSensorStates({
          D1: data.Sensor1 === "FULL",
          D2: data.Sensor2 === "FULL",
          D3: data.Sensor3 === "FULL",
          D4: data.SensorD4 === "OBJECT_PRESENT"
        });
      }
    });
  }, [database]);

  const [loginData, setLoginData] = useState({
    firstname: '',
    lastname: '',
    cardID: '',
    profilePicture: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please upload a valid image file.");
        return;
      }
      const maxSize = 2 * 1024 * 1024; // 2 MB
      if (file.size > maxSize) {
        alert("File size exceeds 2 MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (!loginData.firstname || !loginData.lastname || !loginData.cardID) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน!");
      return;
    }

    try {
      const userId = loginData.firstname;  // ใช้ cardID เป็น userId

      const userRef = ref(database, "Users/" + userId);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        if (
          userData.firstname === loginData.firstname &&
          userData.cardID === loginData.cardID
        ) {
          alert("Login สำเร็จ!");

          setUser({
            firstname: userData.firstname,
            lastname: userData.lastname,
            profilePicture: imagePreview || 'https://www.fareastmarble.com/wp-content/uploads/2021/08/G30-Indian-Black-web-scaled.jpg',
            userId: loginData.cardID
          });

          setCurrentSection("book");

          setLoginData({
            firstname: '',
            lastname: '',
            cardID: '',
            password: '',
          });
          setImagePreview(null);
        } else {
          alert("ข้อมูลไม่ตรง กรุณาตรวจสอบอีกครั้ง!");
        }
      } else {
        alert("ไม่มีผู้ใช้นี้ในระบบ!");
      }
    } catch (error) {
      console.error("Error during login: ", error);
      alert("เกิดข้อผิดพลาดในระบบ กรุณาลองอีกครั้ง!");
    }
  };

  const handleExit = () => {
    const exitRef = ref(database, "/Exit");
    set(exitRef, "OPEN");

    setExitVisible(false);
    setBoxesDisabled(false);
    setSelectedSlot(null);

    // รีเซ็ตสถานะของช่องที่จอดสำหรับผู้ใช้ที่ล็อกอินอยู่
    const userId = user.userId;
    const slotRef = ref(database, `Bookings/${userId}/${selectedSlot}`);
    set(slotRef, null).then(() => {
      console.log(`Slot ${selectedSlot} has been reset for user ${userId}`);
    }).catch(error => {
      console.error("Error resetting slot status: ", error);
    });

    // รีเซ็ต UI ช่องจอด
    document.querySelectorAll('.box').forEach(box => {
      box.classList.remove('activ');
    });
  };

  const showSection = (sectionId) => {
    setCurrentSection(sectionId);
  };

  const selectBox = (element, slot) => {
    if (!user.userId) {
      alert("กรุณาล็อกอินก่อน!");
      return;
    }

    setBoxesDisabled(true);
    element.classList.add('activ');
    setSelectedSlot(slot);
    setExitVisible(true);

    const userId = user.userId;
    const slotRef = ref(database, `Bookings/${userId}`);
    set(slotRef, {
      [slot]: {
        status: "booked",
        user: `${user.firstname} ${user.lastname}`,
        profilePicture: user.profilePicture
      }
    }).then(() => {
      console.log(`Slot ${slot} has been booked for user ${userId}`);
    }).catch(error => {
      console.error("Error booking slot: ", error);
    });
  };

  return (
    <div>
      <header>
        <nav>
          <div className="logo">
            <h1>Realtime Parking</h1>
          </div>
          <div className="user">
            <div className="user-img">
              <img src={user.profilePicture} alt="user_img" style={{ width: '100%' }} />
            </div>
            <div className="user-name">
              <span className="user-name-fist">{user.firstname}</span>
              <span className="user-name-last">{user.lastname}</span>
            </div>
          </div>
        </nav>
      </header>

      <section>
        <div className="sliedbar">
          <div className="litsy" onClick={() => showSection('book')}>
            <p>Reserve Parking</p>
          </div>
          <div className="litsy" onClick={() => showSection('park')}>
            <p>Parking Car</p>
          </div>
          <div className="litsy" onClick={() => showSection('login')}>
            <p>Login</p>
          </div>
        </div>

        <div className="main-content">
          {currentSection === 'book' && (
            <div id="book">
              <div className="haeduser">
                <div className="userimg-head">
                  <img src={user.profilePicture} alt="" />
                </div>
                <div className="username">
                  <span className="username-fist">{user.firstname}</span>
                  <span className="username-last">{user.lastname}</span>
                </div>
              </div>
              <div className="box-book">
                <div
                  className={`box ${selectedSlot === 'A1' ? 'activ' : ''}`}
                  onClick={(e) => !boxesDisabled && selectBox(e.target, 'A1')}
                  style={{ cursor: boxesDisabled ? 'not-allowed' : 'pointer' }}
                >
                  <h4>A1</h4>
                </div>

                <div
                  className={`box ${selectedSlot === 'A2' ? 'activ' : ''}`}
                  onClick={(e) => !boxesDisabled && selectBox(e.target, 'A2')}
                  style={{ cursor: boxesDisabled ? 'not-allowed' : 'pointer' }}
                >
                  <h4>A2</h4>
                </div>

                <div
                  className={`box ${selectedSlot === 'A3' ? 'activ' : ''}`}
                  onClick={(e) => !boxesDisabled && selectBox(e.target, 'A3')}
                  style={{ cursor: boxesDisabled ? 'not-allowed' : 'pointer' }}
                >
                  <h4>A3</h4>
                </div>
              </div>

              {exitVisible && (
                <div className="exit">
                  <div className="exit-box">
                    <button
                      onClick={handleExit}
                      disabled={!sensorStates.D4}
                      className={`btn ${sensorStates.D4 ? 'enabled' : 'disabled'}`}
                    >
                      EXIT
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentSection === 'park' && (
            <div id="park">
              <div className="barall">
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
              </div>

              {(sensorStates.D1 && sensorStates.D2 && sensorStates.D3) ? (
                <div className="full-message">
                  <p>This parking lot is full, Sorry.</p>
                  <div className="cary1">
                    <img className="car1-display" src={car1Image} alt="Car 1" />
                  </div>
                  <div className="cary2">
                    <img className="car2-display" src={car1Image} alt="Car2" />
                  </div>
                  <div className="cary3">
                    <img className="car3-display" src={car1Image} alt="Car 3" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="car1">
                    <img
                      className="car1-display"
                      src={car1Image}
                      alt="Car 1"
                      style={{ display: sensorStates['D1'] ? 'block' : 'none' }}
                    />
                    {selectedSlot === 'A1' ? (
                      <img
                        className="user1-display"
                        src={user.profilePicture}
                        alt="User 1"
                        style={{ display: sensorStates['D1'] ? 'none' : 'block' }}
                      />
                    ) : (
                      <h2 className="log1" style={{ display: sensorStates['D1'] ? 'none' : 'block' }}>A1</h2>
                    )}
                  </div>
                  <div className="car2">
                    <img
                      className="car2-display"
                      src={car1Image}
                      alt="Car2"
                      style={{ display: sensorStates['D2'] ? 'block' : 'none' }}
                    />
                    {selectedSlot === 'A2' ? (
                      <img
                        className="user2-display"
                        src={user.profilePicture}
                        alt="User 2"
                        style={{ display: sensorStates['D2'] ? 'none' : 'block' }}
                      />
                    ) : (
                      <h2 className="log2" style={{ display: sensorStates['D2'] ? 'none' : 'block' }}>A2</h2>
                    )}
                  </div>
                  <div className="car3">
                    <img
                      className="car3-display"
                      src={car1Image}
                      alt="Car 3"
                      style={{ display: sensorStates['D3'] ? 'block' : 'none' }}
                    />
                    {selectedSlot === 'A3' ? (
                      <img
                        className="user3-display"
                        src={user.profilePicture}
                        alt="User 3"
                        style={{ display: sensorStates['D3'] ? 'none' : 'block' }}
                      />
                    ) : (
                      <h2 className="log3" style={{ display: sensorStates['D3'] ? 'none' : 'block' }}>A3</h2>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
                  
                  {currentSection === 'login' && (
            <div id="login">
              <div className="login-container">
              <h2>Login</h2>
              <form id="login-form" onSubmit={handleLoginSubmit}>
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="firstname"
                        value={loginData.firstname}
                        onChange={(e) => setLoginData({ ...loginData, firstname: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Lastname"
                        value={loginData.lastname}
                        onChange={(e) => setLoginData({ ...loginData, lastname: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Cardid"
                        value={loginData.cardID}
                        onChange={(e) => setLoginData({ ...loginData, cardID: e.target.value })}
                      />
                    </div>
                    
                    <div className="img-input">
                      <input type="file" accept="image/*" onChange={handleFileChange} />
                      <div className="image-preview" id="image-preview">
                        {imagePreview && <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%' }} />}
                      </div>
                    </div>
                    
                    <button type="submit">Login</button>
                  </form>
            </div>
          </div>
              
          )}
          
        </div>
      </section>
    </div>
  );
}

export default App;