import { Colors } from '@/lib/colors';

export function Palette({
  color,
  setColor,
}: {
  color: number;
  setColor: (color: number) => void;
}) {
  return (
    <div className='flex flex-row bg-slate-200 gap-1 md:gap-2 p-1 flex-wrap w-[18.25rem] md:w-[40rem] justify-center'>
      {Colors.map((c, i) => (
        <div
          key={i}
          style={{
            width: '2rem',
            height: '2rem',
            backgroundColor: c,
            cursor: 'pointer',
            border: color === i
              ? (i === 1 ? '3px solid  white' : '3px solid black')
              : 'none',
          }}
          onClick={() => setColor(i)}
          onTouchStart={() => setColor(i)}
        />
      ))}
    </div>
  )
}