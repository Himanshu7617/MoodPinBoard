import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import type { ReactNode } from 'react';

export interface PinImage {
    height: number;
    width: number;
    url: string;
}

interface BoardContextType {
    allBoards: any[];
    allPins: PinImage[];
    selectedBoardId: string | null;
    currentPin: PinImage | null;
    fetchBoards: () => Promise<void>;
    selectBoard: (boardId: string) => void;
    fetchCurrentPin: () => Promise<void>;
    fetchAllPins: (boardId: string) => Promise<void>;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export const BoardProvider = ({ children }: { children: ReactNode }) => {
    const { isLoggedIn } = useAuth();
    const [allBoards, setAllBoards] = useState<any[]>([]);
    const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
    const [currentPin, setCurrentPin] = useState<PinImage | null>(null);
    const [allPins, setAllPins] = useState<PinImage[]>([]);

    const fetchBoards = async () => {
        if (!isLoggedIn) return;
        try {
            const boards = await window.electron.fetchPinterestBoards();
            setAllBoards(boards.items);
        } catch (error) {
            console.error("Failed to fetch boards", error);
        }
    };

    const selectBoard = (boardId: string) => {
        setSelectedBoardId(boardId);
        localStorage.setItem("selectedBoardId", boardId);
        // Reset pin ID when selecting a new board if desired, or keep logic as is
        if (!localStorage.getItem("pinId")) {
            localStorage.setItem("pinId", String(3));
        }
    };

    const fetchCurrentPin = async () => {
        if (!selectedBoardId) return;

        const pinId = localStorage.getItem("pinId");
        const totalPins = localStorage.getItem("TotalPinsFetched");
        console.log("Fetching pin with pinId:", pinId, "and totalPins:", totalPins);

        const pinIndex = pinId && totalPins ? parseInt(pinId, 10) % parseInt(totalPins, 10) : 0;

        try {
            const image = await window.electron.getCurrentImage(pinIndex);
            setCurrentPin(image);
            localStorage.setItem("pinId", String(parseInt(pinId as string || "3", 10) + 4)); // Increment logic from original code
        } catch (error) {
            console.error("Failed to fetch current pin", error);
        }
    };

    const fetchAllPins = async (boardId: string) => {
        if (!boardId) return;
        setAllPins([]);
        try {
            const pins = await window.electron.fetchAllPins(boardId);
            setAllPins(pins);
        } catch (error) {
            console.error("Failed to fetch all pins", error);
        }
    };
    // Initial load of boards when logged in
    useEffect(() => {
        if (isLoggedIn) {
            fetchBoards();
        }
    }, [isLoggedIn]);

    // Load selected board from local storage on mount
    useEffect(() => {
        const storedBoardId = localStorage.getItem("selectedBoardId");
        if (storedBoardId) {
            setSelectedBoardId(storedBoardId);
            fetchAllPins(storedBoardId);
        }
    }, []);

    // Fetch pin when board is selected
    useEffect(() => {
        if (selectedBoardId) {
            fetchAllPins(selectedBoardId);
        }
    }, [selectedBoardId]);

    return (
        <BoardContext.Provider value={{ allPins, allBoards, selectedBoardId, currentPin, fetchBoards, selectBoard, fetchCurrentPin, fetchAllPins }}>
            {children}
        </BoardContext.Provider>
    );
};

export const useBoard = () => {
    const context = useContext(BoardContext);
    if (context === undefined) {
        throw new Error('useBoard must be used within a BoardProvider');
    }
    return context;
};
