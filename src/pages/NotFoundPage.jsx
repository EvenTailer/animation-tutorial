import React from 'react';
import {Link} from 'react-router-dom';
export default function NotFoundPage(){return <section className="info-panel"><span className="eyebrow">404</span><h1>Страница не найдена</h1><p>Вернись к маршруту и выбери занятие.</p><Link className="secondary" to="/">К моему маршруту</Link></section>;}
