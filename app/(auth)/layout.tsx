import Image from "next/image";

/** Sign-in and sign-up: the full crest on top, one form, nothing else. */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex-1 flex flex-col items-center px-5 pt-safe">
      <div className="w-full max-w-sm flex flex-col items-center pt-8 pb-10">
        {/* The crest's own banner reads "Kings of Distinction", so no wordmark is needed under it. */}
        <Image
          src="/brand/kod-crest.svg"
          alt="Kings of Distinction"
          width={1000}
          height={1063}
          priority
          className="w-56 max-w-[70%] h-auto"
        />
        {children}
      </div>
    </div>
  );
}
