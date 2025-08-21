import { Loader } from 'lucide-react'

export const LoadingSpinner = () => {
  return (
    <div className='w-full items-center justify-center flex'>
      <Loader className='animate-spin ' />
    </div>
  )
}

