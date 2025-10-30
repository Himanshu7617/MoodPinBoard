
interface Window{
    electron: {
        store: {
            get: (key: string) => Promise<any>;
            set: (key: string, value: any) => Promise<void>;
        };

        pinterestAuth: () => Promise<{message : string;}>;
        fetchPinterestBoards: () => Promise<any>;
        storeBoardPins: (boardId: string) => Promise<{message: string; totalLength: number;}>;
        getCurrentImage: (pinIndex: number) => Promise<{height: number; width: number; url: string;}>;
    };
}