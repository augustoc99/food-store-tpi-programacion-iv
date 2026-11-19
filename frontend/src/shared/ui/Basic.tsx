import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) { return <button {...props} className={`btn-primary ${props.className??''}`.trim()}/>; }
export function Input(props: InputHTMLAttributes<HTMLInputElement>) { return <input {...props} className={`field ${props.className??''}`.trim()}/>; }
export function Card({children}:{children:ReactNode}) {return <section className="panel p-5">{children}</section>;}
