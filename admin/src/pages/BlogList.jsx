import React, { useContext, useEffect, useState } from "react";
import { AuthDataContext } from "../context/AuthContext";
import axios from "axios";
import { FaTrash, FaEdit } from "react-icons/fa";
import { toast } from "react-toastify";

const BlogList = () => {
  const [list, setList] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { baseUrl } = useContext(AuthDataContext);

  const fetchList = async () => {
    try {
      const result = await axios.get(baseUrl + "/api/v1/blogs/list", {
        withCredentials: true,
      });
      setList(result.data.blogs);
    } catch (error) {
      console.error("Error fetching list:", error);
    }
  };

  const removeList = async (id) => {
    try {
      const result = await axios.delete(
        `${baseUrl}/api/v1/blogs/delete/${id}`,
        { withCredentials: true }
      );
      if (result.data.success) {
        toast.success("Blog removed successfully!");
        fetchList();
      } else {
        toast.error("Failed to remove Blog");
      }
    } catch (error) {
      console.error("Error removing blog:", error);
      toast.error("Something went wrong!");
    }
  };

  const openEdit = (blog) => {
    setSelectedBlog(blog);
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", selectedBlog.title);
      formData.append("description", selectedBlog.description);
      formData.append("category", selectedBlog.category);
      if (selectedBlog.newImage) {
        formData.append("image", selectedBlog.newImage);
      }

      const result = await axios.put(
        `${baseUrl}/api/v1/blogs/update/${selectedBlog._id}`,
        formData,
        { withCredentials: true }
      );

      if (result.data.success) {
        toast.success("Blog updated successfully!");
        setShowModal(false);
        fetchList();
      } else {
        toast.error("Failed to update Blog");
      }
    } catch (error) {
      console.error("Error updating blog:", error);
      toast.error("Something went wrong!");
    }
  };

  useEffect(() => {
    fetchList();
  }, [baseUrl]);

  return (
    <div className="p-6 mb-10">
      {list?.length > 0 ? (
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="min-w-full border-collapse bg-white">
            <thead>
              <tr className="bg-[#F0D800] text-white">
                <th className="px-6 py-3 text-left text-sm font-semibold">SL No</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Blog Title</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Image</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">Action</th>
              </tr>
            </thead>

            <tbody>
              {list.map((item, index) => (
                <tr key={item._id} className="odd:bg-gray-50 hover:bg-yellow-50">
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">{item.title}</td>
                  <td className="px-6 py-4">
                    <img
                      src={item.image?.url}
                      alt="blog"
                      className="h-16 w-16 rounded-md object-cover border"
                    />
                  </td>
                  <td className="px-6 py-4 flex gap-2 justify-center">
                    <button
                      onClick={() => openEdit(item)}
                      className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 text-sm rounded-md"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => removeList(item._id)}
                      className="flex items-center gap-1 bg-red-600 text-white px-3 py-2 text-sm rounded-md"
                    >
                      <FaTrash /> Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500 text-lg mt-10">No Blogs available</p>
      )}

      {/* Edit Modal */}
      {showModal && selectedBlog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl rounded-xl shadow-xl p-6 overflow-y-auto max-h-[90vh]">
            <h2 className="text-lg font-semibold mb-4">Edit Blog</h2>

            <form onSubmit={handleUpdate}>
              <input
                type="text"
                className="border w-full p-2 rounded mb-3"
                value={selectedBlog.title}
                onChange={(e) =>
                  setSelectedBlog({ ...selectedBlog, title: e.target.value })
                }
                placeholder="Blog Title"
              />

              <textarea
                className="border w-full p-2 rounded mb-3"
                rows={3}
                value={selectedBlog.description}
                onChange={(e) =>
                  setSelectedBlog({
                    ...selectedBlog,
                    description: e.target.value,
                  })
                }
                placeholder="Description"
              ></textarea>

              <input
                type="text"
                className="border w-full p-2 rounded mb-3"
                value={selectedBlog.category || ""}
                onChange={(e) =>
                  setSelectedBlog({ ...selectedBlog, category: e.target.value })
                }
                placeholder="Category"
              />

              <input
                type="file"
                className="border p-2 w-full rounded mb-3"
                onChange={(e) =>
                  setSelectedBlog({
                    ...selectedBlog,
                    newImage: e.target.files[0],
                  })
                }
              />

              <div className="flex justify-between">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogList;
