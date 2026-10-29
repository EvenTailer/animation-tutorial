import React, {
  useState,
  useEffect,
  useLayoutEffect,
  Suspense,
  Component,
} from "react";
import {
  ArrowUpRight,
  Play,
  Route,
  BookOpen,
  Layers,
  SlidersHorizontal,
  Sun,
  Moon,
  ChevronRight,
  PenTool,
  Menu,
  X,
} from "lucide-react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  useAppSelector,
  useAppDispatch,
  selectSettings,
  selectProgress,
  selectPersistenceError,
  setTheme as themeAction,
} from "./store/index.js";
import { COURSE_COUNTS } from "./routing/paths.js";
const destinations = {
  home: "/",
  masterclass: "/draw",
  animation: "/animation",
  lesson: "/lesson",
  tools: "/tools",
  library: "/library",
};
const sections = {
  draw: "masterclass",
  animation: "animation",
  lesson: "lesson",
  tools: "tools",
  library: "library",
};
export function LoadingPage() {
  return (
    <div role="status" className="info-panel">
      Открываем мастерскую…
    </div>
  );
}
class PageBoundary extends Component {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div role="alert" className="info-panel">
        <h1>Не удалось открыть страницу</h1>
        <p>
          Попробуй обновить страницу. Сохранённый прогресс останется в браузере.
        </p>
        <button className="secondary" onClick={() => window.location.reload()}>
          Обновить
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function AppLayout() {
  const location = useLocation(),
    navigate = useNavigate(),
    dispatch = useAppDispatch(),
    { theme } = useAppSelector(selectSettings),
    progress = useAppSelector(selectProgress),
    saveError = useAppSelector(selectPersistenceError);
  const group = location.pathname.split("/")[1],
    view = location.pathname === "/" ? "home" : sections[group],
    duckSteps = { length: COURSE_COUNTS.duck },
    duckDone = Object.keys(progress.drawing).filter((k) =>
      k.startsWith("duck:"),
    ).length;
  const [menu, setMenu] = useState(false),
    setTheme = (value) => dispatch(themeAction(value));
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  useEffect(() => {
    setMenu(false);
  }, [location.pathname]);
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [group]);
  return (
    <div className="shell">
      <aside className={menu ? "sidebar mobile-open" : "sidebar"}>
        <Link className="brand" to="/">
          <span className="brand-mark">G.</span>
          <span>
            GRAMILYA<span className="brand-sub">МАСТЕРСКАЯ ПЕРСОНАЖА</span>
          </span>
        </Link>
        <button
          className="mobile-close icon"
          aria-label="Закрыть меню"
          onClick={() => setMenu(false)}
        >
          <X />
        </button>
        <div className="side-label">ТВОЯ МАСТЕРСКАЯ</div>
        <nav>
          {[
            ["home", Route, "Мой маршрут"],
            ["masterclass", BookOpen, "Рисуем героя"],
            ["animation", Play, "Анимация героя"],
            ["lesson", PenTool, "Основы рисунка"],
            ["tools", SlidersHorizontal, "Инструменты"],
            ["library", Layers, "Шпаргалки"],
          ].map(([id, Icon, label]) => (
            <NavLink
              key={id}
              to={destinations[id]}
              end={id === "home"}
              className={({ isActive }) =>
                "nav-item" + (isActive ? " active" : "")
              }
            >
              <Icon size={19} />
              {label}
              {id === "home" && <span className="nav-count">10</span>}
            </NavLink>
          ))}
        </nav>
        <div className="side-note">
          <span className="tiny-star">✳</span>
          <p>
            Не нужно уметь.
            <br />
            Нужно попробовать.
          </p>
          <small>Один штрих уже считается.</small>
        </div>
        <div className="side-bottom">
          <span className="side-label">ОФОРМЛЕНИЕ</span>
          <div className="themes">
            {[
              ["paper", "Бумага", PenTool],
              ["light", "Светлая", Sun],
              ["dark", "Ночная", Moon],
            ].map(([id, label, Icon]) => (
              <button
                key={id}
                title={label}
                aria-label={`Тема: ${label}`}
                aria-pressed={theme === id}
                className={theme === id ? "chosen" : ""}
                onClick={() => setTheme(id)}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </div>
          <small>Бесплатно. Без спешки. Без оценок.</small>
        </div>
      </aside>
      <div className="workspace">
        <header>
          <div>
            <button
              className="mobile-menu icon"
              aria-label="Открыть меню"
              onClick={() => setMenu(true)}
            >
              <Menu />
            </button>
            <span className="breadcrumb">
              Мастерская <ChevronRight size={13} />{" "}
              <b>
                {
                  {
                    home: "Мой маршрут",
                    lesson: "Занятие",
                    masterclass: "Рисуем героя",
                    animation: "Анимация героя",
                    tools: "Инструменты",
                    library: "Шпаргалки",
                  }[view]
                }
              </b>
            </span>
          </div>
          <button
            className="header-progress"
            onClick={() => navigate("/tools")}
          >
            <span className="status-dot" />
            {saveError
              ? "Не удалось сохранить"
              : `Герой: ${duckDone} из ${duckSteps.length} шагов`}
            <span className="mini-progress">
              <i style={{ width: (duckDone / duckSteps.length) * 100 + "%" }} />
            </span>
          </button>
        </header>
        <main>
          <PageBoundary key={group}>
            <Suspense fallback={<LoadingPage />}>
              <Outlet />
            </Suspense>
          </PageBoundary>
          <footer>
            <span className="footer-brand">GRAMILYA</span>
            <span>Рисуй в своём темпе. Возвращайся, когда захочешь.</span>
            <button onClick={() => navigate("/tools")}>
              Настройки и прогресс <ArrowUpRight size={14} />
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}
