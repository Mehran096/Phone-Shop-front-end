import { Link } from 'react-router-dom'

const Paginate = ({ pages, page, isAdmin = false, onPageChange, keyword = '' }) => {
  if (pages <= 1) return null

  const baseBtn = "px-3 py-2 text-sm font-medium border-gray-300 hover:bg-gray-50"
  const activeBtn = "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
  const inactiveBtn = "bg-white text-gray-700"
  const disabledBtn = "opacity-50 cursor-not-allowed"

  const baseUrl = isAdmin? '/admin/productlist' : '/'
  const urlKeyword = keyword? `&keyword=${keyword}` : ''

  // Helper to render page number button
  const PageButton = ({ pageNum, isActive }) => {
    const classes = `${baseBtn} ${isActive? activeBtn : inactiveBtn}`

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
        to={`${baseUrl}?page=${pageNum}${urlKeyword}`}
        className={classes}
      >
        {pageNum}
      </Link>
    )
  }

  // Helper for Prev/Next
  const NavButton = ({ to, disabled, children }) => {
    const classes = `${baseBtn} ${inactiveBtn} ${disabled? disabledBtn : ''}`

    if (isAdmin && onPageChange) {
      return (
        <button
          onClick={() =>!disabled && onPageChange(to)}
          disabled={disabled}
          className={classes}
        >
          {children}
        </button>
      )
    }

    return (
      <Link
        to={disabled? '#' : `${baseUrl}?page=${to}${urlKeyword}`}
        className={`${classes} ${disabled? 'pointer-events-none' : ''}`}
      >
        {children}
      </Link>
    )
  }

  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const pageNumbers = []
    const showPages = 5 // show 5 numbers max
    const half = Math.floor(showPages / 2)

    let start = Math.max(1, page - half)
    let end = Math.min(pages, page + half)

    if (page <= half) {
      end = Math.min(pages, showPages)
    }
    if (page + half >= pages) {
      start = Math.max(1, pages - showPages + 1)
    }

    for (let i = start; i <= end; i++) {
      pageNumbers.push(i)
    }
    return pageNumbers
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex justify-center mt-6">
      <nav className="inline-flex -space-x-px rounded-md shadow-sm items-center gap-1 flex-wrap">
        <NavButton to={page - 1} disabled={page === 1}>
          Prev
        </NavButton>

        {/* First page +... */}
        {pageNumbers[0] > 1 && (
          <>
            <PageButton pageNum={1} isActive={page === 1} />
            {pageNumbers[0] > 2 && <span className="px-3 py-2 text-gray-500">...</span>}
          </>
        )}

        {/* Page numbers */}
        {pageNumbers.map((pageNum) => (
          <PageButton key={pageNum} pageNum={pageNum} isActive={pageNum === page} />
        ))}

        {/*... + Last page */}
        {pageNumbers[pageNumbers.length - 1] < pages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < pages - 1 && (
              <span className="px-3 py-2 text-gray-500">...</span>
            )}
            <PageButton pageNum={pages} isActive={page === pages} />
          </>
        )}

        <NavButton to={page + 1} disabled={page === pages}>
          Next
        </NavButton>

        <span className="text-sm text-gray-600 ml-4 px-2">
          Page {page} of {pages}
        </span>
      </nav>
    </div>
  )
}

export default Paginate