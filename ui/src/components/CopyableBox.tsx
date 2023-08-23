import { FiCopy } from "react-icons/fi";
import { toast } from "react-toastify";

type CopyableProps = {
  value: string;
  valueType: string;
}

export function CopyableBox({ value, valueType }: CopyableProps) {

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast.info(`Copied ${valueType} to clipboard`, {
      position: toast.POSITION.BOTTOM_CENTER,
      pauseOnFocusLoss: false,

    })
  }

  return (
    <div className="border rounded-3xl py-1 px-3 flex place-items-center gap-1 ">
      <p className="truncate text-sm">{value}</p>
      <div onClick={handleCopy} className='cursor-pointer'><FiCopy /></div>
    </div>
  )
}