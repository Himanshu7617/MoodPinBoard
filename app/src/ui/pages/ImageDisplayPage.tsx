import type { PinImage } from "../context/BoardContext";
import { useNavigate } from "react-router-dom";


const ImageDisplayPage = ({currentPin}: {currentPin: PinImage | null}) => {
    console.log(currentPin)
    const navigate = useNavigate(); 
    const createBoard = () => {
        navigate("/create-board");
    }
  return (
    <div>
      <button onClick={createBoard}>Create Board</button>
        {currentPin && (
            <img className={`h-[${currentPin.height}px] w-[${currentPin.width}px] object-cover`} src={currentPin.url} alt="Current Pin" />
        )}

    </div>
  )
}

export default ImageDisplayPage