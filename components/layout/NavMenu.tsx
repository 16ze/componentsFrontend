import Link from "next/link";
import { Award } from "lucide-react";

const NavMenu = () => {
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";
  const activeClass = "text-blue-500";
  const inactiveClass = "text-gray-500";

  return (
    <div>
      {/* ... existing links ... */}
      {section === "crm" && (
        <>
          {/* ... existing links ... */}
          <Link
            href="/crm/scoring"
            className={
              pathname === "/crm/scoring" ? activeClass : inactiveClass
            }
          >
            <Award className="h-5 w-5 mr-2" />
            Scoring des Leads
          </Link>
          {/* ... existing links ... */}
        </>
      )}
      {/* ... existing links ... */}
    </div>
  );
};

export default NavMenu;
