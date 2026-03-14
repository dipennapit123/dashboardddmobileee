"use client";

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
} from "react";

export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={
        "rounded-3xl border border-purple-600/20 bg-card/80 shadow-xl shadow-purple-900/40 " +
        className
      }
      {...props}
    />
  );
}

export function Button({
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={
        "inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg shadow-purple-900/40 hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60 " +
        className
      }
      {...props}
    />
  );
}

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Input({ className = "", ...props }, ref) {
  return (
    <input
      ref={ref}
      className={
        "w-full rounded-xl border border-purple-500/30 bg-muted/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 " +
        className
      }
      {...props}
    />
  );
});

export const TextArea = forwardRef<
  HTMLTextAreaElement,
  HTMLAttributes<HTMLTextAreaElement> & { rows?: number }
>(function TextArea({ className = "", ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={
        "w-full rounded-xl border border-purple-500/30 bg-muted/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 " +
        className
      }
      {...props}
    />
  );
});
