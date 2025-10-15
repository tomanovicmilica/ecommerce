import type { ReactNode } from "react";

interface TableProps {
  headers: (string | ReactNode)[];
  headerAlignments?: string[];
  children: ReactNode;
}

export default function Table({ headers, headerAlignments, children }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
      <table className="w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>
            {headers.map((header, i) => (
              <th
                key={i}
                className={`px-4 py-3 text-sm font-semibold text-gray-700 border-b ${
                  headerAlignments?.[i] || 'text-left'
                }`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">{children}</tbody>
      </table>
    </div>
  );
}