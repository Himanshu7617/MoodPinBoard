import { useAuth } from "../context/AuthContext";
import { useBoard } from "../context/BoardContext";
import BoardManagerPage from "./BoardManagerPage";
import CreateBoardPage from "./CreateBoardPage";
import HomeBackground from "../assets/HomeScreenBackground.svg"
function Home() {
  const { isLoggedIn, login } = useAuth();
  const {  selectedBoardId } = useBoard();



  return (
    <div className="overflow-hidden">
      
      {isLoggedIn ? (
        selectedBoardId ? (
          <CreateBoardPage/>    
        ) : (
          <>
            <BoardManagerPage/>
          </>
        )
      ) : (
        <div className="flex flex-col h-screen w-screen justify-center items-center">
                <img className="absolute object-cover  w-full h-full top-0 left-0 z-[-1]" src={HomeBackground} alt="background image" />
          <h1 className=" p-8 top-20 text-2xl font-bold mb-8">
            MoodBoard - Organize your inspiration from Pinterest
          </h1>
          <button className="h-fit w-fit  rounded-2xl p-4 border-2 border-red-500 text-red-500 hover:bg-red-500  bg-white hover:text-white cursor-pointer" onClick={login}>Connect with Pinterest </button>

        </div>
      )}
    </div>
  );
}

export default Home;
