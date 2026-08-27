import { useState } from "react";
import { Bell, LogOut, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, setUnreadCount } = useSocket();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-800">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-xs capitalize text-gray-400">{user?.role} portal</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => {
              setOpen(!open);
              if (!open) setUnreadCount(0);
            }}
            className="relative rounded-full p-2 hover:bg-gray-100"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                {unreadCount}
              </span>
            )}
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
              <div className="border-b border-gray-100 px-4 py-2 text-sm font-semibold">Notifications</div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-gray-400">No notifications yet</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n._id} className="border-b border-gray-50 px-4 py-3 text-sm hover:bg-gray-50">
                      <p className="font-medium text-gray-800">{n.title}</p>
                      <p className="text-xs text-gray-500">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5">
          <User className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">{user?.name}</span>
        </div>

        <button onClick={handleLogout} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600">
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
