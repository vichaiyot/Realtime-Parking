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

  const [user, setUser] = useState({
    userId: 'user123',
    profilePicture: 'https://www.fareastmarble.com/wp-content/uploads/2021/08/G30-Indian-Black-web-scaled.jpg',
    firstname: 'John',
    lastname: 'Doe',
  });
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookedSlots, setBookedSlots] = useState({}); // ใช้เก็บข้อมูลการจองทั้งหมด
  const [exitVisible, setExitVisible] = useState(false);
  const [boxesDisabled, setBoxesDisabled] = useState(false);

  // ดึงข้อมูลการจองจาก Firebase
  useEffect(() => {
    const bookingsRef = ref(database, "Bookings");
    onValue(bookingsRef, (snapshot) => {
      const data = snapshot.val();
      setBookedSlots(data || {});
    });
  }, [database]);

  // ฟังก์ชั่นสำหรับการจองที่จอดรถ
  const selectBox = (element, slot) => {
    if (!user.userId) {
      alert("กรุณาล็อกอินก่อน!");
      return;
    }

    // ตรวจสอบว่าช่องนี้ถูกจองไปแล้วหรือยัง
    if (bookedSlots[slot]) {
      alert(`ช่อง ${slot} ถูกจองแล้ว!`);
      return;
    }

    setBoxesDisabled(true);
    element.classList.add('activ');
    setSelectedSlot(slot);
    setExitVisible(true);

    // เพิ่มข้อมูลการจองช่องใน Firebase
    const userId = user.userId;
    const slotRef = ref(database, `Bookings/${slot}`);
    set(slotRef, {
      status: "booked",
      user: `${user.firstname} ${user.lastname}`,
      profilePicture: user.profilePicture
    }).then(() => {
      console.log(`Slot ${slot} has been booked for user ${userId}`);
    }).catch(error => {
      console.error("Error booking slot: ", error);
    });
  };

  // ฟังก์ชั่นสำหรับการออกจากที่จอดรถ
  const handleExit = () => {
    const exitRef = ref(database, "/Exit");
    set(exitRef, "OPEN");

    setExitVisible(false);
    setBoxesDisabled(false);
    setSelectedSlot(null);

    // รีเซ็ตสถานะของช่องที่จอดสำหรับผู้ใช้ที่ล็อกอินอยู่
    const slotRef = ref(database, `Bookings/${selectedSlot}`);
    set(slotRef, null).then(() => {
      console.log(`Slot ${selectedSlot} has been reset for user ${user.userId}`);
    }).catch(error => {
      console.error("Error resetting slot status: ", error);
    });

    // รีเซ็ต UI ช่องจอด
    document.querySelectorAll('.box').forEach(box => {
      box.classList.remove('activ');
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
        <div className="main-content">
          <div className="box-book">
            {/* ช่องที่จอดรถ A1 */}
            <div
              className={`box ${bookedSlots['A1'] ? 'activ' : ''}`}
              onClick={(e) => !bookedSlots['A1'] && selectBox(e.target, 'A1')}
              style={{ cursor: bookedSlots['A1'] ? 'not-allowed' : 'pointer' }}
            >
              <h4>A1</h4>
              {bookedSlots['A1'] && (
                <div className="booked-info">
                  <img src={bookedSlots['A1'].profilePicture} alt="User" style={{ width: '20px', borderRadius: '50%' }} />
                  <span>{bookedSlots['A1'].user}</span>
                </div>
              )}
            </div>

            {/* ช่องที่จอดรถ A2 */}
            <div
              className={`box ${bookedSlots['A2'] ? 'activ' : ''}`}
              onClick={(e) => !bookedSlots['A2'] && selectBox(e.target, 'A2')}
              style={{ cursor: bookedSlots['A2'] ? 'not-allowed' : 'pointer' }}
            >
              <h4>A2</h4>
              {bookedSlots['A2'] && (
                <div className="booked-info">
                  <img src={bookedSlots['A2'].profilePicture} alt="User" style={{ width: '20px', borderRadius: '50%' }} />
                  <span>{bookedSlots['A2'].user}</span>
                </div>
              )}
            </div>

            {/* ช่องที่จอดรถ A3 */}
            <div
              className={`box ${bookedSlots['A3'] ? 'activ' : ''}`}
              onClick={(e) => !bookedSlots['A3'] && selectBox(e.target, 'A3')}
              style={{ cursor: bookedSlots['A3'] ? 'not-allowed' : 'pointer' }}
            >
              <h4>A3</h4>
              {bookedSlots['A3'] && (
                <div className="booked-info">
                  <img src={bookedSlots['A3'].profilePicture} alt="User" style={{ width: '20px', borderRadius: '50%' }} />
                  <span>{bookedSlots['A3'].user}</span>
                </div>
              )}
            </div>
          </div>

          {/* ปุ่มออกเมื่อผู้ใช้จองแล้ว */}
          {exitVisible && (
            <div className="exit">
              <div className="exit-box">
                <button
                  onClick={handleExit}
                  className="btn"
                >
                  EXIT
                </button>
              </div>
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
