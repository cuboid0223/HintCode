import { auth } from "../../firebase/firebase";
import React from "react";
import { useSignOut } from "react-firebase-hooks/auth";
import { FiLogOut } from "react-icons/fi";
import { useRouter } from "next/navigation";
const Logout: React.FC = () => {
  const router = useRouter();
  const [signOut, loading, error] = useSignOut(auth);

  const handleLogout = () => {
    signOut();
    router.push("/auth");
  };
  return (
    <button
      className="bg-dark-fill-3 py-1.5 px-3 cursor-pointer rounded text-brand-orange"
      onClick={handleLogout}
    >
      <FiLogOut />
    </button>
  );
};
export default Logout;
