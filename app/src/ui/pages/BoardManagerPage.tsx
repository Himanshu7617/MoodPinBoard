import AllBoards from "../components/AllBoards"
import { useBoard } from "../context/BoardContext";
import HomeBackground from "../assets/HomeScreenBackground.svg"
const BoardManagerPage = () => {
    const { allBoards } = useBoard();
    return (
        <div className="h-[100vh] w-[100vw] p-4 overflow-x-hidden">
            <img className="absolute object-cover opacity-50  w-full h-full top-0 left-0 z-[-1]" src={HomeBackground} alt="background image" />

            <div className=" p-4 h-full w-full flex flex-col items-center justify-center"> 
            <h1 className="text-2xl font-bold text-center "> Choose a board </h1>

            <AllBoards allBoards={allBoards} />
            </div>
        </div>
    )
}

export default BoardManagerPage
