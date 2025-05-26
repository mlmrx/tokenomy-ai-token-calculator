import React, { useEffect, useState } from 'react';

interface GpuInfo {
  gpu_uuid: string;
  tps: number;
  tokens_total: number;
}

export function GpuGrid() {
  const [data, setData] = useState<GpuInfo[]>([]);

  useEffect(() => {
    fetch('/gpu/leaderboard')
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData([]));
  }, []);

  return (
    <table className="w-full text-left">
      <thead>
        <tr>
          <th>GPU UUID</th>
          <th>Tokens Total</th>
        </tr>
      </thead>
      <tbody>
        {data.map((d) => (
          <tr key={d.gpu_uuid}>
            <td>{d.gpu_uuid}</td>
            <td>{d.tokens_total}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
