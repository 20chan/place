'use client';

import { useState } from 'react';

export function TestDrawer() {
  const [input, setInput] = useState([0, 0, 0]);

  return (
    <div className='flex flex-col text-black'>
      <div>
        <label>X</label>
        <input value={input[0]} onChange={(e) => setInput([parseInt(e.target.value), input[1], input[2]])} />
      </div>
      <input value={input[1]} onChange={(e) => setInput([input[0], parseInt(e.target.value), input[2]])} />
      <input value={input[2]} onChange={(e) => setInput([input[0], input[1], parseInt(e.target.value)])} />

      <button onClick={() => {
        fetch('http://localhost:4200/api/draw', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            x: input[0],
            y: input[1],
            c: input[2],
          }),
        });
      }}
        className='bg-blue-800 hover:bg-blue-600'>
        Draw
      </button>
    </div>
  );
}