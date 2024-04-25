import { Colors } from '@/lib/colors';

export function Palette({
  color,
  setColor,
}: {
  color: number;
  setColor: (color: number) => void;
}) {
  return (
    <div className='flex flex-row bg-slate-200 gap-2 p-1 flex-wrap w-80 md:w-[40rem] justify-center '>
      {Colors.map((c, i) => (
        <div
          key={c}
          style={{
            width: '2rem',
            height: '2rem',
            backgroundColor: c,
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