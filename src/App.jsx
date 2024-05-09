import { useState, useEffect } from "react"; 
import "./App.css";
import { useNavigate } from 'react-router-dom'; 
import { useUser } from './contexts/authContext/UserContext'; 
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  setDoc
} from 'firebase/firestore';
import { db } from "./firebase/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';



function App() {
  const navigate = useNavigate(); 
  const { user, userEmail } = useUser(); 
  const [todos, setTodos] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [taskStatus, setTaskStatus] = useState("Incomplete");
  const [showPopup, setShowPopup] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [filter, setFilter] = useState("All"); 
  const [error, setError] = useState(""); 
  const [displayName, setDisplayName] = useState('');
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [userAge, setUserAge] = useState('');
  const [userNationality, setUserNationality] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [profilePic, setProfilePic] = useState(null);


  const goToProfile = () => {
    navigate('/account');
  };
  
  const handleSignOut = () => {
    navigate('/');
  };
  useEffect(() => {
    if (userEmail) {
      const userProfileRef = doc(db, 'UserProfile', userEmail);
      const unsubscribe = onSnapshot(userProfileRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setDisplayName(userData.DisplayName || userEmail);
          setUserAge(userData.Age || '');
          setUserNationality(userData.Nationality || '');
          setProfilePicUrl(userData.ProfilePicture || '');
        }
      }, (error) => {
        console.error("Error fetching user profile: ", error);
      });
      return () => unsubscribe();
    }
  }, [userEmail]);
  
  const handleProfilePictureUpload = () => {
    if (!profilePic) return;
  
    const storageRef = ref(getStorage(), `profile_pictures/${userEmail}`);
    uploadBytes(storageRef, profilePic).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((downloadURL) => {
        console.log('File available at', downloadURL);
        setProfilePicUrl(downloadURL); 
        updateUserProfile(downloadURL); 
      });
    }).catch((error) => {
      console.error("Error uploading profile picture: ", error);
    });
  };
  const handleProfilePopupSubmit = (e) => {
    e.preventDefault();
    if (profilePic) {
      handleProfilePictureUpload();
    } else {
      updateUserProfile(profilePicUrl); 
    }
  };
  
  
  const updateUserProfile = (newProfilePicUrl) => {
    const userProfileRef = doc(db, 'UserProfile', userEmail);
    const updatedProfile = {
      DisplayName: newDisplayName || displayName, 
      Age: userAge,
      Nationality: userNationality,
      ProfilePicture: newProfilePicUrl 
    };
  
    setDoc(userProfileRef, updatedProfile, { merge: true })
      .then(() => {
        setShowProfilePopup(false); 
        setProfilePic(null); 
      })
      .catch((error) => {
        console.error("Error updating user profile: ", error);
      });
  };
  
  
  useEffect(() => {
    if (userEmail) {
      const q = query(collection(db, "todos"), where("user", "==", userEmail));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const todosArray = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTodos(todosArray);
      }, (error) => {
        console.error("Error fetching todos: ", error);
        setError("Failed to fetch todos.");
      });
      return () => unsubscribe(); 
    }
  }, [userEmail]);

  function handlePopupSubmit(e) {
    e.preventDefault();
    if (!newItem.trim()) return;
  
    const isCompleted = taskStatus === "Completed";
  
    const todo = {
      text: newItem,
      completed: isCompleted, 
      user: userEmail
    };
  
    addDoc(collection(db, "todos"), todo)
      .then((docRef) => {
        console.log("Document written with ID: ", docRef.id);
        setNewItem("");
        setShowPopup(false);
        setTaskStatus("Incomplete"); 
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
      });
  }
  


  

  function getVisibleTodos() {
    if (filter === "Completed") {
      return todos.filter((todo) => todo.completed);
    } else if (filter === "Incomplete") {
      return todos.filter((todo) => !todo.completed);
    }
    return todos;
  }


  function toggleTodo(id, completed) {
    const todoRef = doc(db, "todos", id);
    updateDoc(todoRef, { completed: completed });
  }

  function deleteTodo(id) {
    const todoRef = doc(db, "todos", id);
    deleteDoc(todoRef);
  }

  function toggleEdit(id) {
    setEditingId(id);
    const todo = todos.find(todo => todo.id === id);
    setEditedTitle(todo.text); 
  }

  function handleEdit(id) {
    const todoRef = doc(db, "todos", id);
    updateDoc(todoRef, { text: editedTitle }) 
      .then(() => setEditingId(null));
  }

  return (
    <>
    {userEmail &&  (
  <div style={{ position: 'absolute', top: '60px', left: '130px' }}>
  <div className="profile-pic-container">
      {profilePicUrl ? (
        <img src={profilePicUrl} alt="Profile" className="profile-pic" />
      ) : (
        <div className="profile-pic default-pic"></div>  
      )}
    </div>
    <p>Welcome back, {displayName}</p>
    <p>Age: {userAge}</p>
    <p>Nationality: {userNationality}</p>
    <button onClick={() => setShowProfilePopup(true)} className="label-white">Edit Profile Details</button>
    <button onClick={goToProfile} className="label-white">Go to Profile</button>

  </div>
)}

{showProfilePopup && (
  <div className="overlay" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <div className="modal" style={{ background: 'white', padding: '20px', borderRadius: '10px' }}>
      <form onSubmit={handleProfilePopupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <label htmlFor="displayName" className="label-black">Display Name:</label>
        <input
          type="text"
          id="displayName"
          value={newDisplayName}
          onChange={(e) => setNewDisplayName(e.target.value)}
          placeholder="Enter new display name"
        />
        <label htmlFor="profilePic" className="label-black">Profile Picture:</label>
        <input
          type="file"
          id="profilePic"
          onChange={(e) => setProfilePic(e.target.files[0])}
        />
        <label htmlFor="userAge"className="label-black">Age:</label>
        <input
          type="number"
          id="userAge"
          value={userAge}
          onChange={(e) => setUserAge(e.target.value)}
          placeholder="Enter your age"
        />

        <label htmlFor="userNationality"className="label-black">Nationality:</label>
        <input
          type="text"
          id="userNationality"
          value={userNationality}
          onChange={(e) => setUserNationality(e.target.value)}
          placeholder="Enter your nationality"
        />

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button type="submit" className="label-white" style={{ flexGrow: 1, marginRight: '10px' }}>Save</button>
          <button type="button" className="label-white"  onClick={() => setShowProfilePopup(false)} style={{ flexGrow: 1 }}>Cancel</button>
        </div>
      </form>
    </div>
  </div>
)}


      <div className="Sign-Out-Button" style={{ position: 'absolute', top: '10px', left: '10px' }}>
        <button
          className="sign-out-button"
          style={{
            boxShadow: "inset 0 2px 4px 0 rgb(2 6 23 / 0.3), inset 0 -2px 4px 0 rgb(203 213 225)",
            display: "inline-flex",
            cursor: "pointer",
            alignItems: "center",
            gap: "1rem",
            borderRadius: "0.375rem",
            border: "1px solid rgb(203 213 225)",
            background: "linear-gradient(to bottom, rgb(249 250 251), rgb(229 231 235))",
            padding: "0.5rem 1rem",
            fontWeight: "600",
            opacity: "1",
            textDecoration: "none",
            color: "rgb(55 65 81)",
          }}
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      </div>
      {/* {userEmail && (
      <div style={{ position: 'absolute', top: '30px', left: '10px' }}>
        <p>Welcome back, {userEmail}!</p>
      </div>
    )} */}

    
      <div className="App">
      <span className="btn-shine">Gde Ngurah Randy Agastya - 2602119165</span>
    </div>
      {showPopup && (
        <div className="overlay">
          <div className="modal">
            <form onSubmit={handlePopupSubmit}>
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value)}
              >
                <option value="Incomplete">Incomplete</option>
                <option value="Completed">Completed</option>
              </select>
              <div className="popup-buttons">
                <button type="submit" className="btn btn-primary">
                  Add Task
                </button>
                <button type="button" className="btn" onClick={() => setShowPopup(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
  
      <form className="new-item-form" onSubmit={(e) => e.preventDefault()}>
        <div className="form-control">
          <label htmlFor="item">New item</label>
          
          <input className="input input-alt" placeholder="Type your activity!"
            type="text"
            id="item"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
          />
          <span className="input-border input-border-alt"></span>
        </div>
        
        <button className="btn" type="button" onClick={() => setShowPopup(true)}>
          <span>Add</span>
        </button>
      </form>
  
      <div className="todo-header">
        <h1 className="header">Todo List</h1>
        <select
          className="filter-dropdown"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Completed">Completed</option>
          <option value="Incomplete">Incomplete</option>
        </select>
      </div>
  
      <ul className="list">
        {getVisibleTodos().map((todo) => (
          <li key={todo.id} className={`flex justify-between items-center my-2 ${todo.completed ? 'completed' : ''}`}>
          <div className="checkbox-container">
                <input
              type="checkbox"
              checked={todo.completed} 
              onChange={(e) => toggleTodo(todo.id, e.target.checked)}
              className="check"
            />
            </div>
            <div className="task-text">
              {editingId === todo.id ? (
                <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="edit-input"
                autoFocus
              />
            ) : (
              <span className={`ml-2 ${todo.Completed ? 'line-through' : ''}`}>
                {todo.text} {/* Use 'text' to match Firestore field */}
              </span>
            )}
          </div>
            <div className="button-container">
              <button
                type="button"
                onClick={() => toggleEdit(todo.id)}
                className="btn-edit"
              >
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => deleteTodo(todo.id)}
                className="btn-delete"
              >
                <span>Delete</span>
              </button>
              {editingId === todo.id && (
                <button
                  type="button"
                  onClick={() => handleEdit(todo.id)}
                  className="btn-save"
                >
                  <span>Save</span>
                </button>


              )}
            </div>
          </li>
        ))}
      </ul>
    </>
    );
              }
  
export default App;