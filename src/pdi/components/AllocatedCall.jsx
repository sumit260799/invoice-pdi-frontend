import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCallListByInspector } from "../features/pdiUserSlice";

const AllocatedCall = () => {
  const dispatch = useDispatch();

  // Correcting state access to match the actual name in Redux store
  const callListByInspector = useSelector(
    (state) => state.pdiUser.callListByInspector // Corrected
  );

  const callListByInspectorStatus = useSelector(
    (state) => state.pdiUser.callListByInspectorStatus
  );
  const callListByInspectorError = useSelector(
    (state) => state.pdiUser.callListByInspectorError
  );

  const [filteredCalls, setFilteredCalls] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (callListByInspectorStatus === "idle") {
      dispatch(getCallListByInspector());
    }
  }, [dispatch, callListByInspectorStatus]);

  useEffect(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    if (callListByInspector && Array.isArray(callListByInspector)) {
      const filtered = callListByInspector.filter((call) => {
        return (
          (call.sr_no &&
            call.sr_no.toLowerCase().includes(lowercasedSearchTerm)) ||
          (call.assigned_to &&
            call.assigned_to.toLowerCase().includes(lowercasedSearchTerm)) ||
          (call.call_status &&
            call.call_status.toLowerCase().includes(lowercasedSearchTerm)) ||
          (call.call_type &&
            call.call_type.toLowerCase().includes(lowercasedSearchTerm)) ||
          (call.allocation_status &&
            call.allocation_status
              .toLowerCase()
              .includes(lowercasedSearchTerm)) ||
          (call.working_status &&
            call.working_status.toLowerCase().includes(lowercasedSearchTerm))
        );
      });
      setFilteredCalls(filtered);
    }
  }, [callListByInspector, searchTerm]);

  if (callListByInspectorStatus === "loading") return <p>Loading...</p>;
  if (callListByInspectorStatus === "failed")
    return <p>Error: {callListByInspectorError}</p>;

  // Sorting Logic
  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";

    const sorted = [...filteredCalls].sort((a, b) => {
      // Handle date sorting specifically
      if (field === "assign_date") {
        const dateA = new Date(a[field]);
        const dateB = new Date(b[field]);
        return order === "asc" ? dateA - dateB : dateB - dateA;
      }

      // Handle other fields (string and numeric)
      if (a[field] < b[field]) return order === "asc" ? -1 : 1;
      if (a[field] > b[field]) return order === "asc" ? 1 : -1;
      return 0;
    });

    setSortField(field);
    setSortOrder(order);
    setFilteredCalls(sorted);
  };

  // Pagination Logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCalls = filteredCalls.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const totalPages = Math.ceil(filteredCalls.length / itemsPerPage);

  // Status and Allocation Color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "text-red-500";
      case "completed":
        return "text-green-500";
      case "in-progress":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold mb-4 text-gray-800">
        Allocated Calls
      </h1>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by any field"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-1 px-2 border rounded w-[50%] outline-none"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-md shadow-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-medium select-none">
            <tr>
              <th
                className="py-2 px-3 text-left cursor-pointer"
                onClick={() => handleSort("sr_no")}
              >
                SL No{" "}
                {sortField === "sr_no" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="py-2 px-3 text-left cursor-pointer"
                onClick={() => handleSort("assign_date")}
              >
                Assign Date{" "}
                {sortField === "assign_date" &&
                  (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="py-2 px-3 text-left cursor-pointer"
                onClick={() => handleSort("working_status")}
              >
                Working Status{" "}
                {sortField === "working_status" &&
                  (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="py-2 px-3 text-left cursor-pointer"
                onClick={() => handleSort("call_type")}
              >
                Call Type{" "}
                {sortField === "call_type" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="py-2 px-3 text-left cursor-pointer"
                onClick={() => handleSort("call_status")}
              >
                Call Status{" "}
                {sortField === "call_status" &&
                  (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="py-2 px-3 text-left cursor-pointer"
                onClick={() => handleSort("assigned_by")}
              >
                Assigned By{" "}
                {sortField === "assigned_by" &&
                  (sortOrder === "asc" ? "↑" : "↓")}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedCalls.map((call, index) => (
              <tr
                key={call._id}
                className={`text-gray-700 text-sm ${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                }`}
              >
                <td className="py-2 px-3">{call.sr_no}</td>
                <td className="py-2 px-3">
                  {new Date(call.assign_date).toLocaleDateString()}
                </td>
                <td className="py-2 px-3">{call.working_status}</td>
                <td className="py-2 px-3">{call.call_type}</td>
                <td
                  className={`py-2 px-3 font-medium ${getStatusColor(
                    call.call_status
                  )}`}
                >
                  {call.call_status}
                </td>
                <td className="py-2 px-3">{call.assigned_by}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AllocatedCall;