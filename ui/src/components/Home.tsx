import CodePreview from './CodePreview';
import ChallengeDetails from './ChallengeDetails';
import useGetChallengeData from '../hooks/getChallengeData';

export default function Home() {

  const { challengeDetails } = useGetChallengeData();

  return (
    <div>
      <div className='mb-5'>
        <h1 className='text-7xl text-center'>Blockchain Challenge</h1>
      </div>
      {
        !challengeDetails.data ? <p className="text-center"> Loading...</p> :

          <div className='flex flex-wrap-reverse justify-center gap-3'>
            <CodePreview />
            <ChallengeDetails />
          </div >

      }
      {challengeDetails.errorUpdateCount > 2 && !challengeDetails.data
        && <p className="text-center">Struggling to retrieve challenge details, Please contact the admins :(</p>}
    </div>
  )

}
