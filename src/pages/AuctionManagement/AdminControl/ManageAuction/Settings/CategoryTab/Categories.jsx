import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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

const Categories = ({ auctionId }) => {
  const [categoryPopup, setCategoryPopup] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editId, setEditId] = useState("");
  const [deletePopup, setDeletePopup] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [playersPopup, setPlayersPopup] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const categoryLoading = useSelector((state) => state?.loading?.categories);
  const categoryDetails = useSelector((state) => state?.data?.categories);
  const categories = categoryDetails?.data;
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
      {categories?.map((category) => (
        <div
          key={category.id}
          className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
        >
          <div className="p-4 md:p-5">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-base md:text-lg font-semibold text-gray-800 break-words flex-1">
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
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
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
                <span className="text-gray-500">Base Amount:</span>
                <span className="font-semibold text-gray-800">₹{category.baseAmount}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Bid Increment:</span>
                <span className="font-semibold text-gray-800">₹{category.biddingIncrement}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Max Bid:</span>
                <span className="font-semibold text-gray-800">₹{category.maxBid}</span>
              </div>
            </div>
            
            <button
              onClick={() => {
                setPlayersPopup(true);
                setCategoryId(category._id);
              }}
              className="w-full px-3 py-2 text-sm bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-lg hover:from-green-100 hover:to-emerald-100 transition font-medium"
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
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Base Amount
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Bid Increment
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Max Bid
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories?.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm">
                  {category.name}
                </td>
                <td className="px-6 py-4 text-sm">
                  ₹{category.baseAmount}
                </td>
                <td className="px-6 py-4 text-sm">
                  ₹{category.biddingIncrement}
                </td>
                <td className="px-6 py-4 text-sm">
                  ₹{category.maxBid}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setDeletePopup(true);
                        setDeleteId(category._id);
                      }}
                      className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => {
                        setPlayersPopup(true);
                        setCategoryId(category._id);
                      }}
                      className="px-3 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100 transition"
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
    <div className="min-h-screen p-4 sm:p-6 bg-gray-50 text-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h4 className="text-xl md:text-2xl font-semibold text-gray-800">
            Categories
          </h4>
          
          <button
            onClick={() => {
              setEditingCategory(null);
              setCategoryPopup(true);
            }}
            className="px-4 py-2 bg-[var(--color-button-primary)] text-white border border-gray-400/20 rounded-lg font-medium hover:opacity-90 transition shadow-sm whitespace-nowrap"
          >
            + Create Category
          </button>
        </div>

        {/* Content Section - Automatic view switching based on screen size */}
        {categories?.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="text-gray-600 mb-2">No categories available</div>
            <div className="text-sm text-gray-400">
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