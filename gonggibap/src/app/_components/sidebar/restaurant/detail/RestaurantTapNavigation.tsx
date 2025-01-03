interface Tab {
  id: string;
  label: string;
  ariaLabel: string;
}

interface RestaurantTabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

export function RestaurantTapNavigation({
  tabs,
  activeTab,
  onTabChange,
  className = '',
}: RestaurantTabNavigationProps) {
  return (
    <div
      className={`flex w-full border-b-2 border-gray-500 ${className}`}
      role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`${tab.id}-panel`}
          aria-label={tab.ariaLabel}
          className={`relative flex-1 px-4 py-2 text-sm font-semibold transition-all duration-200
              ${
                activeTab === tab.id
                  ? 'text-[#FF7058]'
                  : 'text-gray-500 hover:text-gray-700'
              }
            `}
          onClick={() => onTabChange(tab.id)}>
          {tab.label}
          {activeTab === tab.id && (
            <div
              className="absolute bottom-[-1.8px] left-0 h-[2px] w-full bg-[#FF7058]"
              aria-hidden="true"
            />
          )}
        </button>
      ))}
    </div>
  );
}
