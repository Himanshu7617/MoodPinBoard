import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBoard } from "../context/BoardContext";



const AllBoards = ({ allBoards }: { allBoards: any[] }) => {
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { fetchAllPins } = useBoard();

  function handleBoardSelection(boardId: string) {
    //setSelectedBoard(boardId);
    localStorage.setItem("selectedBoardId", boardId.toString());
    setSelectedBoard(boardId);
  }
  async function storeBoardPins(boardId: string) {
    const boardPins = await window.electron.storeBoardPins(boardId);
    console.log("Board Pins stored:", boardPins);
    if (boardPins.message === "Pins saved successfully") {

      localStorage.setItem("TotalPinsFetched", boardPins.totalLength.toString());

    }
  }

  useEffect(() => {
    const loadBoardData = async () => {
      if (selectedBoard) {
        setIsLoading(true);
        try {
          await storeBoardPins(selectedBoard);
          await fetchAllPins(selectedBoard);
          navigate("/create-board");
        } catch (error) {
          console.error("Error loading board:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadBoardData();
  }, [selectedBoard]);

  if (isLoading) {
    return (
      <div className="h-[800px] w-full flex items-center justify-center">
        <div className="text-2xl font-bold text-black text-6xl">Loading Board...</div>
      </div>
    );
  }

  return (
    <div className="h-[800px] w-full m-4 flex flex-wrap p-4">
      {allBoards.map((board) => (
        <div className="h-fit w-fit flex m-2 cursor-pointer hover:bg-red-500 hover:border-red-500 hover:text-white flex-col border-2 border-gray-950 rounded-2xl items-center">
          <div
            onClick={() => {
              handleBoardSelection(board.id);

            }}
            key={board.id}
            className="h-[250px] w-[250px] cursor-pointer border-b-2 border-gray-950 hover:border-red-500 hover:text-white rounded-t-2xl  overflow-hidden"
          >
            <img
              className="h-full w-full object-cover"
              src={board.media.image_cover_url}
              alt={board.name}
            />

          </div>
          <p className=" text-xl h-fit w-fit p-2">{board.name}</p>
        </div>
      ))}


    </div>
  );
};

export default AllBoards;
