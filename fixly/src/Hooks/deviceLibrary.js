import { useNavigate } from "react-router-dom";
import LibraryBrowser from "./libraryBrowser";
import { getRole } from "../Hooks/loginApi";
import { addListingPath } from "../Hooks/listingsBase";

// Library page for the admin and shop dashboards (routes: /admin/library and /shop/library)
export default function DeviceLibrary() {
  const navigate = useNavigate();
  const isAdmin = getRole() !== "shop_owner"; // only staff reach the dashboards

  return (
    <div className="flex flex-col gap-4 max-w-6xl">
      <p className="text-sm text-gray-500 max-w-2xl">
        Specs for every device, shared by all shops. Pick one to start a listing, then add your own
        photos and price. A device that isn't here is added automatically when you list it.
      </p>
      <LibraryBrowser
        isAdmin={isAdmin}
        selectLabel="List this device"
        onSelect={(d) => navigate(`${addListingPath()}?from=${d._id}`)}
      />
    </div>
  );
}