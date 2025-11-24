import boardManager from "../assets/boardManager.png"
import createBoard from "../assets/createBoard.png"
import { FaWindows } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";


const Home = () => {

  function handleDownload() { 
    window.location.href = "https://github.com/Himanshu7617/MoodPinBoard/releases/download/v1/moodboard.0.0.0.exe"
  }
  return (
    <div className=' font-bold flex flex-col items-center h-screen'>
        
        <h1 className="text-3xl">MoodPinBoard</h1>
        <p className="text-xl">Create vision boards for your mood</p>
        <div className="w-fit h-fit p-4 gap-4 flex justify-center items-center">

        <button onClick={handleDownload} className="p-3 px-6 rounded-3xl border-2 border-black hover:border-red-500 hover:bg-red-500 hover:text-white cursor-pointer">Download for Windows <FaWindows className="inline-block ml-2" /></button>
        <button onClick={() => window.open("https://github.com/Himanshu7617/MoodPinBoard", "_blank")} className="p-3 px-6 rounded-3xl border-2 border-black hover:border-green-500 hover:bg-green-500 hover:text-white cursor-pointer">Github <FaGithub className="inline-block ml-2" /></button>
        </div>
        <img src={boardManager} alt="boardManager" className="w-1/3 h-fit object-contain border-2 m-2 border-black hover:border-red-500  rounded-3xl" />
        <img src={createBoard} alt="createBoard"  className="w-1/3 h-fit object-contain border-2 m-2 border-black hover:border-red-500  rounded-3xl"  />
        
    </div>
  )
}

export default Home