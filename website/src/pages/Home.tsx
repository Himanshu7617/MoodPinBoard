import boardManager from "../assets/boardManager.png"
import createBoard from "../assets/createBoard.png"
const Home = () => {
  return (
    <div className=' font-bold flex flex-col items-center h-screen'>
        
        <h1 className="text-3xl">MoodPinBoard</h1>
        <p className="text-xl">Create vision boards for your mood</p>
        <button onClick={() => window.open("https://github.com/Himanshu7617/MoodPinBoard/tree/main/app", "_blank")} className="p-3 px-6 rounded-3xl border-2 border-black hover:border-red-500 hover:bg-red-500 hover:text-white cursor-pointer">Download App</button>
        <img src={boardManager} alt="boardManager" className="w-1/3 h-fit object-contain border-2 m-2 border-black hover:border-red-500  rounded-3xl" />
        <img src={createBoard} alt="createBoard"  className="w-1/3 h-fit object-contain border-2 m-2 border-black hover:border-red-500  rounded-3xl"  />
        
    </div>
  )
}

export default Home