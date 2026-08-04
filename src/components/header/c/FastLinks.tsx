import Iconify from "@/components/iconify";
import { useAppNavigate } from "@/hooks/useAppNavigate";

export function FastLinks() {

  const items = [
    {
      event: () => navigate({ to: "/profile" }),
      id: "home",
      label: "My Profile"
    },
    {
      event: () => navigate({ to: "/profile" }),
      id: "transactions",
      label: "Transactions"
    },
    {
      event: () => navigate({ to: "/profile" }),
      id: "bet-history",
      label: "Bet History"
    },
    {
      event: () => navigate({ to: "/profile" }),
      id: "security",
      label: "Security"
    },
    {
      event: () => navigate({ to: "/profile" }),
      id: "settings",
      label: "Settings"
    }
  ];

  return (<>
    {items.map((item: Record<string, any>) => (<div
      key={item.id}
      onClick={() => item.event()}
      className="cursor-pointer h-10 font-semibold flex items-center gap-1 text-base-content/50">
      <Iconify icon={`custom:${item.id}`} className="w-4 h-4" />
      <span className="text-sm font-semibold whitespace-nowrap">{item.label}</span>
    </div>))}
  </>);
}
