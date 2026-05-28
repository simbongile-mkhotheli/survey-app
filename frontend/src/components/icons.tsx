import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function IconBase(props: IconProps) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props} />;
}

export function ClipboardIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect
        x="9"
        y="3"
        width="6"
        height="4"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8 5.5H6.5A1.5 1.5 0 0 0 5 7v12A2 2 0 0 0 7 21h10a2 2 0 0 0 2-2V7a1.5 1.5 0 0 0-1.5-1.5H16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8.5 12.5 10.5 14.5 15.5 9.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

export function ChartIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        d="M5 19V5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M5 19h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <rect
        x="8"
        y="12"
        width="2.6"
        height="7"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect
        x="12.7"
        y="8"
        width="2.6"
        height="11"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect
        x="17.4"
        y="10"
        width="2.6"
        height="9"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </IconBase>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5.5 19.5a6.5 6.5 0 0 1 13 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect
        x="4.5"
        y="6"
        width="15"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m6 8.5 6 4.5 6-4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        d="M8 4.5h2l1.2 4.2-1.4 1.2c1 2.1 2.7 3.8 4.8 4.8l1.2-1.4 4.2 1.2v2A2.5 2.5 0 0 1 17.5 19C10.6 19 5 13.4 5 6.5A2.5 2.5 0 0 1 7.5 4h.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect
        x="4.5"
        y="5.5"
        width="15"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M4.5 9h15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8 3.5v4M16 3.5v4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

export function ForkIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        d="M8 4v16M6 6.5c0 1.4.9 2.5 2 2.5s2-1.1 2-2.5S9.1 4 8 4 6 5.1 6 6.5ZM14 4v16M12.2 5.8h3.6M12.2 9.2h3.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        d="m12 4.5 2.5 5.1 5.5.8-4 3.9.9 5.6L12 17.2l-4.9 2.7.9-5.6-4-3.9 5.5-.8L12 4.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        d="M12 3.5 13.6 9l5.4 1.6-5.4 1.6L12 17.5l-1.6-5.3L5 10.6 10.4 9 12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M18 3.5v3M16.5 5h3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </IconBase>
  );
}
