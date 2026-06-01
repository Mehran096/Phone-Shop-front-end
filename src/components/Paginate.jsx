import { Link } from 'react-router-dom'

const Paginate = ({ pages, page, isAdmin = false, onPageChange, keyword = '' }) => {
  if (pages <= 1) return null

  const baseBtn = "px-3 py-2 text-sm font-medium border rounded-md transition"
  const activeBtn = "bg-blue-600 text-white border-blue-600"
  const inactiveBtn = "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"

  const baseUrl = isAdmin ? '/admin/productlist' : '/'
  const urlKeyword = keyword ? `&keyword=${keyword}` : ''

  const PageButton = ({ pageNum, isActive }) => {
    const classes = `${baseBtn} ${isActive ? activeBtn : inactiveBtn}`

    if (isAdmin && onPageChange) {
      return (
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          className={classes}
        >
          {pageNum}
        </button>
      )
    }

    return (
      <Link
        key={pageNum}
        to={`${baseUrl}?pageNumber=${pageNum}${urlKeyword}`}
        className={classes}
      >
        {pageNum}
      </Link>
    )
  }

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