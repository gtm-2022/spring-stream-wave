import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import './App.css';
import VideoUpload from './components/VideoUpload';
import VideoPlayer from './components/VideoPlayer';
import { Button, TextInput } from 'flowbite-react';

function App() {
  const [fieldValue,setFieldValue]=useState(null);
const [videoId, setVideoId] = useState("d02bebe6-fa27-4954-8afb-3c368afe4fb13453535311");
  

  function playVideo(videoId){
    setVideoId(videoId);

  }

  return (
    <>
      <Toaster />
      <div className="container">
        <h1 className="title">Stream Wave</h1>
        <div className="main-content">
          
          <div className="video-section">
            <h2 className="section-title">Playing Video</h2>
            <VideoPlayer
              src={`http://localhost:8080/api/v1/videos/${videoId}/master.m3u8`}
            />
          </div>
          <div className="upload-section">
            <h2 className="section-title">Upload Video</h2>
            <VideoUpload />
          </div>
          
        </div>

        
      </div>
      <div className='flex justify-center items-center space-x-2'>
          <TextInput onChange={(event)=>
            {setFieldValue(event.target.value);
            
            }} placeholder='Enter Video id here' name="video_id_field" style={{width:"100%",height:"50px,"}} />
         <Button onClick={()=>{
          setVideoId(fieldValue);
         }}>Play</Button>
         
         
         </div> 

          
    </>
  );
}

export default App;
