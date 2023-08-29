import React from 'react'
import useGetChallengeData from '../hooks/getChallengeData'
import "highlight.js/styles/github-dark.css";
import hljs from "highlight.js";
import hljsDefineSolidity from "highlightjs-solidity";

export default function CodePreview() {
  const { challengeSource } = useGetChallengeData();
  hljsDefineSolidity(hljs);
  hljs.highlightAll();

  // TODO: Fix this so that you can display multiple contract sources
  const code2 = challengeSource.data && challengeSource.data.length ? atob(challengeSource.data[0]) : "No source available";


  return (
    <div>
      {/* <h3 className='text-left'>SolveMe.sol</h3> */}
      <div className='bg-zinc-200 dark:bg-zinc-900 rounded p-2 w-160'>
        <pre className="solidity text-left overflow-y-scroll max-h-128 text-xs">
          <code >{code2}</code>
        </pre>
      </div>
    </div>
  )
}
