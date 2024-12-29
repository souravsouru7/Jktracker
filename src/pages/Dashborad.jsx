import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slice/authSlice";
import EntryForm from "../components/addentry/EntryForm";

import {
  fetchMonthlyExpenses,
  fetchIncomeVsExpense,
  fetchCategoryExpenses,

} from "../store/slice/analyticsSlice";
import {
  fetchProjects,
  createProject,
  selectProject,
  deleteProject,
} from "../store/slice/projectSlice";
import { Menu, X, Plus, Trash2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("");
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useMemo(() => JSON.parse(localStorage.getItem("user")), []);
  const userId = user?._id || user?.id;

  const projects = useSelector((state) => state.projects.projects);
  const selectedProject = useSelector((state) => state.projects.selectedProject);
  const monthlyExpenses = useSelector((state) => state.analytics.monthlyExpenses);
  const incomeVsExpense = useSelector((state) => state.analytics.incomeVsExpense);
  const categoryExpenses = useSelector((state) => state.analytics.categoryExpenses);


  useEffect(() => {
    if (userId) {
      dispatch(fetchProjects(userId));
    } else {
      navigate("/login");
    }
  }, [dispatch, userId, navigate]);

  useEffect(() => {
    if (selectedProject && userId) {
      dispatch(fetchMonthlyExpenses({ userId, projectId: selectedProject._id }));
      dispatch(fetchIncomeVsExpense({ userId, projectId: selectedProject._id }));
      dispatch(fetchCategoryExpenses({ userId, projectId: selectedProject._id }));
    }
  }, [dispatch, userId, selectedProject]);

  const colorPalette = [
    "#E6CCB2",
    "#DDB892",
    "#B08968",
    "#7F5539",
    "#9C6644",
    "#764134"
  ];

  const showToast = (message, type) => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleCreateProject = async () => {
    if (newProjectName) {
      try {
        await dispatch(createProject({
          userId,
          name: newProjectName,
          description: newProjectDescription,
        })).unwrap();
        setNewProjectName("");
        setNewProjectDescription("");
        showToast("Project created successfully", "success");
      } catch (error) {
        showToast("Failed to create project", "error");
      }
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await dispatch(deleteProject({ projectId, userId })).unwrap();
        showToast("Project deleted successfully", "success");
      } catch (error) {
        showToast("Failed to delete project", "error");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5EBE0] via-[#E6CCB2] to-[#DDB892]">
      <nav className="bg-white/10 backdrop-blur-md border-b border-[#B08968]/20 sticky top-0 z-50">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-[#7F5539] text-2xl font-bold">Finance Tracker</h1>
            
            <div className="hidden md:flex items-center space-x-6">
              <button onClick={() => navigate("/entries")} 
                className="text-[#9C6644] hover:text-[#7F5539] transition-colors">
                Entries
              </button>
              <button onClick={() => navigate("/balance-sheet")}
                className="text-[#9C6644] hover:text-[#7F5539] transition-colors">
                Balance Sheet
              </button>
              <button onClick={() => dispatch(logout())}
                className="bg-[#B08968] hover:bg-[#9C6644] text-white px-6 py-2 rounded-full transition-all">
                Logout
              </button>
            </div>

            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
              {isOpen ? <X className="text-[#7F5539]" /> : <Menu className="text-[#7F5539]" />}
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
     
        {/* Project Creation */}
        <div className="bg-white/30 backdrop-blur-md rounded-2xl p-6 shadow-xl mb-8">
          <h2 className="text-2xl font-bold text-[#7F5539] mb-6">Create Project</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Project Name"
              className="flex-1 px-4 py-2 rounded-lg bg-white/50 border border-[#B08968]/20 focus:outline-none focus:ring-2 focus:ring-[#B08968]"
            />
            <input
              type="text"
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
              placeholder="Description"
              className="flex-1 px-4 py-2 rounded-lg bg-white/50 border border-[#B08968]/20 focus:outline-none focus:ring-2 focus:ring-[#B08968]"
            />
            <button
              onClick={handleCreateProject}
              className="px-6 py-2 bg-[#B08968] hover:bg-[#9C6644] text-white rounded-lg transition-all">
              Create Project
            </button>
          </div>
        </div>

        {/* Project Selection */}
        <div className="bg-white/30 backdrop-blur-md rounded-2xl p-6 shadow-xl mb-8">
          <h2 className="text-2xl font-bold text-[#7F5539] mb-6">Your Projects</h2>
          <div className="flex flex-wrap gap-4">
            {projects.map((project) => (
              <div key={project._id} 
                className={`relative group px-6 py-3 rounded-xl cursor-pointer transition-all
                  ${selectedProject?._id === project._id 
                    ? 'bg-[#B08968] text-white' 
                    : 'bg-white/50 text-[#7F5539] hover:bg-white/70'}`}>
                <div className="flex items-center gap-3">
                  <span onClick={() => dispatch(selectProject(project))}
                    className="font-medium">{project.name}</span>
                  <button onClick={() => handleDeleteProject(project._id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Monthly Expenses */}
          <div className="bg-white/30 backdrop-blur-md rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-[#7F5539] mb-6">Monthly Expenses</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyExpenses}>
                <CartesianGrid strokeDasharray="3 3" stroke="#B08968" opacity={0.2} />
                <XAxis dataKey="_id.month" stroke="#7F5539" />
                <YAxis stroke="#7F5539" />
                <Tooltip />
                <Bar dataKey="total" fill="#B08968" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Income vs Expense */}
          <div className="bg-white/30 backdrop-blur-md rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-[#7F5539] mb-6">Income vs Expense</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incomeVsExpense}
                  dataKey="total"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {incomeVsExpense.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colorPalette[index % colorPalette.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Floating Action Button */}
        <button
          onClick={() => setIsEntryModalOpen(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-[#B08968] hover:bg-[#9C6644] text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110">
          <Plus className="w-6 h-6" />
        </button>

        {/* Entry Modal */}
        {isEntryModalOpen && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="w-full max-w-md m-4 bg-white/95 rounded-2xl shadow-xl">
              <button
                onClick={() => setIsEntryModalOpen(false)}
                className="absolute top-4 right-4 text-[#7F5539]">
                <X className="w-6 h-6" />
              </button>
              <EntryForm onClose={() => setIsEntryModalOpen(false)} />
            </div>
          </div>
        )}

        {/* Notification Toast */}
        {showNotification && (
          <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 
            ${notificationType === "success" ? "bg-[#B08968]" : "bg-red-500"} 
            text-white transform transition-all duration-300`}>
            <div className="flex items-center gap-2">
              <span>{notificationType === "success" ? "✓" : "✕"}</span>
              <span>{notificationMessage}</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default React.memo(Dashboard);