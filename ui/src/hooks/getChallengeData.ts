import { useQuery } from "@tanstack/react-query";
import getChallengeDetails, { getChallengeSource } from "../api/challengeAPI";

export default function useGetChallengeData() {
  const challengeDetails = useQuery({
    queryKey: ["challenge"],
    queryFn: getChallengeDetails,
    refetchInterval: (data) =>
      !data || data.status != "DEPLOYED" ? 500 : false,
  });

  const challengeSource = useQuery({
    queryKey: ["source"],
    queryFn: getChallengeSource,
  });

  return { challengeDetails, challengeSource };
}
