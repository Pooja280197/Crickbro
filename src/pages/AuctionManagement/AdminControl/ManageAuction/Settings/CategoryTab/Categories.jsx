import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Pencil, Trash2 } from "lucide-react";
import CreateCategory from "./CreateCategory";
import {
  createCategory,
  deleteCategory,
  fetchAuctionDetails,
  getCategories,
  updateCategories,
} from "../../../../../../redux/actions";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import DeleteConfirmModal from "../../../../../../components/DeleteConfirmModal";
import CategoryPlayers from "./CategoryPlayers";
import Pagination from "../../../../../../components/Pagination";

const CATEGORIES_PER_PAGE = 5;

const Categories = ({ auctionId }) => {
  const [categoryPopup, setCategoryPopup] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editId, setEditId] = useState("");
  const [deletePopup, setDeletePopup] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [playersPopup, setPlayersPopup] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const categoryDetails = useSelector((state) => state?.data?.categories);
  const categories = Array.isArray(categoryDetails?.data)
    ? categoryDetails.data
    : [];
  const dispatch = useDispatch();

  const tournamentId = useSelector((state) => state.tournamentId);

  // Check screen size for responsive view
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint (1024px)
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    dispatch(fetchAuctionDetails(auctionId));
    dispatch(getCategories(auctionId));
  }, [auctionId]);

  const totalPages = Math.max(
    1,
    Math.ceil(categories.length / CATEGORIES_PER_PAGE)
  );

  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * CATEGORIES_PER_PAGE;
    return categories.slice(startIndex, startIndex + CATEGORIES_PER_PAGE);
  }, [categories, currentPage]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const handleCreateCategory = async (categoryData) => {
    const data = {
      ...categoryData,
      auctionId,
      tournamentId,
    };
    try {
      await dispatch(createCategory(data));
      toast.success("Category created successfully");
      dispatch(getCategories(auctionId));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
    setCategoryPopup(false);
  };

  const handleUpdateCategory = async (categoryData) => {
    const data = {
      ...categoryData,
      auctionId,
      tournamentId,
    };
    try {
      await dispatch(updateCategories(data, editId));
      toast.success("Category updated successfully");
      dispatch(getCategories(auctionId));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
    setCategoryPopup(false);
    setEditingCategory(null);
  };

  const handleEditCategory = (category) => {
    setEditId(category._id);
    setEditingCategory(category);
    setCategoryPopup(true);
  };

  const handleDeleteCategory = async () => {
    try {
      await dispatch(deleteCategory(deleteId));
      toast.success("Category deleted successfully");
      setDeletePopup(false);
      dispatch(getCategories(auctionId));
    } catch (error) {
      console.error(error);
      toast.error("Delete failed");
    }
  };

  // Card/Grid View Component (for mobile & tablet)
  const CardView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
      {paginatedCategories.map((category) => (
        <div
          key={category._id || category.id}
          className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-card)] shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
        >
          <div className="p-4 md:p-5">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-base md:text-lg font-semibold text-[var(--text-primary)] break-words flex-1">
                {category.name}
              </h3>
              <div className="flex gap-1 ml-2">
                <button
                  onClick={() => handleEditCategory(category)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Edit"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    setDeletePopup(true);
                    setDeleteId(category._id);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-[var(--bg-card)] text-red-500 transition hover:bg-red-50 hover:text-red-600"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="space-y-2.5 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--text-secondary)]">Base Amount:</span>
                <span className="font-semibold text-[var(--text-primary)]">₹{category.baseAmount}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--text-secondary)]">Bid Increment:</span>
                <span className="font-semibold text-[var(--text-primary)]">₹{category.biddingIncrement}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--text-secondary)]">Max Bid:</span>
                <span className="font-semibold text-[var(--text-primary)]">₹{category.maxBid}</span>
              </div>
            </div>
            
            <button
              onClick={() => {
                setPlayersPopup(true);
                setCategoryId(category._id);
              }}
              className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] px-3 text-sm font-semibold text-[var(--primary)] transition hover:bg-[var(--secondary-lighter)]"
            >
              View Players
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  // Table View Component (for laptops & desktops)
  const TableView = () => (
    <div className="overflow-hidden rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-[var(--bg-soft)]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-card)]">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-card)]">
                Base Amount
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-card)]">
                Bid Increment
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-card)]">
                Max Bid
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-card)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedCategories.map((category) => (
              <tr key={category._id || category.id} className="hover:bg-[var(--bg-soft)] transition">
                <td className="px-6 py-2.5 text-sm">
                  {category.name}
                </td>
                <td className="px-6 py-2.5 text-sm">
                  ₹{category.baseAmount}
                </td>
                <td className="px-6 py-2.5 text-sm">
                  ₹{category.biddingIncrement}
                </td>
                <td className="px-6 py-2.5 text-sm">
                  ₹{category.maxBid}
                </td>
                <td className="px-6 py-2.5">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                      title="Edit"
                      aria-label={`Edit ${category.name}`}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => {
                        setDeletePopup(true);
                        setDeleteId(category._id);
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-[var(--bg-card)] text-red-500 transition hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                      aria-label={`Delete ${category.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                    <button
                      onClick={() => {
                        setPlayersPopup(true);
                        setCategoryId(category._id);
                      }}
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-[var(--border-primary)] bg-[var(--accent-light)] px-3 text-xs font-semibold text-[var(--primary)] transition hover:bg-[var(--secondary-lighter)]"
                    >
                      View Players
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-[var(--bg-soft)] text-[var(--text-primary)]">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h4 className="text-xl md:text-2xl font-semibold text-[var(--text-primary)]">
            Categories
          </h4>
          
          <button
            onClick={() => {
              setEditingCategory(null);
              setCategoryPopup(true);
            }}
            className="px-4 py-2 bg-[var(--color-button-primary)] text-[var(--text-dark)] border border-gray-400/20 rounded-lg font-medium hover:opacity-90 transition shadow-sm whitespace-nowrap"
          >
            + Create Category
          </button>
        </div>

        {/* Content Section - Automatic view switching based on screen size */}
        {categories.length === 0 ? (
          <div className="text-center py-12 px-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border-card)] shadow-sm">
            <div className="text-[var(--text-secondary)] mb-2">No categories available</div>
            <div className="text-sm text-[var(--text-muted)]">
              Create your first category to get started
            </div>
          </div>
        ) : (
          <>
            {/* Table View - Only visible on lg screens and above */}
            <div className={`${isMobile ? 'hidden' : 'block'}`}>
              <TableView />
            </div>
            
            {/* Card View - Only visible on mobile and tablet */}
            <div className={`${isMobile ? 'block' : 'hidden'}`}>
              <CardView />
            </div>

            {totalPages > 1 && (
              <Pagination
                className="mt-5"
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                summaryPrefix="Categories page"
              />
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {categoryPopup &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <CreateCategory
              isOpen={categoryPopup}
              onClose={() => {
                setCategoryPopup(false);
                setEditingCategory(null);
              }}
              onSubmit={
                editingCategory ? handleUpdateCategory : handleCreateCategory
              }
              initialData={editingCategory}
            />
          </div>,
          document.body
        )}

      <DeleteConfirmModal
        open={deletePopup}
        title="Delete Category"
        description="Do you want to delete this category?"
        onClose={() => setDeletePopup(false)}
        onConfirm={handleDeleteCategory}
      />

      {playersPopup &&
        createPortal(
          <CategoryPlayers
            open={playersPopup}
            onClose={() => setPlayersPopup(false)}
            categoryId={categoryId}
            auctionId={auctionId}
          />,
          document.body
        )}
    </div>
  );
};

export default Categories;
