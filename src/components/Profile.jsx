import React, { useEffect, useState, useRef } from "react";
import { FiLogOut, FiX } from "react-icons/fi";
import apis from "../utils/apis";
import httpAction from "../utils/httpAction";
import useGeneral from "../hooks/useGeneral";

const Profile = () => {
  const [user, setUser] = useState({});
  const [file, setFile] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [fileList, setFileList] = useState([]);
  const [newFileName, setNewFileName] = useState("");
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const audioChunks = useRef([]);
  const { navigate } = useGeneral();

  const fetchFileHistory = async () => {
    setIsFetchingHistory(true);
    const filesData = await httpAction({ url: apis().getallfiles });
    setIsFetchingHistory(false);
    if (filesData?.fileData) {
      const processedFiles = filesData.fileData.map((file, index) => {
        let audioUrl = null;
        let audioName = `audio_${index + 1}.mp3`;

        if (file.audio?.buffer) {
          const byteCharacters = atob(file.audio.buffer);
          const byteArray = new Uint8Array(
            [...byteCharacters].map((char) => char.charCodeAt(0))
          );
          const audioBlob = new Blob([byteArray], {
            type: file.audio.contentType,
          });
          audioUrl = URL.createObjectURL(audioBlob);
          audioName = file.audio.originalName || audioName;
        }
        let textName = `transcript_${index + 1}.txt`;
        let textUrl = null;
        textName = file.text.originalName || textName;

        if (file.text?.buffer) {
          const textBlob = new Blob([file.text.buffer], {
            type: file.text.contentType,
          });
          textUrl = URL.createObjectURL(textBlob);
        }

        return { id: file.id, audioUrl, audioName, textUrl, textName };
      });

      setFileList(processedFiles);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await httpAction({ url: apis().getUserProfile });
      if (userData?.success) setUser(userData.data);
    };

    fetchUser();
  }, []);

  const logoutHandler = async () => {
    const result = await httpAction({ url: apis().logout, method: "POST" });
    if (result?.success) navigate("/login");
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setTranscription("");
  };

  const handleFileUpload = async () => {
    if (!file) return alert("Please select or record a file first.");
    setIsUploading(true);
    const formData = new FormData();
    formData.append("audio", file);

    try {
      const response = await fetch(apis().transcribeAudio, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setTranscription(result.transcript);
        const updatedFiles = await httpAction({ url: apis().getallfiles });
        if (updatedFiles?.success) {
          const updatedFileList = updatedFiles.fileData.map((file, index) => {
            const audioBlob = new Blob(
              [
                Uint8Array.from(atob(file.audio.buffer), (c) =>
                  c.charCodeAt(0)
                ),
              ],
              { type: file.audio.contentType }
            );

            return {
              audioUrl: URL.createObjectURL(audioBlob),
              audioName: file.audio.originalName || `audio_${index + 1}.mp3`,
              textUrl: URL.createObjectURL(
                new Blob([file.text.buffer], { type: file.text.contentType })
              ),
              textName: `transcript_${index + 1}.txt`,
            };
          });
          setFileList(updatedFileList);
        }
      } else {
        setTranscription(result.message || "Failed to transcribe.");
      }
    } catch (err) {
      setTranscription("Upload error: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTranscript = () => {
    if (!transcription) return;
    setIsDownloading(true);
    const blob = new Blob([transcription], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transcript.txt";
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setIsDownloading(false), 500);
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (e) => audioChunks.current.push(e.data);
    recorder.onstop = () => {
      const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
      audioChunks.current = [];
      const audioFile = new File([audioBlob], "recording.mp3", {
        type: "audio/mp3",
      });
      setFile(audioFile);
    };
    audioChunks.current = [];
    recorder.start();
    setRecording(true);
    setMediaRecorder(recorder);
  };

  const stopRecording = () => {
    mediaRecorder.stop();
    setRecording(false);
  };

  const handleModify = async (index) => {
    const fileToModify = fileList.find((file) => file.id === selectedFileId);
    if (!fileToModify || !newFileName) return;

    // const fileToModify = fileList[index];
    const response = await httpAction({
      url: apis().modifyFileName(fileToModify.id),
      method: "PATCH",
      body: { newFileName },
      headers: { "Content-Type": "application/json" },
    });
    if (response?.success) {
      const updatedFileList = [...fileList];

      // ✅ Find the correct index
      const fileIndex = updatedFileList.findIndex(
        (file) => file.id === selectedFileId
      );

      if (fileIndex !== -1) {
        updatedFileList[fileIndex].textName = response.updatedFile.originalName;
        setFileList(updatedFileList);
        alert("File name updated successfully!");
        setShowModal(false);
      } else {
        alert("File modified but could not update UI — file not found.");
      }
    } else {
      alert("Failed to update file name.");
    }
  };

  const handleDelete = async (index) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this file?"
    );
    if (!confirmDelete) return;

    const fileToDelete = fileList[index];
    const response = await httpAction({
      url: apis().deleteFile(fileToDelete.id),
      method: "DELETE",
    });

    if (response?.success) {
      const updatedFileList = fileList.filter((_, i) => i !== index);
      setFileList(updatedFileList);
      alert("File deleted successfully!");
    } else {
      alert("Failed to delete file.");
    }
  };

  return (
    <div>
      <div className="w-full max-w-full overflow-y-hidden overflow-x-hidden p-4 space-y-4">
        {/* Top section */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Profile Card */}
          <div className="bg-white shadow-md p-4 rounded-xl w-full md:w-1/3 flex flex-col items-center md:sticky md:top-4">
            <div className="bg-orange-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl">
              {user?.name?.[0]}
            </div>
            <h2 className="text-lg font-semibold capitalize">{user?.name}</h2>
            <p className="text-sm text-gray-600">{user?.email}</p>
            <button
              onClick={logoutHandler}
              className="mt-4 px-4 py-2 border rounded w-full flex items-center justify-center gap-2 hover:bg-gray-100"
            >
              Logout <FiLogOut />
            </button>
          </div>

          {/* Upload & Transcript */}
          <div className="bg-white shadow-md p-4 rounded-xl w-full flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-2">
              <label className="w-full md:w-1/3 border p-1 rounded cursor-pointer flex items-center justify-between">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {file ? (
                  <span className="text-sm text-gray-600 truncate flex-1">
                    📄 {file.name}
                  </span>
                ) : (
                  <span className="font-semibold text-gray-700">
                    📁 Choose File
                  </span>
                )}

                {file && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setFile(null);
                      setTranscription("");
                    }}
                    className="ml-2 text-red-500 hover:text-red-700"
                    title="Remove File"
                  >
                    <FiX size={18} />
                  </button>
                )}
              </label>

              <button
                onClick={recording ? stopRecording : startRecording}
                className={`w-full md:w-1/6 px-4 py-2 rounded text-white transition ${
                  recording
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {recording ? "Stop Recording" : "Record Audio"}
              </button>

              <button
                onClick={handleFileUpload}
                disabled={!file || isUploading}
                className="w-full md:w-1/6 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {isUploading ? <span className="loader-small" /> : "Submit"}
              </button>

              <button
                onClick={downloadTranscript}
                disabled={!transcription || isDownloading}
                className="w-full md:w-1/6 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {isDownloading ? <span className="loader-small" /> : "Download"}
              </button>

              <button
                onClick={fetchFileHistory}
                disabled={isFetchingHistory}
                className="w-full md:w-1/6 px-4 py-2 bg-gray-500 hover:bg-gray-700 text-white rounded disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {isFetchingHistory ? (
                  <>
                    <span className="loader-small" />
                    Loading
                  </>
                ) : (
                  "Show History"
                )}
              </button>
            </div>

            <textarea
              rows="6"
              readOnly
              value={transcription}
              className="w-full h-full p-3 border text-lg rounded placeholder-gray-400"
              placeholder="Transcript"
            ></textarea>
          </div>
        </div>
        {/* File History */}{" "}
        <div className="bg-white shadow-md rounded-xl p-4">
          <div className="overflow-auto max-h-80">
            <table className="min-w-[768px] w-full text-sm table-fixed text-center">
              <thead className="sticky top-0 bg-white z-10 border-b">
                <tr>
                  <th className="w-1/3 py-2">Audio File</th>
                  <th className="w-1/3 py-2">Transcript</th>
                  <th className="w-1/3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {fileList.map((file, index) => (
                  <tr key={index} className="border-b">
                    {/* Audio Column */}
                    <td className="w-1/3 py-3 px-2">
                      {file.audioUrl ? (
                        <audio
                          controls
                          src={file.audioUrl}
                          className="mx-auto w-full max-w-xs"
                        />
                      ) : (
                        <p className="text-red-600">Missing audio</p>
                      )}
                    </td>

                    {/* Transcript Column */}
                    <td className="w-1/3 py-3 px-2">
                      {file.textUrl ? (
                        <a
                          href={file.textUrl}
                          download={file.textName}
                          className="text-green-600 underline break-all"
                        >
                          {file.textName}
                        </a>
                      ) : (
                        <p className="text-red-600">Missing transcript</p>
                      )}
                    </td>

                    {/* Action Column */}
                    <td className="w-1/3 py-3 px-2">
                      <div className="flex justify-center gap-2 flex-wrap">
                        <button
                          onClick={() => {
                            setSelectedFileId(file.id);
                            setShowModal(true);
                          }}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                        >
                          Modify
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Footer */}
        <footer className="fixed bottom-0 left-0 w-full bg-white border-t py-2 text-center text-sm text-gray-500 shadow-sm z-10">
          © {new Date().getFullYear()} Audio Transcriber App by Faizan Khan
        </footer>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 bg-transparent flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4 text-center">
              Modify File Name
            </h2>
            <input
              type="text"
              placeholder="Enter new file name"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              className="w-full border px-4 py-2 rounded mb-4 outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-300"
                onClick={() => {
                  setShowModal(false);
                  setNewFileName("");
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white"
                onClick={handleModify}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
