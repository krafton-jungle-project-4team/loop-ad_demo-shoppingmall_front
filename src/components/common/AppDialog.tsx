import {
  type MouseEvent,
  type ReactNode,
  type SyntheticEvent,
  useEffect,
  useId,
  useRef,
} from "react";

type AppDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  actions?: ReactNode;
  onOpenChange: (open: boolean) => void;
};

export function AppDialog({
  open,
  title,
  description,
  children,
  actions,
  onOpenChange,
}: AppDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
      return;
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    onOpenChange(false);
  }

  function handleClose() {
    if (open) {
      onOpenChange(false);
    }
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) {
      onOpenChange(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={handleCancel}
      onClose={handleClose}
      onClick={handleBackdropClick}
      className="w-[min(calc(100vw-2rem),28rem)] rounded-md border border-border bg-card p-0 text-foreground shadow-2xl backdrop:bg-foreground/45"
    >
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex flex-col gap-2">
          <h2 id={titleId} className="text-xl font-bold tracking-normal text-foreground">
            {title}
          </h2>
          {description ? (
            <p id={descriptionId} className="text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        {children ? <div>{children}</div> : null}

        {actions ? (
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
    </dialog>
  );
}
