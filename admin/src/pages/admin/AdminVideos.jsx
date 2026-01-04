import React, { useEffect, useState } from "react";

import api from "../../services/api";
import Swal from "sweetalert2";

const AdminVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [showForm, setShowForm] = useState(false); // ✅ TOGGLE

  /* ================= LOAD VIDEOS ================= */
  const loadVideos = async () => {
    setLoading(true);
    try {
      const res = await api.get("/videos");
      setVideos(res.data.videos || []);
    } catch {
      Swal.fire("Error", "Failed to load videos", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadVideos();
  }, []);

  /* ================= UPLOAD VIDEO ================= */
  const uploadVideo = async (e) => {
    e.preventDefault();

    if (!title.trim() || !videoFile) {
      Swal.fire("Warning", "Title & video required", "warning");
      return;
    }

    const fd = new FormData();
    fd.append("title", title);
    fd.append("video", videoFile);

    setUploading(true);
    try {
      await api.post("/videos", fd);
      Swal.fire("Success", "Video uploaded successfully", "success");

      setTitle("");
      setVideoFile(null);
      setShowForm(false); // ✅ HIDE FORM
      loadVideos();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Upload failed",
        "error"
      );
    }
    setUploading(false);
  };

  /* ================= TOGGLE STATUS ================= */
  const toggleStatus = async (id, current) => {
    try {
      await api.put(`/videos/${id}`, { isActive: !current });
      loadVideos();
    } catch {
      Swal.fire("Error", "Status update failed", "error");
    }
  };

  /* ================= DELETE VIDEO ================= */
  const deleteVideo = async (id) => {
    Swal.fire({
      title: "Delete this video?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
    }).then(async (res) => {
      if (!res.isConfirmed) return;

      try {
        await api.delete(`/videos/${id}`);
        Swal.fire("Deleted", "Video removed", "success");
        loadVideos();
      } catch {
        Swal.fire("Error", "Delete failed", "error");
      }
    });
  };

  return (
    <div className="p-6 space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Video Manager</h1>
          <p className="text-sm text-gray-500">
            Upload and manage promotional videos
          </p>
        </div>

        <button
          onClick={() => setShowForm((p) => !p)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          {showForm ? "Close" : "+ Add Video"}
        </button>
      </div>

      {/* ================= UPLOAD FORM (TOGGLE) ================= */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow p-6 max-w-xl">
          <h2 className="text-lg font-semibold mb-4">Upload New Video</h2>

          <form onSubmit={uploadVideo} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Video Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter video title"
                className="mt-1 w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Video File</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files[0])}
                className="mt-1 w-full border rounded-lg p-2"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={uploading}
                className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-lg font-medium"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border px-5 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= VIDEO GRID ================= */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Uploaded Videos</h2>

        {loading ? (
          <p className="text-center py-8">Loading videos...</p>
        ) : videos.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No videos uploaded yet
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((v) => (
              <div
                key={v._id}
                className="bg-white rounded-2xl shadow overflow-hidden"
              >
                <video
                  src={v.video?.url}
                  controls
                  className="w-full h-48 object-cover bg-black"
                />

                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium truncate">{v.title}</h3>
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        v.isActive
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {v.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleStatus(v._id, v.isActive)}
                      className="flex-1 border rounded-lg py-1.5 text-sm hover:bg-gray-50"
                    >
                      {v.isActive ? "Disable" : "Enable"}
                    </button>

                    <button
                      onClick={() => deleteVideo(v._id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-lg py-1.5 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVideos;
