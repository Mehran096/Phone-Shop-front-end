import { Link } from 'react-router-dom'

const Paginate = ({ 
  pages, 
  page, 
  isAdmin = false, 
  onPageChange, 
  keyword = '', 
  pathname = '/',  // <-- Add this
  searchParamName = 'keyword' // <-- Add this for UserList ?search=
}) => {
  if (pages <= 1) return null

  const baseBtn = "px-3 py-2 text-sm font-medium border rounded-md transition"
  const activeBtn = "bg-blue-600 text-white border-blue-600"
  const inactiveBtn = "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"

  // FIX: Use pathname prop instead of hardcoding
  const baseUrl = pathname
  const urlKeyword = keyword ? `&${searchParamName}=${keyword}` : ''

  // Show only 5 page numbers on mobile to prevent overflow
  const getPageNumbers = () => {
    const delta = 2
    const range = []
    for (let i = Math.max(2, page - delta); i <= Math.min(pages - 1, page + delta); i++) {
      range.push(i)
    }
    if (page - delta > 2) range.unshift('...')
    if (page + delta < pages - 1) range.push('...')
    range.unshift(1)
    if (pages !== 1) range.push(pages)
    return range
  }

  const PageButton = ({ pageNum, isActive }) => {
    const classes = `${baseBtn} ${isActive ? activeBtn : inactiveBtn}`

    if (isAdmin && onPageChange) {
      return (
        <button
          onClick={() => onPageChange(pageNum)}
          className={classes}
        >
          {pageNum}
        </button>
      )
    }

    return (
      <Link
        to={`${baseUrl}?pageNumber=${pageNum}${urlKeyword}`}
        className={classes}
      >
        {pageNum}
      </Link>
    )
  }

  return (
    <div className='flex flex-col sm:flex-row items-center justify-between gap-4 mt-6'>
      <div className='text-sm text-gray-700'>
        Page <span className='font-medium'>{page}</span> of{' '}
        <span className='font-medium'>{pages}</span>
      </div>

      <div className='flex flex-wrap items-center gap-2'>
        {page > 1 && (
          <Link
            to={`${baseUrl}?pageNumber=${page - 1}${urlKeyword}`}
            className={`${baseBtn} ${inactiveBtn}`}
          >
            Prev
          </Link>
        )}

        {getPageNumbers().map((pageNum, idx) =>
          pageNum === '...' ? (
            <span key={`dots-${idx}`} className='px-3 py-2'>...</span>
          ) : (
            <PageButton key={pageNum} pageNum={pageNum} isActive={pageNum === page} />
          )
        )}

        {page < pages && (
          <Link
            to={`${baseUrl}?pageNumber=${page + 1}${urlKeyword}`}
            className={`${baseBtn} ${inactiveBtn}`}
          >
            Next
          </Link>
        )}
      </div>
    </div>
  )
}

export default Paginate