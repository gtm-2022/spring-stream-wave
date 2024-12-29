import React, { useState } from "react";
import { HiInformationCircle } from "react-icons/hi";
import { Button, Label, Progress, Textarea, TextInput, Card, Alert } from "flowbite-react";
import videoLogo from "../assets/video-posting.png";
import axios from "axios";
import toast from "react-hot-toast";

function VideoUpload() {
  const [meta, setMeta] = useState({
    title: "",
    description: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  function handleFileChange(event) {
    setSelectedFile(event.target.files[0]);
  }

  function formFieldChange(event) {
    setMeta({
      ...meta,
      [event.target.name]: event.target.value,
    });
  }

  async function handleForm(formEvent) {
    formEvent.preventDefault();
    if (!selectedFile) {
      alert("Please Select File !!");
      return;
    }
    // Submit the file to server
    await saveVideoToServer(selectedFile, meta);
  }
  function resetForm(){
    setMeta({
      title: "",
      description: "",
    });
    setSelectedFile(null);
    setProgress(0);
    setUploading(false);
    //setMessage("");
  }

  // Submit file to server
  async function saveVideoToServer(video, videoMetaData) {
    setUploading(true);
    setProgress(0); // Reset progress before starting upload

    try {
      const formData = new FormData();
      formData.append("title", videoMetaData.title);
      formData.append("description", videoMetaData.description);
      formData.append("file", video);

      const response = await axios.post('http://localhost:8080/api/v1/videos', formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(progress);
          setProgress(progress);
        },
      });

      console.log(response);
      setProgress(0);

      setMessage(`File uploaded successfully! Video Id is: ${response.data.videoId}`);

      setUploading(false);
      toast.success("File uploaded successfully!");
      resetForm();
    } catch (error) {
      console.log(error);
      setMessage("Error uploading file.");
      toast.error("file not uploaded");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="text-white">
      <Card>
        <h1>Upload Videos</h1>
        <div>
          <form noValidate onSubmit={handleForm} className="flex flex-col space-y-6">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="title" value="Video Title" />
              </div>
              <TextInput value={meta.title} onChange={formFieldChange} name="title" placeholder="Enter Video title" />
            </div>
            <div className="max-w-md">
              <div className="mb-2 block">
                <Label htmlFor="description" value="Description" />
              </div>
              <Textarea
              value={meta.description}
                onChange={formFieldChange}
                name="description"
                id="description"
                placeholder="Write Video Description..."
                required
                rows={4}
              />
            </div>

            <div className="flex justify-center items-center space-x-5">
              <div className="shrink-0">
                <img className="h-16 w-16 object-cover" src={videoLogo} alt="Video Logo" />
              </div>

              <label className="block">
                <span className="sr-only">Choose Video files</span>
                <input
                
                  name="file"
                  onChange={handleFileChange}
                  type="file"
                  accept="video/*"
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                />
              </label>
            </div>
            {uploading && (
              <div className="">
                <Progress
                  color="green"
                  progress={progress}
                  textLabel="Uploading"
                  size="lg"
                  labelProgress
                  labelText
                />
              </div>
            )}
            {message &&(
            <div className="">
              <Alert color={"success"} icon={HiInformationCircle} onDismiss={()=>{
                setMessage("");
              }}>
                <span className="font-medium"></span>
                {message}

              </Alert>
            </div>
            )}
            <div className="flex justify-center">
              <Button  disabled={uploading} type="submit">
                Upload Video
              </Button>
            </div>
            
          </form>
        </div>
      </Card>
    </div>
  );
}

export default VideoUpload;
