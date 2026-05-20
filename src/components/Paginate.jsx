import { Link } from 'react-router-dom'

const Paginate = ({ pages, page, isAdmin = false, onPageChange, keyword = '' }) => {
  if (pages <= 1) return null

  const baseBtn = "px-3 py-2 text-sm font-medium border-gray-300 hover:bg-gray-50"
  const activeBtn = "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
  const inactiveBtn = "bg-white text-gray-700"

  return (
    <div className="flex justify-center mt-6">
      <nav className="inline-flex -space-x-px rounded-md shadow-sm">
        {[...Array(pages).keys()].map((x) => {
          const pageNum = x + 1
          const isActive = pageNum === page

          if (isAdmin) {
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`${baseBtn} ${isActive ? activeBtn : inactiveBtn} 
                  ${pageNum === 1 ? 'rounded-l-md' : ''} 
                  ${pageNum === pages ? 'rounded-r-md' : ''}`}
              >
                {pageNum}
              </button>
            )
          }

          // For public pages using Link
          return (
            <a
              key={pageNum}
              href={keyword ? `/search/${keyword}/page/${pageNum}` : `/page/${pageNum}`}
              className={`${baseBtn} ${isActive ? activeBtn : inactiveBtn} 
                ${pageNum === 1 ? 'rounded-l-md' : ''} 
                ${pageNum === pages ? 'rounded-r-md' : ''}`}
            >
              {pageNum}
            </a>
          )
        })}
      </nav>
    </div>
  )
}

export default Paginate

 