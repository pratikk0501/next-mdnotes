import { useAuth } from "@/context/AuthContext";
import { useNotes } from "@/context/NoteContext";
import { db, storage } from "@/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import {
  getDownloadURL,
  uploadBytes,
  ref,
  deleteObject,
} from "firebase/storage";
import { useEffect, useState } from "react";
import Modal from "./Modal";

function UploadsPage() {
  const { currentUser } = useAuth();

  const [uploadsList, setUploadsList] = useState([]);
  const [uploadsTimes, setUploadsTimes] = useState([]);
  const [uploadsRules, setUploadsRules] = useState(false);
  const [deletingUpload, setDeletingUpload] = useState({
    name: "",
    display: false,
  });
  const { fetchTimeRemaining, navRefreshKey, setNavRefreshKey } = useNotes();

  function handleUpload() {
    if (!currentUser || !currentUser.uid || uploadsList.length >= 10) return;
    // Upload logic here
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      await uploadFileToFirestore(file);
    };
    fileInput.click();
  }

  async function uploadFileToFirestore(file) {
    try {
      const storageRef = ref(
        storage,
        `users/${currentUser.uid}/uploads/${file.name}`
      );
      // Upload file to Firestore Storage and handle the upload
      const snapshot = await uploadBytes(storageRef, file);

      const downloadURL = await getDownloadURL(storageRef);
      // Save the download URL in user's uploads collection

      const newUploadRef = await setDoc(
        doc(db, "users", currentUser.uid, "uploads", file.name),
        {
          name: file.name,
          url: downloadURL,
          uploadedAt: Date.now(),
        }
      );
      console.log("Uploading image:", file.name);
    } catch (error) {
      console.error(error.message);
    } finally {
      setNavRefreshKey((curr) => curr + 1);
      setUploadsRules(false);
    }
  }

  async function deleteUpload(uploadId) {
    try {
      if (!currentUser || !currentUser.uid || !uploadId) return;

      const storageRef = ref(
        storage,
        `users/${currentUser.uid}/uploads/${uploadId}`
      );
      console.log("Deleting image:", uploadId, "at:", storageRef);
      await deleteObject(storageRef);

      await deleteDoc(doc(db, "users", currentUser.uid, "uploads", uploadId));
      setUploadsList((curr) => {
        return curr.filter((upload) => upload.name !== uploadId);
      });
    } catch (error) {
      console.error("Error attempting deletion:", error.message);
    } finally {
      console.log(`Image ${uploadId} deleted from storage`);
    }
  }

  useEffect(() => {
    if (!currentUser || !currentUser.uid) return;
    if (!uploadsList || uploadsList.length === 0) {
      setUploadsTimes({});
      return;
    }

    let mounted = true;

    (async () => {
      try {
        // fetch all times in parallel
        const pairs = await Promise.all(
          uploadsList?.map(async (upload) => {
            try {
              const time = fetchTimeRemaining(upload.uploadedAt);
              return [upload.name, time];
            } catch (err) {
              console.error("fetchTimeRemaining for", upload.name, err);
              return [upload.name, null];
            }
          })
        );

        if (!mounted) return;
        const map = Object.fromEntries(pairs);
        setUploadsTimes(map); // set all at once — fewer re-renders
      } catch (err) {
        console.error("bulk fetch error:", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [uploadsList, currentUser, db]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }
    async function fetchUploads() {
      try {
        const uploadsRef = collection(db, "users/", currentUser.uid, "uploads");
        const snapshot = await getDocs(uploadsRef);
        const uploadsData = snapshot.docs.map((doc) => ({
          name: doc.id,
          url: doc.data().url || "",
          uploadedAt: doc.data().uploadedAt || 0,
        }));

        setUploadsList(uploadsData);
      } catch (error) {
        console.log(error.message);
      }
    }
    fetchUploads();
  }, [currentUser, navRefreshKey]);

  return (
    <>
      {uploadsRules && (
        <Modal handleCloseModal={() => setUploadsRules(false)}>
          <h4 className="upload-rules">❗Upload Rules❗</h4>
          <ul>
            <li>Only image files are allowed.</li>
            <li>Image size is limited to 5MB.</li>
            <li>
              You can only uploads a maximum of 10 images. Remaining:{" "}
              {10 - uploadsList.length}
            </li>
            <li>
              To use an image in a note, copy the image URL from the list and
              use it like this: ![your_image_title](image_url).
            </li>
          </ul>
          <button className="upload-btn" onClick={handleUpload}>
            Upload
          </button>
        </Modal>
      )}
      {deletingUpload.display && (
        <Modal handleCloseModal={() => setDeletingUpload({ display: false })}>
          <p>Are you sure you want to delete {deletingUpload.name}?</p>
          <div className="modal-actions">
            <button
              onClick={async () => {
                await deleteUpload(deletingUpload.name);
                setDeletingUpload({ display: false });
              }}
            >
              Delete
            </button>
            <button
              onClick={() =>
                setDeletingUpload({
                  name: deletingUpload.name,
                  display: false,
                })
              }
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
      <button
        className="notes-list-secondary-btn"
        onClick={() => {
          setUploadsRules(true);
        }}
      >
        <h6>Upload</h6>
        <i className="fa-solid fa-upload"></i>
      </button>
      <div className="notes-list">
        {uploadsList.length === 0
          ? "Nothing uploaded yet!"
          : uploadsList.map((upload) => {
              const timeSince = uploadsTimes[upload.name];
              return (
                <button
                  key={upload.name}
                  className="card-button-secondary list-btn"
                  title={upload.name}
                  onClick={() => window.open(upload.url)}
                >
                  <p>{upload.name.slice(0, 10)}</p>
                  <small>{timeSince}</small>
                  <a
                    href="#"
                    className="copy-btn"
                    title="Copy link"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      navigator.clipboard.writeText(upload.url);
                      alert(
                        `${
                          upload.name.split(".")[0]
                        } image link copied to clipboard!`
                      );
                    }}
                  >
                    <i className="fa-regular fa-clipboard"></i>
                  </a>
                  <div
                    className="delete-btn"
                    role="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setDeletingUpload({ name: upload.name, display: true });
                    }}
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </div>
                </button>
              );
            })}
      </div>
    </>
  );
}

export default UploadsPage;
