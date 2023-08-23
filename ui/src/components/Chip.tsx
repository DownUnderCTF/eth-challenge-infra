import React from 'react'


type ChipProps = {
  text: string,
  colour: string,
}
export default function Chip({ text, colour: color }: ChipProps) {
  return (
    <div className={`border rounded-3xl py-1 px-3 flex place-items-center gap-1 ${color}`} > {text}</div >
  )
}
