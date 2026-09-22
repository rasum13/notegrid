import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase.js";
import { fetchUserProfile } from "../api/profile.js";

const links = [
  { to: "/", label: "Feed", icon: HomeIcon, end: true },
  { to: "/upload", label: "Share resource", icon: UploadIcon },
  { to: "/profile", label: "Profile", icon: UserIcon },
];

const adminLink = { to: "/admin", label: "Admin", icon: ShieldIcon };

export default function Sidebar() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          navigate("/login");
          return;
        }

        const userData = await fetchUserProfile(supabase, user.id);
        setCurrentUser(userData);
      }
      catch (err) {
        console.error("Unexpected error: ", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate]);
  return (
    <aside className="w-[188px] shrink-0 border-r border-line px-4 py-6 flex flex-col gap-1 h-screen sticky top-0">
      <div className="flex items-center gap-2 mb-6 px-2">
        <div className="w-7 h-7 rounded-md bg-accent-600 flex items-center justify-center">
          <GridIcon />
        </div>
        <span className="font-serif text-[17px] font-semibold">Notegrid</span>
      </div>

      <nav className="flex flex-col gap-1">
        {
          loading ? (
            <>
              <SkeletonFieldSingle />
              <SkeletonFieldSingle />
              <SkeletonFieldSingle />
            </>
          ) : (
            currentUser.role === "ADMIN" ? (
              <NavLink
                key={adminLink.to}
                to={adminLink.to}
                end={adminLink.end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-md text-[13.5px] transition-colors ${
                    isActive
                      ? "bg-accent-50 text-accent-700 font-medium"
                      : "text-muted hover:bg-paper hover:text-ink"
                  }`
                }
              >
                <adminLink.icon />
                {adminLink.label}
              </NavLink>
            ) : (
              links.map(({ to, label, icon: Icon, end }) =>
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-md text-[13.5px] transition-colors ${
                        isActive
                          ? "bg-accent-50 text-accent-700 font-medium"
                          : "text-muted hover:bg-paper hover:text-ink"
                      }`
                    }
                  >
                    <Icon />
                    {label}
                  </NavLink>
              )
            )
          )
        }
      </nav>

      <Link to="/setup" className="mt-auto flex items-center gap-2.5 pt-4 border-t border-line">
        { loading
          ? <SkeletonField />
          : <>
              <div className="w-8 h-8 rounded-full bg-accent-50 text-accent-700 flex items-center justify-center text-[12px] font-medium shrink-0">
                {currentUser?.full_name[0].toUpperCase() + (currentUser?.full_name.split(" ").length > 1 ? currentUser?.full_name.split(" ")[1][0]?.toUpperCase() : "")}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium truncate">{currentUser?.full_name}</p>
                <p className="text-[12px] text-faint truncate">
                  {currentUser?.faculties?.name}, Sem {currentUser?.semester}
                </p>
              </div>
            </>
        }
        </Link>
    </aside>
  );
}

function iconProps(extra = "") {
  return {
    width: 17,
    height: 17,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: extra,
  };
}

function HomeIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v9a1 1 0 0 0 1 1H10v-5.5h4V20h3.5a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}
function UploadIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M12 15V4" />
      <path d="M7.5 8.5 12 4l4.5 4.5" />
      <path d="M4.5 15v3.5a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1V15" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="12" cy="8" r="3.3" />
      <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M12 3.5 5 6v6c0 4.5 3 7.5 7 8.5 4-1 7-4 7-8.5V6l-7-2.5Z" />
      <path d="M9.3 12l1.9 1.9 3.5-3.8" />
    </svg>
  );
}
function GridIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.2" />
    </svg>
  );
}
function SkeletonField() {
  return (
    <div className="flex flex-row gap-2 w-full">
      <div className="h-8 w-8 rounded bg-line/60" />
      <div className="h-8 w-full rounded bg-line/60" />
    </div>
  );
}
function SkeletonFieldSingle() {
  return (
    <div className="flex flex-row gap-2 w-full">
      <div className="h-8 w-full mb-2 rounded bg-line/40" />
    </div>
  );
}
