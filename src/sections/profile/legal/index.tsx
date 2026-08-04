import { useState } from "react";
import AboutUs from "./AboutUs";
import ResponsibleGaming from "./ResponsibleGaming.tsx";
import TermOfService from "./TermOfService.tsx";
import { NavScrollBar, TBar } from "./NavScrollBar.tsx";

const SECTIONS = [
  { key: "aboutUs" as TBar, Component: AboutUs },
  { key: "responsibleGaming" as TBar, Component: ResponsibleGaming },
  { key: "termsOfService" as TBar, Component: TermOfService },
];

export function Index() {
  const [navIndex, setNavIndex] = useState<TBar>("aboutUs");

  return (
    <div className="p-4">
      <NavScrollBar setNavIndex={setNavIndex} />
      {SECTIONS.map(({ key, Component }) => (
        <div key={key} className={`collapse${navIndex === key ? " collapse-open" : ""}`}>
          <div className="collapse-content !p-0">
            <Component />
          </div>
        </div>
      ))}
    </div>
  );
}
