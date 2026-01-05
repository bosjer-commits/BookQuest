export default function BookFrame({ coverUrl, onSelect }: { coverUrl?: string; onSelect?: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="relative w-[77px] h-[110px] cursor-pointer"
    >
      <div className="absolute inset-[8%] z-[1]">
        {coverUrl ? (
          <img src={coverUrl} alt="" className="w-full h-full object-cover rounded block" />
        ) : (
          <div className="w-full h-full rounded bg-[#2B4E6E]" />
        )}
      </div>
      <img
        src="/assets/bookframe.png"
        alt=""
        className="absolute inset-0 w-full h-full block pointer-events-none"
      />
    </button>
  );
}
