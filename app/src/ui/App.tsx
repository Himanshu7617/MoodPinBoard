import { useEffect, useState } from "react";
import AllBoards from "./components/AllBoards";

interface PinImage {
  height: number;
  width: number;
  url: string;
}

function App() {
  //const [userAccessToken, setUserAccessToken] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [allBoards, setAllBoards] = useState<any[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [currentPin, setCurrentPin] = useState<PinImage | null>(null);

  async function fetchBoards() {
    const allBoards = await window.electron.fetchPinterestBoards();
    setAllBoards(allBoards.items);
  }
 
  useEffect(() => {
    if (!selectedBoardId) return;

    const fetchPin = async () => {
      const pinId = localStorage.getItem("pinId");
      const totalPins = localStorage.getItem("TotalPinsFetched");
      console.log("Fetching pin with pinId:", pinId , "and totalPins:", totalPins);
      const pinIndex =
        pinId && totalPins ? parseInt(pinId, 10) % parseInt(totalPins, 10) : 0;
      const image = await window.electron.getCurrentImage(pinIndex);
      setCurrentPin(image);
      localStorage.setItem("pinId", String(parseInt(pinId as string, 10) + 4));
    };

    fetchPin();
  }, [selectedBoardId]);

   useEffect(() => {
    const storedBoardId = localStorage.getItem("selectedBoardId");
    if (storedBoardId) {
      setSelectedBoardId(storedBoardId);
    }
  }, [selectedBoardId]);


  useEffect(() => {
    const token = window.electron.store.get("pinterestAccessToken");
    token.then((token) => {
      if (token) {
        //setUserAccessToken(token);
        setIsLoggedIn(true);
        if(!localStorage.getItem("pinId")) {
          localStorage.setItem("pinId", String(0));
        }
        fetchBoards();
      }
    });
  }, []);

  async function handleLoginWithPinterest() {
    try {
      const res = await window.electron.pinterestAuth();
      if (res.message === "success") {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  }

  return (
    <div className="overflow-hidden">
      {isLoggedIn ? (
        selectedBoardId ? (
          <img
            className="h-[600px] w-[400px] object-cover"
            src={currentPin?.url}
            alt="Current Pin"
          />
        ) : (
          <>
            <p className="text-blue">moodPinboard</p>
            <AllBoards allBoards={allBoards} />
          </>
        )
      ) : (
        <button onClick={handleLoginWithPinterest}>Pinterest </button>
      )}
    </div>
  );
}

export default App;
