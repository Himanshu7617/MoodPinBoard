
const AllBoards = ({ allBoards }: { allBoards: any[] }) => {
  //const [selectedBoard, setSelectedBoard] = useState<string | null>(null);

  function handleBoardSelection(boardId: string) {
    //setSelectedBoard(boardId);
    localStorage.setItem("selectedBoardId", boardId.toString());
    storeBoardPins(boardId);
  }
  async function storeBoardPins(boardId: string) {
    const boardPins = await window.electron.storeBoardPins(boardId);
    console.log("Board Pins stored:", boardPins);
    if (boardPins.message === "Pins saved successfully") {

      localStorage.setItem("TotalPinsFetched", boardPins.totalLength.toString());
    }
  }

  return (
    <div className="h-[800px] w-full m-4 flex flex-wrap p-4">
      <h1>Choose a board</h1>
      {allBoards.map((board) => (
        <div
          onClick={() => {
            handleBoardSelection(board.id);
          }}
          key={board.id}
          className="h-48 w-48 m-1 border hover:border-blue-500 hover:border-4 cursor-pointer border-gray-300 rounded overflow-hidden"
        >
          <img
            className="h-full w-full object-cover"
            src={board.media.image_cover_url}
            alt={board.name}
          />
          <p>{board.name}</p>
        </div>
      ))}
    </div>
  );
};

export default AllBoards;
