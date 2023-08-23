
type FlagProps = {
  flag: string;
}

export default function Flag({ flag }: FlagProps) {
  return (
    <div className="text-center my-4">
      <span className=" text-gray-700 bg-white p-3 rounded text-xl font-['Courier']">{flag}</span>
    </div>
  )
}