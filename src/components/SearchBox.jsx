import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaSearch } from 'react-icons/fa'

const SearchBox = ({ onSearchComplete }) => {
  const [keyword, setKeyword] = useState('')
  const navigate = useNavigate()

  const submitHandler = (e) => {
    e.preventDefault()
    if (keyword.trim()) {
      navigate(`/?keyword=${keyword.trim()}&pageNumber=1`)
      setKeyword('')
      if (onSearchComplete) onSearchComplete() // Close mobile menu
    } else {
      navigate('/')
      if (onSearchComplete) onSearchComplete()
    }
  }

  return (
    <form onSubmit={submitHandler} className='flex w-full pr-2'>
      <input
        type='text'
        name='q'
        onChange={(e) => setKeyword(e.target.value)}
        value={keyword}
        placeholder='Search phones, brands...'
        className='flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white'
      />
      <button
        type='submit'
        className='px-4 py-2 border rounded-r-lg focus:outline-none shrink-0 focus:ring-2 focus:ring-blue-500'
      >
        
        <FaSearch className='text-white-500 w-5 h-5' /> 
      </button>
    </form>
  )
}

export default SearchBox