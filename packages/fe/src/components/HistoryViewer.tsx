'use client';

import { SERVER_URL } from '@/lib/consts';
import { useEffect, useState } from 'react';

export function HistoryViewer({
  show,
  setShow,
}: {
  show: boolean;
  setShow: (show: boolean) => void;
}) {
  const [history, setHistory] = useState<number[]>([]);
  const [current, setCurrent] = useState<number | null>(null);

  async function fetchHistory() {
    const res = await fetch(`${SERVER_URL}/api/history`);
    const data = await res.json() as number[];
    data.sort((a, b) => b - a);

    setHistory(data);
    return data;
  }

  useEffect(() => {
    if (!show) {
      return;
    }

    fetchHistory()
      .then(xs => setCurrent(xs[0]));
  }, [show]);

  if (!show) {
    return null;
  }

  return (
    <div className='fixed inset-0 bg-black/50 z-20 flex flex-row justify-center items-center'>
      <div className='mx-4 my-4 max-w-4xl bg-white flex flex-row relative z-30'>
        <div className='absolute -left-[16rem] top-0 bottom-0 overflow-y-scroll'>
          <div className='flex flex-col w-[14rem]'>
            {history.map((h, i) => (
              <div
                key={i}
                className={`${current === h ? 'bg-slate-400' : 'bg-white'} text-center py-1 text-black text-sm cursor-pointer hover:bg-slate-100`}
                onClick={() => setCurrent(h)}>
                {new Date(h).toLocaleString()}
              </div>
            ))}
          </div>

        </div>

        <div>
          {
            current === null ? null : (
              <img src={`${SERVER_URL}/api/history/${current}`} alt='history' />
            )
          }
        </div>

        <div className='absolute -right-16 top-0'>
          <div className='w-14 h-10 bg-red-400 rounded-lg flex justify-center items-center cursor-pointer hover:bg-red-600' onClick={() => setShow(false)}>
            X
          </div>
        </div>
      </div>
    </div>
  )
}