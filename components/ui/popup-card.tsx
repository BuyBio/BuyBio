import * as React from "react";

import { cn } from "@/lib/utils";

import { IoClose } from "react-icons/io5";
import { MdOutlineQuestionMark } from "react-icons/md";

import { Card } from "./card";

export interface PopupCardProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
  onAction?: () => void;
  title?: string;
  actionText?: string;
  icon?: React.ReactNode;
}

const PopupCard = React.forwardRef<HTMLDivElement, PopupCardProps>(
  (
    {
      className,
      onClose,
      onAction,
      title = "아직 투자 성향 진단을 안 했어요",
      actionText = "내 투자 성향 알아보기",
      icon = (
        <MdOutlineQuestionMark className="w-5 h-5 text-muted-foreground" />
      ),
      ...props
    },
    ref,
  ) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "flex items-center justify-between px-4 py-3.5 cursor-pointer transition-colors",
          "bg-background hover:bg-muted/50 rounded-[14px] border-0 shadow-sm",
          className,
        )}
        {...props}
      >
        {/* Left Content */}
        <div className="flex items-center gap-3 flex-1">
          {/* Icon Container */}
          <div
            className={cn(
              "flex items-center justify-center rounded-full shrink-0",
              "bg-muted w-10 h-10",
            )}
          >
            {icon}
          </div>

          {/* Text Content */}
          <div className="flex flex-col gap-1 items-start justify-center">
            <p
              className={cn(
                "text-[13px] leading-normal font-medium text-muted-foreground",
                "font-['Pretendard',_sans-serif] tracking-[-0.13px]",
              )}
            >
              {title}
            </p>
            <button
              type="button"
              onClick={onAction}
              className={cn(
                "text-[13px] leading-normal font-semibold text-blue-primary",
                "font-['Pretendard',_sans-serif] tracking-[-0.13px]",
                "hover:text-blue-primary-hover transition-colors cursor-pointer",
              )}
            >
              {actionText}
            </button>
          </div>
        </div>

        {/* Close Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-6 h-6 flex items-center justify-center hover:bg-muted rounded-full transition-colors"
            aria-label="Close popup"
          >
            <IoClose className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </Card>
    );
  },
);

PopupCard.displayName = "PopupCard";

export { PopupCard };
