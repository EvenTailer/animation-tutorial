import React from "react";
import { ArrowUpRight, ArrowRight, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useAppDispatch,
  useAppSelector,
  selectSettings,
  setDevice as deviceAction,
} from "../store/index.js";
import { apps } from "../data/apps.js";
import Masterclass from "../Masterclass";
export default function MasterclassPage() {
  const navigate = useNavigate(),
    dispatch = useAppDispatch();
  const { device } = useAppSelector(selectSettings);
  const setDevice = (value) => dispatch(deviceAction(value));
  return (
    <>
      <div className="masterclass-app">
        <span>Рисую в</span>
        <select
          aria-label="Программа для мастер-класса"
          value={device}
          onChange={(e) => setDevice(e.target.value)}
        >
          {apps.map((a) => (
            <option key={a.id} value={a.id}>
              {a.device} · {a.name}
            </option>
          ))}
        </select>
        <button className="text-button" onClick={() => navigate("/tools")}>
          Настройка и бесплатный вариант <ArrowUpRight size={14} />
        </button>
      </div>
      <Masterclass />
      <div className="drawing-support">
        <BookOpen size={22} />
        <div>
          <h3>Нужна дополнительная практика?</h3>
          <p>
            Основы, ракурсы и анимация остаются под рукой. Этап рисунка
            сохранится, и ты сможешь к нему вернуться.
          </p>
        </div>
        <button className="secondary" onClick={() => navigate("/animation")}>
          Анимация полного героя <ArrowRight size={16} />
        </button>
      </div>
    </>
  );
}
