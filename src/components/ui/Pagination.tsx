import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

interface PaginationProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    paginate: (pageNumber: number) => void;
    itemName?: string;
}

const Pagination = ({
    currentPage,
    totalItems,
    itemsPerPage,
    paginate,
    itemName = "elementos"
}: PaginationProps) => {
    // Calcular índices y páginas
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
    const indexOfLastItem = currentPage * itemsPerPage;

    if (totalPages <= 1) return null;

    // Configuración para la navegación paginada
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // Generar array de números de página
    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="flex justify-between items-center py-4 px-4 bg-white border-t border-blue-100">
            <div className="text-sm text-gray-600 mr-1">
                Mostrando {indexOfFirstItem}-{Math.min(indexOfLastItem, totalItems)} de {totalItems} {itemName}
            </div>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md border border-gray-200 text-gray-600 hover:bg-blue-50 
                    disabled:opacity-50 disabled:hover:bg-white transition-colors"
                    aria-label="Página anterior"
                >
                    <BsChevronLeft size={16} />
                </button>

                {pageNumbers.map(number => (
                    <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`px-3 py-1 rounded-md transition-colors ${currentPage === number
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-600 hover:bg-blue-50'
                            }`}
                        aria-label={`Ir a página ${number}`}
                        aria-current={currentPage === number ? "page" : undefined}
                    >
                        {number}
                    </button>
                ))}

                <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md border border-gray-200 text-gray-600 hover:bg-blue-50 
                    disabled:opacity-50 disabled:hover:bg-white transition-colors"
                    aria-label="Página siguiente"
                >
                    <BsChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;