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
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-[#B08968]/20">
        <div className="flex justify-between items-center px-4 py-4">
          <h1 className="text-xl font-bold text-[#7F5539]">Finance Tracker</h1>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="text-[#7F5539]"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="fixed inset-0 bg-white z-40 flex flex-col">
          <div className="flex justify-between items-center px-4 py-4 border-b">
            <h1 className="text-xl font-bold text-[#7F5539]">Finance Tracker</h1>
            <button onClick={() => setIsOpen(false)}>
              <X size={24} className="text-[#7F5539]" />
            </button>
          </div>
          <nav className="flex flex-col p-4 gap-4">
            <button
              onClick={() => {
                navigate("/entries");
                setIsOpen(false);
              }}
              className="w-full py-3 text-left text-[#9C6644] text-lg"
            >
              Entries
            </button>
            <button
              onClick={() => {
                navigate("/balance-sheet");
                setIsOpen(false);
              }}
              className="w-full py-3 text-left text-[#9C6644] text-lg"
            >
              Balance Sheet
            </button>
            <button
              onClick={() => dispatch(logout())}
              className="w-full py-3 bg-[#B08968] text-white rounded-lg text-lg"
            >
              Logout
            </button>
          </nav>
        </div>
      )}

      <main className="p-4 space-y-6">
        {/* Create Project Section */}
        <section className="bg-white/80 rounded-xl p-4">
          <h2 className="text-lg font-semibold text-[#7F5539] mb-4">Create Project</h2>
          <div className="space-y-4">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Project Name"
              className="w-full px-4 py-3 rounded-lg bg-white border border-[#B08968]/20"
            />
            <input
              type="text"
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
              placeholder="Description"
              className="w-full px-4 py-3 rounded-lg bg-white border border-[#B08968]/20"
            />
            <button
              onClick={handleCreateProject}
              className="w-full py-3 bg-[#B08968] text-white rounded-lg"
            >
              Create Project
            </button>
          </div>
        </section>

        {/* Projects List */}
        <section className="bg-white/80 rounded-xl p-4">
          <h2 className="text-lg font-semibold text-[#7F5539] mb-4">Your Projects</h2>
          <div className="space-y-2">
            {projects.map((project) => (
              <div
                key={project._id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  selectedProject?._id === project._id
                    ? 'bg-[#B08968] text-white'
                    : 'bg-white'
                }`}
              >
                <span 
                  onClick={() => dispatch(selectProject(project))}
                  className="flex-1"
                >
                  {project.name}
                </span>
                <button
                  onClick={() => handleDeleteProject(project._id)}
                  className="ml-2"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Charts */}
        {selectedProject && (
          <>
            {/* Monthly Expenses Chart */}
            <section className="bg-white/80 rounded-xl p-4">
              <h2 className="text-lg font-semibold text-[#7F5539] mb-4">Monthly Expenses</h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer>
                  <BarChart data={monthlyExpenses} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id.month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#B08968" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Income vs Expense Chart */}
            <section className="bg-white/80 rounded-xl p-4">
              <h2 className="text-lg font-semibold text-[#7F5539] mb-4">Income vs Expense</h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer>
                  <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <Pie
                      data={incomeVsExpense}
                      dataKey="total"
                      nameKey="_id"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {incomeVsExpense.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colorPalette[index % colorPalette.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
          </>
        )}

        {/* Floating Action Button */}
        <button
          onClick={() => setIsEntryModalOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#B08968] text-white rounded-full shadow-xl flex items-center justify-center"
        >
          <Plus size={24} />
        </button>

        {/* Entry Modal */}
        {isEntryModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-md bg-white rounded-xl relative">
              <button
                onClick={() => setIsEntryModalOpen(false)}
                className="absolute top-4 right-4"
              >
                <X size={24} className="text-[#7F5539]" />
              </button>
              <EntryForm onClose={() => setIsEntryModalOpen(false)} />
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {showNotification && (
          <div
            className={`fixed bottom-4 left-4 right-4 p-4 rounded-lg ${
              notificationType === "success" ? "bg-[#B08968]" : "bg-red-500"
            } text-white z-50`}
          >
            {notificationMessage}
          </div>
        )}
      </main>
    </div>
  );
};

export default React.memo(Dashboard);