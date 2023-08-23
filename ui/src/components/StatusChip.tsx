import React from 'react'
import Chip from './Chip'

type StatusChipProps = {
  text: string,
  statusColor: "red" | "orange" | "green",
}


const colourMap = {
  "red": "bg-red-500/50",
  "orange": "bg-amber-500/50",
  "green": "bg-green-500/50",
}

export default function StatusChip({ text, statusColor }: StatusChipProps) {


  return (
    <Chip text={text} colour={colourMap[statusColor]} />
  )
}
