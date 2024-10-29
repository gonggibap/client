import { Restaurant } from "@/types/restaurant";
import { MobileSidebar } from "@/app/_components/MobileSidebar";
import { DesktopSidebar } from "@/app/_components/DesktopSidebar";

type SidebarProps = {
  restaurants: Restaurant[];
  totalPage: number;
};

export const Sidebar: React.FC<SidebarProps> = ({ restaurants, totalPage }) => {
  return (
    <nav aria-label="사이드바">
      <div className="hidden md:block" aria-label="데스크톱 사이드바">
        <DesktopSidebar restaurants={restaurants} totalPpage={totalPage} />
      </div>
      <div className="block md:hidden" aria-label="모바일 사이드바">
        <MobileSidebar restaurants={restaurants} totalPpage={totalPage}/>
      </div>
    </nav>
  );
};
