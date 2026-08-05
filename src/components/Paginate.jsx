import { Link } from 'react-router-dom'

const Paginate = ({
  pages = 1, // default to 1
  page = 1,  // default to 1
  isAdmin = false,
  onPageChange,
  keyword = '',
  brand = '',
  pathname = '/',
  searchParamName = 'keyword',
}) => {
  const currentPage = Number(page) || 1 // FIX 1: fallback to 1
  const totalPages = Number(pages) || 1 // FIX 2: fallback to 1

  if (totalPages <= 1) return null // don't render if only 1 page

  const baseBtn = 'px-3 py-2 text-sm font-medium border rounded-md transition'
  const activeBtn = 'bg-blue-600 text-white border-blue-600'
  const inactiveBtn = 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'

  const baseUrl = pathname
  const urlKeyword = keyword ? `&${searchParamName}=${keyword}` : ''
  const urlBrand = brand ? `&brand=${brand}` : ''
  const urlParams = `${urlKeyword}${urlBrand}`

  const getPageNumbers = () => {
    const delta = 2
    const range = []
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }
    if (currentPage - delta > 2) range.unshift('...')
    if (currentPage + delta < totalPages - 1) range.push('...')
    range.unshift(1)
    if (totalPages !== 1) range.push(totalPages)
    return range
  }

  return (
    <div className='flex flex-col sm:flex-row items-center justify-between gap-4 mt-6'>
      <div className='text-sm text-gray-700'>
        <div>
          Page <span className='font-medium'>{currentPage}</span> of{' '}
          <span className='font-medium'>{totalPages}</span>
        </div>
      </div>

      <div className='flex flex-wrap items-center gap-2'>
        {currentPage > 1 && (
          <Link
            to={`${baseUrl}?pageNumber=${currentPage - 1}${urlParams}`}
            className={`${baseBtn} ${inactiveBtn}`}
          >
            Prev
          </Link>
        )}

        {getPageNumbers().map((pageNum, idx) =>
          pageNum === '...' ? (
            <span key={`dots-${idx}`} className='px-3 py-2'>...</span>
          ) : (
            // FIX 3: KEY MUST BE HERE ON THE COMPONENT ITSELF
            <Link
              key={pageNum}
              to={`${baseUrl}?pageNumber=${pageNum}${urlParams}`}
              onClick={() => isAdmin && onPageChange && onPageChange(pageNum)}
              className={`${baseBtn} ${pageNum === currentPage ? activeBtn : inactiveBtn}`}
            >
              {pageNum}
            </Link>
          )
        )}

        {currentPage < totalPages && (
          <Link
            to={`${baseUrl}?pageNumber=${currentPage + 1}${urlParams}`}
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