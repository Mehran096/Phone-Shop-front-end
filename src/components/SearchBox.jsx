import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const SearchBox = () => {
  const [keyword, setKeyword] = useState('')
  const navigate = useNavigate()

  const submitHandler = (e) => {
    e.preventDefault()
    if (keyword.trim()) {
      navigate(`/?keyword=${keyword}&pageNumber=1`)
      setKeyword('')
    } else {
      navigate('/')
    }
  }

  return (
    <form onSubmit={submitHandler} className='flex w-full max-w-md'>
      <input
        type='text'
        name='q'
        onChange={(e) => setKeyword(e.target.value)}
        value={keyword}
        placeholder='Search phones, brands...'
        className='flex-1 px-4 py-2 border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
      />
      <button
        type='submit'
        className='px-4 py-2 bg-blue-600 text-white font-medium rounded-r-lg hover:bg-blue-700 transition-colors'
      >
        Search
      </button>
    </form>
  )
}

export default SearchBox