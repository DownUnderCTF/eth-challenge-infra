import { ReactNode, useState } from 'react';
import { CopyableBox } from './CopyableBox';
import StatusChip from './StatusChip';
import useGetChallengeData from '../hooks/getChallengeData';
import { toast } from 'react-toastify';
import { getChallengeFlag, resetChallenge } from '../api/challengeAPI';
import Flag from './Flag';
import { Tooltip } from 'react-tooltip'





export default function ChallengeDetails() {

  const { challengeDetails } = useGetChallengeData();
  const [flag, setFlag] = useState("");

  const data = challengeDetails.data;

  const handleReset = async () => {
    setFlag("");
    try {
      await resetChallenge();
      toast.success("Challenge Reset!")
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, { toastId: e.message });
      }
    }
    challengeDetails.refetch();
  }

  const handleGetFlag = async () => {
    try {
      const data = await getChallengeFlag();
      toast.success("Challenge Solved!", { toastId: "solved" })
      setFlag(data.flag);
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message, {
          toastId: err.message,

        })
      }
    }
  }

  return (
    <div className="flex flex-col justify-center w-144">
      <div className="border rounded shadow p-5">



        {data && !challengeDetails.isError ?
          <>
            <div className="mb-2">
              <h2 className="text-xl font-bold">{data.name}</h2>
            </div>

            <p>{data.description}</p>

            <div>
              <ChallengeDetail detail="Status" tooltipText="The current status of the challenge."  >
                <StatusChip text={data.status} statusColor={data.status === "DEPLOYED" ? "green" : "orange"} />
              </ChallengeDetail>
              <ChallengeDetail detail="Player Balance" tooltipText="The balance of your wallet in ETH">
                {data.player_wallet !== undefined ? <p>{data.player_wallet.balance}</p> : <p>Loading...</p>}
              </ChallengeDetail>
              <ChallengeDetail detail="Player Wallet Address" tooltipText="The public address of your wallet.">
                {data.player_wallet !== undefined ? <CopyableBox valueType='address' value={data.player_wallet.address} /> : <p>Loading...</p>}
              </ChallengeDetail>

              <ChallengeDetail detail="Private Key" tooltipText="The private key for your wallet.">
                {data.player_wallet !== undefined ? <CopyableBox valueType='private key' value={data.player_wallet.private_key} /> : <p>Loading...</p>}
              </ChallengeDetail>
              <ChallengeDetail detail="Contract Address" tooltipText="The address of the deployed challenge contract.">
                {data.contract_address !== undefined ? <CopyableBox valueType='contract address' value={data.contract_address} /> : <p>Loading...</p>}
              </ChallengeDetail>
              <ChallengeDetail detail='Block Time' tooltipText="The time in seconds between blocks. 0 means instant.">
                <CopyableBox valueType='Block Time' value={data.blockTime.toString()} />
              </ChallengeDetail>
            </div>

          </>
          : "Unable to load your challenge details :( If this error persists please contact an admin. "}

        {/* TODO update these to be dynamic variables based on what we want */}
        <ChallengeDetail detail='RPC URL' tooltipText="The URL that you can connect to the Blockchain RPC API">
          <CopyableBox valueType='rpc url' value='http://localhost:8545' />
        </ChallengeDetail>

        <ChallengeDetail detail='Chain ID' tooltipText="The unique ID of the blockchain.">
          <CopyableBox valueType='Chain ID' value='31337' />
        </ChallengeDetail>



        <div className='flex justify-center gap-3'>
          <button onClick={handleGetFlag}>Get Flag</button>
          <button onClick={handleReset}>Reset Challenge</button>
        </div>
        <div>
          {flag && <Flag flag={flag} />}
        </div>

      </div>
    </div>
  )
}


type ChallengeDetailProps = {
  detail: string,
  tooltipText: string,
  children: ReactNode,
}

export function ChallengeDetail({ detail, tooltipText, children }: ChallengeDetailProps) {
  return (
    <div className="flex justify-between place-items-center text-right my-3 h-10">
      <div className="flex">

        <p className="font-bold my-auto" data-tooltip-id={detail} data-tooltip-content={tooltipText}>{detail}:</p>
        <Tooltip id={detail} />
      </div>
      <div className=" max-w-xs ">
        {children}
      </div>
    </div>
  )
}

