export default async function getChallengeDetails() {
  // await new Promise((res) => setTimeout(res, 2000));
  const res = await fetch("/challenge");
  const data = await res.json();
  if (!res.ok) {
    throw Error(data.error);
  }

  return data as ChallengeDetailsData;
}

export async function getChallengeFlag() {
  const res = await fetch("/challenge/solve");
  const data = await res.json();
  if (res.ok) {
    return data as { flag: string };
  }
  throw new Error(data.error);
}

export async function resetChallenge(): Promise<void> {
  const res = await fetch("/challenge/reset");
  const data = await res.json();
  if (!res.ok) {
    throw Error(data.error);
  }
}

export async function getChallengeSource() {
  const res = await fetch("/challenge/source");
  const data: string[] = await res.json();
  return data;
}

export type ChallengeDetailsData = {
  name: string;
  description: string;
  status: "DEPLOYED" | "DEPLOYING" | "NOT DEPLOYED" | "FAILED";
  player_wallet?: {
    address: string;
    private_key: string;
    balance: string;
  };
  contract_address?: string;
  blockTime: number;
};
